import { Button, Drawer, Modal, Table, Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import Search from 'antd/es/input/Search';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import 'react-toastify/dist/ReactToastify.css';
import apiCaller from '../../apis/apiCaller';
import { movieApi } from '../../apis/admin/movieApi';
import { mapAge } from '../../constants/mapData';
import { MOVIE_LIST_PAGE_SIZE } from '../../constants/pagination';
import ModalDelete from '../../components/ModalDelete';
import CreateMovie from '../../components/Movie/CreateMovie';

export default function Movie() {
  const [lists, setLists] = useState();
  const [height, setHeight] = useState(0);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowSelected, setRowSelected] = useState();
  const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState({
    open: false,
    type: '',
  });
  const [search, setSearch] = useState();
  const access_token = localStorage.getItem('admin_access_token');
  const errorHandler = (error) => {
    toast.error(error.message, { autoClose: 3000, theme: 'colored' });
  };
  const handleGetListMovie = async () => {
    const data = {
      keyword: search,
      sort: '-createdAt',
      limit: MOVIE_LIST_PAGE_SIZE,
      page: currentPage,
    };
    const response = await apiCaller({
      request: movieApi.listMovie(data, access_token),
      errorHandler,
    });
    if (response) {
      setLists(response.data);
      setLoading(false);
      setTotalCount(response.extra.totalCount);
    }
  };
  useEffect(() => {
    handleGetListMovie();
    setLoading(true);
  }, [search, currentPage]);
  const deleteMovie = async () => {
    setDeleteLoading(true);
    const response = await apiCaller({
      request: movieApi.deleteMovie(rowSelected, access_token),
      errorHandler,
    });
    if (response) {
      setIsModalOpenDelete(false);
      setDeleteLoading(false);
      handleGetListMovie();
    }
  };
  const handleFinish = () => {
    setIsModalOpen({
      open: false,
      type: '',
    });
    handleGetListMovie();
  };
  const handleCancelDelete = () => {
    setIsModalOpenDelete(false);
  };
  const handleCancel = () => {
    console.log('rrr');
    setIsModalOpen({
      open: false,
      type: '',
    });
  };
  const renderAction = () => {
    return (
      <div>
        <DeleteOutlined
          style={{ color: 'red', fontSize: '30px', cursor: 'pointer' }}
          onClick={() => setIsModalOpenDelete(true)}
        />
        <EditOutlined
          style={{ color: 'orange', fontSize: '30px', cursor: 'pointer' }}
          onClick={() => setIsModalOpen({ open: true, type: 'Thay đổi phim' })}
        />
      </div>
    );
  };
  const columns = [
    {
      title: 'Tên phim',
      dataIndex: 'title',
    },
    {
      title: 'Tên phim (gốc)',
      dataIndex: 'originalTitle',
    },
    {
      title: 'Tổng quan',
      children: [
        {
          title: 'Tiếng việt',
          dataIndex: 'overview',
          render: (text) => (
            <Tooltip title={text?.vi}>
              <div className="limit-line">{text?.vi}</div>
            </Tooltip>
          ),
        },

        {
          title: 'Tiếng anh',
          dataIndex: 'overview',
          render: (text) => (
            <Tooltip title={text?.en}>
              <div className="limit-line">{text?.en}</div>
            </Tooltip>
          ),
        },
      ],
    },
    {
      title: 'Định dạng',
      dataIndex: 'formats',
      render: (text) => text.map((val) => val).join(', '),
    },
    {
      title: 'Ngôn ngữ',
      dataIndex: 'languages',
    },
    {
      title: 'Độ tuổi',
      dataIndex: 'ageType',
      render: (text) => (
        <Tooltip title={mapAge[text]}>
          <div className="limit-line">{text}</div>
        </Tooltip>
      ),
    },
    {
      title: 'Thể loại',
      dataIndex: 'genres',
      render: (text) => (
        <Tooltip title={text.map((val) => `${val.name.vi} (${val.name.en})`).join(', ')}>
          <div className="limit-line">{text.map((val) => `${val.name.vi} (${val.name.en})`).join(', ')}</div>
        </Tooltip>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      render: renderAction,
    },
  ];
  useEffect(() => {
    const calculateHeight = () => {
      const windowHeight = window.innerHeight;

      const heightPercentage = 0.55;

      const calculatedHeight = windowHeight * heightPercentage;

      setHeight(calculatedHeight);
    };

    calculateHeight();

    window.addEventListener('resize', calculateHeight);

    return () => {
      window.removeEventListener('resize', calculateHeight);
    };
  }, []);
  const dataTable =
    lists?.length &&
    lists?.map((val) => {
      return {
        ...val,
      };
    });
  return (
    <div>
      <div className="text-3xl text-center font-bold uppercase mb-3">DANH SÁCH PHIM</div>
      <div className="flex justify-between mb-3">
        <Search
          enterButton="Search"
          size="large"
          allowClear
          className=" w-[45%]"
          onSearch={(e) => setSearch(e)}
          placeholder="Keyword"
        />
        <Button size="large" onClick={() => setIsModalOpen({ type: 'Tạo phim', open: true })}>
          Create Movie
        </Button>
      </div>
      <Table
        loading={loading}
        bordered
        scroll={{ y: height }}
        columns={columns}
        dataSource={dataTable}
        pagination={
          lists?.length &&
          totalCount > MOVIE_LIST_PAGE_SIZE && {
            pageSize: MOVIE_LIST_PAGE_SIZE,
            current: currentPage,
            total: totalCount,
            onChange: (page) => setCurrentPage(page),
          }
        }
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
        title="Xóa sản phẩm"
        open={isModalOpenDelete}
        onCancel={handleCancelDelete}
        okButtonProps={{ loading: deleteLoading }}
        onOk={deleteMovie}
      >
        <div>Bạn có chắc xóa sản phẩm này không?</div>
      </ModalDelete>
      <Drawer title={isModalOpen.type} open={isModalOpen.open} onClose={handleCancel} width={1200}>
        <CreateMovie handleFinish={handleFinish} />
      </Drawer>
    </div>
  );
}
