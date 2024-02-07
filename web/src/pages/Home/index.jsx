import React, { useEffect, useState } from 'react';
import { Tabs, Card, Image, Button, Modal, Skeleton } from 'antd';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { HeartFilled } from '@ant-design/icons';

import { movieApi } from '../../apis/movieApi';
import { theaterApi } from '../../apis/theaterApi';
import apiCaller from '../../apis/apiCaller';
import './index.scss';
import { NO_IMAGE } from '../../constants/images';
import { Video } from '../../components/video';
import { MovieCardVertical } from '../../components/movie-card';
import ROUTES from '../../constants/routes';

const banners = [
  'assets/images/banner_01.jpg',
  'assets/images/banner_02.jpg',
  'assets/images/banner_03.webp',
  'assets/images/banner_04.webp',
];

function HomePage() {
  const navigate = useNavigate();

  const [movieLoading, setMovieLoading] = useState(true);
  const [theaterLoading, setTheaterLoading] = useState(true);

  const [currentMovieTab, setCurrentMovieTab] = useState(1);
  const [currentTheaterTab, setCurrentTheaterTab] = useState(1);
  const [modalOpen, setModalOpen] = useState('');

  const [nowShowingMovie, setNowShowingMovie] = useState([]);
  const [comingSoonMovie, setComingSoonMovie] = useState([]);
  const [nearbyTheater, setNearbyTheater] = useState();
  const [mostRateTheater, setMostRateTheater] = useState();

  const onMovieChange = (idx) => {
    setCurrentMovieTab(idx);
  };

  const onTheaterChange = (idx) => {
    setCurrentTheaterTab(idx);
  };

  const getMovieTabData = () => {
    return currentMovieTab === 1 ? nowShowingMovie : comingSoonMovie;
  };

  const getTheaterTabData = () => {
    return currentTheaterTab === 1 ? nearbyTheater : mostRateTheater;
  };

  const errorHandler = (error) => {
    setMovieLoading(false);
    toast.error(error.message, { autoClose: 3000, theme: 'colored' });
  };

  const listMovieNowShowing = async () => {
    const response = await apiCaller({
      request: movieApi.listMovieNowShowing({
        limit: 10,
        page: 1,
      }),
      errorHandler,
    });

    if (response) {
      setNowShowingMovie(response?.data);
    }
  };

  const listMovieComingSoon = async () => {
    const response = await apiCaller({
      request: movieApi.listMovieComingSoon({
        limit: 10,
        page: 1,
      }),
      errorHandler,
    });

    if (response) {
      setComingSoonMovie(response?.data);
    }
  };

  const listNearbyTheater = async (latitude, longitude) => {
    if (!latitude || !latitude) return;

    const response = await apiCaller({
      request: theaterApi.listNearbyTheater({
        latitude,
        longitude,
      }),
      errorHandler,
    });

    if (response) {
      setNearbyTheater(response?.data);
    }
  };

  const listMostRateTheater = async () => {
    const response = await apiCaller({
      request: theaterApi.listMostRateTheater(),
      errorHandler,
    });

    if (response) {
      setMostRateTheater(response?.data);
    }
  };

  const getData = async (ofTheater, lat, lng) => {
    if (ofTheater) {
      setTheaterLoading(true);

      await Promise.all([Promise.resolve(listNearbyTheater(lat, lng)), Promise.resolve(listMostRateTheater())]).then(
        () => {
          setTheaterLoading(false);
          if (!lat || !lng) setCurrentTheaterTab(2);
        },
      );
    } else {
      setMovieLoading(true);

      await Promise.all([Promise.resolve(listMovieNowShowing()), Promise.resolve(listMovieComingSoon())]).then(() => {
        setMovieLoading(false);
      });
    }
  };

  // Gọi API lấy danh sách movie
  useEffect(() => {
    getData();
  }, []);

  // Lấy tọa độ hiện tại của mình
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (data) => getData(true, data.coords.latitude, data.coords.longitude), // success
        () => getData(true), // Error - Từ chối
      );
    }
  }, []);

  return (
    <section className="banner">
      {/* Banner */}
      <div className="" id="home-slide">
        <div id="carouselExampleInterval" className="carousel slide" data-bs-ride="carousel">
          <div className="carousel-inner">
            {banners.map((banner, idx) => (
              <div key={idx} className={`carousel-item ${idx === 0 ? 'active' : ''}`} data-bs-interval="10000">
                <img src={banner} className="d-block w-100 rounded-0" alt="image" />
              </div>
            ))}
          </div>
          <button
            className="carousel-control-prev"
            type="button"
            data-bs-target="#carouselExampleInterval"
            data-bs-slide="prev"
          >
            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Previous</span>
          </button>
          <button
            className="carousel-control-next"
            type="button"
            data-bs-target="#carouselExampleInterval"
            data-bs-slide="next"
          >
            <span className="carousel-control-next-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Next</span>
          </button>
        </div>
      </div>

      {/* Movies */}
      <div className="container mt-4 mb-1">
        <div className="d-flex flex-column w-100">
          {/* Tiêu đề và tab Đang chiếu | Sắp chiếu */}
          <div className="d-flex align-items-center justify-content-start">
            <h2 className="fw-bold border-5 border-start border-primary ps-2 me-5">PHIM</h2>
            <Tabs
              size="large"
              defaultActiveKey="1"
              items={[
                {
                  key: 1,
                  label: 'Đang chiếu',
                  disabled: movieLoading,
                },
                {
                  key: 2,
                  label: 'Sắp chiếu',
                  disabled: movieLoading,
                },
              ]}
              onChange={onMovieChange}
            />
          </div>

          {/* Data movie tương ứng */}
          <div className="row row-cols-5 gy-4 justify-content-start mb-3">
            {movieLoading ? (
              Array(5)
                .fill(1)
                .map((_e, idx) => (
                  <Skeleton.Input active key={idx} style={{ height: 380, width: 240 }} className="rounded-3" />
                ))
            ) : getMovieTabData()?.length === 0 ? (
              <div className="container h-5">
                <div className="fs-4 fw-bold my-5">Hiện tại chưa có lịch chiếu tương ứng!</div>
              </div>
            ) : (
              getMovieTabData()?.map((movie) => (
                <MovieCardVertical
                  key={movie._id}
                  movie={movie}
                  showDate={currentMovieTab === 2}
                  openTrailer={(trailer) => setModalOpen(trailer)}
                />
              ))
            )}
          </div>

          {/* Nút xem thêm */}
          {getMovieTabData()?.length >= 10 && (
            <div className="text-center mb-5 mt-3">
              <Button
                type="primary"
                size="large"
                style={{ width: '20%' }}
                onClick={() => {
                  if (currentMovieTab === 1) {
                    navigate(ROUTES.NOW_SHOWING);
                  } else {
                    navigate(ROUTES.COMING_SOON);
                  }
                }}
              >
                Xem thêm
                <i className="ms-2 fa-solid fa-chevron-right fs-6" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Theaters */}
      <div className="container mb-1">
        <div className="d-flex flex-column w-100">
          {/* Tiêu đề và tab Ở gần | Nổi bật */}
          <div className="d-flex align-items-center justify-content-start">
            <h2 className="fw-bold border-5 border-start border-primary ps-2 me-5">RẠP</h2>
            <Tabs
              size="large"
              defaultActiveKey="1"
              items={[
                {
                  key: 1,
                  label: 'Gần đây',
                  disabled: theaterLoading,
                },
                {
                  key: 2,
                  label: 'Nổi bật',
                  disabled: theaterLoading,
                },
              ]}
              onChange={onTheaterChange}
            />
          </div>

          {/* Data theater tương ứng */}
          <div className="row row-cols-5 gy-4 justify-content-between mb-5">
            {theaterLoading ? (
              Array(5)
                .fill(1)
                .map((_e, idx) => (
                  <Skeleton.Input key={idx} style={{ height: 380, width: 240 }} className="rounded-3" />
                ))
            ) : getTheaterTabData()?.length === 0 ? (
              <div className="container h-5">
                <div className="fs-4 fw-bold my-5">Không có rạp thỏa mãn!</div>
              </div>
            ) : (
              getTheaterTabData()?.map((theater) => (
                <div key={theater._id}>
                  <Card
                    hoverable
                    style={{ width: 250, paddingLeft: 0 }}
                    bodyStyle={{ padding: 0 }}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(`/theaters/${theater._id}`);
                    }}
                    cover={
                      <div className="position-relative w-100">
                        <Image
                          alt=""
                          src={theater.images?.at(0) ?? NO_IMAGE}
                          height={250}
                          width={250}
                          preview={false}
                        />

                        <div className="position-absolute top-0 end-0 m-2 px-2 bg-warning text-white fw-bold rounded-3 text-center">
                          {theater.ratingAverage?.toFixed(2) ?? 0}
                          <i className="ms-1 fa-solid fa-star"></i>
                        </div>

                        {theater.isFavorited && (
                          <div
                            className="position-absolute start-0 top-0 m-2 px-1 pt-1 text-danger fw-bold rounded-3 text-center"
                            style={{ backgroundColor: 'rgba(0,0,0,0.25)' }}
                          >
                            <HeartFilled style={{ fontSize: '1.25rem' }} />
                          </div>
                        )}

                        {theater.distance && (
                          <div className="position-absolute bottom-0 end-0 m-2 px-2 bg-success text-white fw-bold rounded-3 text-center">
                            {(theater.distance / 1000).toFixed(2)}
                            {' km'}
                          </div>
                        )}
                      </div>
                    }
                  >
                    <div className="pe-auto cusor-pointer px-1">
                      <h6 className="pb-1 pt-2 max-2-lines fw-bold">{theater.name}</h6>
                      <small className="pb-3 max-3-lines text-muted" style={{ minHeight: 80 }}>
                        {theater.address}
                      </small>
                    </div>
                  </Card>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

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
    </section>
  );
}

export default HomePage;
