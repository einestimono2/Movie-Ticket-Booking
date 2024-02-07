import React, { useEffect, useState } from 'react';
import { Rate, Button } from 'antd';
import { StarFilled } from '@ant-design/icons';

import { rateTooltip } from '../../../constants/strings';
import { ReviewCard, TheaterReviewCard } from '../../../components/review-card';
import apiCaller from '../../../apis/apiCaller';
import { reviewApi } from '../../../apis/reviewApi';
import { Loading } from '../../../components/loading';
import NoDataCard from '../../../components/no-data-card';
import { isAuthenticated } from '../../../utils/can-continue';

const PAGE_SIZE = 5;

export default function TheaterReviews(props) {
  const [reviews, setReviews] = useState();

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [modalReviewCreate, setModalReviewCreate] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [ratingAverage, setRatingAverage] = useState(props.theater?.ratingAverage);
  const [ratingCount, setRatingCount] = useState(props.theater?.ratingCount);

  const errorHandler = (error) => {
    setLoading(false);
    props.onError(error);
  };

  const childrenErrorHandler = (error) => {
    props.onError(error);
    setModalReviewCreate(false);
  };

  const getListReviewOfTheater = async () => {
    if (!props.theater?._id) return;

    setLoading(true);
    const response = await apiCaller({
      request: reviewApi.listReviewByTheater(props.theater?._id, {
        page: currentPage,
        limit: PAGE_SIZE,
      }),
      errorHandler,
    });

    if (response) {
      setTotalPages(response.extra.totalPages);
      setReviews(response.data);
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (currentPage === 1) return; // Tương ứng vs load lần đầu tiên - getListReviewOfTheater đã gọi r

    setLoadingMore(true);
    const response = await apiCaller({
      request: reviewApi.listReviewByTheater(props.theater?._id, {
        page: currentPage,
        limit: PAGE_SIZE,
      }),
      errorHandler,
    });

    if (response) {
      setReviews([...reviews, ...response.data]);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    handleLoadMore();
  }, [currentPage]);

  useEffect(() => {
    getListReviewOfTheater();
  }, [props.theater?._id]);

  return (
    <>
      {loading ? (
        <Loading height="30vh" />
      ) : (
        <div className="border shadow-sm border-top-0 z-3 px-3 py-4 rounded-bottom">
          <div className="border shadow-sm rounded-3 p-3 w-50 text-center my-2 mx-auto">
            <span className="mb-2 fw-bold fs-2 text-danger">{ratingAverage?.toFixed(2) ?? 0}</span>
            <span className="mb-2 fs-5 text-danger"> trên 5</span>
            <div>
              <Rate
                tooltips={rateTooltip}
                value={ratingAverage}
                allowHalf
                style={{ fontSize: '2rem' }}
                onChange={() => isAuthenticated({ onSuccess: () => setModalReviewCreate(true) })}
              />
            </div>
            <div className="mt-1 text-muted">
              {ratingCount ? `Dựa trên ${ratingCount} đánh giá` : 'Chưa có đánh giá nào'}
            </div>
          </div>
          <div className="mx-5">
            <div className="d-flex justify-content-between align-items-center">
              <h2 className="mt-4 mb-3 fw-bold border-5 border-start border-primary ps-2 d-flex justify-content-between">
                DANH SÁCH ĐÁNH GIÁ
              </h2>
              <Button
                icon={<StarFilled />}
                onClick={() => isAuthenticated({ onSuccess: () => setModalReviewCreate(true) })}
              >
                Đánh giá
                {/* 4.8 <StarFilled style={{ color: '#f6c343' }} /> */}
              </Button>
            </div>
            {reviews?.length ? (
              <div className="">
                {reviews?.map((review) => (
                  <ReviewCard key={review._id} review={review} />
                ))}

                {currentPage < totalPages && (
                  <div className="text-center w-100 mt-3">
                    <Button
                      type="primary"
                      className="w-100"
                      style={{ height: '2.5rem' }}
                      loading={loadingMore}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Xem thêm
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <NoDataCard
                text={
                  <div>
                    <div>{'Rạp chưa có đánh giá nào'}</div>
                    <div>{'Hãy trở thành người đánh giá đầu tiên'}</div>
                  </div>
                }
              />
            )}
          </div>
        </div>
      )}

      <TheaterReviewCard
        open={modalReviewCreate}
        onCancel={() => setModalReviewCreate(false)}
        title={props.theater?.name}
        id={props.theater?._id}
        onSuccess={(data) => {
          setRatingAverage(data.ratingAverage);
          setRatingCount(data.ratingCount);
          setModalReviewCreate(false);
          getListReviewOfTheater();
        }}
        onError={(message) => childrenErrorHandler(message)}
      />
    </>
  );
}
