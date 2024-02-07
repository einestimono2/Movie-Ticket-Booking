import React, { useEffect, useState } from 'react';
import { Modal } from 'antd';
import { useSelector, useDispatch } from 'react-redux';

import './style.scss';
import Login from '../../pages/Login/login';
import { setProfile } from '../../redux/reducer/userReducer';
import Register from '../../pages/Register/register';
import OtpConfirm from '../../pages/Otp-Confirm/opt-confirm';
import ForgotPassword from '../../pages/ForgotPassword';
import ResetPassword from '../../pages/ResetPassword';
import { openLogin } from '../../redux/reducer/authReducer';

export default function AuthCard(props) {
  const dispatch = useDispatch();
  const authAction = useSelector((state) => state.auth.openLogin);
  const [currentPage, setCurrentPage] = useState(0);

  const onLoginSuccess = (data) => {
    localStorage.setItem('access_token', data.accessToken);
    localStorage.setItem('refresh_token', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    dispatch(setProfile(data.user));
    props.onCancel();
  };

  const onChangePage = (index) => {
    setCurrentPage(index);
  };

  useEffect(() => {
    if (authAction === true) {
      if (currentPage !== 0) setCurrentPage(0);
      props.onOpen();
    }
  }, [authAction]);

  const pages = [
    // Đăng nhập
    {
      key: 0,
      content: <Login onError={props.onError} onSuccess={onLoginSuccess} onChangePage={onChangePage} />,
    },
    // Đăng ký
    {
      key: 1,
      content: <Register onError={props.onError} onChangePage={onChangePage} />,
    },
    // OTP
    {
      key: 2,
      content: <OtpConfirm onError={props.onError} onChangePage={onChangePage} />,
    },
    // Quên mật khẩu
    {
      key: 3,
      content: <ForgotPassword onError={props.onError} onChangePage={onChangePage} />,
    },
    // Đặt lại mật khẩu
    {
      key: 4,
      content: <ResetPassword onError={props.onError} onChangePage={onChangePage} />,
    },
    // Kích hoạt tài khoản
    {
      key: 5,
      content: <ForgotPassword onError={props.onError} onChangePage={onChangePage} isActivateAccount />,
    },
  ];

  return (
    <Modal
      className="auth-card-container"
      open={props.open}
      onCancel={() => {
        if (authAction === true) dispatch(openLogin(undefined));
        props.onCancel();
      }}
      footer={null}
      centered
      closeIcon={false}
    >
      {pages[currentPage].content}
    </Modal>
  );
}
