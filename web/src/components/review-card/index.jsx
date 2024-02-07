import React, { useEffect, useState } from 'react';
import { Modal, Image, Rate, Form, Input, Button, Checkbox, Avatar, Pagination, Skeleton } from 'antd';
import { StarFilled } from '@ant-design/icons';

import { reviewApi } from '../../apis/reviewApi';
import apiCaller from '../../apis/apiCaller';
import { getTimeAgo } from '../../utils/date';
import { SPOILER_WARNING_IMAGE } from '../../constants/images';
import { rateTooltip } from '../../constants/strings';
import NoDataCard from '../no-data-card';

export const TheaterReviewCard = (props) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [buttonText, setButtonText] = useState('Gửi đánh giá');

  const errorHandler = (error) => {
    setLoading(false);
    console.log(error);
    props.onError(error);
  };

  const onFinish = async (values) => {
    if (!props.id) return;

    setLoading(true);
    const response = await apiCaller({
      request: reviewApi.createReview({ ...values, theater: props.id }),
      errorHandler,
    });

    if (response) {
      setLoading(false);
      props.onSuccess(response.data);
    }
  };

  const getMyReview = async () => {
    if (!props.id) return;

    setReviewLoading(true);
    const response = await apiCaller({
      request: reviewApi.myReview(props.id),
      errorHandler,
    });

    if (response) {
      form.setFieldsValue({
        rating: response.data?.rating ?? 0,
        message: response.data?.message ?? '',
      });
      if (response.data?.rating) setButtonText('Cập nhật đánh giá');
      setReviewLoading(false);
    }
  };

  useEffect(() => {
    if (!props.open) return;

    getMyReview();
  }, [props.open]);

  return (
    <Modal
      width={'35%'}
      title={props.title ? `Đánh giá ${props.title}` : ''}
      open={props.open}
      onCancel={props.onCancel}
      footer={null}
      centered
    >
      <>
        {reviewLoading ? (
          <div className="my-4 d-flex flex-row">
            <div className="ms-3 w-100 d-flex flex-column">
              <Skeleton.Input className="mb-1" style={{ height: '1rem' }} />
              <Skeleton.Input style={{ width: '100%' }} />
              <Skeleton.Input className="mt-3 mb-1" style={{ height: '1rem' }} />
              <Skeleton.Input style={{ width: '100%', height: '7rem' }} />
              <Skeleton.Input className="mt-3 mb-1 w-100" />
            </div>
          </div>
        ) : (
          <div className="my-4 d-flex flex-row">
            <Form form={form} className="ms-3 w-100" layout="vertical" onFinish={onFinish} initialValues={undefined}>
              <Form.Item label="Đánh giá" name="rating">
                <Rate allowHalf tooltips={rateTooltip} />
              </Form.Item>
              <Form.Item label="Nội dung" name="message">
                <Input.TextArea autoSize={{ minRows: 4, maxRows: 4 }} />
              </Form.Item>
              <div className="text-center">
                <Button type="primary" htmlType="submit" loading={loading} size="large" className="w-100">
                  {buttonText}
                </Button>
              </div>
            </Form>
          </div>
        )}
      </>
    </Modal>
  );
};

export const MovieReviewCard = (props) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [buttonText, setButtonText] = useState('Gửi đánh giá');

  const errorHandler = (error) => {
    setLoading(false);
    props.onError(error);
  };

  const onFinish = async (values) => {
    if (!props.id) return;

    setLoading(true);
    const response = await apiCaller({
      request: reviewApi.createReview({ ...values, movie: props.id }),
      errorHandler,
    });

    if (response) {
      setLoading(false);
      props.onSuccess(response.data);
    }
  };

  const getMyReview = async () => {
    if (!props.id) return;

    setReviewLoading(true);
    const response = await apiCaller({
      request: reviewApi.myReview(props.id),
      errorHandler,
    });

    if (response) {
      form.setFieldsValue({
        rating: response.data?.rating ?? 0,
        message: response.data?.message ?? '',
        isSpoil: response.data?.isSpoil ?? false,
      });
      if (response.data?.rating) setButtonText('Cập nhật đánh giá');
      setReviewLoading(false);
    }
  };

  useEffect(() => {
    if (!props.open) return;

    getMyReview();
  }, [props.open]);

  return (
    <Modal
      width={'45%'}
      title={props.title ? `Đánh giá ${props.title}` : ''}
      open={props.open}
      onCancel={props.onCancel}
      footer={null}
      centered
    >
      <>
        {reviewLoading ? (
          <div className="my-4 d-flex flex-row">
            <Skeleton.Input size="large" style={{ height: '100%' }} />
            <div className="ms-3 w-100 d-flex flex-column">
              <Skeleton.Input className="mb-1" style={{ height: '1rem' }} />
              <Skeleton.Input style={{ width: '100%' }} />
              <Skeleton.Input className="mt-3 mb-1" style={{ height: '1rem' }} />
              <Skeleton.Input style={{ width: '100%', height: '10rem' }} />
              <Skeleton.Input className="mt-3 mb-1" />
            </div>
          </div>
        ) : (
          <div className="my-4 d-flex flex-row">
            <Image src={props.poster} width={'50%'} style={{ height: '100%' }} preview={false} className="rounded-3" />
            <Form form={form} className="ms-3 w-100" layout="vertical" onFinish={onFinish} initialValues={undefined}>
              <Form.Item label="Đánh giá" name="rating">
                <Rate allowHalf count={10} tooltips={rateTooltip} />
              </Form.Item>
              <Form.Item label="Nội dung" name="message">
                <Input.TextArea autoSize={{ minRows: 4, maxRows: 4 }} />
              </Form.Item>
              <Form.Item name="isSpoil" valuePropName="checked">
                <Checkbox>Chứa nội dung phim?</Checkbox>
              </Form.Item>
              <div className="text-center">
                <Button type="primary" htmlType="submit" loading={loading} size="large" className="w-100">
                  {buttonText}
                </Button>
              </div>
            </Form>
          </div>
        )}
      </>
    </Modal>
  );
};

export const ReviewCard = (props) => {
  const review = props.review;
  const [showSpoil, setShowSpoil] = useState(false);

  return (
    <div className={`mb-3 p-3 border shadow-sm ${review.mine ? 'bg-light' : 'bg-body'} bg-gradient rounded-3 z-3`}>
      <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <Avatar src={review.user?.avatar} size={48} />
          <div className="ms-2">
            <p className="fw-bold fs-6 text-body my-0">{review.user?.name}</p>
            <p className="text-muter my-0">{getTimeAgo(review.createdAt)}</p>
          </div>
        </div>
        <div className="fw-bold fs-4 text-body my-0">
          {review.rating} <StarFilled style={{ color: '#f6c343' }} />
        </div>
      </div>
      <div className="mt-2 mx-1">
        {!showSpoil && review.isSpoil ? (
          <div className="w-100 text-center cusor-pointer" onClick={() => setShowSpoil(true)}>
            <Image src={`/${SPOILER_WARNING_IMAGE}`} preview={false} height={'3rem'} />
            <p className="my-0">Đánh giá có chứa nội dung phim. Nhấn để hiển thị !</p>
          </div>
        ) : (
          <p className="fs-6 text-body mb-0">{review.message}</p>
        )}
      </div>
    </div>
  );
};

export const MovieReviewList = (props) => {
  const PAGE_SIZE = 3;
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(1);
  const [reviews, setReviews] = useState();

  const errorHandler = (error) => {
    setLoading(false);
    props.onError(error);
  };

  const getListReviewOfMovie = async () => {
    if (!props.id) return;

    setLoading(true);
    const response = await apiCaller({
      request: reviewApi.listReviewByMovie(props.id, {
        page: currentPage,
        limit: PAGE_SIZE,
      }),
      errorHandler,
    });

    if (response) {
      setTotalCount(response.extra.totalCount);
      setReviews(response.data);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (props.open) {
      getListReviewOfMovie();
    }
  }, [props.open, currentPage]);

  return (
    <Modal
      width={'35%'}
      title={props.title ? `Đánh giá phim ${props.title}` : ''}
      open={props.open}
      onCancel={props.onCancel}
      footer={null}
      centered
    >
      <>
        {loading ? (
          Array(3)
            .fill(1)
            .map((_val, idx) => (
              <div key={idx} className="w-100 p-3 mb-3 mt-4">
                <div className="d-flex align-items-center mb-3">
                  <Skeleton.Avatar size="large" className="me-3" />
                  <Skeleton.Input className="w-75" />
                </div>
                <Skeleton.Input className="w-100" />
              </div>
            ))
        ) : reviews?.length ? (
          <div className="mb-2 mt-4">
            {reviews?.map((review) => (
              <ReviewCard key={review._id} review={review} />
            ))}
            <div className="w-100 text-center">
              <Pagination
                onChange={(page) => setCurrentPage(page)}
                current={currentPage}
                pageSize={PAGE_SIZE}
                total={totalCount}
                hideOnSinglePage
              />
            </div>
          </div>
        ) : (
          <NoDataCard text="Phim chưa có đánh giá nào!" />
        )}
      </>
    </Modal>
  );
};
