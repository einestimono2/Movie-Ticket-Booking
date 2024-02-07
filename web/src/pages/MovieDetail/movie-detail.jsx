import React, { useEffect, useRef, useState } from 'react';
import { Image, Button, Segmented, Collapse, ConfigProvider, Modal } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import './movie-detail.scss';
import { movieApi } from '../../apis/movieApi';
import { userApi } from '../../apis/userApi';
import { showtimeApi } from '../../apis/showtimeApi';
import apiCaller from '../../apis/apiCaller';
import { Video } from '../../components/video';
import { NO_IMAGE } from '../../constants/images';
import { getListOfConsecutiveShowtimes, getTemplateOfDate, getVietNamFormatDate } from '../../utils/date';
import { openGoogleMapsInNewTab } from '../../utils/open-map';
import { AgeTypes } from '../../constants/values';
import FullScreenLoading from '../../components/loading';
import { Truncate } from '../../components/truncate/index';
import { MovieCardHorizontal } from '../../components/movie-card';
import { MovieReviewCard, MovieReviewList } from '../../components/review-card';
import { checkCanBooking, isAuthenticated } from '../../utils/can-continue';
import NoDataCard from '../../components/no-data-card';

function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const ref = useRef(null);

  const [loading, setLoading] = useState(true);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [modalSeeMore, setModalSeeMore] = useState(false);
  const [modalReviewCreate, setModalReviewCreate] = useState(false);
  const [modalReviewList, setModalReviewList] = useState(false);
  const [showtimeLoading, setShowtimeLoading] = useState(false);

  const [movie, setMovie] = useState();
  const [showtime, setShowtime] = useState([]);
  const [popularMovie, setPopularMovie] = useState([]);
  const [currentSelected, setCurrentSelected] = useState();
  const [segmentedLabel, setSegmentedLabel] = useState();

  const errorHandler = (error) => {
    setLoading(false);
    setShowtimeLoading(false);
    setFavoriteLoading(false);
    toast.error(error.message, { autoClose: 3000, theme: 'colored' });
  };

  const childrenErrorHandler = (error) => {
    toast.error(error.message, { autoClose: 3000, theme: 'colored' });
    setModalReviewCreate(false);
  };

  const getMovieDetails = async (id) => {
    if (!id) return;

    setLoading(true);
    const response = await apiCaller({
      request: movieApi.getMovieDetails(id),
      errorHandler,
    });

    if (response) {
      setMovie(response.data);
      setIsFavorited(response.data.isFavorited ?? false);
      setLoading(false);
    }
  };

  const getListShowtimes = async (id) => {
    if (!id) return;

    setShowtimeLoading(true);
    const response = await apiCaller({
      request: showtimeApi.listShowtimeByMovie(id),
      errorHandler,
    });

    if (response) {
      setShowtime(response.data);
      setCurrentSelected(response.data[0]);
      setSegmentedLabel(
        getListOfConsecutiveShowtimes(response.data[0]?.date, response.data[response.data.length - 1]?.date),
      );
      setShowtimeLoading(false);
    }
  };

  const getListPopularMovie = async () => {
    const response = await apiCaller({
      request: movieApi.listMostRateMovie({
        movieId: id,
        limit: 5,
      }),
      errorHandler,
    });

    if (response) {
      setPopularMovie(response.data);
    }
  };

  const toggleFavorite = async () => {
    setFavoriteLoading(true);
    const response = await apiCaller({
      request: userApi.toggleFavoriteMovie(id),
      errorHandler,
    });

    if (response) {
      setFavoriteLoading(false);
      setIsFavorited(response.data?.favoriteMovies?.includes(id) ?? false);
    }
  };

  useEffect(() => {
    getMovieDetails(id);
    getListShowtimes(id);
    getListPopularMovie();
  }, [id]);

  const handleBuyTicket = (id, time) => {
    isAuthenticated({
      onSuccess: () =>
        checkCanBooking({
          time,
          onSuccess: () => navigate(`/booking/${id}`),
        }),
    });
  };

  const items = currentSelected?.theaters?.map((theater) => {
    const _theater = theater.theater;
    const _types = theater.types;

    return {
      forceRender: true,
      key: _theater._id,
      label: (
        <div className="d-flex row">
          <div className="col-1">
            <Image
              preview={false}
              className="rounded-3"
              width={'100%'}
              height={'100%'}
              src={_theater?.logo ?? `/${NO_IMAGE}`}
            />
          </div>
          <div className="col-10">
            <div
              className="fw-bold fs-5 text-black cusor-pointer hover-underline"
              style={{ width: 'fit-content' }}
              onClick={() => navigate(`/theaters/${_theater._id}`)}
            >
              {_theater?.name}
            </div>
            <span className="fs-6 text-muted max-2-lines">
              {_theater?.address}
              {' - '}
              <span
                className="cusor-pointer hover-underline text-primary"
                onClick={() => openGoogleMapsInNewTab(_theater.coordinates)}
              >
                Bản đồ
              </span>
            </span>
          </div>
        </div>
      ),
      children: (
        <div>
          {_types?.map((type, idx) => (
            <div key={`${idx}-${type.type}`} className="w-100 mb-4">
              <div className="fw-bold fs-6 text-body align-items-center mb-1">{type.type}</div>
              <div className="d-flex flex-wrap gap-2">
                {type.showtimes?.map((showtime) => (
                  <Button
                    disabled={
                      getTemplateOfDate(undefined, 'YYYY/MM/DD HH:mm') >=
                      getTemplateOfDate(showtime.startTime, 'YYYY/MM/DD HH:mm')
                    }
                    key={showtime._id}
                    onClick={() => handleBuyTicket(showtime._id, showtime.startTime)}
                  >
                    {getTemplateOfDate(showtime.startTime, 'HH:mm')}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ),
    };
  });

  return (
    <ConfigProvider
      theme={{
        components: {
          Segmented: {
            itemActiveBg: '#6fadf4',
            itemSelectedBg: '#6fadf4',
            // itemSelectedColor: 'white',
          },
        },
      }}
    >
      <div>
        {loading ? (
          <FullScreenLoading />
        ) : !movie ? (
          <NoDataCard text="Phim không tồn tại hoặc đã bị xóa!" onAction={() => navigate(-1)} actionText="Quay lại" />
        ) : (
          <>
            {/* Trailer */}
            <div style={{ backgroundColor: 'black' }}>
              <div className="container">
                <div className="row w-100">
                  <div className="col-md-2 d-flex justify-content-center"></div>
                  <div className="col-md-7 d-flex justify-content-center embed-responsive embed-responsive-16by9">
                    {movie?.trailer && <Video borderRadius={0} height={'40vh'} url={movie?.trailer} />}
                  </div>
                  <div className="col-md-3 d-flex justify-content-center"></div>
                </div>
              </div>
            </div>
            {/* Movie Details */}
            <div className="container mb-5">
              <div className="row px-2">
                {/* Poster */}
                <div className="col-md-2 d-flex" style={{ position: 'relative', overflow: 'visible' }}>
                  <div style={{ position: 'relative', height: '110%', width: '100%', bottom: '10%' }}>
                    <Image
                      className="img-detail"
                      height={'100%'}
                      width={'100%'}
                      src={movie?.poster ?? NO_IMAGE}
                      style={{ minHeight: '18rem' }}
                      alt=""
                      preview={{ maskClassName: 'rounded-3' }}
                    />
                  </div>
                </div>
                {/* Info */}
                <div className="col-md-7 d-flex justify-content-start">
                  <div className="row">
                    <div className="col-md-12 mt-3" style={{ height: 'fit-content' }}>
                      <h3 className="detail-title text-dark">{movie?.title}</h3>
                      <h5 className="detail-sub-title text-body">{movie?.originalTitle}</h5>
                      {/* Actions Button */}
                      <div className="d-flex my-3 gap-2">
                        <Button
                          icon={
                            isFavorited ? (
                              <i className="fa-solid fa-heart-crack"></i>
                            ) : (
                              <i className="fa-solid fa-heart"></i>
                            )
                          }
                          className="bg-danger text-white"
                          loading={favoriteLoading}
                          onClick={() => isAuthenticated({ onSuccess: () => toggleFavorite() })}
                        >
                          {isFavorited ? 'Bỏ yêu thích' : 'Yêu thích'}
                        </Button>
                        <Button
                          className="btn-vote"
                          icon={<i className="fa-solid fa-star" />}
                          onClick={() => isAuthenticated({ onSuccess: () => setModalReviewCreate(true) })}
                        >
                          Đánh giá
                        </Button>
                        <Button
                          className="btn-ticket"
                          icon={<i className="fa-solid fa-ticket" />}
                          onClick={() => ref.current?.scrollIntoView({ behavior: 'smooth' })}
                        >
                          Mua vé
                        </Button>
                      </div>
                      {/* Movie summary */}
                      <p className="detail-description text-dark text-justify">
                        <Truncate
                          lines={4}
                          addBr={false}
                          ellipsis={
                            <span>
                              ...
                              <span className="cusor-pointer text-primary" onClick={() => setModalSeeMore(true)}>
                                {'  Xem thêm'}
                              </span>
                            </span>
                          }
                        >
                          {movie?.overview}
                        </Truncate>
                      </p>
                    </div>
                    <div className="col-md-12 d-flex" style={{ alignItems: 'end', justifyContent: 'space-between' }}>
                      <div>
                        <h6 className="info-detail-title text-dark">
                          <i className="fa-solid fa-star me-1"></i> Đánh giá
                        </h6>
                        <p
                          className="info-detail text-center text-muted cusor-pointer"
                          onClick={() => setModalReviewList(true)}
                        >
                          {movie?.ratingAverage?.toFixed(2) ?? 0}
                          <small>{` (${movie?.ratingCount ?? 0} votes)`}</small>
                        </p>
                      </div>
                      <div>
                        <h6 className="info-detail-title text-dark">
                          <i className="fa-regular fa-calendar-days me-1"></i> Khởi chiếu
                        </h6>
                        <p className="info-detail text-center text-muted">
                          {movie?.releaseDate ? getVietNamFormatDate(movie?.releaseDate, false) : 'Không xác định'}
                        </p>
                      </div>
                      <div>
                        <h6 className="info-detail-title text-dark">
                          <i className="fa-regular fa-clock me-1"></i> Thời lượng
                        </h6>
                        <p className="info-detail text-center text-muted">
                          {movie?.duration ? `${movie?.duration} phút` : 'Không xác định'}
                        </p>
                      </div>
                      <div>
                        <h6 className="info-detail-title text-dark">
                          <i className="fa-solid fa-user-plus me-1"></i> Giới hạn tuổi
                        </h6>
                        <p className="info-detail text-center text-muted">{AgeTypes[movie?.ageType ?? 'P']}</p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Genre, Director, Actor */}
                <div className="col-md-3 d-flex mt-4">
                  <div className="row ms-2 w-100 h-100 border-start" style={{ alignContent: 'space-evenly' }}>
                    <div className="col-md-12">
                      <h6 className="main-detail-title text-dark">
                        <i className="fa-solid fa-shapes me-1"></i> Thể loại
                      </h6>
                      <div className="ms-1 max-3-lines" style={{ color: 'white', fontWeight: '500' }}>
                        {movie?.genres.map((genre, idx) => (
                          <span key={genre._id}>
                            <span className="movie-person-name">{genre.name}</span>
                            <span style={{ color: 'black' }}>{idx === movie?.genres.length - 1 ? '' : ', '}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="col-md-12">
                      <h6 className="main-detail-title text-dark">
                        <i className="fa-solid fa-user-secret me-1"></i> Diễn viên
                      </h6>
                      <div className="ms-1 max-3-lines" style={{ color: 'white', fontWeight: '500' }}>
                        {movie?.directors?.map((director, idx) => (
                          <span key={director._id}>
                            <span onClick={() => navigate(`/persons/${director._id}`)} className="movie-person-name">
                              {director.fullName}
                            </span>
                            <span style={{ color: 'black' }}>{idx === movie?.directors?.length - 1 ? '' : ', '}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="col-md-12">
                      <h6 className="main-detail-title text-dark">
                        <i className="fa-solid fa-film me-1"></i> Đạo diễn
                      </h6>
                      <div className="ms-1 max-3-lines" style={{ color: 'white', fontWeight: '500' }}>
                        {movie?.actors?.map((actor, idx) => (
                          <span key={actor._id}>
                            <span onClick={() => navigate(`/persons/${actor._id}`)} className="movie-person-name">
                              {actor.fullName}
                            </span>
                            <span style={{ color: 'white' }}>{idx === movie?.actors?.length - 1 ? '' : ', '}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Lịch chiếu & DS phim đang chiếu */}
            <div className="container mb-5">
              <div className="row w-100">
                {/* Lịch chiếu */}
                {!showtimeLoading && (
                  <div ref={ref} className="col-md-9">
                    <h2 className="fw-bold border-5 border-start border-primary ps-2">LỊCH CHIẾU</h2>
                    <div className="text-center">
                      <Segmented
                        className="mt-3"
                        block={segmentedLabel?.length >= 3}
                        size="large"
                        options={segmentedLabel?.map((e) => {
                          return {
                            label: (
                              <div>
                                <div className="pt-1 fw-bold">{e.date}</div>
                                <div className="pb-1">{e.name}</div>
                              </div>
                            ),
                            value: e.value,
                          };
                        })}
                        onChange={(value) => setCurrentSelected(showtime.find((e) => e.date === value))}
                      />
                    </div>
                    <div className="mt-1 pe-1">
                      {currentSelected ? (
                        <Collapse
                          className="my-4"
                          defaultActiveKey={[currentSelected?.theaters?.at(0)._id]}
                          items={items}
                          expandIconPosition="end"
                          size="large"
                        />
                      ) : (
                        <div className="my-5 py-3 text-center fw-bold fs-3">Hiện tại không có lịch chiếu nào!</div>
                      )}
                    </div>
                  </div>
                )}
                {/* Danh sách phim đang chiếu */}
                <div className="col-md-3">
                  <div className="row ms-2">
                    {popularMovie?.length ? (
                      <div className="col-md-12">
                        <h2 className="fw-bold border-5 border-start border-primary ps-2">PHIM ĐANG CHIẾU</h2>
                        <div className="mt-3">
                          {popularMovie.map((movie) => (
                            <MovieCardHorizontal key={movie._id} movie={movie} />
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <Modal
        title="Nội dung phim"
        centered
        open={modalSeeMore}
        onOk={() => setModalSeeMore(false)}
        onCancel={() => setModalSeeMore(false)}
        footer={null}
      >
        <p className="text-body py-2 text-justify">{movie?.overview ?? ''}</p>
      </Modal>
      <MovieReviewCard
        open={modalReviewCreate}
        onCancel={() => setModalReviewCreate(false)}
        title={movie?.title}
        poster={movie?.poster}
        id={movie?._id}
        onSuccess={(data) => {
          setMovie({ ...movie, ratingAverage: data.ratingAverage, ratingCount: data.ratingCount });
          setModalReviewCreate(false);
        }}
        onError={(message) => childrenErrorHandler(message)}
      />
      <MovieReviewList
        open={modalReviewList}
        onCancel={() => setModalReviewList(false)}
        id={movie?._id}
        title={movie?.title}
        onError={(message) => childrenErrorHandler(message)}
      />
    </ConfigProvider>
  );
}

export default MovieDetail;
