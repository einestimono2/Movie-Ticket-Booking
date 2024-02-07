import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Button, Carousel } from 'antd';
import apiCaller from '../../apis/apiCaller';
import { theaterApi } from '../../apis/manager/theaterApi';
import 'react-toastify/dist/ReactToastify.css';

export default function MytheaterPage() {
  const [data, setData] = useState();
  const theaterId = JSON.parse(localStorage.getItem('admin_user')).theater;
  const errorHandler = (error) => {
    toast.error(error.message, { autoClose: 3000, theme: 'colored' });
  };
  const getDetailTheater = async () => {
    const res = await apiCaller({
      request: theaterApi.detailTheater(theaterId),
      errorHandler,
    });

    if (res) {
      console.log(res.data);
      setData(res.data);
    }
  };
  useEffect(() => {
    getDetailTheater();
  }, []);
  return (
    <div>
      <div className="flex justify-between items-center">
        <p className="text-2xl font-bold">{data?.name}</p>
        <Button>Sửa thông tin rạp</Button>
      </div>
      <div className="flex">
        <img alt="#" src={data?.logo} width={200} height={200} className="rounded-lg" />
        <div className="ml-5">
          <p>Địa chỉ: {data?.address}</p>
          <p>Hotline: {data?.hotline}</p>
          <p>Email: {data?.email}</p>
          <p>Mô tả: {data?.description}</p>
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold mb-1">Ảnh rạp</p>
        <Carousel autoplay>
          {data?.images.map((e, index) => (
            <img key={index} src={e} alt="img" className="h-[30rem] rounded-md" />
          ))}
        </Carousel>
      </div>
    </div>
  );
}
