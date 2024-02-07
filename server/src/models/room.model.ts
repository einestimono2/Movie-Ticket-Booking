import mongoose, { type Schema } from 'mongoose';

import { type ISeat, type IRoom } from '../interfaces';
import { Message, RoomTypes, SeatTypes } from '../constants';
import { ConflictError } from '.';

const seatSchema: Schema<ISeat> = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: {
        values: Object.values(SeatTypes),
        message: `'${Message.INVALID_SEAT_TYPE_s.msg}', '{VALUE}'`
      },
      required: [true, `'${Message.FIELD_s_EMPTY.msg}', 'type'`]
    },
    label: {
      type: String,
      required: [true, `'${Message.FIELD_s_EMPTY.msg}', 'label'`]
    },
    coordinates: {
      type: [Number, Number],
      required: [true, `'${Message.FIELD_s_EMPTY.msg}', 'coordinates'`]
    },
    status: {
      type: String,
      default: 'Available'
    }
  },
  { timestamps: true, versionKey: false }
);
// seatSchema.index({ row: 1, col: 1 }, { unique: true });

const roomSchema: Schema<IRoom> = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: {
        values: Object.values(RoomTypes),
        message: `'${Message.INVALID_ROOM_TYPE_s.msg}', '{VALUE}'`
      },
      required: [true, `'${Message.FIELD_s_EMPTY.msg}', 'type'`]
    },
    name: {
      type: String,
      unique: true,
      required: [true, `'${Message.FIELD_s_EMPTY.msg}', 'name'`]
    },
    capacity: {
      type: Number,
      required: [true, `'${Message.FIELD_s_EMPTY.msg}', 'capacity'`]
    },
    theater: {
      required: [true, `'${Message.FIELD_s_EMPTY.msg}', 'theater'`],
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theater'
    },
    seats: [
      seatSchema
      // {
      //   type: mongoose.Schema.Types.ObjectId,
      //   ref: 'Seat'
      // }
    ],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true, versionKey: false }
);

// Validate list seat
roomSchema.pre('save', function (next, done) {
  if (this.seats) {
    const size = this.seats.length;

    // Validate row-col
    if (new Set(this.seats.map((e) => `${e.label}-${e.coordinates.toString()}`)).size !== size) {
      next(new ConflictError(Message.INVALID_ROOM_SEATS_ROW_COL));
      return;
    }

    // Validate coordinates
    if (new Set(this.seats.map((e) => e.coordinates.toString())).size !== size) {
      next(new ConflictError(Message.INVALID_ROOM_SEATS_COORDINATES));
      return;
    }
  }

  next();
});

export const RoomModel = mongoose.model<IRoom>('Room', roomSchema);
