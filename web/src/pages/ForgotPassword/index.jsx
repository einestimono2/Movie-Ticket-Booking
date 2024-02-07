import React, { useState } from 'react';
import { Form, Input, Button } from 'antd';
import { toast } from 'react-toastify';

import './style.scss';
import { userApi } from '../../apis/userApi';
import apiCaller from '../../apis/apiCaller';

export default function ForgotPassword(props) {
  const isActivateAccount = props.isActivateAccount ?? false;
  const [loading, setLoading] = useState(false);

  const errorHandler = (error) => {
    setLoading(false);
    props.onError(error);
  };

  const handleForgotPassword = async (values) => {
    setLoading(true);

    const response = await apiCaller({
      request: userApi.forgotPassword(values),
      errorHandler,
    });

    if (response) {
      toast.success(response.message, { autoClose: 3000, theme: 'colored' });
      localStorage.setItem(
        'verify_token',
        JSON.stringify({
          email: values.email,
          resetPasswordToken: response.data.resetPasswordToken,
        }),
      );
      setLoading(false);
      props.onChangePage(4);
    }
  };

  const handleActivateAccount = async (values) => {
    setLoading(true);

    const response = await apiCaller({
      request: userApi.resend_activate(values),
      errorHandler,
    });

    if (response) {
      toast.success(response.message, { autoClose: 3000, theme: 'colored' });
      localStorage.setItem(
        'verify_token',
        JSON.stringify({
          email: values.email,
          activationToken: response.data.activationToken,
        }),
      );
      setLoading(false);
      props.onChangePage(2);
    }
  };

  const handleSubmit = async (values) => {
    if (isActivateAccount) {
      await handleActivateAccount(values);
    } else {
      await handleForgotPassword(values);
    }
  };

  return (
    <div className="px-5 pt-4 pb-1 forgot-password-container">
      <div>
        <div className="text-center">
          <p className="my-0 fw-bold text-body fs-4">{isActivateAccount ? 'Kích hoạt tài khoản?' : 'Quên mật khẩu?'}</p>
          <p className="my-0 text-body fs-6">
            {`Nhập địa chỉ email của tài khoản và chúng tôi sẽ gửi tới bạn mã OTP để ${
              isActivateAccount ? 'xác thực tài khoản' : 'đặt lại mật khẩu'
            }.`}
          </p>
        </div>
        <Form onFinish={handleSubmit} size="large" layout="vertical" className="mt-4">
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

          <div className="group-button mt-5">
            <Button
              loading={loading}
              htmlType="submit"
              className="btn-login rounded-3 col-md-12"
              icon={<i className="fa-solid fa-right-to-bracket"></i>}
            >
              Tiếp tục
            </Button>
          </div>
        </Form>
      </div>
      <h6 className="text-center mt-4">
        {'Đã có tài khoản?  '}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            props.onChangePage(0);
          }}
        >
          Đăng nhập
        </a>
      </h6>
    </div>
  );
}
