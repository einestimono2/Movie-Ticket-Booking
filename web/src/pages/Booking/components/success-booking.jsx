import React from 'react';
import { Image, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

import { NO_IMAGE } from '../../../constants/images';

export default function SuccessBooking(props) {
  const booking = props.booking;
  const navigate = useNavigate();

  return (
    <div className="w-100 p-5 text-center">
      <h1 className="fw-bold my-1 text-success">Đặt vé thành công!</h1>
      <h2 className="text-body my-2">Mã booking #{booking?._id ?? '^^'}</h2>
      <div className="my-2">
        <Image
          src={booking?.qrcode ?? `/${NO_IMAGE}`}
          height={'50%'}
          width={'25%'}
          className="rounded-3"
          preview={{ maskClassName: 'rounded-3' }}
        />
      </div>
      <h2 className="text-body my-2">Sử dụng mã QR trên khi tới rạp để xác nhận đã đặt trước!</h2>
      <Button className="w-25 mt-4" type="primary" size="large" onClick={() => navigate('/', { replace: true })}>
        Trang chủ
      </Button>
    </div>
  );
}
