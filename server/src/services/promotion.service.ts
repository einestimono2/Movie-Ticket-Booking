import { PromotionModel, NotFoundError } from '../models';
import { type IUpdatePromotionRequest, type IPromotion, type IApplyPromotionRequest } from '../interfaces';
import { Message, PROMOTION_UPLOAD_FOLDER } from '../constants';
import { cloudinaryServices } from '.';
import dayjs from 'dayjs';
import { type PipelineStage } from 'mongoose';
import { convertToMongooseId } from '../utils';

export const createPromotion = async (promotion: IPromotion) => {
  if (!promotion.theater) {
    throw new NotFoundError(Message.MANAGER_THEATER_EMPTY);
  }

  if (promotion.code) {
    const isExist = await PromotionModel.findOne({ code: promotion.code, theater: promotion.theater });
    if (isExist) throw new NotFoundError(Message.PROMOTION_CODE_EXIST);
  }

  const _promotion = new PromotionModel(promotion);
  return await _promotion.save();
};

export const applyPromotion = async (body: IApplyPromotionRequest, userId?: string) => {
  const pipelines: PipelineStage[] = [
    { $match: { theater: convertToMongooseId(body.theater), isActive: true, code: body.code } },
    { $set: { isUsed: { $in: [convertToMongooseId(userId), '$userUsed'] } } }
  ];

  const [promotion] = await PromotionModel.aggregate(pipelines);
  if (!promotion) {
    throw new NotFoundError(Message.PROMOTION_NOT_FOUND);
  }

  if (promotion.isUsed) {
    throw new NotFoundError(Message.PROMOTION_USED);
  }

  const startTime = dayjs(body.startTime).format('YYYY-MM-DD HH:mm');
  const promotionStartTime = dayjs(promotion.startTime).format('YYYY-MM-DD HH:mm');

  if (startTime < promotionStartTime) {
    throw new NotFoundError(Message.PROMOTION_EXPIRED_OR_UNAVAILABLE);
  }
  if (promotion.endTime && startTime > dayjs(promotion.endTime).format('YYYY-MM-DD HH:mm')) {
    throw new NotFoundError(Message.PROMOTION_EXPIRED_OR_UNAVAILABLE);
  }

  return promotion;
};

export const deletePromotion = async (id: string) => {
  // Xử lý xóa ảnh và hợp lệ trong middleware
  const doc = await PromotionModel.findByIdAndDelete(id);
  if (!doc) {
    throw new NotFoundError(Message.PROMOTION_NOT_FOUND);
  }
};

export const updatePromotion = async (id: string, newPromotion: IUpdatePromotionRequest, theater?: string) => {
  if (newPromotion.code) {
    const isExist = await PromotionModel.findOne({ code: newPromotion.code, theater, _id: { $ne: id } });
    if (isExist) throw new NotFoundError(Message.PROMOTION_CODE_EXIST);
  }

  // Xóa thumbnail mới khỏi obj nếu có
  const thumbnail = newPromotion.thumbnail;
  if (thumbnail) delete newPromotion.thumbnail;

  const promotion = await PromotionModel.findById(id);
  if (!promotion) throw new NotFoundError(Message.PROMOTION_NOT_FOUND);

  Object.assign(promotion, newPromotion);
  await promotion.validate();

  if (thumbnail) {
    promotion.thumbnail = await cloudinaryServices.uploadImage({
      public_id: promotion._id,
      file: thumbnail,
      folder: PROMOTION_UPLOAD_FOLDER
    });
  }

  return await promotion.save();
};

export const getPromotionDetails = async (id: string) => {
  const promotion = await PromotionModel.findById(id);
  if (!promotion) throw new NotFoundError(Message.PROMOTION_NOT_FOUND);

  return promotion;
};

export const getPromotionsByTheater = async (theater: string, userId?: string) => {
  const pipelines: PipelineStage[] = [
    { $match: { theater: convertToMongooseId(theater), isActive: true } },
    { $set: { isUsed: { $in: [convertToMongooseId(userId), '$userUsed'] } } }
  ];

  return await PromotionModel.aggregate(pipelines);
};

export const getMyTheaterPromotions = async (theater?: string) => {
  if (!theater) {
    throw new NotFoundError(Message.MANAGER_THEATER_EMPTY);
  }

  const promotion = await PromotionModel.find({ theater });

  return promotion;
};
