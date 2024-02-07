import React, { useEffect, useState } from 'react';
import { Steps, Image, Button, Divider } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

import './style.scss';
import socket from '../../socket';
import { showtimeApi } from '../../apis/showtimeApi';
import { bookingApi } from '../../apis/bookingApi';
import apiCaller from '../../apis/apiCaller';
import { NO_IMAGE } from '../../constants/images';
import { SeatTypes, ShowtimeLanguageTypes } from '../../constants/values';
import { getTemplateOfDate } from '../../utils/date';
import { formatVietNamCurrency } from '../../utils/string';
import SeatBooking from './components/seat-booking';
import ProductBooking from './components/product-booking';
import FullScreenLoading from '../../components/loading';
import NoDataCard from '../../components/no-data-card';
import { NotificationCard } from '../../components/notification-card';
import PaymentBooking from './components/payment-booking';
import SuccessBooking from './components/success-booking';
import Timer from '../../components/timer';
import { cleanData } from '../../redux/reducer/bookingReducer';

export default function Booking() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const [currentStep, setCurrentStep] = useState(0);

  const selectedSeats = useSelector((state) => state.booking.seats);
  const selectedProducts = useSelector((state) => state.booking.products);
  const selectedPromotions = useSelector((state) => state.booking.promotions);

  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [data, setData] = useState();
  const [bookingData, setBookingData] = useState();

  const errorHandler = (error) => {
    setLoading(false);
    toast.error(error.message, { autoClose: 3000, theme: 'colored' });
  };

  const childrenErrorHandler = (message) => {
    toast.error(message, { autoClose: 3000, theme: 'colored' });
  };

  const getShowtimeData = async () => {
    if (!id) return;

    setLoading(true);
    const response = await apiCaller({
      request: showtimeApi.getDetails(id),
      errorHandler,
    });

    if (response) {
      if (
        !response.data?.showtime?.endTime ||
        getTemplateOfDate(response.data?.showtime?.endTime, 'YYYY-MM-DD HH:mm') <=
          getTemplateOfDate(undefined, 'YYYY-MM-DD HH:mm')
      ) {
        NotificationCard({
          title: 'Lịch chiếu không tồn tại!',
          content: 'Lịch chiếu hiện tại đã kết thúc. Vui lòng lựa chọn lịch chiếu khác.',
          onConfirm: () => navigate('/', { replace: true }),
          onAllAction: () => navigate('/', { replace: true }),
        });
      } else {
        setData(response.data);
        setLoading(false);
      }
    }
  };

  const handleBooking = async () => {
    const _seats = [];
    const prices = calculateTotalAmount(false);
    const _showtime = data.showtime._id;

    Object.keys(selectedSeats).forEach((key) => {
      selectedSeats[key].forEach((e) => {
        _seats.push(e.id);
      });
    });

    const body = {
      showtime: _showtime,
      theater: data.showtime.theater._id,
      room: data.showtime.room._id,
      seats: _seats,
      products: Object.keys(selectedProducts).map((key) => {
        return {
          quantity: selectedProducts[key].quantity,
          item: key,
        };
      }),
      payment: {
        promotion: Object.keys(selectedPromotions),
        discountAmount: prices[0],
        totalPrice: prices[1],
      },
    };

    setBookingLoading(true);
    const response = await apiCaller({
      request: bookingApi.createBooking(body),
      errorHandler,
    });

    if (response) {
      const seats = [];

      Object.keys(selectedSeats).forEach((key) => {
        selectedSeats[key]?.forEach((e) => seats.push(e));
      });
      socket.emit('completeBooking', { seats, showtimeId: _showtime });

      dispatch(cleanData());

      setBookingData(response.data);
      setBookingLoading(false);
      setCurrentStep(currentStep + 1);
    }
  };

  const items = [
    {
      key: 0,
      title: 'Chọn ghế',
      content: <SeatBooking data={data} onError={(message) => childrenErrorHandler(message)} />,
    },
    {
      key: 1,
      title: 'Chọn đồ ăn',
      content: <ProductBooking data={data} onError={(message) => childrenErrorHandler(message)} />,
    },
    {
      key: 2,
      title: 'Thanh toán',
      content: <PaymentBooking data={data} onError={(message) => childrenErrorHandler(message)} />,
    },
    {
      key: 3,
      title: 'Kết quả',
      content: <SuccessBooking booking={bookingData} />,
    },
  ];

  useEffect(() => {
    getShowtimeData();
  }, [id]);

  //! Socket
  useEffect(() => {
    socket.connect(); // Mở kết nối socket

    function onConnect() {}
    function onDisconnect() {}

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // Khi rời khỏi trang or unmount
    return () => {
      socket.disconnect(); // Dóng kết nối

      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  const calculateTotalAmount = (format = true) => {
    let total = 0;
    let discount = 0;

    Object.keys(selectedSeats).forEach((key) => {
      total += selectedSeats[key].length * data?.price[key] ?? 1;
    });

    Object.keys(selectedProducts).forEach((key) => {
      total += selectedProducts[key].quantity * selectedProducts[key].price;
    });

    Object.keys(selectedPromotions).forEach((key) => {
      discount +=
        selectedPromotions[key].type === 'Amount'
          ? selectedPromotions[key].value
          : (selectedPromotions[key].value * total) / 100;
    });

    total = total - discount;

    return format
      ? [
          discount === 0 ? undefined : formatVietNamCurrency(discount.toFixed(2)),
          formatVietNamCurrency(total.toFixed(2)),
        ]
      : [discount, total];
  };

  const handleNextStep = () => {
    if (currentStep === 2) {
      handleBooking();
      return;
    }

    setCurrentStep(currentStep + 1);
  };

  const handlePreviousStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const cancel = (navigate = true) => {
    const showtimeId = data.showtime._id;
    const seats = [];

    Object.keys(selectedSeats).forEach((key) => {
      selectedSeats[key]?.forEach((e) => seats.push(e));
    });

    socket.emit('cancelBooking', { seats, showtimeId });

    // Go Home
    if (navigate) navigate('/', { replace: true });
  };

  const handleTimedout = () => {
    NotificationCard({
      title: 'Hết thời gian giữ chỗ!',
      content: 'Phiên giao dịch của bạn đã hết hạn. Ban có thể thử lại bằng cách nhấn vào nút bên dưới.',
      onConfirm: () => window.location.reload(),
      confirmText: 'Thử lại',
      denyText: 'Hủy',
      onDeny: cancel,
      onOther: cancel,
    });
  };

  return (
    <div className="booking-container">
      <>
        {loading ? (
          <FullScreenLoading />
        ) : (
          <>
            {data ? (
              <>
                {/* Steps */}
                <div className="container mt-4">
                  <Steps current={currentStep} className=" px-4" items={items} labelPlacement="horizontal" />
                </div>
                {/* Body */}
                <div className="container mt-5">
                  <div className="row w-100 d-flex justify-content-between" style={{ height: 'fit-content' }}>
                    {/* Content */}
                    <div className={currentStep === 3 ? 'w-100' : 'col-8 h-100'}>
                      <div className="border rounded-2 shadow-sm z-3 me-3">{items[currentStep].content}</div>
                    </div>
                    {/* Summary, Button */}
                    {currentStep !== 3 ? (
                      <div className="col-4 h-100 d-flex flex-column">
                        <Timer
                          className="d-flex bg-danger text-white justify-content-between align-items-center p-2 border rounded-1 shadow-sm z-3"
                          initialMinute={5}
                          initialSeconds={0}
                          onTimedout={handleTimedout}
                          title="Thời gian giữ chỗ"
                        />
                        <div className="w-100 border rounded-2 shadow-sm z-3 p-2">
                          {/* Movie Info */}
                          <div className="w-100 d-flex gap-2">
                            <div style={{ width: '27.5%', height: '11rem' }}>
                              <Image
                                src={data?.showtime?.movie?.poster ?? `/${NO_IMAGE}`}
                                width={'100%'}
                                height={'100%'}
                                className="rounded-3"
                                preview={{ maskClassName: 'rounded-3' }}
                              />
                            </div>
                            <div className="h-100">
                              <p className="fw-bold fs-5 text-body my-0">{data?.showtime?.movie?.title}</p>
                              <p className="fs-6 text-muted my-0">{data?.showtime?.movie?.originalTitle}</p>
                              <div className="d-flex mt-2 gap-2 text-body text-center">
                                <p className="text-body">{data?.showtime?.room?.type}</p>
                                {' • '}
                                <p className="text-body">
                                  {ShowtimeLanguageTypes[data?.showtime?.language] ?? 'Unkown'}
                                </p>
                                {' • '}
                                <p
                                  className="fw-bold border rounded bg-warning text-white text-center"
                                  style={{ width: 'fit-content', minWidth: '2.5rem' }}
                                >
                                  {data?.showtime?.movie?.ageType}
                                </p>
                              </div>
                            </div>
                          </div>
                          {/* Room */}
                          <div className="my-3">
                            <p className="fw-bold text-body fs-5 my-0">{data?.showtime?.theater?.name}</p>
                            <span>
                              <span>{data?.showtime?.room?.name}</span>
                              {' • '}
                              <span>
                                Ngày:{' '}
                                <span className="fw-bold">
                                  {getTemplateOfDate(data?.showtime?.startTime, 'DD/MM/YYYY')}
                                </span>
                              </span>
                              {' • '}
                              <span>
                                Suất:
                                <span className="fw-bold">
                                  {' '}
                                  {getTemplateOfDate(data?.showtime?.startTime, 'HH:mm')}
                                </span>
                              </span>
                            </span>
                          </div>
                          {/* Seats Order */}
                          {Object.keys(selectedSeats).length ? (
                            <div>
                              <Divider className="my-2" />
                              <div className="d-flex flex-column gap-1">
                                {Object.keys(selectedSeats).map((key) => (
                                  <div key={key} className="px-2 d-flex justify-content-between align-items-center">
                                    <div>
                                      <div>
                                        <span className="fw-bold text-danger">{selectedSeats[key].length}x </span>{' '}
                                        {SeatTypes[key]}
                                      </div>
                                      <div className="text-muted">
                                        Ghế: {selectedSeats[key].map((e) => e.label).join(', ')}
                                      </div>
                                    </div>
                                    <div>
                                      {formatVietNamCurrency((selectedSeats[key].length * data.price[key]).toFixed(2))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null}
                          {/* Products Order */}
                          {Object.keys(selectedProducts).length ? (
                            <div>
                              <Divider className="my-2" />
                              <div className="d-flex flex-column gap-1">
                                {Object.keys(selectedProducts).map((key) => (
                                  <div key={key} className="px-2 d-flex justify-content-between align-items-center">
                                    <div>
                                      <span className="fw-bold text-danger">{selectedProducts[key].quantity}x </span>{' '}
                                      {selectedProducts[key].name}
                                    </div>
                                    <div>
                                      {formatVietNamCurrency(
                                        (selectedProducts[key].quantity * selectedProducts[key].price).toFixed(2),
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null}
                          <div>
                            <Divider className="my-2" />
                            {calculateTotalAmount().map((e, idx) => {
                              if (idx === 0) {
                                return e ? (
                                  <div className="mt-3 d-flex justify-content-between px-1">
                                    <p className="text-body my-0">Giảm</p>
                                    <p className="text-muted my-0">{e}</p>
                                  </div>
                                ) : null;
                              } else {
                                return (
                                  <div key={e + idx} className="mt-1 d-flex justify-content-between px-1">
                                    <p className="fw-bold text-body">Tổng cộng</p>
                                    <p className="fw-bold text-danger">{e}</p>
                                  </div>
                                );
                              }
                            })}
                          </div>
                        </div>
                        {/* Button */}
                        <div className="mt-4 w-100 d-flex gap-2">
                          <Button
                            size="large"
                            className="rounded w-50"
                            disabled={currentStep === 0}
                            onClick={handlePreviousStep}
                          >
                            Quay lại
                          </Button>
                          <Button
                            type="primary"
                            className="rounded w-50"
                            disabled={!Object.keys(selectedSeats).length}
                            size="large"
                            onClick={handleNextStep}
                          >
                            {currentStep === 2 ? 'Thanh toán' : 'Tiếp theo'}
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </>
            ) : (
              <NoDataCard text="Không có dữ liệu" />
            )}
          </>
        )}
      </>
      {bookingLoading && <FullScreenLoading />}
    </div>
  );
}
