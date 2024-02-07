import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Image, Tabs, ConfigProvider, Button } from 'antd';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, Pagination } from 'swiper/modules';
import { toast } from 'react-toastify';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import './style.scss';
import { NO_IMAGE } from '../../constants/images';
import TheaterInfo from './components/theater-info';
import TheaterShowtimes from './components/theater-showtimes';
import TheaterFare from './components/theater-fare';
import TheaterReviews from './components/theater-reviews';
import { openGoogleMapsInNewTab } from '../../utils/open-map';
import FullScreenLoading from '../../components/loading/index';
import { theaterApi } from '../../apis/theaterApi';
import { userApi } from '../../apis/userApi';
import apiCaller from '../../apis/apiCaller';
import { MovieCardHorizontal } from '../../components/theater-card';
import NoDataCard from '../../components/no-data-card';
import { isAuthenticated } from '../../utils/can-continue';

export default function TheaterDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isFavorited, setIsFavorited] = useState(false);

  const [loading, setLoading] = useState(true);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const [theater, setTheater] = useState();
  const [nearbyTheater, setNearbyTheater] = useState([]);

  const errorHandler = (error) => {
    setLoading(false);
    setFavoriteLoading(false);
    toast.error(error.message, { autoClose: 3000, theme: 'colored' });
  };

  const childrenErrorHandler = (error) => {
    toast.error(error.message, { autoClose: 3000, theme: 'colored' });
  };

  const getTheaterDetails = async () => {
    if (!id) return;

    setLoading(true);
    const response = await apiCaller({
      request: theaterApi.getDetails(id),
      errorHandler,
    });

    if (response) {
      setTheater(response.data);
      setIsFavorited(response.data.isFavorited ?? false);
      setLoading(false);
      getNearbyTheater(response.data.location.coordinates[1], response.data.location.coordinates[0]);
    }
  };

  const getNearbyTheater = async (latitude, longitude) => {
    if (!latitude || !latitude) return;

    const response = await apiCaller({
      request: theaterApi.listNearbyTheater(
        {
          latitude,
          longitude,
        },
        {
          theaterId: id,
        },
      ),
      errorHandler,
    });

    if (response) {
      setNearbyTheater(response?.data);
    }
  };

  const toggleFavorite = async () => {
    setFavoriteLoading(true);
    const response = await apiCaller({
      request: userApi.toggleFavoriteTheater(id),
      errorHandler,
    });

    if (response) {
      setFavoriteLoading(false);
      setIsFavorited(response.data?.favoriteTheaters?.includes(id) ?? false);
    }
  };

  useEffect(() => {
    getTheaterDetails();
  }, [id]);

  const items = [
    {
      label: `Thông tin rạp`,
      key: 0,
      children: <TheaterInfo theater={theater} />,
    },
    {
      label: `Lịch chiếu`,
      key: 1,
      children: <TheaterShowtimes id={theater?._id} onError={(message) => childrenErrorHandler(message)} />,
    },
    {
      label: `Bảng giá`,
      key: 2,
      children: <TheaterFare id={theater?._id} onError={(message) => childrenErrorHandler(message)} />,
    },
    {
      label: `Đánh giá`,
      key: 3,
      children: <TheaterReviews theater={theater} onError={(message) => childrenErrorHandler(message)} />,
    },
  ];

  return (
    <ConfigProvider
      theme={{
        components: {
          Tabs: {
            horizontalMargin: '0',
          },
          Segmented: {
            itemActiveBg: '#6fadf4',
            itemSelectedBg: '#6fadf4',
            // itemSelectedColor: 'white',
          },
        },
      }}
    >
      <>
        {loading ? (
          <FullScreenLoading />
        ) : !theater ? (
          <NoDataCard
            text="Rạp không tồn tại hoặc đã rời khỏi hệ thống!"
            onAction={() => navigate(-1)}
            actionText="Quay lại"
          />
        ) : (
          <div className="theater-details-container d-flex flex-column">
            {/* List Images */}
            <div style={{ height: '50vh', width: '100%' }}>
              {theater?.images?.length ? (
                <Swiper
                  style={{
                    /*
            --swiper-pagination-color: var(--swiper-theme-color);
            --swiper-pagination-bullet-size: 8px;
            --swiper-pagination-bullet-width: 8px;
            --swiper-pagination-bullet-height: 8px;
            --swiper-pagination-bullet-inactive-color: #000;
            --swiper-pagination-bullet-inactive-opacity: 0.2;
            --swiper-pagination-bullet-opacity: 1;
            --swiper-pagination-bullet-horizontal-gap: 4px;
            --swiper-pagination-bullet-vertical-gap: 6px;
            */
                    '--swiper-navigation-color': 'white',
                    // '--swiper-pagination-color': 'white',
                    '--swiper-pagination-bullet-inactive-color': '#fff',
                    '--swiper-pagination-bullet-size': '12px',
                    '--swiper-pagination-bullet-inactive-opacity': '0.85',
                  }}
                  spaceBetween={30}
                  slidesPerView={1.2}
                  modules={[Navigation, Autoplay, Pagination]}
                  loop={true}
                  pagination={{
                    // type: 'fraction', // vd 1/4
                    clickable: true,
                  }}
                  lazy={true}
                  centeredSlides={true}
                  navigation={true}
                  grabCursor={true}
                  autoplay={{
                    delay: 33000,
                    disableOnInteraction: false,
                  }}
                >
                  {theater?.images.map((e) => (
                    <SwiperSlide key={e}>
                      <Image src={e} preview={false} width={'100%'} height={'100%'} />
                    </SwiperSlide>
                  ))}
                </Swiper>
              ) : (
                <Image src={`/${NO_IMAGE}`} preview={false} width={'100%'} height={'100%'} />
              )}
            </div>

            {/* Theater Info */}
            <div className="container mt-2">
              <div className="w-100">
                {/* Thông tin cơ bản về rạp */}
                <div className="w-100 d-flex gap-3 align-items-center" style={{ height: 'fit-content' }}>
                  {/* Logo */}
                  <div style={{ width: '15%' }}>
                    <Image src={theater?.logo ?? `/${NO_IMAGE}`} preview={false} height={'100%'} className="" />
                  </div>
                  {/* Thông tin cơ bản */}
                  <div className="w-100 mt-4">
                    <p className="fs-4 fw-bold text-body my-2">{theater?.name}</p>
                    <ul className="ps-3">
                      <li className="fs-6 text-muted">
                        <div>
                          Địa chỉ: {theater?.address} -{' '}
                          <span
                            className="text-primary cusor-pointer custom-hover"
                            onClick={() => openGoogleMapsInNewTab(theater?.location?.coordinates)}
                          >
                            Bản đồ
                          </span>
                        </div>
                      </li>
                      <li className="fs-6 text-muted">
                        Email:{' '}
                        <a
                          className="text-primary cusor-pointer custom-hover"
                          onClick={() => (window.location = `mailto:${theater?.email}`)}
                        >
                          {theater?.email}
                        </a>
                      </li>
                      <li className="fs-6 text-muted">
                        Hotline:{' '}
                        <a href={`tel:${theater?.hotline}`} className="tet}-primary cusor-pointer custom-hover">
                          {theater?.hotline}
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div className="me-4">
                    <Button
                      icon={
                        isFavorited ? (
                          <i className="fa-solid fa-heart-crack"></i>
                        ) : (
                          <i className="fa-solid fa-heart"></i>
                        )
                      }
                      className="bg-danger text-white"
                      size="large"
                      loading={favoriteLoading}
                      onClick={() => isAuthenticated({ onSuccess: () => toggleFavorite() })}
                    >
                      {isFavorited ? 'Bỏ yêu thích' : 'Yêu thích'}
                    </Button>
                  </div>
                </div>
                {/* Body */}
                <div className="my-4 row w-100">
                  {/* Thông tin chi tiết, bảng giá, đánh giá ... */}
                  <div className="col-9">
                    <Tabs
                      className=""
                      onChange={() => {}}
                      type="card"
                      animated
                      defaultActiveKey={1}
                      size="large"
                      items={items}
                    />
                  </div>
                  {/* Rạp ở gần */}
                  <>
                    {nearbyTheater?.length ? (
                      <div className="col-3">
                        <p
                          className="bg-light text-body border border-bottom-0 cus-rounded-top px-3 mb-0 ant-tabs-tab"
                          style={{ paddingTop: '0.6rem', paddingBottom: '0.5rem', fontSize: '1rem' }}
                        >
                          Rạp gần đây
                        </p>
                        <div className="border rounded-bottom px-3 py-2 shadow-sm z-3">
                          {nearbyTheater.map((theater, idx) => (
                            <div key={theater._id} className={idx ? 'border-top my-3 pt-3' : 'mt-3'}>
                              <MovieCardHorizontal theater={theater} />
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    </ConfigProvider>
  );
}
