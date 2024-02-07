import React from 'react';
import Map from '../../../components/map';

export default function TheaterInfo(props) {
  const theater = props.theater;

  return (
    <div className="border border-top-0 shadow-sm z-3 px-3 py-4 rounded-bottom">
      {theater?.description ? (
        <div>
          <h2 className="mb-3 fw-bold border-5 border-start border-primary ps-2">MÔ TẢ</h2>
          <p className="text-body text-justify fs-6">{theater?.description}</p>
        </div>
      ) : null}
      <div className="mt-5">
        <h2 className="my-3 fw-bold border-5 border-start border-primary ps-2">THÔNG TIN CHI TIẾT</h2>
        <ul className="ps-3">
          <li className="fs-6 text-muted">
            <span className="text-body fw-bold">{'Email: '}</span>
            <span className="text-body">{theater?.email}</span>
          </li>
          <li className="fs-6 text-muted">
            <span className="text-body fw-bold">{'Số điện thoại: '}</span>
            <span className="text-body">{theater?.hotline}</span>
          </li>
          <li className="fs-6 text-muted">
            <div>
              <span className="text-body fw-bold">{'Địa chỉ: '}</span>
              <span className="text-body">{theater?.address}</span>
            </div>
            <div className="position-relative w-100 mb-3 mt-1" style={{ height: '50vh' }}>
              <Map
                lat={theater?.location?.coordinates[1]}
                lng={theater?.location?.coordinates[0]}
                scrollWheelZoom
                theater={theater}
              />
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}
