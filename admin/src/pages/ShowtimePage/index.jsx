import {
  Button,
  Calendar,
  ConfigProvider,
  DatePicker,
  Empty,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Select,
  Skeleton,
  Table,
  Timeline,
  Upload,
} from 'antd';
import './style.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import React, { useEffect, useState } from 'react';
import { DeleteOutlined, EditOutlined, LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import apiCaller from '../../apis/apiCaller';
import ModalDelete from '../../components/ModalDelete';
import { showtimeApi } from '../../apis/manager/showtimeApi';
import { roomApi } from '../../apis/manager/roomApi';
import { movieApi } from '../../apis/admin/movieApi';
import { mapLanguage, mapType } from '../../constants/mapData';

export default function ShowTimePage() {
  const [data, setData] = useState([]);
  const [currentDate, setCurrentDate] = useState(dayjs(new Date()).format('YYYY-MM-DD'));
  const [datas, setDatas] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [filterRooms, setFilterRooms] = useState([]);
  const [filterLanguages, setFilterLanguages] = useState();
  const [movies, setMovies] = useState([]);
  const [typeMovie, setTypeMovie] = useState([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [height, setHeight] = useState(0);
  const [rowSelected, setRowSelected] = useState();
  const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingTable, setLoadingTable] = useState(false);
  const [isOpen, setIsOpen] = useState({ open: false, type: '' });
  const [form] = Form.useForm();
  const { RangePicker } = DatePicker;
  const errorHandler = (error) => {
    setLoading(false);
    toast.error(error.message, { autoClose: 3000, theme: 'colored' });
  };
  const getListRooms = async () => {
    const response = await apiCaller({
      request: roomApi.listRoom(),
      errorHandler,
    });
    if (response) {
      setRooms(response.data);
      setFilterRooms(response.data);
    }
  };
  const getListMovies = async () => {
    const response = await apiCaller({
      request: movieApi.listMovie(),
      errorHandler,
    });
    if (response) {
      setMovies(response.data);
    }
  };
  const deleteShowtime = async () => {
    setDeleteLoading(true);
    const response = await apiCaller({
      request: showtimeApi.deleteShowtime(rowSelected),
      errorHandler,
    });
    if (response) {
      setIsModalOpenDelete(false);
      toast.success('Xóa lịch chiếu thành công!');
      setDeleteLoading(false);
      getListShowTime();
    }
  };
  const onFinish = async (values) => {
    setLoading(true);
    const body = {
      movie: movies[values.movie]._id,
      room: values.room,
      type: values.type,
      language: values.language,
      startTime: values.time[0],
    };
    const response = await apiCaller({
      request: showtimeApi.createShowtime(body),
      errorHandler,
    });
    if (response) {
      setIsOpen({ open: false, type: '' });
      toast.success('Thêm lịch chiếu thành công!');
      form.resetFields();
      setLoading(false);
      getListShowTime();
    }
  };
  const detailShowtime = async () => {
    const response = await apiCaller({
      request: showtimeApi.detailShowtime(rowSelected),
      errorHandler,
    });
    if (response) {
      form.setFieldsValue({
        movie: response.data.movie._id,
        room: response.data.room._id,
        type: response.data.type,
        language: response.data.language,
        time: [response.data.startTime, response.data.endTime],
      });
    }
  };
  const getListShowTime = async () => {
    setLoadingTable(true);
    const response = await apiCaller({
      request: showtimeApi.listShowtime(),
      errorHandler,
    });
    if (response) {
      setLoadingTable(false);
      setData(response.data);
    }
  };
  const columns = [
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
      title: 'Tên phim',
      dataIndex: 'movie',
    },
    {
      title: 'Loại',
      dataIndex: 'type',
    },
    {
      title: 'Ngôn ngữ',
      dataIndex: 'language',
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
  useEffect(() => {
    getListShowTime();
    getListMovies();
    getListRooms();
  }, []);
  useEffect(() => {
    const calculateHeight = () => {
      const windowHeight = window.innerHeight;

      const heightPercentage = 0.83;

      const calculatedHeight = windowHeight * heightPercentage;

      setHeight(calculatedHeight);
    };

    calculateHeight();

    window.addEventListener('resize', calculateHeight);

    return () => {
      window.removeEventListener('resize', calculateHeight);
    };
  }, []);
  const optionMovie = movies.map((val, index) => {
    return {
      label: val.title,
      value: index,
    };
  });
  const optionRoom = filterRooms.map((val) => {
    return {
      label: val.name,
      value: val._id,
    };
  });
  const optionType = [
    {
      label: 'Bình thường',
      value: 'Normal',
    },
    {
      label: 'Chiếu sớm',
      value: 'Sneakshow',
    },
  ];
  const languages = [
    {
      label: 'Phụ đề',
      value: 'Subtitles',
    },
    {
      label: 'Thuyết minh',
      value: 'Dubbing',
    },
  ];
  const optionLanguage = filterLanguages ? languages.filter((val) => val.value === filterLanguages?.[0]) : languages;
  const handleMovieChange = (value) => {
    setFilterLanguages(movies[value].languages);
    setTypeMovie(movies[value].formats);
    form.setFieldsValue({ room: undefined });
  };
  useEffect(() => {
    if (typeMovie) {
      const newRooms = rooms.filter((val) => val.type === typeMovie[0]);
      setFilterRooms(newRooms);
    }
  }, [typeMovie]);

  const items = datas?.map((val) => {
    return {
      label: val.room.name,
      children: (
        <Table
          scroll={{ y: 470 }}
          pagination={false}
          bordered
          columns={columns}
          dataSource={val.showtimes.map((value, index) => {
            return {
              _id: value._id,
              key: index + 1,
              startTime: dayjs(value.startTime).format('HH:mm'),
              endTime: dayjs(value.endTime).format('HH:mm'),
              movie: value?.movie?.title,
              type: mapType[value.type],
              language: mapLanguage[value.language],
            };
          })}
          onRow={(record, rowIndex) => {
            return {
              onClick: (event) => {
                setRowSelected(record._id);
              },
            };
          }}
        />
      ),
    };
  });
  useEffect(() => {
    if (data?.length > 0) {
      const newDatas = data?.filter((val) => val.date === currentDate);
      setDatas(newDatas?.[0]?.rooms);
    }
  }, [currentDate, data]);
  const onChange = (value) => {
    setCurrentDate(dayjs(value).format('YYYY-MM-DD'));
  };
  useEffect(() => {
    if (isOpen.type === 'edit') {
      detailShowtime();
    }
  }, [isOpen]);
  return (
    <div>
      <div className="flex justify-between cur">
        <p className="text-3xl font-bold mt-0">Quản lý lịch chiếu</p>
        <Button onClick={() => setIsOpen({ open: true, type: 'create' })}>Tạo lịch chiếu</Button>
      </div>
      <div className="grid grid-cols-6">
        <Calendar onChange={onChange} fullscreen={false} className="h-full col-span-2 pr-2" />
        {loadingTable ? (
          <Skeleton.Input className="col-span-4 pl-12 " active style={{ height: `${height}px` }} block />
        ) : datas?.length > 0 && !loadingTable ? (
          <div className="col-span-4 overflow-auto" style={{ height: `${height}px` }}>
            <Timeline mode="left" className="custom-timeline" items={items} />
          </div>
        ) : (
          <div className="col-span-4 flex justify-center items-center">
            <Empty />
          </div>
        )}
      </div>
      <ToastContainer />
      <Modal footer={null} onCancel={() => setIsOpen({ open: false, title: '' })} closeIcon={false} open={isOpen.open}>
        <Form form={form} labelCol={{ span: 5 }} onFinish={onFinish} labelAlign="left">
          <p className="text-3xl font-bold mt-0">Tạo lịch chiếu</p>
          <Form.Item name="movie" label="Tên phim" rules={[{ required: true, message: 'Vui lòng chọn phim !' }]}>
            <Select options={optionMovie} placeholder="Chọn phim" onChange={handleMovieChange} />
          </Form.Item>
          <Form.Item
            name="room"
            label="Phòng"
            rules={[
              { required: true, message: 'Vui lòng chọn phòng!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (typeMovie) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Vui lòng chọn tên phim trước khi chọn phòng!'));
                },
              }),
            ]}
          >
            <Select options={optionRoom} placeholder="Chọn phòng" />
          </Form.Item>
          <Form.Item name="time" label="Thời gian" rules={[{ required: true, message: 'Vui lòng nhập thời gian!' }]}>
            <RangePicker showTime />
          </Form.Item>
          <div className="grid grid-cols-2 gap-2">
            <Form.Item
              labelCol={{ span: 10 }}
              name="type"
              label="Loại"
              rules={[{ required: true, message: 'Vui loại chọn loại!' }]}
            >
              <Select options={optionType} placeholder="Chọn loại" />
            </Form.Item>
            <Form.Item
              labelCol={{ span: 10 }}
              name="language"
              label="Ngôn ngữ"
              rules={[{ required: true, message: 'Vui loại chọn ngôn ngữ!' }]}
            >
              <Select options={optionLanguage} placeholder="Chọn ngôn ngữ" />
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
        title="Xóa lịch chiếu"
        open={isModalOpenDelete}
        onCancel={() => setIsModalOpenDelete(false)}
        okButtonProps={{ loading: deleteLoading }}
        onOk={deleteShowtime}
      >
        <div>Bạn có chắc xóa lịch chiếu này không?</div>
      </ModalDelete>
    </div>
  );
}
