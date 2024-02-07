import { Image } from 'antd';
import { useNavigate } from 'react-router-dom';

import { NO_IMAGE } from '../../constants/images';
import { openGoogleMapsInNewTab } from '../../utils/open-map';

export const MovieCardHorizontal = (props) => {
  const navigate = useNavigate();

  const theater = props.theater;

  return (
    <div className="row m-100">
      <div className="col-4">
        <Image src={theater?.logo ?? `/${NO_IMAGE}`} height={'100%'} width={'100%'} preview={false} />
      </div>
      <div className="col-8">
        <p
          className="fw-bold text-body fs-6 max-2-lines my-0 cusor-pointer custom-hover"
          onClick={() => navigate(`/theaters/${theater._id}`)}
        >
          {theater.name}
        </p>
        <p className="text-muted fs-6 max-2-lines my-1" style={{ minHeight: '2rem' }}>
          {theater.address}
        </p>
        <span className="text-success fs-6 max-2-lines my-0">
          {(theater.distance / 1000).toFixed(2)} km •{' '}
          <span
            className="text-primary cusor-pointer"
            onClick={() => openGoogleMapsInNewTab(theater?.location?.coordinates)}
          >
            Bản đồ
          </span>
        </span>
      </div>
    </div>
  );
};
