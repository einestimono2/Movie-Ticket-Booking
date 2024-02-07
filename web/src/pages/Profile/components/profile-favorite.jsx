import React, { useEffect, useState } from 'react';
import { Segmented, Image, Button, Modal } from 'antd';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

import apiCaller from '../../../apis/apiCaller';
import { userApi } from '../../../apis/userApi';
import NoDataCard from '../../../components/no-data-card';
import { openGoogleMapsInNewTab } from '../../../utils/open-map';
import { Video } from '../../../components/video';
import { AgeTypes } from '../../../constants/values';
import { Loading } from '../../../components/loading';

export default function ProfileFavorite() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(0);
  const [modalOpen, setModalOpen] = useState('');

  const [data, setData] = useState();

  const onUnFavoriteTheater = (idx) => {
    const theaters = data.theaters;
    theaters.splice(idx, 1);
    setData({ ...data, theaters });
  };

  const onUnFavoriteMovie = (idx) => {
    const movies = data.movies;
    movies.splice(idx, 1);
    setData({ ...data, movies });
  };

  const items = [
    {
      label: 'Rạp',
      value: 0,
      icon: <i className="fa-solid fa-masks-theater"></i>,
      content: (
        <div className="mt-3 d-flex flex-column gap-3">
          {data?.theaters?.length ? (
            data?.theaters?.map((theater, idx) => (
              <TheaterSection
                key={theater._id}
                theater={theater}
                onSuccess={() => onUnFavoriteTheater(idx)}
                onNavigate={(dest) => navigate(dest)}
              />
            ))
          ) : (
            <NoDataCard text="Bạn chưa đánh dấu yêu thích rạp nào!" />
          )}
        </div>
      ),
    },
    {
      label: 'Phim',
      value: 1,
      icon: <i className="fa-solid fa-film"></i>,
      content: (
        <div className="mt-3 d-flex flex-column gap-3">
          {data?.movies?.length ? (
            data?.movies?.map((movie, idx) => (
              <MovieSection
                key={movie._id}
                movie={movie}
                onSuccess={() => onUnFavoriteMovie(idx)}
                onNavigate={(dest) => navigate(dest)}
                onOpenTrailer={(trailer) => setModalOpen(trailer)}
              />
            ))
          ) : (
            <NoDataCard text="Bạn chưa đánh dấu yêu thích phim nào!" />
          )}
        </div>
      ),
    },
  ];

  const errorHandler = (error) => {
    setLoading(false);
    toast.error(error.message, { autoClose: 3000, theme: 'colored' });
  };

  const getMyFavorites = async () => {
    setLoading(true);

    const response = await apiCaller({
      request: userApi.myFavorite(),
      errorHandler,
    });

    if (response) {
      setData(response.data);
      setLoading(false);
    }
  };

  useEffect(() => {
    getMyFavorites();
  }, []);

  return (
    <div className="px-4 h-100 w-100">
      {loading ? (
        <Loading height={'100%'} />
      ) : (
        <>
          <Segmented
            options={items}
            block
            size="large"
            value={selected}
            onChange={(value) => setSelected(value)}
            style={{ height: '3.5rem' }}
          />
          <div className="w-100 h-100 mt-1">{items[selected].content}</div>

          {/* Popup trailer */}
          {modalOpen && (
            <Modal
              footer={null}
              closeIcon={false}
              centered
              width={'70%'}
              open
              className="modal-trailer"
              onCancel={() => setModalOpen('')}
            >
              <Video url={modalOpen} />
            </Modal>
          )}
        </>
      )}
    </div>
  );
}

const MovieSection = (props) => {
  const movie = props.movie;

  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const errorHandler = (error) => {
    setFavoriteLoading(false);
    toast.error(error.message, { autoClose: 3000, theme: 'colored' });
  };

  const toggleFavorite = async (id) => {
    setFavoriteLoading(true);
    const response = await apiCaller({
      request: userApi.toggleFavoriteMovie(id),
      errorHandler,
    });

    if (response) {
      setFavoriteLoading(false);
      props.onSuccess();
    }
  };

  return (
    <div className="d-flex gap-3 border p-3 bg-white shadow-sm z-3 rounded-3">
      <div style={{ width: '20%', height: '12.5rem' }}>
        <Image
          src={movie.poster}
          width={'100%'}
          height={'100%'}
          className="rounded-3"
          preview={{ maskClassName: 'rounded-3' }}
        />
      </div>
      <div className="w-100 pe-3 d-flex flex-column justify-content-between">
        {/* Title */}
        <div>
          <div className="d-flex align-items-center my-0 py-0" style={{ height: 'fit-content' }}>
            <div
              className="my-0 fs-5 fw-bold d-flex align-items-top cusor-pointer custom-hover"
              onClick={() => props.onNavigate(`/movies/${movie._id}`)}
            >
              {movie?.title}
            </div>
            <div
              className="ms-2 my-0 bg-warning fw-bold rounded-3 text-white justify-content-center d-flex align-items-center"
              style={{ width: '2.5rem', height: '100%' }}
            >
              <div className="h-100">{movie?.ageType}</div>
            </div>
          </div>
          <div className="text-muted">
            <span>{movie.originalTitle}</span>
            <span>{' • '}</span>
            <span>{movie.genres?.join(', ') ?? 'Chưa xác định thể loại'}</span>
          </div>
          {/* Summary */}
          <div className="text-body max-3-lines text-justify mt-2">{movie.overview}</div>
        </div>
        {/* Block Info */}
        <div className="d-flex gap-3">
          <div
            className="d-flex flex-column align-items-center border rounded-3 p-1 cusor-pointer info"
            style={{ minWidth: '9rem' }}
          >
            <div className="d-flex gap-1 align-items-center">
              <i className="fa-regular fa-calendar-days me-1"></i>
              Khởi chiếu
            </div>
            <div className="text-muted">{movie.releaseDate ?? 'Chưa xác định'}</div>
          </div>
          <div
            className="d-flex flex-column align-items-center border rounded-3 p-1 cusor-pointer info"
            style={{ minWidth: '9rem' }}
          >
            <div className="d-flex gap-1 align-items-center">
              <i className="fa-regular fa-clock me-1"></i>
              Thời lượng
            </div>
            <div className="text-muted">{movie?.duration ? `${movie?.duration} phút` : 'Không xác định'}</div>
          </div>
          <div
            className="d-flex flex-column align-items-center border rounded-3 p-1 cusor-pointer info"
            style={{ minWidth: '9rem' }}
          >
            <div className="d-flex gap-1 align-items-center">
              <i className="fa-solid fa-star"></i>
              Đánh giá
            </div>
            <div className="text-muted">
              {movie.ratingCount ? (
                <>
                  <span className="text-body fw-bold">{movie?.ratingAverage?.toFixed(1) ?? '0.0'}</span>
                  <span className="text-muted ms-1">({movie?.ratingCount ?? 0} lượt)</span>
                </>
              ) : (
                <span className="text-muted">Chưa có đánh giá</span>
              )}
            </div>
          </div>
          <div
            className="d-flex flex-column align-items-center border rounded-3 p-1 cusor-pointer info"
            style={{ minWidth: '9rem' }}
          >
            <div className="d-flex gap-1 align-items-center">
              <i className="fa-solid fa-user-plus me-1"></i>
              Giới hạn tuổi
            </div>
            <div className="text-muted">{AgeTypes[movie?.ageType ?? 'P']}</div>
          </div>
        </div>
      </div>
      <div className="d-flex flex-column align-items-center gap-3">
        <Button
          icon={<i className="fa-solid fa-heart-crack"></i>}
          className="bg-danger text-white"
          size="large"
          loading={favoriteLoading}
          onClick={() => toggleFavorite(movie._id)}
        />
        <Button
          icon={<i className="fa-brands fa-youtube"></i>}
          className="text-danger bg-light"
          size="large"
          onClick={() => props.onOpenTrailer(movie.trailer)}
        />
      </div>
    </div>
  );
};

const TheaterSection = (props) => {
  const theater = props.theater;
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const errorHandler = (error) => {
    setFavoriteLoading(false);
    toast.error(error.message, { autoClose: 3000, theme: 'colored' });
  };

  const toggleFavorite = async (id) => {
    setFavoriteLoading(true);
    const response = await apiCaller({
      request: userApi.toggleFavoriteTheater(id),
      errorHandler,
    });

    if (response) {
      setFavoriteLoading(false);
      props.onSuccess();
    }
  };

  return (
    <div className="d-flex gap-3 border p-3 bg-white shadow-sm z-3 rounded-3">
      <div style={{ width: '20%', minHeight: '9rem' }}>
        <Image
          src={theater.logo}
          width={'100%'}
          height={'100%'}
          className="rounded-3"
          preview={{ maskClassName: 'rounded-3' }}
        />
      </div>
      <div className="w-100 d-flex flex-column justify-content-between">
        <div>
          <p
            className="fs-4 fw-bold text-body my-0 cusor-pointer custom-hover"
            onClick={() => props.onNavigate(`/theaters/${theater._id}`)}
          >
            {theater.name}
          </p>
          <p className="fs-6 fw-bold text-muted my-0">
            {theater.address}
            {' • '}
            <span
              className="text-primary cusor-pointer custom-hover"
              onClick={() => openGoogleMapsInNewTab(theater?.coordinates)}
            >
              Bản đồ
            </span>
          </p>
        </div>

        <div className="d-flex gap-3">
          <div
            className="d-flex flex-column align-items-center border rounded-3 p-1 cusor-pointer info"
            style={{ minWidth: '8rem' }}
            onClick={() => (window.location = `mailto:${theater?.email}`)}
          >
            <div className="d-flex gap-1 align-items-center">
              <i className="fa-solid fa-envelope"></i>
              Email
            </div>
            <div className="text-muted">{theater.email}</div>
          </div>
          <div
            className="d-flex flex-column align-items-center border rounded-3 p-1 cusor-pointer info"
            style={{ minWidth: '8rem' }}
            onClick={() => (window.location = `tel:${theater?.hotline}`)}
          >
            <div className="d-flex gap-1 align-items-center">
              <i className="fa-solid fa-phone-volume"></i>
              Liên hệ
            </div>
            <div className="text-muted">{theater.hotline}</div>
          </div>
          <div
            className="d-flex flex-column align-items-center border rounded-3 p-1 cusor-pointer info"
            style={{ minWidth: '8rem' }}
          >
            <div className="d-flex gap-1 align-items-center">
              <i className="fa-solid fa-star"></i>
              Đánh giá
            </div>
            <div className="text-muted">
              {theater.ratingCount ? (
                <>
                  <span className="text-body fw-bold">{theater.ratingAverage.toFixed(1)}</span>
                  <span className="text-muted ms-1">({theater.ratingCount} lượt)</span>
                </>
              ) : (
                <span className="text-muted">Chưa đánh giá</span>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="d-flex flex-column align-items-center gap-3">
        <Button
          icon={<i className="fa-solid fa-heart-crack"></i>}
          className="bg-danger text-white"
          size="large"
          loading={favoriteLoading}
          onClick={() => toggleFavorite(theater._id)}
        />
      </div>
    </div>
  );
};
