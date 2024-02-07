import { Button, Form, Image, Input, InputNumber, Modal, Table, Upload } from 'antd';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import React, { useEffect, useState } from 'react';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import apiCaller from '../../apis/apiCaller';
import { productApi } from '../../apis/manager/productApi';
import { uploadApi } from '../../apis/all/uploadApi';
import ModalDelete from '../../components/ModalDelete';

export default function ProductPage() {
  const [data, setData] = useState([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [height, setHeight] = useState(0);
  const [rowSelected, setRowSelected] = useState();
  const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingTable, setLoadingTable] = useState(false);
  const [images, setImages] = useState();
  const [fileList, setFileList] = useState([]);
  const [isOpen, setIsOpen] = useState({
    open: false,
    type: '',
  });
  const [form] = Form.useForm();
  const errorHandler = (error) => {
    setLoading(false);
    toast.error(error.message, { autoClose: 3000, theme: 'colored' });
  };
  const deleteMovie = async () => {
    setDeleteLoading(true);
    const response = await apiCaller({
      request: productApi.deleteProduct(rowSelected),
      errorHandler,
    });
    if (response) {
      setIsModalOpenDelete(false);
      toast.success('Xóa sản phẩm thành công!');
      setDeleteLoading(false);
      getListProduct();
    }
  };
  const detailProduct = async () => {
    const response = await apiCaller({
      request: productApi.detailProduct(rowSelected),
      errorHandler,
    });
    if (response) {
      form.setFieldsValue({
        name: response.data.name,
        price: response.data.price,
        description_en: response.data.description.en,
        description_vi: response.data.description.vi,
      });
      setImages(response.data.image);
      setFileList([response.data.image]);
    }
  };
  const onFinish = async (values) => {
    setLoading(true);
    const body = {
      name: values.name,
      price: Number(values.price),
      image: images,
      description: {
        en: values.description_en,
        vi: values.description_vi,
      },
    };
    if (isOpen.type === 'update') {
      const response = await apiCaller({
        request: productApi.updateProduct(rowSelected, body),
        errorHandler,
      });
      if (response) {
        setIsOpen({ open: false, type: '' });
        toast.success('Cập nhật sản phẩm thành công!');
        form.resetFields();
        setFileList([]);
        setLoading(false);
        getListProduct();
      }
    } else {
      const response = await apiCaller({
        request: productApi.addProduct(body),
        errorHandler,
      });
      if (response) {
        setIsOpen({ open: false, type: '' });
        toast.success('Thêm sản phẩm thành công!');
        form.resetFields();
        setFileList([]);
        setLoading(false);
        getListProduct();
      }
    }
  };
  const getListProduct = async () => {
    setLoadingTable(true);
    const response = await apiCaller({
      request: productApi.myTheater(),
      errorHandler,
    });
    if (response) {
      setLoadingTable(false);
      setData(response.data);
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
      dataIndex: 'image',
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
    },
    {
      title: 'Mô tả',
      children: [
        {
          title: 'Tiếng anh',
          dataIndex: 'en',
        },
        {
          title: 'Tiếng việt',
          dataIndex: 'vi',
        },
      ],
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      render: (text) => text.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }),
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
      key: index + 1,
      name: val.name,
      en: val.description.en,
      vi: val.description.vi,
      price: val.price,
      image: <Image height={50} src={val.image} preview={false} alt="" />,
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
  useEffect(() => {
    if (isOpen.type === 'edit') {
      detailProduct();
    }
  }, [isOpen]);
  return (
    <div>
      <div className="flex justify-between">
        <p className="text-3xl font-bold mt-0">Quản lý sản phẩm</p>
        <Button onClick={() => setIsOpen({ open: true, type: 'create' })}>Thêm sản phẩm</Button>
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
      <Modal footer={null} onCancel={() => setIsOpen({ open: false, title: '' })} closeIcon={false} open={isOpen.open}>
        <Form form={form} labelCol={{ span: 5 }} onFinish={onFinish} labelAlign="left">
          {isOpen.type === 'create' ? (
            <p className="text-3xl font-bold mt-0"> Tạo sản phẩm</p>
          ) : (
            <p className="text-3xl font-bold mt-0"> Cập nhật sản phẩm</p>
          )}
          <Form.Item
            name="name"
            labelCol={{ span: 6 }}
            label="Tên sản phẩm"
            rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm!' }]}
          >
            <Input placeholder="Tên sản phẩm" />
          </Form.Item>
          <Form.Item
            labelCol={{ span: 6 }}
            name="description_en"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
          >
            <Input placeholder="Mô tả bằng tiếng anh" />
          </Form.Item>
          <Form.Item
            labelCol={{ span: 6 }}
            name="description_vi"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
          >
            <Input placeholder="Mô tả bằng tiếng việt" />
          </Form.Item>
          <div className="grid grid-cols-5 gap-5">
            <Form.Item
              className="col-span-3"
              name="price"
              labelCol={{ span: 10 }}
              label="Giá (VND)"
              rules={[
                { required: true, message: 'Vui lòng nhập giá!' },
                {
                  pattern: /^[0-9]+$/,
                  message: 'Vui lòng nhập số!',
                },
              ]}
            >
              <Input placeholder="Giá" />
            </Form.Item>
            <Form.Item
              className="col-span-2"
              label="Ảnh"
              labelCol={{ span: 10 }}
              name="image"
              rules={[{ required: true, message: 'Hãy chọn ảnh!' }]}
            >
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
          </div>
          <Form.Item className="text-center mb-0">
            <Button loading={loading} type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <ModalDelete
        title="Xóa sản phẩm"
        open={isModalOpenDelete}
        onCancel={() => setIsModalOpenDelete(false)}
        okButtonProps={{ loading: deleteLoading }}
        onOk={deleteMovie}
      >
        <div>Bạn có chắc xóa sản phẩm này không?</div>
      </ModalDelete>
    </div>
  );
}
