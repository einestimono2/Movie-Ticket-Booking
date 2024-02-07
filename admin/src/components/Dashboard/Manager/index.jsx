import { faChartArea, faChartColumn, faChartLine, faChartPie } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import dayjs from 'dayjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from 'chart.js';
import moment from 'moment';
import { DatePicker, Skeleton } from 'antd';
import { ToastContainer, toast } from 'react-toastify';
import { reportApi } from '../../../apis/all/reportApi';
import apiCaller from '../../../apis/apiCaller';
import 'react-toastify/dist/ReactToastify.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, BarElement, Legend);
export default function DashboardAdmin() {
  const [revenue, setRevenue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [_year, setYear] = useState(moment().format('YYYY'));
  const [datas, setDatas] = useState([]);
  const labels = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const access_token = localStorage.getItem('admin_access_token');
  const errorHandler = (error) => {
    toast.error(error.message, { autoClose: 3000, theme: 'colored' });
  };
  const handleYearChange = (date, dateString) => {
    setYear(dateString);
  };
  const getRevenueOverview = async () => {
    const response = await apiCaller({
      request: reportApi.revenueOverview(access_token),
      errorHandler,
    });
    if (response) {
      setRevenue(response.data);
    }
  };
  const getRevenueByYear = async () => {
    const data = {
      year: _year,
    };
    setLoading(true);
    const response = await apiCaller({
      request: reportApi.revenueByYear(data, access_token),
      errorHandler,
    });
    if (response) {
      setLoading(false);
      setDatas(response.data);
    }
  };
  const data = {
    labels,
    datasets: [
      {
        label: 'Doanh thu',
        data: datas.map((item) => item.totalRevenue),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: 'Doanh số',
        data: datas.map((item) => item.totalCount),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };
  const { RangePicker } = DatePicker;
  useEffect(() => {
    getRevenueOverview();
  }, []);
  useEffect(() => {
    getRevenueByYear();
  }, [_year]);
  return (
    <>
      {loading ? (
        <div>
          <div className="grid grid-cols-4 gap-5">
            <Skeleton.Input active block className="!h-[140px]" />
            <Skeleton.Input active block className="!h-[140px]" />
            <Skeleton.Input active block className="!h-[140px]" />
            <Skeleton.Input active block className="!h-[140px]" />
          </div>
          <div className="grid grid-cols-2 mt-5 gap-5">
            <Skeleton.Input active block className="!h-[350px]" />
            <Skeleton.Input active block className="!h-[350px]" />
          </div>
          <ToastContainer />
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-4 gap-5">
            <div className="bg-[#f3f6f9] rounded-lg items-center grid grid-cols-5 p-5">
              {' '}
              <FontAwesomeIcon className="text-5xl col-span-2 text-blue-500" icon={faChartLine} />{' '}
              <div className="col-span-3">
                <p className="text-lg font-semibold text-gray-400 m-0">Tổng doanh thu hôm nay</p>
                <p className="my-3 font-bold">
                  {Number(revenue[0]?.today?.totalRevenue).toLocaleString('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  })}
                </p>
              </div>
            </div>
            <div className=" bg-[#f3f6f9] rounded-lg grid grid-cols-5 items-center p-5">
              {' '}
              <FontAwesomeIcon className="text-5xl col-span-2 text-blue-500" icon={faChartColumn} />{' '}
              <div className="col-span-3">
                <p className="text-lg font-semibold text-gray-400 m-0">Tổng doanh thu tuần này</p>
                <p className="my-3 font-bold">
                  {' '}
                  {Number(revenue[0]?.week?.totalRevenue).toLocaleString('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  })}
                </p>
              </div>
            </div>
            <div className=" bg-[#f3f6f9] rounded-lg grid grid-cols-5 items-center p-5">
              {' '}
              <FontAwesomeIcon className="text-5xl col-span-2 text-blue-500" icon={faChartArea} />{' '}
              <div className="col-span-3">
                <p className="text-lg font-semibold text-gray-400 m-0">Tổng doanh số hôm nay</p>
                <p className="my-3 font-bold"> {Number(revenue[0]?.today?.totalCount)}</p>
              </div>
            </div>
            <div className="bg-[#f3f6f9] rounded-lg grid grid-cols-5 items-center p-5">
              {' '}
              <FontAwesomeIcon className="text-5xl col-span-2 text-blue-500" icon={faChartPie} />{' '}
              <div className="col-span-3">
                <p className="text-lg font-semibold text-gray-400 m-0">Tổng doanh số tuần nay</p>
                <p className="my-3 font-bold">{Number(revenue[0]?.week?.totalCount)}</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 mt-5 gap-5">
            <div className="bg-[#f3f6f9] rounded-lg p-5">
              <div className="grid grid-cols-2 items-center">
                <p className="mt-0">Doanh thu của từng rạp theo thời gian</p>
                <RangePicker />
              </div>
              <Line data={data} />
            </div>
            <div className="bg-[#f3f6f9] rounded-lg p-5">
              <div className="grid grid-cols-2 items-center">
                <p className="mt-0">Doanh thu theo tháng</p>
                <DatePicker
                  defaultValue={dayjs(moment())}
                  onChange={handleYearChange}
                  picker="year"
                  placeholder="Chọn năm"
                  format="YYYY"
                />{' '}
              </div>
              <Bar data={data} />
            </div>
          </div>
          <ToastContainer />
        </div>
      )}
    </>
  );
}
