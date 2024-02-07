import React, { useEffect, useState } from 'react';
import { Segmented, Tag, Button, Image, Modal } from 'antd';
import { useNavigate } from 'react-router-dom';

import { getListOfConsecutiveShowtimes, getTemplateOfDate } from '../../../utils/date';
import { NO_IMAGE } from '../../../constants/images';
import { AgeTypes } from '../../../constants/values';
import { Video } from '../../../components/video';
import { showtimeApi } from '../../../apis/showtimeApi';
import apiCaller from '../../../apis/apiCaller';
import { Loading } from '../../../components/loading';
import NoDataCard from '../../../components/no-data-card';
import { checkCanBooking, isAuthenticated } from '../../../utils/can-continue';

export default function TheaterShowtimes(props) {
  const navigate = useNavigate();

  const [showtimes, setShowtimes] = useState();
  const [currentSelected, setCurrentSelected] = useState();

  const [loading, setLoading] = useState(true);
  const [modalTrailer, setModalTrailer] = useState('');
  const [segmentedLabel, setSegmentedLabel] = useState();

  const errorHandler = (error) => {
    setLoading(false);
    props.onError(error);
  };

  const getListShowtimes = async () => {
    if (!props.id) return;

    setLoading(true);
    const response = await apiCaller({
      request: showtimeApi.listShowtimeByTheater(props.id),
      errorHandler,
    });

    if (response) {
      setShowtimes(response.data);
      setCurrentSelected(response.data[0]);
      setSegmentedLabel(
        getListOfConsecutiveShowtimes(response.data[0]?.date, response.data[response.data.length - 1]?.date),
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    getListShowtimes();
  }, [props.id]);

  const handleBuyTicket = (id, time) => {
    isAuthenticated({
      onSuccess: () =>
        checkCanBooking({
          time,
          onSuccess: () => navigate(`/booking/${id}`),
        }),
    });
  };

  return (
    <>
      {loading ? (
        <Loading height="30vh" />
      ) : (
        <div>
          <div className="border border-top-0 z-3 px-3 pt-3 rounded-bottom">
            <div className="text-center">
              <Segmented
                className=""
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
                onChange={(value) => setCurrentSelected(showtimes.find((e) => e.date === value))}
              />
            </div>
            <div className="mt-1 pe-1">
              {currentSelected ? (
                currentSelected?.movies?.map((movie) => {
                  const _movie = movie.movie;
                  const _types = movie.types;

                  return (
                    <div key={_movie?._id} className="d-flex row my-3 border shadow-sm z-1 rounded-2 mx-0">
                      {/* Title */}
                      <span className="d-flex align-items-center">
                        <Tag color="#f50" className="me-2 text-center fw-bold" style={{ minWidth: '2.5rem' }}>
                          {_movie?.ageType}
                        </Tag>
                        <div
                          className="fw-bold fs-5 text-black cusor-pointer custom-hover my-2"
                          style={{ width: 'fit-content' }}
                          onClick={() => navigate(`/movies/${_movie._id}`)}
                        >
                          {_movie?.title}
                        </div>
                        <span
                          className="cusor-pointer hover-underline text-primary fw-bold ms-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            setModalTrailer(_movie.trailer);
                          }}
                        >
                          • Trailer
                        </span>
                      </span>
                      {/* Showtime */}
                      <div className="d-flex gap-3 mb-3" style={{ minHeight: '12.5rem' }}>
                        {/* Poster */}
                        <div className="col-2">
                          <Image
                            preview={false}
                            className="rounded-3"
                            width={'100%'}
                            height={'100%'}
                            src={_movie?.poster ?? `/${NO_IMAGE}`}
                          />
                        </div>
                        {/* Data Right */}
                        <div className="col-10">
                          {/*  */}
                          <span className="fs-6 text-muted" style={{ width: 'fit-content' }}>
                            {_movie?.originalTitle}
                            {' • '}
                            {_movie?.genres?.map((genre, idx) => (
                              <span key={genre._id}>
                                <span>{genre.name}</span>
                                <span style={{ color: 'black' }}>{idx === _movie?.genres.length - 1 ? '' : ', '}</span>
                              </span>
                            ))}
                            {' • '}
                            {`${_movie?.duration} phút`}
                            {' • '}
                            {`${AgeTypes[_movie?.ageType]}`}
                          </span>
                          <div className="mt-2">
                            {_types?.map((type, idx) => (
                              <div key={`${idx}-${type.type}`} className="w-100 mb-3">
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
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <NoDataCard text="Hiện tại rạp không có lịch chiếu nào!" />
              )}
            </div>
          </div>
          {/* Popup trailer */}
          {modalTrailer && (
            <Modal
              footer={null}
              closeIcon={false}
              centered
              width={'70%'}
              open
              className="modal-trailer"
              onCancel={() => setModalTrailer('')}
            >
              <Video url={modalTrailer} />
            </Modal>
          )}
        </div>
      )}
    </>
  );
}
