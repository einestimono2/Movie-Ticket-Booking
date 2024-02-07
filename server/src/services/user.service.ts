import jwt, { type Secret } from 'jsonwebtoken';
import { type Request } from 'express';

import {
  type IActivationToken,
  type IUser,
  type IOTPRequest,
  type IResetPasswordToken,
  type IUpdateProfileRequest
} from '../interfaces';
import { BadRequestError, MovieModel, NotFoundError, TheaterModel, UserModel } from '../models';
import logger, { SendMail, convertRequestToPipelineStages, convertToMongooseId, omitIsNil } from '../utils';
import { AVATAR_UPLOAD_FOLDER, Message } from '../constants';
import { cloudinaryServices } from '.';
import { type PipelineStage } from 'mongoose';

export const createUser = async (user: IUser) => {
  const isEmailExist = await findUserByEmail(user.email);
  if (isEmailExist) {
    if (!isEmailExist.isVerified) throw new BadRequestError(Message.ACCOUNT_NOT_ACTIVATED);
    else throw new BadRequestError(Message.EMAIL_ALREADY_EXIST);
  }

  const newUser = new UserModel(user);

  return await newUser.save();
};

export const findUserByEmail = async (email: string, password: boolean = false) => {
  return await UserModel.findOne({ email }).select(password ? '+password' : '-password');
};

export const getUsers = async (req: Request) => {
  const options = convertRequestToPipelineStages({
    req,
    fieldsApplySearch: ['_id', 'email', 'name', 'phoneNumber', 'provider']
  });

  return await UserModel.aggregate(options);
};

export const toggleBlock = async (id: string) => {
  const user = await UserModel.findById(id);
  if (!user) {
    throw new NotFoundError(Message.USER_NOT_FOUND);
  }

  user.isBlocked = !user.isBlocked;

  return await user.save();
};

export const getUserByEmail = async (email: string, password: boolean = false) => {
  const user = await UserModel.findOne({ email }).select(password ? '+password' : '-password');
  if (!user) {
    throw new NotFoundError(Message.EMAIL_NOT_EXIST);
  }

  return user;
};

export const getUserById = async (id: string, password: boolean = false) => {
  const user = await UserModel.findById(id).select(password ? '+password' : '-password');
  if (!user) {
    throw new NotFoundError(Message.USER_NOT_FOUND);
  }

  return user;
};

export const getUser = async (filters: any, password: boolean = false) => {
  const user = await UserModel.findOne(omitIsNil(filters)).select(password ? '+password' : '-password');
  if (!user) {
    throw new NotFoundError(Message.USER_NOT_FOUND);
  }

  return user;
};

export const toggleFavoriteMovie = async (req: Request) => {
  if (!req.userPayload?.id) {
    throw new NotFoundError(Message.USER_NOT_FOUND);
  }

  const user = await getUserById(req.userPayload?.id);

  const index = user.favoriteMovies.indexOf(req.params.id);
  // Bỏ yêu thích
  if (index > -1) {
    user.favoriteMovies.splice(index, 1);
    await MovieModel.findByIdAndUpdate(req.params.id, { $inc: { totalFavorites: -1 } });
  }
  // Yêu thích
  else {
    user.favoriteMovies.push(req.params.id);
    await MovieModel.findByIdAndUpdate(req.params.id, { $inc: { totalFavorites: 1 } });
  }

  return await user.save();
};

export const toggleFavoriteTheater = async (req: Request) => {
  if (!req.userPayload?.id) {
    throw new NotFoundError(Message.USER_NOT_FOUND);
  }

  const user = await getUserById(req.userPayload?.id);

  const index = user.favoriteTheaters.indexOf(req.params.id);
  if (index > -1) {
    user.favoriteTheaters.splice(index, 1);
    await TheaterModel.findByIdAndUpdate(req.params.id, { $inc: { totalFavorites: -1 } });
  } else {
    user.favoriteTheaters.push(req.params.id);
    await TheaterModel.findByIdAndUpdate(req.params.id, { $inc: { totalFavorites: 1 } });
  }

  return await user.save();
};

export const myFavorite = async (req: Request) => {
  const piplelines: PipelineStage[] = [
    { $match: { _id: convertToMongooseId(req.userPayload?.id) } },
    { $project: { favoriteMovies: 1, favoriteTheaters: 1, _id: 0 } },
    {
      $lookup: {
        from: 'movies',
        localField: 'favoriteMovies',
        foreignField: '_id',
        pipeline: [
          {
            $lookup: {
              from: 'genres',
              localField: 'genres',
              foreignField: '_id',
              as: 'genres',
              pipeline: [{ $project: { name: 1 } }]
            }
          },
          {
            $project: {
              genres: `$genres.name.${req.getLocale()}`,
              _id: 1,
              title: 1,
              originalTitle: 1,
              trailer: 1,
              poster: 1,
              duration: 1,
              releaseDate: 1,
              overview: `$overview.${req.getLocale()}`,
              ageType: 1,
              ratingAverage: 1,
              ratingCount: 1,
              createdAt: 1
            }
          }
        ],
        as: 'favoriteMovies'
      }
    },
    {
      $lookup: {
        from: 'theaters',
        localField: 'favoriteTheaters',
        foreignField: '_id',
        pipeline: [
          {
            $set: {
              description: `$description.name.${req.getLocale()}`,
              coordinates: '$location.coordinates',
              location: '$$REMOVE'
            }
          }
        ],
        as: 'favoriteTheaters'
      }
    },
    { $project: { movies: '$favoriteMovies', theaters: '$favoriteTheaters' } }
  ];

  return await UserModel.aggregate(piplelines);
};

export const updateProfile = async (id: string, newProfile: IUpdateProfileRequest) => {
  // Xóa ảnh mới khỏi obj nếu có
  const avatar = newProfile.avatar;
  if (avatar) delete newProfile.avatar;

  const user = await getUserById(id);

  Object.assign(user, newProfile);
  await user.validate();

  if (avatar) {
    user.avatar = await cloudinaryServices.uploadImage({
      public_id: user._id,
      file: avatar,
      folder: AVATAR_UPLOAD_FOLDER
    });
  }

  return await user.save();
};

export const sendActivationOTP = async (payload: IOTPRequest): Promise<IActivationToken> => {
  const { activationToken, otp } = createActivationToken(payload.id);
  const createdAt = new Date(Date.now()).toLocaleString();
  const expiredTime = (process.env.ACTIVATION_TOKEN_EXPIRE ?? '5m').replace(/[^0-9]/g, '');
  const data = { user: { name: payload.name ?? payload.email, email: payload.email }, otp, createdAt, expiredTime };

  await SendMail({
    email: payload.email,
    subject: payload.subject,
    template: payload.template,
    data
  });

  return { activationToken, otp };
};

export const sendResetPasswordOTP = async (payload: IOTPRequest): Promise<IResetPasswordToken> => {
  const { resetPasswordToken, otp } = createResetPasswordToken(payload.id);
  const createdAt = new Date(Date.now()).toLocaleString();
  const expiredTime = (process.env.RESET_PASSWORD_TOKEN_EXPIRE ?? '5m').replace(/[^0-9]/g, '');
  const data = { user: { name: payload.name ?? payload.email, email: payload.email }, otp, createdAt, expiredTime };

  await SendMail({
    email: payload.email,
    subject: payload.subject,
    template: payload.template,
    data
  });

  return { resetPasswordToken, otp };
};

// METHODs

const createActivationToken = (id: string): IActivationToken => {
  // OTP verification - 6 digits
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  logger.debug(`OTP: ${otp}`);

  const activationToken = jwt.sign({ id, otp }, process.env.ACTIVATION_TOKEN_SECRET as Secret, {
    expiresIn: process.env.ACTIVATION_TOKEN_EXPIRE
  });

  return { activationToken, otp };
};

const createResetPasswordToken = (id: string): IResetPasswordToken => {
  // OTP verification - 6 digits
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  logger.debug(`OTP: ${otp}`);

  const resetPasswordToken = jwt.sign({ id, otp }, process.env.RESET_PASSWORD_TOKEN_SECRET as Secret, {
    expiresIn: process.env.RESET_PASSWORD_TOKEN_EXPIRE
  });

  return { resetPasswordToken, otp };
};
