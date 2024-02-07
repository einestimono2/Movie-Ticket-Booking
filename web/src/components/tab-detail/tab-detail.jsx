import React from 'react';
import './tab-detail.scss';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { Rate } from 'antd';

function TabDetail() {
  return (
    <div className="container-fluid my-3">
      <Tabs>
        <TabList>
          <Tab>Thông tin phim</Tab>
          <Tab>Lịch chiếu</Tab>
          <Tab>Đánh giá</Tab>
        </TabList>
        <TabPanel>
          <div className="container">
            <div className="card">
              <iframe
                width="760"
                height="415"
                src="https://www.youtube.com/embed/cYCOcxWgPVU?si=gz_aIsmy_Dbznzll"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowfullscreen
              ></iframe>
            </div>
          </div>
          <div className="container">
            <div className="review w-100">
              <p className="review-title">Cộng đồng</p>
              <div className="card">
                <div className="card-header">
                  <div className="d-flex user-review" style={{ alignItems: 'center' }}>
                    <i className="fa-solid fa-user"></i>&nbsp; Đức Tuệ
                  </div>
                </div>
                <div className="card-body">
                  <h5 className="card-title">Thương nam chính Bách Ruồi quá</h5>
                  <p className="card-text">1 giờ trước</p>
                  <div className="d-flex">
                    <Rate allowHalf defaultValue={2.5} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabPanel>
      </Tabs>
    </div>
  );
}

export default TabDetail;
