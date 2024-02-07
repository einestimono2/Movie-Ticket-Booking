import { Avatar, Form, Image, Input, InputNumber, Modal, Table, Upload } from 'antd';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import React, { useEffect, useState } from 'react';
import { DeleteOutlined, EditOutlined, EyeInvisibleOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import apiCaller from '../../apis/apiCaller';
import ModalDelete from '../../components/ModalDelete';
import { reviewApi } from '../../apis/manager/reviewApi';

export default function ReviewPage() {
  const [data, setData] = useState([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [height, setHeight] = useState(0);
  const [rowSelected, setRowSelected] = useState();
  const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);
  const [loadingTable, setLoadingTable] = useState(false);
  const errorHandler = (error) => {
    toast.error(error.message, { autoClose: 3000, theme: 'colored' });
  };
  const deleteReview = async () => {
    setDeleteLoading(true);
    const response = await apiCaller({
      request: reviewApi.deleteReview(rowSelected),
      errorHandler,
    });
    if (response) {
      setIsModalOpenDelete(false);
      toast.success('Xóa đánh giá thành công!');
      setDeleteLoading(false);
      getListReview();
    }
  };
  const getListReview = async () => {
    const theaterId = JSON.parse(localStorage.getItem('admin_user'));
    setLoadingTable(true);
    const response = await apiCaller({
      request: reviewApi.listReview(theaterId._id),
      errorHandler,
    });
    if (response) {
      setLoadingTable(false);
      setData(response.data);
    }
  };
  const handleActiveReview = async (id) => {
    setLoadingTable(true);
    const response = await apiCaller({
      request: reviewApi.activeReview(id),
      errorHandler,
    });
    if (response) {
      getListReview();
    }
  };
  const columns = [
    {
      title: 'STT',
      dataIndex: 'key',
    },
    {
      title: 'Người dùng',
      dataIndex: 'user',
      render: (text) => (
        <div>
          <Avatar className="mr-3" size="large" src={text?.avatar} />
          {text?.name}
        </div>
      ),
    },
    {
      title: 'Nội dung',
      dataIndex: 'message',
    },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
    },
    {
      title: 'Thao tác',
      dataIndex: 'key',
      align: 'center',
      render: (text) => {
        return (
          <div className="flex justify-around">
            <DeleteOutlined
              style={{ color: 'red', fontSize: '30px', cursor: 'pointer' }}
              onClick={() => setIsModalOpenDelete(true)}
            />
            {text.active ? (
              <EyeInvisibleOutlined
                style={{ fontSize: '30px', cursor: 'pointer' }}
                onClick={() => handleActiveReview(text.id)}
              />
            ) : (
              <EyeOutlined
                style={{ fontSize: '30px', cursor: 'pointer' }}
                onClick={() => handleActiveReview(text.id)}
              />
            )}
          </div>
        );
      },
    },
  ];
  const dataTable = data.map((val, index) => {
    return {
      _id: val._id,
      key: { id: val._id, active: val.isActive },
      user: val?.user,
      rating: val.rating,
      message: val.message,
    };
  });
  useEffect(() => {
    getListReview();
  }, []);
  useEffect(() => {
    const calculateHeight = () => {
      const windowHeight = window.innerHeight;

      const heightPercentage = 0.68;

      const calculatedHeight = windowHeight * heightPercentage;

      setHeight(calculatedHeight);
    };

    calculateHeight();

    window.addEventListener('resize', calculateHeight);

    return () => {
      window.removeEventListener('resize', calculateHeight);
    };
  }, []);
  console.log(data);
  return (
    <div>
      <div className="flex justify-between">
        <p className="text-3xl font-bold mt-0">Quản lý đánh giá</p>
      </div>
      <Table
        scroll={{ y: height }}
        pagination={false}
        bordered
        loading={loadingTable}
        columns={columns}
        dataSource={dataTable}
        onRow={(record, rowIndex) => {
          return {
            onClick: (event) => {
              setRowSelected(record._id);
            },
          };
        }}
      />
      <ToastContainer />
      <ModalDelete
        title="Xóa đánh giá"
        open={isModalOpenDelete}
        onCancel={() => setIsModalOpenDelete(false)}
        okButtonProps={{ loading: deleteLoading }}
        onOk={deleteReview}
      >
        <div>Bạn có chắc xóa đánh giá này không?</div>
      </ModalDelete>
    </div>
  );
}
