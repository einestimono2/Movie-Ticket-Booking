import React, { useState } from 'react';
import { Image, Form, Input, Button } from 'antd';
import { toast } from 'react-toastify';

import './register.scss';
import { MEGACINE_LOGO } from '../../constants/images';
import { userApi } from '../../apis/userApi';
import apiCaller from '../../apis/apiCaller';

function Register(props) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const errorHandler = (error) => {
    setLoading(false);
    props.onError(error);
  };

  const onConfirm = async (values) => {
    const data = {
      password: values.password,
      name: values.name,
      email: values.email,
      phoneNumber: values.phone,
    };

    setLoading(true);
    const response = await apiCaller({
      request: userApi.register(data),
      errorHandler,
    });

    if (response) {
      toast.success(response.message, { autoClose: 3000, theme: 'colored' });
      localStorage.setItem(
        'verify_token',
        JSON.stringify({
          email: data.email,
          activationToken: response.data.activationToken,
        }),
      );
      setLoading(false);
      props.onChangePage(2);
    }
  };

  return (
    <div className="">
      <div className="align-items-center justify-content-center" style={{ width: '100%' }}>
        <div className="pt-3 pb-1 px-4 loginForm">
          {/* Logo */}
          <div className="mb-5">
            <div className="mb-3 text-center">
              <Image src={`/${MEGACINE_LOGO}`} height={'7rem'} preview={false} />
            </div>
          </div>
          {/* Form */}
          <Form
            size="large"
            className="mx-3 my-4 mb-5"
            labelCol={{ span: 5 }}
            labelAlign="left"
            onFinish={onConfirm}
            form={form}
          >
            <Form.Item
              className="mb-4"
              label="Họ và tên"
              name="name"
              rules={[
                {
                  required: true,
                  message: 'Hãy điền họ và tên bạn!',
                },
              ]}
            >
              <Input placeholder="Họ và tên" />
            </Form.Item>
            <Form.Item
              className="mb-4"
              label="Điện thoại"
              name="phone"
              rules={[
                {
                  required: true,
                  message: 'Hãy điền số điện thoại!',
                },
                { type: 'text', message: 'Số điện thoại không hợp lệ!' },
              ]}
            >
              <Input placeholder="Số điện thoại" />
            </Form.Item>
            <Form.Item
              className="mb-4"
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
              className="mb-4"
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
            <Form.Item
              label="Nhập lại"
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                {
                  required: true,
                  message: 'Hãy điền mật khẩu!',
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Mật khẩu không khớp'));
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Nhập lại mật khẩu" />
            </Form.Item>

            <div className="group-button mt-5 w-100">
              <Button
                loading={loading}
                type={undefined}
                style={{ width: '100%' }}
                htmlType="submit"
                className="btn-login rounded-3"
                icon={<i className="fa-solid fa-right-to-bracket"></i>}
              >
                Đăng ký
              </Button>
            </div>
          </Form>

          <h6 className="text-center">
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
      </div>
    </div>
  );
}

export default Register;
