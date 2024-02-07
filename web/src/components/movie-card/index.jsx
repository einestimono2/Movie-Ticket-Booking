import React, { useState } from 'react';
import { Image, Card, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { HeartFilled } from '@ant-design/icons';

import './style.scss';
import { NO_IMAGE } from '../../constants/images';
import { getTemplateOfDate } from '../../utils/date';
import apiCaller from '../../apis/apiCaller';
import { userApi } from '../../apis/userApi';
import { AgeTypes } from '../../constants/values';
import { isAuthenticated } from '../../utils/can-continue';

const { Meta } = Card;

export const MovieCardHorizontal = (props) => {
  const navigate = useNavigate();

  return (
    <div className="row d-flex mb-3 cusor-pointer" onClick={() => navigate(`/movies/${props.movie._id}`)}>
      <div className="col-4 position-relative pe-0">
        <Image
          src={props.movie?.poster ?? NO_IMAGE}
          width={'100%'}
          height={'8rem'}
          className="rounded-3"
          preview={false}
        />
        <div
          style={{ minWidth: 35 }}
          className="position-absolute top-0 end-0 m-1 bg-warning text-white fw-bold rounded-3 text-center"
        >
          {props.movie?.ageType}
        </div>
        <div
          style={{ width: '70%', alignContent: 'end', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          className="position-absolute bottom-0 end-0 m-1 px-1 text-white rounded-3 text-center"
        >
          <i className="fa-solid fa-star" style={{ color: 'yellow' }} /> {props.movie?.ratingAverage?.toFixed(2) ?? 0}
        </div>
      </div>
      <div className="col-8 p-0 ps-2 d-flex flex-column justify-content-around">
        <p className="text-body fs-6 fw-bold">{props.movie?.title}</p>
        <div>
          <p className="text-body mb-0">Thể loại: {props.movie?.genres.join(', ')}</p>
          <p className="text-body mb-0">Thời lượng: {props.movie?.duration} phút</p>
        </div>
      </div>
    </div>
  );
};

export const MovieCardVertical = (props) => {
  const movie = props.movie;
  const navigate = useNavigate();

  const backgroundColor = props.backgroundColor ?? 'white';

  return (
    <div key={movie._id} className="custom-card">
      <Card
        hoverable={false}
        bordered={null}
        style={{ width: 240, padding: 0 }}
        bodyStyle={{ padding: 0, backgroundColor: backgroundColor }}
        onClick={(e) => {
          e.preventDefault();
          navigate(`/movies/${movie._id}`);
        }}
        cover={
          <div className="position-relative">
            <Image
              alt=""
              src={movie.poster}
              height={340}
              width={'100%'}
              className="rounded-3"
              preview={{
                visible: false,
                mask: (
                  <div className="d-flex flex-column">
                    <Button
                      className="mb-3"
                      type="primary"
                      icon={<i className="fa-solid fa-video"></i>}
                      size="large"
                      onClick={(e) => {
                        e.stopPropagation();
                        props.openTrailer(movie.trailer);
                      }}
                    >
                      Trailer
                    </Button>
                    <Button size="large" ghost icon={<i className="fa-solid fa-ticket"></i>}>
                      Đặt vé
                    </Button>
                  </div>
                ),
              }}
            />

            <div
              style={{ minWidth: 35 }}
              className="position-absolute top-0 end-0 m-2 px-1 bg-warning text-white fw-bold rounded-3 text-center"
            >
              {movie.ageType}
            </div>

            {movie.isFavorited && (
              <div
                className="position-absolute start-0 top-0 m-2 px-1 pt-1 text-danger fw-bold rounded-3 text-center"
                style={{ backgroundColor: 'rgba(0,0,0,0.25)' }}
              >
                <HeartFilled style={{ fontSize: '1.25rem' }} />
              </div>
            )}

            <div
              style={{ alignContent: 'end', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
              className="position-absolute bottom-0 end-0 m-1 px-2 text-white rounded-3 text-end"
            >
              <span>
                {props.movie?.ratingAverage?.toFixed(2) ?? 0}{' '}
                <i className="fa-solid fa-star" style={{ color: 'yellow' }} />
              </span>
            </div>
          </div>
        }
      >
        <div className="pe-auto cusor-pointer">
          {props.showDate ? (
            <Meta
              className="pb-1 pt-2"
              description={movie.releaseDate ? getTemplateOfDate(movie.releaseDate, 'DD/MM/YYYY') : 'Không xác định'}
            />
          ) : (
            <Meta className="pb-1 pt-2" description={movie.genres.join(', ')} />
          )}
          <Meta className="pb-1" title={movie.title} />
        </div>
      </Card>
    </div>
  );
};

export const SneakShowCard = (props) => {
  const movie = props.movie;
  const navigate = useNavigate();

  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [isFavorited, setIsFavorited] = useState(movie.isFavorited);

  const errorHandler = (error) => {
    setFavoriteLoading(false);
    props.onError(error);
  };

  const toggleFavorite = async () => {
    setFavoriteLoading(true);
    const response = await apiCaller({
      request: userApi.toggleFavoriteMovie(movie._id),
      errorHandler,
    });

    if (response) {
      setFavoriteLoading(false);
      setIsFavorited(response.data?.favoriteMovies?.includes(movie._id) ?? false);
    }
  };

  return (
    <div key={movie._id} className="d-flex gap-3 rounded-3 p-3 border shadow-sm z-3" style={{ minHeight: '18rem' }}>
      <div style={{ width: '30%' }}>
        <Image
          src={movie?.poster}
          height={'100%'}
          width={'100%'}
          className="rounded-3"
          preview={{ maskClassName: 'rounded-3' }}
        />
      </div>
      <div style={{ width: '70%' }} className="d-flex flex-column">
        <p className="text-body fs-4 fw-bold my-0">{movie?.title}</p>
        <p className="text-muted my-0">
          {movie?.originalTitle} - {movie?.genres?.join(', ')}
        </p>
        <div className="my-2 d-flex gap-3 justify-content-between">
          <span>
            <i className="fa-solid fa-clock"></i> {movie?.duration} phút
          </span>
          <span>
            <i className="fa-solid fa-user-plus"></i> {AgeTypes[movie?.ageType]}
          </span>
          <span>
            <i className="fa-solid fa-play"></i>{' '}
            {movie?.releaseDate ? getTemplateOfDate(movie?.releaseDate, 'DD/MM/YYYY') : 'Không xác định'} (Suất chiếu:{' '}
            {getTemplateOfDate(movie?.nearestDay, 'DD/MM/YYYY')})
          </span>
        </div>
        <p className="text-body my-3 max-3-lines text-justify">{movie?.overview}</p>
        <div className="mt-auto" style={{ marginTop: 'auto' }}>
          <div className="d-flex gap-2">
            <div className="w-50 d-flex gap-2">
              <Button
                icon={isFavorited ? <i className="fa-solid fa-heart-crack"></i> : <i className="fa-solid fa-heart"></i>}
                className="bg-danger text-white"
                loading={favoriteLoading}
                size="large"
                onClick={() => isAuthenticated({ onSuccess: () => toggleFavorite() })}
              >
                {isFavorited ? 'Bỏ yêu thích' : 'Yêu thích'}
              </Button>
              <Button
                size="large"
                className="w-50"
                icon={<i className="fa-solid fa-video"></i>}
                onClick={props.onOpenModal}
              >
                Trailer
              </Button>
            </div>
            <Button
              size="large"
              className="w-50"
              type="primary"
              icon={<i className="fa-solid fa-ticket"></i>}
              onClick={() => navigate(`/movies/${movie?._id}`)}
            >
              Chi tiết/Mua vé
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
