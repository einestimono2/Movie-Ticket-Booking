import { type Request } from 'express';
import { type PipelineStage } from 'mongoose';

import { RoomModel, NotFoundError } from '../models';
import { type IUpdateRoomRequest, type IRoom } from '../interfaces';
import { Message } from '../constants';
import { convertToMongooseId } from '../utils';

export const createRoom = async (room: IRoom) => {
  if (!room.theater) {
    throw new NotFoundError(Message.MANAGER_THEATER_EMPTY);
  }

  const newRoom = new RoomModel(room);

  return await newRoom.save();
};

export const deleteRoom = async (id: string) => {
  return await RoomModel.findByIdAndDelete(id);
};

export const updateRoom = async (id: string, newRoom: IUpdateRoomRequest) => {
  const room = await RoomModel.findByIdAndUpdate(id, newRoom, { new: true });
  if (!room) throw new NotFoundError(Message.ROOM_NOT_FOUND);

  return room;
};

export const getRoomsByTheater = async (theater: string) => {
  const rooms = await RoomModel.find({ theater }, { seats: false });

  return rooms;
};

export const getMyTheaterRooms = async (req: Request) => {
  const theaterId = req.userPayload?.theater;
  if (!theaterId) {
    throw new NotFoundError(Message.MANAGER_THEATER_EMPTY);
  }

  const rooms = await RoomModel.find({ theater: theaterId }, { seats: false });

  return rooms;
};

export const getRoomDetails = async (id: string) => {
  const rooms = await RoomModel.findById(id);

  return rooms;
};

export const getSeatListWithStatus = async (room: string, showtime: string) => {
  const pipelines: PipelineStage[] = [
    { $match: { _id: convertToMongooseId(room) } },
    { $unwind: '$seats' },
    { $replaceRoot: { newRoot: '$seats' } },
    {
      $lookup: {
        from: 'bookings',
        localField: '_id',
        foreignField: 'seats',
        pipeline: [{ $project: { _id: 1, showtime: 1 } }, { $match: { showtime: convertToMongooseId(showtime) } }],
        as: 'seatsBooked'
      }
    },
    { $unwind: { path: '$seatsBooked', preserveNullAndEmptyArrays: true } },
    {
      $set: {
        status: { $cond: [{ $ifNull: ['$seatsBooked', false] }, 'Booked', 'Available'] }
      }
    }
  ];

  return await RoomModel.aggregate(pipelines);
};
