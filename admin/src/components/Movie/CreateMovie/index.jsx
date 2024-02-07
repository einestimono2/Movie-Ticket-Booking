/* eslint-disable react/no-unstable-nested-components */
import { Avatar, Button, Checkbox, Divider, Form, Input, Modal, Select, Space, Upload } from 'antd';
import { ToastContainer, toast } from 'react-toastify';
import React, { useEffect, useRef, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import apiCaller from '../../../apis/apiCaller';
import 'react-toastify/dist/ReactToastify.css';
import { uploadApi } from '../../../apis/all/uploadApi';
import { genreApi } from '../../../apis/all/genreApi';
import { getEmbedYoutubeURL } from '../../../utils/formatYt';
import { personApi } from '../../../apis/admin/personApi';
import { mapAge } from '../../../constants/mapData';
import { movieApi } from '../../../apis/admin/movieApi';

export default function CreateMovie(props) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imagePoster, setImagePoster] = useState('');
  const [fileList, setFileList] = useState([]);
  const [trailer, setTrailer] = useState('');
  const [listGenres, setListGenres] = useState([]);
  const [listPerson, setListPerson] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [name, setName] = useState('');
  const dispatch = useDispatch();
  const inputRef = useRef(null);
  const onNameChange = (event) => {
    setName(event.target.value);
  };
  const addItem = (e) => {
    e.preventDefault();
    setListPerson([...listPerson, { _id: name, fullName: name }]);
    setName('');
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };
  const plainOptions = [
    {
      value: '2D',
      label: '2D',
    },
    {
      value: '3D',
      label: '3D',
    },
  ];
  const options = [
    {
      value: 'Subtitles',
      label: 'Phụ đề',
    },
    {
      value: 'Dubbing',
      label: 'Thuyết minh',
    },
  ];
  const genres = listGenres.map((item) => {
    return {
      value: item._id,
      label: `${item.name.vi} (${item.name.en})`,
    };
  });
  const persons = listPerson?.map((opt) => {
    return {
      value: opt._id,
      label: opt.fullName,
      emoji: opt.avatar,
    };
  });

  const filterOption = (input, option) => option?.label?.toLowerCase().includes(input.toLowerCase());
  const item = [
    {
      value: 'P',
      label: 'Mọi lứa tuổi',
    },
    {
      value: 'T18',
      label: 'Trên 18 tuổi',
    },
    {
      value: 'T16',
      label: 'Trên 16 tuổi',
    },
    {
      value: 'T13',
      label: 'Trên 13 tuổi',
    },
    {
      value: 'K',
      label: 'Dưới 13 tuổi',
    },
    {
      value: 'C',
      label: 'Cấm chiếu',
    },
  ];
  const errorHandler = (error) => {
    console.log('Fail: ', error);
    toast.error(error.message, { autoClose: 3000, theme: 'colored' });
  };
  const handleGetListGenres = async () => {
    const response = await apiCaller({
      request: genreApi.listGenre(),
      errorHandler,
    });
    if (response) {
      setListGenres(response.data);
    }
  };
  const handleGetListPerson = async () => {
    const response = await apiCaller({
      request: personApi.listPerson(),
      errorHandler,
    });
    if (response) {
      setListPerson(response.data);
    }
  };
  const handleCancel = () => setPreviewOpen(false);
  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
    setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
  };
  const handleUploadFile = async () => {
    const data = new FormData();
    data.append('file', fileList[0].originFileObj);
    const response = await apiCaller({
      request: uploadApi.uploadFile(data),
      errorHandler,
    });
    if (response) {
      setImagePoster(response.data.path);
    }
  };
  const handleChange = ({ fileList: newFileList }) => {
    if (newFileList.every((file) => checkFile(file))) {
      setFileList(newFileList);
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
  useEffect(() => {
    handleGetListGenres();
    handleGetListPerson();
  }, []);
  const addPerson = (menu) => (
    <>
      {menu}
      <Divider
        style={{
          margin: '8px 0',
        }}
      />
      <Space
        style={{
          padding: '0 8px 4px',
        }}
        className="flex justify-between"
      >
        <Input
          placeholder="Please enter item"
          ref={inputRef}
          value={name}
          onChange={onNameChange}
          onKeyDown={(e) => e.stopPropagation()}
        />
        <Button type="text" icon={<PlusOutlined />} onClick={addItem}>
          Thêm
        </Button>
      </Space>
    </>
  );
  const access_token = localStorage.getItem('admin_access_token');
  const onFinish = async (values) => {
    setLoading(true);
    const data = {
      ageType: values.ageType,
      actors: values.actors,
      directors: values.directors,
      formats: values.formats,
      genres: values.genres,
      languages: values.languages,
      originalTitle: values.originalTitle,
      title: values.title,
      trailer: values.trailer,
      poster: imagePoster,
      overview: {
        en: values.overview_en,
        vi: values.overview_vi,
      },
    };
    const response = await apiCaller({
      request: movieApi.createMovie(data, access_token),
      errorHandler,
    });
    if (response) {
      form.resetFields();
      setLoading(false);
      props.handleFinish();
    }
  };
  return (
    <div>
      <div className="text-3xl text-center font-bold uppercase mb-6">{props.title}</div>
      <Form form={form} onFinish={onFinish} labelCol={{ span: 3 }} labelAlign="left">
        <div className="grid grid-cols-3 gap-5">
          <Form.Item
            rules={[{ required: true, message: 'Vui lý thêm ảnh bìa!' }]}
            labelCol={{ span: 9 }}
            label="Ảnh bìa"
            name="poster"
          >
            <Upload
              customRequest={dummyRequest}
              listType="picture-card"
              beforeUpload={checkFile}
              fileList={fileList}
              onPreview={handlePreview}
              onChange={handleChange}
            >
              {fileList?.length === 1 ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>
          <Form.Item
            rules={[{ required: true, message: 'Vui lý thêm trailer!' }]}
            labelCol={{ span: 10 }}
            label="Trailer (link youtube)"
            name="trailer"
          >
            <Input size="large" onChange={(e) => setTrailer(e.target.value)} value={trailer} />
          </Form.Item>
          <div className="text-right">
            {trailer && (
              <iframe
                title="trailer"
                style={{ width: '65%', height: '100px', borderRadius: '6px' }}
                src={getEmbedYoutubeURL(trailer)}
              />
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-5">
          <Form.Item
            rules={[{ required: true, message: 'Vui lý thêm tên phim!' }]}
            labelCol={{ span: 6 }}
            label="Tên phim"
            name="title"
          >
            <Input size="large" />
          </Form.Item>
          <Form.Item
            rules={[{ required: true, message: 'Vui lý thêm tên phim gốc!' }]}
            labelCol={{ span: 6 }}
            label="Tên phim (gốc)"
            name="originalTitle"
          >
            <Input size="large" />
          </Form.Item>
        </div>
        <div className="grid grid-cols-2 gap-5">
          <Form.Item
            rules={[{ required: true, message: 'Vui lý thêm tổng quan!' }]}
            labelCol={{ span: 6 }}
            label="Tổng quan (en)"
            name="overview_en"
          >
            <Input.TextArea autoSize={{ maxRows: 3, minRows: 3 }} />
          </Form.Item>
          <Form.Item
            rules={[{ required: true, message: 'Vui lý thêm tổng quan!' }]}
            labelCol={{ span: 6 }}
            label="Tổng quan (vi)"
            name="overview_vi"
          >
            <Input.TextArea autoSize={{ maxRows: 3, minRows: 3 }} />
          </Form.Item>
        </div>
        <div className="grid grid-cols-2 gap-5">
          <Form.Item labelCol={{ span: 6 }} label="Định dạng" name="formats">
            <Checkbox.Group options={plainOptions} />
          </Form.Item>
          <Form.Item
            rules={[{ required: true, message: 'Vui lý thêm ngôn ngữ!' }]}
            labelCol={{ span: 6 }}
            label="Ngôn ngữ"
            name="languages"
          >
            <Checkbox.Group options={options} />
          </Form.Item>
        </div>
        <div className="grid grid-cols-2 gap-5">
          <Form.Item
            rules={[{ required: true, message: 'Vui lý thêm lứa tuổi!' }]}
            labelCol={{ span: 6 }}
            label="Lứa tuổi"
            name="ageType"
          >
            <Select size="large" allowClear placeholder="Please select" options={item} />
          </Form.Item>
          <Form.Item
            rules={[{ required: true, message: 'Vui lý thêm thể loại!' }]}
            labelCol={{ span: 6 }}
            label="Thể loại"
            name="genres"
          >
            <Select size="large" mode="multiple" allowClear placeholder="Please select" options={genres} />
          </Form.Item>
        </div>
        <div className="grid grid-cols-2 gap-5">
          <Form.Item
            rules={[{ required: true, message: 'Vui lý thêm diễn viên!' }]}
            labelCol={{ span: 6 }}
            label="Diễn viên"
            name="actors"
          >
            <Select
              listItemHeight={30}
              size="large"
              mode="multiple"
              allowClear
              placeholder="Please select"
              dropdownRender={addPerson}
              options={persons}
              optionLabelProp="label"
              filterOption={filterOption}
              optionRender={(option) => (
                <Space>
                  <span role="img" aria-label={option.data.label}>
                    <Avatar size={25} src={option.data.emoji} className="mr-2" />
                    {option.data.label}
                  </span>
                </Space>
              )}
            />
          </Form.Item>
          <Form.Item
            rules={[{ required: true, message: 'Vui lý thêm tác giả!' }]}
            labelCol={{ span: 6 }}
            label="Tác giả"
            name="directors"
          >
            <Select
              size="large"
              mode="multiple"
              allowClear
              placeholder="Please select"
              dropdownRender={addPerson}
              options={persons}
              optionLabelProp="label"
              filterOption={filterOption}
              optionRender={(option) => (
                <Space>
                  <span role="img" aria-label={option.data.label}>
                    <Avatar size={25} src={option.data.emoji} className="mr-2" />
                    {option.data.label}
                  </span>
                </Space>
              )}
            />
          </Form.Item>
        </div>
        <Form.Item className="text-center">
          <Button loading={loading} size="large" type="primary" htmlType="submit">
            Tạo
          </Button>
        </Form.Item>
      </Form>
      <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={handleCancel}>
        <img
          alt="example"
          style={{
            width: '100%',
          }}
          src={previewImage}
        />
      </Modal>
    </div>
  );
}
