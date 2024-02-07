import { type Request } from 'express';
import { type PipelineStage } from 'mongoose';

import { BookingModel, NotFoundError, PromotionModel } from '../models';
import { type IPayment, type IBooking } from '../interfaces';
import { Message } from '../constants';
import { addPaginationPipelineStage, convertToMongooseId } from '../utils';

export const createBooking = async (booking: IBooking) => {
  const _booking = new BookingModel(booking);

  const result = await _booking.save();

  if ((result.payment as IPayment).promotion?.length) {
    for (const payment of (result.payment as IPayment).promotion) {
      await PromotionModel.findByIdAndUpdate(payment, {
        $addToSet: { userUsed: convertToMongooseId(booking.user as string) }
      });
    }
  }

  return result;
};

export const deleteBooking = async (id: string) => {
  const doc = await BookingModel.findByIdAndDelete(id);
  if (!doc) {
    throw new NotFoundError(Message.BOOKING_NOT_FOUND);
  }
};

export const getBookingDetails = async (id: string) => {
  const booking = await BookingModel.findById(id)
    .populate('user', { name: 1, email: 1, phoneNumber: 1 })
    .populate('showtime')
    .populate('theater')
    .populate('room')
    .populate('products.item')
    .populate('payment.promotion');
  if (!booking) {
    throw new NotFoundError(Message.BOOKING_NOT_FOUND);
  }

  return booking;
};

export const getBookingsByUser = async (req: Request) => {
  const pipeline: PipelineStage[] = [
    { $match: { user: convertToMongooseId(req.userPayload?.id) } },
    {
      $lookup: {
        from: 'showtimes',
        localField: 'showtime',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              _id: 1,
              startTime: 1,
              endTime: 1,
              type: 1,
              movie: 1,
              language: 1
            }
          },
          {
            $lookup: {
              from: 'movies',
              localField: 'movie',
              foreignField: '_id',
              pipeline: [
                {
                  $project: {
                    _id: 1,
                    poster: 1,
                    title: 1,
                    originalTitle: 1,
                    duration: 1,
                    ageType: 1
                  }
                }
              ],
              as: 'movie'
            }
          },
          { $unwind: { path: '$movie', preserveNullAndEmptyArrays: true } }
        ],
        as: 'showtime'
      }
    },
    { $unwind: { path: '$showtime', preserveNullAndEmptyArrays: true } },
    { $set: { movie: '$showtime.movie', 'showtime.movie': '$$REMOVE' } },
    {
      $lookup: {
        from: 'theaters',
        localField: 'theater',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              _id: 1,
              name: 1,
              logo: 1,
              address: 1,
              coordinates: '$location.coordinates'
            }
          }
        ],
        as: 'theater'
      }
    },
    { $unwind: { path: '$theater', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'rooms',
        localField: 'room',
        foreignField: '_id',
        let: { listSeat: '$seats' },
        pipeline: [
          {
            $project: {
              type: 1,
              name: 1,
              seats: {
                $filter: {
                  input: '$seats',
                  as: 'item',
                  cond: { $in: ['$$item._id', '$$listSeat'] }
                }
              }
            }
          },
          {
            $project: {
              type: 1,
              name: 1,
              'seats.label': 1,
              'seats.type': 1
            }
          }
        ],
        as: 'room'
      }
    },
    { $unwind: { path: '$room', preserveNullAndEmptyArrays: true } },
    { $set: { seats: '$room.seats', 'room.seats': '$$REMOVE' } },
    {
      $lookup: {
        from: 'products',
        localField: 'products.item',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              _id: 1,
              name: 1,
              price: 1,
              image: 1
            }
          }
        ],
        as: 'temp_products'
      }
    },
    {
      $set: {
        'products.item': {
          $arrayElemAt: ['$temp_products', { $indexOfArray: ['$temp_products.id', '$products.item.id'] }]
        },
        temp_products: '$$REMOVE',
        'products._id': '$$REMOVE'
      }
    },
    {
      $lookup: {
        from: 'promotions',
        localField: 'payment.promotion',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              title: 1,
              code: 1,
              thumbnail: 1,
              value: 1,
              type: 1
            }
          }
        ],
        as: 'payment.promotion'
      }
    },

    { $sort: { createdAt: -1 } }
  ];

  addPaginationPipelineStage({ req, pipeline });

  return await BookingModel.aggregate(pipeline);
};

export const getBookingsByTheater = async (req: Request) => {
  const pipeline: PipelineStage[] = [
    { $match: { theater: convertToMongooseId(req.userPayload?.theater) } },
    { $sort: { createdAt: -1 } }
  ];

  addPaginationPipelineStage({ req, pipeline });

  return await BookingModel.aggregate(pipeline);
};

export const getBookings = async (req: Request) => {
  const pipeline: PipelineStage[] = [{ $sort: { createdAt: 1 } }];

  addPaginationPipelineStage({ req, pipeline });

  return await BookingModel.aggregate(pipeline);
};

export const getBookedSeats = async (showtime: string, room: string) => {
  const data = await BookingModel.find({ showtime, room });

  const bookedSeats: any[] = [];

  data.forEach((e) => {
    bookedSeats.push(...e.seats);
  });

  return bookedSeats;
};
