import React, { useState } from 'react';
import { Image, Form, Input, Button } from 'antd';

import './login.scss';
import { MEGACINE_LOGO } from '../../constants/images';
import { userApi } from '../../apis/userApi';
import apiCaller from '../../apis/apiCaller';

function Login(props) {
  const [loading, setLoading] = useState(false);

  const errorHandler = (error) => {
    setLoading(false);
    props.onError(error);
  };

  const handleLogin = async (values) => {
    setLoading(true);

    const response = await apiCaller({
      request: userApi.login(values),
      errorHandler,
    });

    if (response) {
      props.onSuccess(response.data);
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="align-items-center justify-content-center" style={{ width: '100%' }}>
        <div className="">
          <div className="loginForm pt-3 pb-2">
            {/* Logo */}
            <div className="mb-5 text-center">
              <Image src={`/${MEGACINE_LOGO}`} height={'7rem'} preview={false} />
            </div>

            {/* Form */}
            <Form onFinish={handleLogin} size="large" className="m-4" labelCol={{ span: 5 }} layout="vertical">
              <Form.Item
                className="mt-0 mb-1"
                label="Email"
                name="email"
                rules={[
                  {
                    required: true,
                    message: 'Hãy điền email!',
                  },
                  { type: 'email', message: 'Email không hợp lệ!' },
                ]}
              >
                <Input placeholder="Email" />
              </Form.Item>
              <Form.Item
                className="mt-0 mb-2"
                label="Mật khẩu"
                name="password"
                rules={[
                  {
                    required: true,
                    message: 'Hãy điền mật khẩu!',
                  },
                ]}
              >
                <Input.Password placeholder="Mật khẩu" />
              </Form.Item>

              <div className="d-flex align-items-center justify-content-between">
                <a
                  href="#"
                  className="forgot-pass"
                  onClick={(e) => {
                    e.preventDefault();
                    props.onChangePage(5);
                  }}
                >
                  Kích hoạt tài khoản
                </a>
                <a
                  href="#"
                  className="forgot-pass"
                  onClick={(e) => {
                    e.preventDefault();
                    props.onChangePage(3);
                  }}
                >
                  Quên mật khẩu
                </a>
              </div>

              <div className="group-button mt-5">
                <Button
                  loading={loading}
                  type={undefined}
                  htmlType="submit"
                  className="btn-login rounded-3 col-md-12"
                  icon={<i className="fa-solid fa-right-to-bracket"></i>}
                >
                  Đăng nhập
                </Button>
              </div>
            </Form>

            <div className="social-login mx-4 mb-4 mt-5">
              <div className="d-flex align-items-center gap-2">
                <hr className="w-50" />
                <p className=" text-body fw-bold text-center mb-1">or</p>
                <hr className="w-50" />
              </div>
              <div className="d-flex gap-2 mt-1">
                <a href="#" className="google py-2 rounded-3 d-flex justify-content-center align-items-center w-50">
                  <i className="fa-brands fa-google me-2 fs-5"></i> Google
                </a>
                <a href="#" className="facebook py-2 rounded-3 d-flex justify-content-center align-items-center w-50">
                  <i className="fa-brands fa-facebook me-2 fs-5"></i> Facebook
                </a>
              </div>
            </div>

            <h6 className="text-center">
              {'Chưa có tài khoản?  '}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  props.onChangePage(1);
                }}
              >
                Đăng ký ngay
              </a>
            </h6>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Login;
