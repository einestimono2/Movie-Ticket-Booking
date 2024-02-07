import { type NextFunction, type Request, type Response } from 'express';

import { CatchAsyncError } from '../middlewares';
import { roomServices } from '../services';

// Create a new room
export const createRoom = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const seats: object[] = [];

  for (let r = 0; r < req.body.seats.length; r++) {
    for (let c = 0; c < req.body.seats[r].length; c++) {
      const seat = req.body.seats[r][c];
      seats.push({
        label: seat.label,
        coordinates: [r, c],
        type: seat.type
      });
    }
  }

  const room = await roomServices.createRoom({ ...req.body, theater: req.userPayload?.theater, seats });

  res.sendCREATED({
    data: room
  });
});

// Get list rooms of theater
export const getRoomsByTheater = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const room = await roomServices.getRoomsByTheater(req.params.id);

  res.sendOK({
    data: room
  });
});

// Get list rooms of my theater
export const getMyTheaterRooms = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const room = await roomServices.getMyTheaterRooms(req);

  res.sendOK({
    data: room
  });
});

export const getRooms = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  //
});

export const getRoomDetails = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const room = await roomServices.getRoomDetails(req.params.id);

  res.sendOK({
    data: room ?? {}
  });
});

export const getSeatListWithStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const room = await roomServices.getSeatListWithStatus(req.body.room, req.body.showtime);

  res.sendOK({
    data: room ?? {}
  });
});

// Update Room
export const updateRoom = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const seats: object[] = [];

  for (let r = 0; r < req.body.seats.length; r++) {
    for (let c = 0; c < req.body.seats[r].length; c++) {
      const seat = req.body.seats[r][c];
      seats.push({
        label: seat.label,
        coordinates: [r, c],
        type: seat.type
      });
    }
  }

  const room = await roomServices.updateRoom(req.params.id, { ...req.body, seats });

  res.sendCREATED({
    data: room
  });
});

// Delete Room
export const deleteRoom = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  await roomServices.deleteRoom(req.params.id);

  res.sendOK();
});
