import React from 'react';
import { Spin } from 'antd';

import './style.scss';

export const Loading = (props) => {
  return (
    <div className="loading-container" style={{ height: props.height ?? '50vh' }}>
      <Spin tip="Đang tải ..." size="large">
        <div className="content" />
      </Spin>
    </div>
  );
};

export default function FullScreenLoading() {
  return (
    <div className="fullscreen-loading-container">
      <Spin tip="Đang tải ..." size="large" fullscreen>
        <div className="content" />
      </Spin>
    </div>
  );
}
