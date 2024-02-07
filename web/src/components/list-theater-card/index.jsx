import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Modal, Input, Image, Select, Empty } from 'antd';
import { SearchOutlined, HeartFilled } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { NO_IMAGE } from '../../constants/images';
import { Loading } from '../loading';

export default function ListTheaterCard(props) {
  const navigate = useNavigate();

  const [fetchCityLoading, setFetchCityLoading] = useState(true);

  const [filterTheater, setFilterTheater] = useState(props.theaters);
  const [listCity, setListCity] = useState([]);

  const [currentCity, setCurrentCity] = useState(null);
  const [currentKey, setCurrentKey] = useState(null);

  const getListCity = async () => {
    setFetchCityLoading(true);
    try {
      const response = await axios.get('https://provinces.open-api.vn/api/?depth=1');
      if (response) {
        setListCity(response.data);
        setFetchCityLoading(false);
      }
    } catch (_) {
      //
    }
  };

  const handleFilterTheaters = () => {
    if (!currentKey && !currentCity) {
      setFilterTheater(props.theaters);
      return;
    }

    setFilterTheater(
      props.theaters.filter((e) => {
        const str = e.name + ' ' + e.address;

        if (currentKey && currentCity) {
          return str.includes(currentKey) && str.includes(currentCity);
        } else if (currentKey) {
          return str.includes(currentKey);
        } else {
          return str.includes(currentCity);
        }
      }),
    );
  };

  useEffect(() => {
    if (!listCity.length) getListCity();
  }, []);

  useEffect(() => {
    if (props.open) setFilterTheater(props.theaters);
  }, [props.theaters, props.open]);

  useEffect(() => {
    handleFilterTheaters();
  }, [currentCity, currentKey]);

  return (
    <Modal footer={null} closeIcon={false} width={'45%'} open={props.open} onCancel={props.onCancel}>
      <>
        {props.loading ? (
          <Loading />
        ) : (
          <div className="h-100">
            <div className="d-flex flex-row gap-3 mb-2">
              <Input
                className="w-50"
                addonBefore={<SearchOutlined />}
                size="large"
                placeholder="Tìm kiếm rạp ... "
                onChange={(key) => setCurrentKey(key.target.value)}
              />
              <Select
                showSearch
                className="w-50"
                size="large"
                value={currentCity}
                loading={fetchCityLoading}
                onChange={(value) => setCurrentCity(value)}
                options={[
                  {
                    value: null,
                    label: 'Tất cả',
                  },
                  ...listCity.map((city) => {
                    return {
                      value: city.name,
                      label: city.name,
                    };
                  }),
                ]}
              />
            </div>
            <div className="overflow-auto" style={{ maxHeight: '65vh' }}>
              {!filterTheater.length ? (
                <div className="text-center my-5">
                  <Empty description="Không có rạp thỏa mãn!" />
                </div>
              ) : (
                filterTheater.map((theater) => (
                  <div
                    key={theater._id}
                    className="w-100 d-flex flex-row gap-3 mt-3 cusor-pointer"
                    onClick={() => {
                      props.onCancel.call();
                      navigate(`/theaters/${theater._id}`);
                    }}
                  >
                    <div style={{ width: '4rem', height: '4rem' }}>
                      <Image
                        className="rounded-3"
                        src={theater.logo ?? `/${NO_IMAGE}`}
                        preview={false}
                        height={'100%'}
                        width={'100%'}
                      />
                    </div>
                    <div>
                      <p className="fw-bold fs-5 text-body custom-hover my-0">
                        {theater.name}
                        {theater.isFavorited && (
                          <HeartFilled className="ms-2" style={{ fontSize: '1.25rem', color: 'red' }} />
                        )}
                      </p>
                      <p className="fs-6 text-muted">{theater.address}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </>
    </Modal>
  );
}
