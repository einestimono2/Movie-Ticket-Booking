import { type NextFunction, type Request, type Response } from 'express';

import { userServices } from '../services';
import { type IUpdatePasswordRequest } from '../interfaces';
import { CatchAsyncError } from '../middlewares';
import { Message } from '../constants';
import { BadRequestError, NotFoundError } from '../models';

//! Profile
export const getProfile = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const user = await userServices.getUserById(req.userPayload!.id);

  res.sendOK({
    data: user
  });
});

export const updateProfile = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const user = await userServices.updateProfile(req.userPayload!.id, { ...req.body });

  res.sendOK({
    data: user
  });
});

export const updateAvatar = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.body.avatar) {
    next(new NotFoundError(Message.AVATAR_EMPTY));
    return;
  }

  const user = await userServices.updateProfile(req.userPayload!.id, { avatar: req.body.avatar });

  res.sendOK({
    data: user
  });
});

export const updatePassword = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const { oldPassword, newPassword } = req.body as IUpdatePasswordRequest;

  if (!oldPassword || !newPassword) {
    next(new BadRequestError(Message.OLD_OR_NEW_PASSWORD_EMPTY));
    return;
  }

  const user = await userServices.getUserById(req.userPayload!.id, true);

  // Trường hợp social login => không có mật khẩu
  if (user.password !== undefined) {
    const isPasswordMatchh = await user?.comparePassword(oldPassword);
    if (!isPasswordMatchh) {
      next(new BadRequestError(Message.WRONG_OLD_PASSWORD));
      return;
    }

    if (oldPassword === newPassword) {
      next(new BadRequestError(Message.PASSWORD_DOES_NOT_MATCH));
      return;
    }
  }

  user.password = newPassword;

  await user.save();

  res.sendCREATED({
    data: user
  });
});

export const getUsers = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const [payload] = await userServices.getUsers(req);

  res.sendOK({
    data: payload?.data ?? [],
    extra: payload?.extra ?? { totalCount: 0 }
  });
});

export const toggleBlock = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const user = await userServices.toggleBlock(req.params.id);

  res.sendOK({
    data: user
  });
});

export const toggleFavoriteMovie = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const user = await userServices.toggleFavoriteMovie(req);

  res.sendOK({
    data: user
  });
});

export const toggleFavoriteTheater = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const user = await userServices.toggleFavoriteTheater(req);

  res.sendOK({
    data: user
  });
});

export const myFavorite = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const [favorite] = await userServices.myFavorite(req);

  res.sendOK({
    data: favorite
  });
});
