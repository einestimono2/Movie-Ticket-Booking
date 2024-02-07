import React, { useEffect, useState } from 'react';
import { Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';

import socket from '../../../socket';
import { getUnixTimestamp } from '../../../utils/date';
import { Loading } from '../../../components/loading';
import NoDataCard from '../../../components/no-data-card';
import { addSeat, deleteSeat } from '../../../redux/reducer/bookingReducer';

const getSeat = (type, key, status) => {
  const _type =
    status === 'Booked'
      ? 'seat-booked'
      : status === 'Selected'
        ? 'seat-selected'
        : status === 'Reserved'
          ? 'seat-reserved'
          : '';

  const disable = status !== 'Available' && status !== 'Selected';

  switch (type) {
    case 'Standard':
      return (
        <Button
          disabled={disable}
          className={`seat m-auto seat-standard text-center d-flex justify-content-center align-items-center ${_type}`}
        >
          {key}
        </Button>
      );
    case 'VIP':
      return (
        <Button
          disabled={disable}
          className={`seat m-auto seat-vip text-center d-flex justify-content-center align-items-center ${_type}`}
        >
          {key}
        </Button>
      );
    case 'Sweetbox':
      return (
        <Button
          disabled={disable}
          className={`seat m-auto seat-sweetbox text-center d-flex justify-content-center align-items-center ${_type}`}
        >
          {key}
        </Button>
      );
    default:
      return (
        <div className="seat m-auto seat-empty text-center d-flex justify-content-center align-items-center">
          <div className="text-body">{}</div>
        </div>
      );
  }
};

export default function SeatBooking(props) {
  const dispatch = useDispatch();
  const selectedSeats = useSelector((state) => state.booking.seats);
  const user = JSON.parse(localStorage.getItem('user'));

  const [loading, setLoading] = useState(true);

  const [seats, setSeats] = useState([]);

  const startBooking = () => {
    if (seats?.length) return;

    setLoading(true);
    const userId = user?._id;
    const showtimeId = props.data.showtime._id;
    const roomId = props.data.showtime.room._id;
    const endTime = getUnixTimestamp(props.data.showtime.endTime);

    socket.emit('startBooking', { userId, showtimeId, endTime, roomId });
  };

  const onReservedSeats = (data, my) => {
    data.forEach((e) => {
      seats.push(e);
    });

    // Tránh cộng dồn
    if (my?.length && !Object.keys(selectedSeats)?.length) {
      my.forEach((e) => {
        dispatch(addSeat(e));
      });
    }

    setLoading(false);
  };

  const selectSeat = (seat) => {
    const userId = user._id;
    const showtimeId = props.data.showtime._id;

    socket.emit('select', { userId, showtimeId, seat });
  };

  // Khi thêm seat thành công
  const onAddSeat = (seat, status) => {
    const x = seat.coordinates[0];
    const y = seat.coordinates[1];

    if (!seats || seats[x][y].status === status) return;
    seats[x][y].status = status;
    setSeats([...seats]);

    dispatch(addSeat(seat));
  };

  const removeSeat = (seat) => {
    const showtimeId = props.data.showtime._id;

    socket.emit('deselect', { showtimeId, seat });
  };

  // Khi xóa seat thành công
  const onRemoveSeat = (seat) => {
    const x = seat.coordinates[0];
    const y = seat.coordinates[1];

    if (!seats) return;
    seats[x][y].status = 'Available';
    setSeats([...seats]);

    dispatch(deleteSeat(seat));
  };

  const onError = (messsage) => {
    setLoading(false);
    props.onError(messsage);
  };

  const onCancelSeat = (_seats) => {
    if (!seats) return;

    _seats.forEach((seat) => {
      seats[seat.x][seat.y].status = 'Available';
    });

    setSeats([...seats]);
  };

  const onCompleteSeat = (_seats) => {
    if (!seats) return;

    _seats.forEach((seat) => {
      seats[seat.x][seat.y].status = 'Booked';
    });

    setSeats([...seats]);
  };

  useEffect(() => {
    if (!props.data) return;
    startBooking();
  }, [props.data]);

  useEffect(() => {
    // Response
    socket.on('reservedSeats', onReservedSeats);
    socket.on('addSeat', onAddSeat);
    socket.on('removeSeat', onRemoveSeat);
    socket.on('error', onError);
    socket.on('cancelSeat', onCancelSeat);
    socket.on('completeSeat', onCompleteSeat);

    // Thoát | Unmount
    return () => {
      socket.off('reservedSeats', onReservedSeats);
      socket.off('addSeat', onAddSeat);
      socket.off('removeSeat', onRemoveSeat);
      socket.off('error', onError);
      socket.off('cancelSeat', onCancelSeat);
      socket.on('completeSeat', onCompleteSeat);
    };
  }, []);

  const handleClickSeat = (seat) => {
    if (seat.status === 'Available') {
      selectSeat(seat);
    } else {
      removeSeat(seat);
    }
  };

  return (
    <div>
      {loading ? (
        <Loading />
      ) : (
        <div className="w-100 d-flex flex-column justify-content-center align-items-center">
          <div className="mt-2 px-3">
            {/* Screen */}
            <div className="mt-3 screen-container">
              <div className="screen bg-light border rounded shadow-sm z-3 text-center py-3 mx-auto">Màn hình</div>
            </div>
            {/* DS ghế */}
            <div className="mt-3 px-3">
              {seats?.length ? (
                seats?.map((seat, idx) => {
                  return (
                    <div key={idx} className="d-flex gap-2 my-2">
                      {seat.map((col) => (
                        <div
                          key={col._id}
                          style={{ width: 'fit-content', height: 'fit-content' }}
                          onClick={() => handleClickSeat(col)}
                        >
                          {getSeat(col.type, col.label, col.status)}
                        </div>
                      ))}
                    </div>
                  );
                })
              ) : (
                <NoDataCard />
              )}
            </div>
          </div>
          <div className="mt-4 p-3 w-100 h-100 text-center d-flex justify-content-between border-top shadow-sm z-3">
            {/* Actions */}
            <div className="d-flex gap-3" style={{ width: 'fit-content' }}>
              <div className="d-flex gap-2">
                <div className="seat-small seat-selected text-center" /> <div>Đang chọn</div>
              </div>
              <div className="d-flex gap-2">
                <div className="seat-small seat-booked text-center" /> <div>Đã bán</div>
              </div>
              <div className="d-flex gap-2">
                <div className="seat-small seat-reserved text-center" /> <div>Đặt trước</div>
              </div>
            </div>
            {/* Types */}
            <div className="d-flex gap-3" style={{ width: 'fit-content' }}>
              <div className="d-flex gap-2">
                <div className="seat-small seat-standard text-center" /> <div>Ghế thường</div>
              </div>
              <div className="d-flex gap-2">
                <div className="seat-small seat-vip text-center" /> <div>Ghế VIP</div>
              </div>
              <div className="d-flex gap-2">
                <div className="seat-small seat-sweetbox text-center" /> <div>Ghế đôi</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
