import React, { useEffect, useState } from 'react';
import { Image } from 'antd';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import apiCaller from '../../../apis/apiCaller';
import { bookingApi } from '../../../apis/bookingApi';
import { Loading } from '../../../components/loading';
import NoDataCard from '../../../components/no-data-card';
import { getTemplateOfDate } from '../../../utils/date';
import { ShowtimeLanguageTypes } from '../../../constants/values';
import { openGoogleMapsInNewTab } from '../../../utils/open-map';
import { formatVietNamCurrency } from '../../../utils/string';
import { NO_IMAGE } from '../../../constants/images';

export default function ProfileBooking() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [data, setData] = useState([]);

  const errorHandler = (error) => {
    setLoading(false);
    toast.error(error.message, { autoClose: 3000, theme: 'colored' });
  };

  const getMyBooking = async () => {
    setLoading(true);

    const response = await apiCaller({
      request: bookingApi.myBooking({
        page: 1,
        limit: 20,
      }),
      errorHandler,
    });

    if (response) {
      setData(response.data);
      setLoading(false);
    }
  };

  useEffect(() => {
    getMyBooking();
  }, []);

  return (
    <div className="h-100 w-100 d-flex justify-content-center">
      {loading ? (
        <Loading height={'100%'} />
      ) : data?.length ? (
        <div className="w-100">
          <div className="text-muted text-center fs-6">Lưu ý: Chỉ hiển thị 20 lịch sử giao dịch gần nhất</div>
          <div className="mt-4 w-100 d-flex flex-column gap-3">
            {data?.map((booking) => (
              <div key={booking._id} className="border rounded-3 shadow-sm bg-white p-3 w-100 d-flex gap-4">
                {/* Poster */}
                <div style={{ width: '25%', minHeight: '15rem' }} className="position-relative">
                  <Image
                    src={booking.movie?.poster ?? NO_IMAGE}
                    width={'100%'}
                    height={'100%'}
                    className="rounded-3"
                    preview={{ maskClassName: 'rounded-3' }}
                  />
                  {booking.showtime?.type === 'Sneakshow' ? (
                    <div className="position-absolute top-0 p-1 px-2 bg-danger text-white rounded-3 mt-1 ms-1">
                      <i className="fa-regular fa-star"></i> Chiếu sớm
                    </div>
                  ) : null}
                </div>
                <div className="w-100 d-flex flex-column justify-content-between">
                  {/* Movie */}
                  <div className="d-flex align-items-center my-0 py-0" style={{ height: 'fit-content' }}>
                    <div
                      className="me-2 my-0 bg-warning fw-bold rounded-3 text-white justify-content-center h-100 d-flex align-items-center"
                      style={{ width: '2.5rem', height: '100%' }}
                    >
                      <div className="fs-6">{booking.movie?.ageType}</div>
                    </div>
                    <div className="my-0 d-flex align-items-center">
                      <span
                        className="my-0 text-body fw-bold cusor-pointer custom-hover"
                        style={{ fontSize: '1.35rem' }}
                        onClick={() => navigate(`/movies/${booking.movie?._id}`)}
                      >
                        {booking.movie?.title}
                      </span>
                      <span className="ms-2 text-body fs-6">{`• ${booking.movie?.duration} phút`}</span>
                    </div>
                  </div>
                  {/* Theater */}
                  <div className="mt-0">
                    <div style={{ fontSize: '1.125rem' }}>
                      <span className="text-muted">Rạp: </span>
                      <span
                        className="text-body cusor-pointer custom-hover"
                        onClick={() => navigate(`/theaters/${booking.theater?._id}`)}
                      >
                        {booking.theater?.name}
                      </span>
                    </div>
                    <div style={{ fontSize: '1.1rem' }}>
                      <span className="text-muted">Địa chỉ: </span>
                      <span className="text-body">{booking.theater?.address}</span>
                      <span>{' • '}</span>
                      <span
                        className="text-primary cusor-pointer custom-hover"
                        onClick={() => openGoogleMapsInNewTab(booking.theater?.coordinates)}
                      >
                        Bản đồ
                      </span>
                    </div>
                    {/* Showtimes */}
                    <div style={{ fontSize: '1.1rem' }} className="mt-2">
                      <span className="text-muted">Suất chiếu: </span>
                      <span className="text-body">
                        {getTemplateOfDate(booking.showtime?.startTime, 'HH:mm, DD/MM/YYYY')}
                      </span>
                      <span className="text-body">{` • ${booking?.room?.type} ${
                        ShowtimeLanguageTypes[booking.showtime?.language]
                      }`}</span>
                      <span>{' • '}</span>
                      <span className="text-body">{booking.room?.name}</span>
                    </div>
                    {/* Seats */}
                    <div style={{ fontSize: '1.1rem' }} className="d-flex gap-1 align-items-center mt-1">
                      <span className="text-body d-flex gap-2">
                        {booking.seats?.map((seat) => (
                          <div className="py-2 px-3 bg-success rounded-3 text-white" key={seat.label}>
                            {seat.label}
                          </div>
                        ))}
                      </span>
                    </div>
                  </div>
                  {/* Price */}
                  <div
                    style={{ fontSize: '1.1rem' }}
                    className="d-flex justify-content-between align-items-center border-top me-1 pt-1 px-1"
                  >
                    <div>
                      <span className="text-body fw-bold">Khuyến mãi: </span>
                      <span className="text-danger fw-bold">
                        {formatVietNamCurrency(booking.payment?.discountAmount?.toFixed(2))}
                      </span>
                    </div>
                    <div>
                      <span className="text-body fw-bold">Giá vé: </span>
                      <span className="text-danger fw-bold">
                        {formatVietNamCurrency(booking.payment?.totalPrice?.toFixed(2))}
                      </span>
                    </div>
                  </div>
                </div>
                {/* QR */}
                <div style={{ width: '15%' }} className="d-flex align-items-center">
                  <Image
                    src={booking.qrcode ?? NO_IMAGE}
                    className="rounded-3"
                    preview={{ maskClassName: 'rounded-3' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <NoDataCard text="Bạn chưa thực hiện giao dịch nào trên hệ thống!" />
      )}
    </div>
  );
}
