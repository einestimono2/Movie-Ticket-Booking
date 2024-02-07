import React, { useEffect, useState } from 'react';
import { Table } from 'antd';

import { convertFromToOfFare, formatVietNamCurrency, getLabelFromSurcharge } from '../../../utils/string';
import { DayOfWeek } from '../../../constants/values';
import apiCaller from '../../../apis/apiCaller';
import { fareApi } from '../../../apis/fareApi';
import { Loading } from '../../../components/loading';
import NoDataCard from '../../../components/no-data-card';

const { Column, ColumnGroup } = Table;

export default function TheaterFare(props) {
  const [loading, setLoading] = useState(true);

  const [fare, setFare] = useState();

  const errorHandler = (error) => {
    setLoading(false);
    props.onError(error);
  };

  const getFare = async () => {
    if (!props.id) return;

    setLoading(true);
    const response = await apiCaller({
      request: fareApi.getDetails(props.id),
      errorHandler,
    });

    if (response) {
      setFare(response.data);
      setLoading(false);
    }
  };

  useEffect(() => {
    getFare();
  }, [props.id]);

  const dataSource2D = fare?._2d?.map((e, idx) => {
    return {
      key: idx,
      time: convertFromToOfFare(e.from, e.to),
      standard: e.seat[0],
      vip: e.seat[1],
      sweetbox: e.seat[2],
    };
  });

  const dataSource3D = fare?._3d?.map((e, idx) => {
    return {
      key: idx,
      time: convertFromToOfFare(e.from, e.to),
      standard: e.seat[0],
      vip: e.seat[1],
      sweetbox: e.seat[2],
    };
  });

  return (
    <>
      {loading ? (
        <Loading height="30vh" />
      ) : fare ? (
        <div className="border shadow-sm border-top-0 z-3 px-3 py-4 rounded-bottom">
          <div>
            <h2 className="my-3 fw-bold border-5 border-start border-primary ps-2">GIÁ VÉ PHIM 2D</h2>
            <Table dataSource={dataSource2D} pagination={false} bordered>
              <Column title="Thời gian" dataIndex="time" />
              <ColumnGroup title="Ngày thường">
                <Column
                  title="Ghế thường"
                  align="center"
                  dataIndex="standard"
                  render={(obj) => <div>{formatVietNamCurrency(obj?.normalDayPrice)}</div>}
                />
                <Column
                  title="Ghế VIP"
                  align="center"
                  dataIndex="vip"
                  render={(obj) => <div>{formatVietNamCurrency(obj?.normalDayPrice)}</div>}
                />
                <Column
                  title="Ghế đôi"
                  align="center"
                  dataIndex="sweetbox"
                  render={(obj) => <div>{formatVietNamCurrency(obj?.normalDayPrice)}</div>}
                />
              </ColumnGroup>
              <ColumnGroup title="Cuối tuần và ngày Lễ">
                <Column
                  title="Ghế thường"
                  align="center"
                  dataIndex="standard"
                  render={(obj) => <div>{formatVietNamCurrency(obj?.specialDayPrice)}</div>}
                />
                <Column
                  title="Ghế VIP"
                  align="center"
                  dataIndex="vip"
                  render={(obj) => <div>{formatVietNamCurrency(obj?.specialDayPrice)}</div>}
                />
                <Column
                  title="Ghế đôi"
                  align="center"
                  dataIndex="sweetbox"
                  render={(obj) => <div>{formatVietNamCurrency(obj?.specialDayPrice)}</div>}
                />
              </ColumnGroup>
            </Table>
            <DateSection fare={fare} />
          </div>
          <div>
            <h2 className="mt-5 mb-3 fw-bold border-5 border-start border-primary ps-2">GIÁ VÉ PHIM 3D</h2>
            <Table dataSource={dataSource3D} pagination={false} bordered>
              <Column title="Thời gian" dataIndex="time" />
              <ColumnGroup title="Ngày thường">
                <Column
                  title="Ghế thường"
                  align="center"
                  dataIndex="standard"
                  render={(obj) => <div>{formatVietNamCurrency(obj?.normalDayPrice)}</div>}
                />
                <Column
                  title="Ghế VIP"
                  align="center"
                  dataIndex="vip"
                  render={(obj) => <div>{formatVietNamCurrency(obj?.normalDayPrice)}</div>}
                />
                <Column
                  title="Ghế đôi"
                  align="center"
                  dataIndex="sweetbox"
                  render={(obj) => <div>{formatVietNamCurrency(obj?.normalDayPrice)}</div>}
                />
              </ColumnGroup>
              <ColumnGroup title="Cuối tuần và ngày Lễ">
                <Column
                  title="Ghế thường"
                  align="center"
                  dataIndex="standard"
                  render={(obj) => <div>{formatVietNamCurrency(obj?.specialDayPrice)}</div>}
                />
                <Column
                  title="Ghế VIP"
                  align="center"
                  dataIndex="vip"
                  render={(obj) => <div>{formatVietNamCurrency(obj?.specialDayPrice)}</div>}
                />
                <Column
                  title="Ghế đôi"
                  align="center"
                  dataIndex="sweetbox"
                  render={(obj) => <div>{formatVietNamCurrency(obj?.specialDayPrice)}</div>}
                />
              </ColumnGroup>
            </Table>
            <DateSection fare={fare} />
          </div>
          {fare?.surcharge?.length ? (
            <div className="w-100">
              <h2 className="mt-5 mb-2 fw-bold border-5 border-start border-primary ps-2">PHỤ THU</h2>
              <ul className="">
                {fare?.surcharge?.map((e) => {
                  return (
                    <li key={e.name} className="text-body my-0">
                      {getLabelFromSurcharge(e.name, e.value)}
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
          <div className="w-100">
            <h2 className="mt-5 mb-2 fw-bold border-5 border-start border-primary ps-2">LƯU Ý</h2>
            <ul className="">
              <li className="text-body my-0">
                <span className="fw-bold">Ưu đãi cho học sinh, sinh viên từ 22 tuổi trở xuống: </span>
                {` Đồng giá ${formatVietNamCurrency(
                  fare?.u22 ?? 50000,
                )}/vé 2D cho tất cả các suất chiếu phim từ Thứ 2 đến Thứ 6 (chỉ áp dụng cho hình thức mua vé trực tiếp tại quầy, mỗi thẻ được mua 1 vé/ngày - vui lòng xuất trình thẻ U22 và thẻ HSSV khi mua vé).`}
              </li>
              <li className="text-body my-0">
                {
                  'Khán giả nghiêm túc thực hiện xem phim đúng độ tuổi theo phân loại phim: P, K, T13, T16, T18, C (Trường hợp vi phạm sẽ xử phạt theo Quy định tại Nghị định 128/2022/NĐ-CP ngày 30/12/2022).'
                }
              </li>
              <li className="text-body my-0">
                {
                  'Không bán vé cho trẻ em dưới 13 tuổi đối với các suất chiếu phim kết thúc sau 22:00 và không bán vé cho trẻ em dưới 16 tuổi đối với các suất chiếu phim kết thúc sau 23h00.'
                }
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <NoDataCard text="Rạp chưa cập nhật hoặc không có bảng giá vé!" />
      )}
    </>
  );
}

const DateSection = (props) => {
  const fare = props.fare;

  return (
    <>
      <p className="text-body my-0">
        <span className="fw-bold">* Ngày thường: </span>
        {fare?.normalDay
          ?.split(',')
          .map((day) => DayOfWeek[day.trim()])
          .join(', ')}
      </p>
      <p className="text-body my-0">
        <span className="fw-bold">* Ngày cuối tuần: </span>
        {fare?.weekend
          ?.split(',')
          .map((day) => DayOfWeek[day.trim()])
          .join(', ')}
      </p>
      <p className="text-body my-0">
        <span className="fw-bold">* Ngày lễ: </span>
        {fare?.specialDay?.split(',').join(', ')}
      </p>
    </>
  );
};
