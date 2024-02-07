import { type Socket, Server } from 'socket.io';
import { type Server as HttpServer } from 'http';

import logger from './utils';
import { redis } from './config/redis';
import { roomServices } from './services';

export class SocketServer {
  static instance: SocketServer;
  io: Server;

  constructor(server: HttpServer) {
    this.io = new Server(server, {
      serveClient: false,
      pingInterval: 10000,
      pingTimeout: 5000,
      cookie: false,
      cors: {
        origin: '*'
      }
    });

    this.io.on('connect', this.onConnection);
  }

  static getInstance(server: HttpServer) {
    if (!SocketServer.instance) {
      SocketServer.instance = new SocketServer(server);
    }

    return SocketServer.instance;
  }

  /**
   * io.to(room).emit('event', ...) ==> Gửi sự kiện 'event' tới tất cả client có trong phòng
   * socket.broadcast.to(room).emit('event', ...) ==> Gửi sự kiện 'event' tới tất cả client có trong phòng trừ người gửi thông điệp ban đầu
   * socket.to(room).emit('event', ...) ==> Là cách viết ngắn gọn của socket.broadcast.to(room).emit('event', ...)
   *
   * socket.emit('event', ...) ==> Gửi sự kiện 'event'  tới client mà gửi thông điệp
   * io.emit('event', ...) ==> Gửi sự kiện 'event' tới tất cả client
   */

  onConnection = (socket: Socket) => {
    logger.info(`User '${socket.id}' connected!`);

    // Kết thúc (Done or out)
    socket.on('disconnect', () => {
      logger.info(`User '${socket.id}' disconnected!`);
    });

    // Khi người dùng bắt đầu vào giao diện chọn ghế
    socket.on(
      'startBooking',
      async ({
        userId,
        showtimeId,
        endTime,
        roomId
      }: {
        userId: string;
        showtimeId: string;
        endTime: string;
        roomId: string;
      }) => {
        // Tạo redis json và set hạn nếu chưa tồn tại
        // -2 (Không tồn tại), -1 (tồn tại nhưng chưa set hạn), second (số giây còn lại)
        if ((await redis.ttl(showtimeId)) === -2) {
          try {
            await redis.multi().call('JSON.SET', showtimeId, '$', '{}').expireat(showtimeId, endTime).exec();
          } catch (e) {
            logger.error(e);
          }
        }

        // Join room, nếu đã có thì bỏ qua
        await socket.join(showtimeId);

        try {
          const { seats, my } = await this.getListReservedSeats(userId, showtimeId, roomId);

          // Trả về danh sách ghế đang được chọn
          // Gồm: "của mình" và "không phải của mình" và "ds đã đặt"
          socket.emit('reservedSeats', seats, my);
        } catch (e: any) {
          socket.emit('error', e.message);
        }
      }
    );

    // Khi hết hạn đặt hoặc người dùng rời khỏi trang đặt
    socket.on('cancelBooking', async ({ seats, showtimeId }: { seats: any[]; showtimeId: string }) => {
      // Xóa data redis
      for (const seat of seats) {
        await redis.call('JSON.DEL', showtimeId, `$.${seat.id}`);
      }

      // Gửi tới những người khác trong room
      socket.broadcast.to(showtimeId).emit('cancelSeat', seats);

      // Rời room
      await socket.leave(showtimeId);
    });

    // Hoàn thành đặt
    socket.on('completeBooking', async ({ seats, showtimeId }: { seats: any[]; showtimeId: string }) => {
      // Xóa data redis
      for (const seat of seats) {
        await redis.call('JSON.DEL', showtimeId, `$.${seat.id}`);
      }

      // Gửi tới những người khác
      socket.broadcast.to(showtimeId).emit('completeSeat', seats);

      // Rời room
      await socket.leave(showtimeId);
    });

    // Khi chọn 1 ghế
    socket.on('select', async ({ userId, showtimeId, seat }: { userId: string; showtimeId: string; seat: any }) => {
      try {
        const seatId = seat._id;
        const x = seat.coordinates[0];
        const y = seat.coordinates[1];

        const data = { userId, x, y };
        // update redis
        await redis.multi().call('JSON.SET', showtimeId, `$.${seatId}`, JSON.stringify(data)).exec();

        // send seat to others
        socket.broadcast.to(showtimeId).emit('addSeat', seat, 'Reserved');
        // send seat to current user
        socket.emit('addSeat', seat, 'Selected');
      } catch (_) {
        socket.emit('error', 'Ghế không còn tồn tại nữa, vui lòng chọn ghế khác!');
      }
    });

    // Khi hủy chọn ghế
    socket.on('deselect', async ({ showtimeId, seat }: { showtimeId: string; seat: any }) => {
      const seatId = seat._id;

      // update redis
      const numsDel = await redis.call('JSON.DEL', showtimeId, `$.${seatId}`);

      if (numsDel === 0) {
        socket.emit('error', 'Có lỗi xảy ra, vui lòng thử lại');
      } else {
        // send seat to others
        socket.broadcast.to(showtimeId).emit('removeSeat', seat);
        // send seat to current user
        socket.emit('removeSeat', seat);
      }
    });
  };

  getListReservedSeats = async (userId: string, showtimeId: string, roomId: string) => {
    const data = await roomServices.getSeatListWithStatus(roomId, showtimeId);

    if (!data) throw new Error('Phòng không tồn tại');

    const seats = data.reduce((acc: any, seat) => {
      const rowIndex = seat.coordinates[0];

      if (!acc[rowIndex]) {
        acc[rowIndex] = [];
      }

      acc[rowIndex].push(seat);
      return acc;
    }, []);

    const my: any[] = [];

    const _seats = JSON.parse((await redis.call('JSON.GET', showtimeId, '$')) as string);
    if (_seats?.length) {
      const obj = _seats[0];

      (Object.keys(obj) as Array<keyof typeof obj>).forEach((key) => {
        // Danh sách ghế tôi đặt
        if (obj[key].userId === userId) {
          const _seat = seats[obj[key].x][obj[key].y];
          _seat.status = 'Selected';
          my.push(_seat);
        }
        // Danh sách ghế không phải tôi đặt
        else {
          seats[obj[key].x][obj[key].y].status = 'Reserved';
        }
      });
    }

    return { seats, my };
  };
}
