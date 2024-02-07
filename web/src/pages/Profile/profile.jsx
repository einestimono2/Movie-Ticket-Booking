import React, { useEffect, useState } from 'react';
import { Avatar, Layout, Menu, Upload, Spin } from 'antd';
import { UserOutlined, HeartOutlined, ShoppingOutlined, EllipsisOutlined, PlusOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';

import './profile.scss';
import apiCaller from '../../apis/apiCaller';
import { userApi } from '../../apis/userApi';
import { uploadApi } from '../../apis/uploadApi';
import ProfileInfo from './components/profile-info';
import ProfileBooking from './components/profile-booking';
import FullScreenLoading from '../../components/loading';
import ProfileChangePassword from './components/profile-change-password';
import ProfileFavorite from './components/profile-favorite';
import { setProfile } from '../../redux/reducer/userReducer';

const { Content, Sider } = Layout;

function ProfileUser() {
  const dispatch = useDispatch();
  const [selected, setSelected] = useState('0');

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [user, setUser] = useState();

  const errorHandler = (error) => {
    setLoading(false);
    setUploading(false);
    toast.error(error.message, { autoClose: 3000, theme: 'colored' });
  };

  const updateUser = (user, updateLocal = false) => {
    setUser(user);

    if (updateLocal) {
      localStorage.setItem('user', JSON.stringify(user));
      dispatch(setProfile(user));
    }

    setSelected('0');
  };

  const getProfileUser = async () => {
    setLoading(true);

    const response = await apiCaller({
      request: userApi.getProfile(),
      errorHandler,
    });

    if (response) {
      setUser(response.data);
      setLoading(false);
    }
  };

  useEffect(() => {
    getProfileUser();
  }, []);

  const items = [
    {
      key: '0',
      icon: <UserOutlined />,
      label: 'Thông tin cá nhân',
      content: <ProfileInfo user={user} onChangePage={(idx) => setSelected(`${idx}`)} onSuccess={updateUser} />,
    },
    {
      key: '1',
      icon: <ShoppingOutlined />,
      label: 'Lịch sử giao dịch',
      content: <ProfileBooking />,
    },
    {
      key: '2',
      icon: <HeartOutlined />,
      label: 'Yêu thích',
      content: <ProfileFavorite />,
    },
    {
      key: '3',
      icon: <EllipsisOutlined />,
      label: 'Đổi mật khẩu',
      content: <ProfileChangePassword onSuccess={updateUser} />,
    },
  ];

  const dummyRequest = ({ onSuccess }) => {
    setTimeout(() => {
      onSuccess('ok');
    }, 0);
  };

  const handleUploadFile = async (info) => {
    if (info?.file?.status === 'done') {
      setUploading(true);
      const data = new FormData();
      data.append('file', info.file.originFileObj);

      const response = await apiCaller({
        request: uploadApi.uploadFile(data),
        errorHandler,
      });

      if (response) {
        const _response = await apiCaller({
          request: userApi.updateAvatar({
            avatar: response.data.path,
          }),
          errorHandler,
        });

        if (_response) {
          setUser(_response.data);
          localStorage.setItem('user', JSON.stringify(_response.data));
          dispatch(setProfile(_response.data));
          setUploading(false);
        }
      }
    }
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

  return (
    <div className="mt-5 container profile-container">
      {loading ? (
        <FullScreenLoading />
      ) : (
        <Layout className="bg-white h-100">
          <Sider
            width={300}
            className="bg-light rounded-3 shadow z-3 h-100 border border-light position-sticky"
            style={{ top: '15%' }}
          >
            {/* avatar */}
            <div className="bg-light w-100 pt-3 d-flex justify-content-center align-items-center custom-upload">
              <Upload
                name="avatar"
                listType="picture-circle"
                action="https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188"
                showUploadList={false}
                maxCount={1}
                fileList={undefined}
                customRequest={dummyRequest}
                beforeUpload={checkFile}
                onChange={handleUploadFile}
                disabled={uploading}
              >
                {uploading ? (
                  <div>
                    <Spin size="large" />
                  </div>
                ) : user?.avatar !==
                  'https://res.cloudinary.com/dtl1pdmw6/image/upload/v1695568685/MegaCine/Default_avatar.png' ? (
                  <Avatar src={user?.avatar} alt="" style={{ width: '100%', height: '100%' }} />
                ) : (
                  <div>
                    <PlusOutlined />
                    <div className="ant-upload-text">Upload</div>
                  </div>
                )}
              </Upload>
            </div>

            <div className="bg-light mx-2">
              <hr />
            </div>

            <Menu
              className="bg-light pb-5 pt-2 h-100 border-end-0"
              mode="vertical"
              defaultSelectedKeys={[selected]}
              selectedKeys={[selected]}
              onClick={(e) => (e.key !== selected ? setSelected(e.key) : null)}
              items={items}
            />

            <div className="bg-light mx-2">
              <hr />
            </div>

            <div className="bg-light w-100 text-start px-3 pb-3">
              <div className="fs-6">
                Hotline: <span className="fw-bold text-primary">1900xxxx (8:00 - 22:00)</span>
              </div>
              <div className="my-1 fs-6">
                Email: <span className="fw-bold text-primary">cskh@gmail.com</span>
              </div>
            </div>
          </Sider>

          <Content className="ms-5 rounded-3 shadow-sm p-3 bg-light border border-light">
            {items[Number(selected)].content}
          </Content>
        </Layout>
      )}
    </div>
  );
}

export default ProfileUser;
