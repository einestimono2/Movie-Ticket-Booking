import { type Request } from 'express';
import { type PipelineStage } from 'mongoose';

import { ReviewModel, NotFoundError, BadRequestError, MovieModel, TheaterModel } from '../models';
import { type IReview } from '../interfaces';
import { Message } from '../constants';
import { addPaginationPipelineStage, convertToMongooseId } from '../utils';

const updateMovieOrTheaterRatingData = async (review: any) => {
  if (review.movie) {
    const result = await ReviewModel.aggregate([
      { $match: { movie: review.movie } },
      {
        $group: {
          _id: '$movie',
          ratingAverage: { $avg: '$rating' },
          ratingCount: { $count: {} }
        }
      },
      { $project: { _id: 0 } }
    ]);

    await MovieModel.findByIdAndUpdate(review.movie, result[0]);

    return result[0];
  } else if (review.theater) {
    const result = await ReviewModel.aggregate([
      { $match: { theater: review.theater } },
      {
        $group: {
          _id: '$theater',
          ratingAverage: { $avg: '$rating' },
          ratingCount: { $count: {} }
        }
      },
      { $project: { _id: 0 } }
    ]);

    await TheaterModel.findByIdAndUpdate(review.theater, result[0]);

    return result[0];
  }
};

export const createOrUpdateReview = async (review: IReview) => {
  if (review.movie && (review.rating < 0 || review.rating > 10))
    throw new BadRequestError(Message.INVALID_MOVIE_RATING);
  else if (review.theater && (review.rating < 0 || review.rating > 5))
    throw new BadRequestError(Message.INVALID_THEATER_RATING);

  const find: Record<string, any> = { user: review.user };
  if (review.movie) find.movie = review.movie;
  if (review.theater) find.theater = review.theater;

  const newReview = await ReviewModel.findOneAndUpdate(find, review, { new: true, upsert: true });

  return await updateMovieOrTheaterRatingData(newReview);
};

export const getReviewsByMovie = async (req: Request) => {
  const userId = req.userPayload?.id ?? '-';

  const pipeline: PipelineStage[] = [
    { $match: { isActive: true, movie: convertToMongooseId(req.params.id) } },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        pipeline: [{ $project: { _id: 1, name: 1, email: 1, avatar: 1 } }],
        as: 'user'
      }
    },
    { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
    { $addFields: { mine: { $eq: [{ $toString: '$user._id' }, userId] } } },
    { $sort: { mine: -1, createdAt: -1 } }
  ];

  addPaginationPipelineStage({ req, pipeline });

  return await ReviewModel.aggregate(pipeline);
};

export const getReviewsByTheater = async (req: Request) => {
  const userId = req.userPayload?.id ?? '-';

  const pipeline: PipelineStage[] = [
    { $match: { isActive: true, theater: convertToMongooseId(req.params.id) } },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        pipeline: [{ $project: { _id: 1, name: 1, email: 1, avatar: 1 } }],
        as: 'user'
      }
    },
    { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
    { $addFields: { mine: { $eq: [{ $toString: '$user._id' }, userId] } } },
    { $sort: { mine: -1, createdAt: -1 } }
  ];

  addPaginationPipelineStage({ req, pipeline });

  return await ReviewModel.aggregate(pipeline);
};

export const getReviewsOfMyTheater = async (req: Request) => {
  if (!req.userPayload?.theater) {
    throw new NotFoundError(Message.MANAGER_THEATER_EMPTY);
  }

  const pipeline: PipelineStage[] = [
    { $match: { theater: convertToMongooseId(req.userPayload?.theater) } },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        pipeline: [{ $project: { _id: 1, name: 1, email: 1, avatar: 1 } }],
        as: 'user'
      }
    },
    { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
    { $sort: { createdAt: -1 } }
  ];

  addPaginationPipelineStage({ req, pipeline });

  return await ReviewModel.aggregate(pipeline);
};

export const deleteReview = async (id: string) => {
  const doc = await ReviewModel.findByIdAndDelete(id);
  if (!doc) {
    throw new NotFoundError(Message.REVIEW_NOT_FOUND);
  }

  await updateMovieOrTheaterRatingData(doc);
};

export const myReview = async (req: Request) => {
  const userId = req.userPayload?.id ?? '-';

  const review = await ReviewModel.findOne({
    user: userId,
    $or: [{ theater: req.params.id }, { movie: req.params.id }, { _id: req.params.id }]
  });

  return review ?? {};
};

export const toggleActiveReview = async (id: string) => {
  const review = await ReviewModel.findById(id);
  if (!review) {
    throw new NotFoundError(Message.REVIEW_NOT_FOUND);
  }

  await review.updateOne({ isActive: !review.isActive });
};
