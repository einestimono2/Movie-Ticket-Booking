import { Button, DatePicker, Form, Image, Input, InputNumber, Modal, Select, Table, Upload } from 'antd';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import React, { useEffect, useState } from 'react';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import apiCaller from '../../apis/apiCaller';
import ModalDelete from '../../components/ModalDelete';
import { promotionApi } from '../../apis/manager/promotionApi';
import { uploadApi } from '../../apis/all/uploadApi';

export default function PromotionPage() {
  const [data, setData] = useState([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [height, setHeight] = useState(0);
  const [rowSelected, setRowSelected] = useState();
  const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingTable, setLoadingTable] = useState(false);
  const [images, setImages] = useState();
  const [fileList, setFileList] = useState([]);
  const [isOpen, setIsOpen] = useState({ open: false, type: '' });
  const [form] = Form.useForm();
  const [types, setTypes] = useState('Amount');
  const { RangePicker } = DatePicker;
  const errorHandler = (error) => {
    setLoading(false);
    toast.error(error.message, { autoClose: 3000, theme: 'colored' });
  };
  const deletePromotion = async () => {
    setDeleteLoading(true);
    const response = await apiCaller({
      request: promotionApi.deletePromotion(rowSelected),
      errorHandler,
    });
    if (response) {
      setIsModalOpenDelete(false);
      toast.success('Xóa mã giảm giá thành công!');
      setDeleteLoading(false);
      getListProduct();
    }
  };
  const onChange = (info) => {
    setTypes(info);
  };
  const onFinish = async (values) => {
    const body = {
      code: values.code,
      title: values.title,
      content: values.content,
      startTime: dayjs(values.time[0]).toDate(),
      endTime: dayjs(values.time[1]).toDate(),
      thumbnail: images,
      value: Number(values.price),
      type: types,
    };
    try {
      setLoading(true);
      const response = await apiCaller({
        request: promotionApi.addPromotion(body),
        errorHandler,
      });
      if (response) {
        setIsOpen({ open: false, type: '' });
        toast.success('Thêm mã giảm giá thành công!');
        form.resetFields();
        setFileList([]);
        setLoading(false);
        getListProduct();
      }
    } catch (error) {
      setLoading(false);
    }
  };
  const getListProduct = async () => {
    setLoadingTable(true);
    const response = await apiCaller({
      request: promotionApi.listPromotion(),
      errorHandler,
    });
    if (response) {
      setLoadingTable(false);
      setData(response.data);
    }
  };
  const getDetailPromotion = async () => {
    const response = await apiCaller({
      request: promotionApi.detailPromotion(rowSelected),
      errorHandler,
    });
    if (response) {
      form.setFieldsValue({ ...response.data, price: Number(response.data.value) });
    }
  };
  const handleUploadFile = async () => {
    const image = new FormData();
    image.append('file', fileList[0].originFileObj);
    const response = await apiCaller({
      request: uploadApi.uploadFile(image),
      errorHandler,
    });
    if (response) {
      setImages(response.data.path);
    }
  };
  const dummyRequest = ({ onSuccess }) => {
    setTimeout(() => {
      onSuccess('ok');
      if (fileList.length) {
        handleUploadFile();
      }
    }, 0);
  };
  const checkFile = (file) => {
    if (file && file.name) {
      const isImage = /\.(jpg|jpeg|png)$/.test(file.name.toLowerCase());
      if (!isImage) {
        toast.error('Chỉ được tải lên các tệp tin có đuôi là .jpg, .jpeg hoặc .png!');
      }

      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        toast.error('Kích thước tệp tin phải nhỏ hơn 2MB!');
      }

      return isImage && isLt2M;
    }

    toast.error('Tệp tin không hợp lệ!');
    return false;
  };
  const handleChange = ({ fileList: newFileList }) => {
    if (newFileList.every((file) => checkFile(file))) {
      setFileList(newFileList);
    }
  };
  const columns = [
    {
      title: 'STT',
      dataIndex: 'key',
    },
    {
      title: 'Ảnh',
      dataIndex: 'thumbnail',
    },
    {
      title: 'Tên',
      dataIndex: 'title',
    },
    {
      title: 'Thời gian',
      children: [
        {
          title: 'Bắt đầu',
          dataIndex: 'startTime',
        },
        {
          title: 'Kết thúc',
          dataIndex: 'endTime',
        },
      ],
    },
    {
      title: 'Giá trị',
      dataIndex: 'value',
      render: (text) =>
        text.type === 'Amount' ? (
          <div>{Number(text.value).toLocaleString('vi-VN')} đ</div>
        ) : (
          <div>{Number(text.value)} %</div>
        ),
    },
    {
      title: 'Thao tác',
      dataIndex: 'key',
      render: (text) => {
        return (
          <div>
            <DeleteOutlined
              style={{ color: 'red', fontSize: '30px', cursor: 'pointer' }}
              onClick={() => setIsModalOpenDelete(true)}
            />
            <EditOutlined
              style={{ color: 'orange', fontSize: '30px', cursor: 'pointer' }}
              onClick={() => setIsOpen({ open: true, type: 'edit' })}
            />
          </div>
        );
      },
    },
  ];
  const dataTable = data.map((val, index) => {
    return {
      _id: val._id,
      startTime: dayjs(val.startTime).format(' HH:mm, DD/MM/YYYY'),
      endTime: dayjs(val.endTime).format(' HH:mm, DD/MM/YYYY'),
      key: index + 1,
      title: val.title,
      value: { value: val.value, type: val.type },
      thumbnail: <Image height={50} src={val.thumbnail} preview={false} alt="" />,
    };
  });
  useEffect(() => {
    getListProduct();
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
  const options = [
    {
      value: 'Amount',
      label: 'đ',
    },
    {
      value: 'Percentage',
      label: '%',
    },
  ];
  useEffect(() => {
    if (isOpen.type === 'edit') {
      getDetailPromotion();
    }
  }, [isOpen]);
  return (
    <div>
      <div className="flex justify-between overflow-y-auto">
        <p className="text-3xl font-bold mt-0">Quản lý mã giảm giá</p>
        <Button onClick={() => setIsOpen({ open: true, type: 'create' })}>Thêm mã giảm giá</Button>
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
      <Modal footer={null} onCancel={() => setIsOpen({ open: false, type: '' })} closeIcon={false} open={isOpen.open}>
        <Form form={form} labelCol={{ span: 5 }} onFinish={onFinish} labelAlign="left">
          {isOpen.type === 'create' ? (
            <p className="h- text-3xl font-bold mt-0"> Tạo mã giảm giá</p>
          ) : (
            <p className="h- text-3xl font-bold mt-0"> Sửa giảm giá</p>
          )}
          <Form.Item label="Ảnh" name="thumbnail" rules={[{ required: true, message: 'Hãy chọn ảnh!' }]}>
            <Upload
              customRequest={dummyRequest}
              listType="picture-card"
              beforeUpload={checkFile}
              fileList={fileList}
              onChange={handleChange}
              onPreview={false}
            >
              {fileList?.length === 1 ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>
          <Form.Item name="code" label="Code" rules={[{ required: true, message: 'Vui lòng nhập code!' }]}>
            <Input placeholder="Code" />
          </Form.Item>
          <Form.Item name="title" label="Mã giảm giá" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}>
            <Input placeholder="Mã giảm giá" />
          </Form.Item>
          <Form.Item name="content" label="Nội dung" rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }]}>
            <Input placeholder="Nội dung" />
          </Form.Item>
          <Form.Item
            name="time"
            label="Thời gian"
            rules={[
              {
                required: true,
                message: 'Please select time!',
              },
            ]}
          >
            <RangePicker showTime format="YYYY-MM-DD HH:mm:ss" />
          </Form.Item>
          <Form.Item name="price" label="Giá trị" rules={[{ required: true, message: 'Vui lòng nhập giá trị!' }]}>
            <InputNumber
              addonAfter={<Select options={options} onChange={onChange} value={types} />}
              placeholder="Giá trị"
              controls={false}
            />
          </Form.Item>
          <Form.Item className="text-center mb-0">
            <Button loading={loading} type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <ModalDelete
        title="Xóa mã giảm giá"
        open={isModalOpenDelete}
        onCancel={() => setIsModalOpenDelete(false)}
        okButtonProps={{ loading: deleteLoading }}
        onOk={deletePromotion}
      >
        <div>Bạn có chắc xóa mã giảm giá này không?</div>
      </ModalDelete>
    </div>
  );
}
