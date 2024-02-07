import React, { useState } from 'react';
import { Form, Input, Button } from 'antd';
import { toast } from 'react-toastify';

import apiCaller from '../../../apis/apiCaller';
import { userApi } from '../../../apis/userApi';

export default function ProfileChangePassword(props) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const errorHandler = (error) => {
    setLoading(false);
    toast.error(error.message, { autoClose: 3000, theme: 'colored' });
  };

  const onConfirm = async (values) => {
    setLoading(true);

    const response = await apiCaller({
      request: userApi.updatePassword(values),
      errorHandler,
    });

    if (response) {
      setLoading(false);
      form.resetFields();
      toast.success('Mật khẩu đã được cập nhật!', { autoClose: 3000, theme: 'colored' });
      props.onSuccess(response.data);
    }
  };

  return (
    <div className="w-100 px-5 py-3">
      <p className="fs-4 text-center fw-bold text-body mb-5">THAY ĐỔI MẬT KHẨU!</p>
      <div className="container w-100">
        <Form
          size="large"
          className="w-75 px-5 py-4 border rounded-3 bg-white"
          layout="vertical"
          onFinish={onConfirm}
          form={form}
        >
          <Form.Item
            className="mb-3"
            label="Mật khẩu cũ"
            name="oldPassword"
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
            className="mb-3"
            label="Mật khẩu mới"
            dependencies={['oldPassword']}
            name="newPassword"
            rules={[
              {
                required: true,
                message: 'Hãy điền mật khẩu!',
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('oldPassword') !== value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu mới phải khác mật khẩu cũ'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Mật khẩu" />
          </Form.Item>
          <Form.Item
            className="mb-5"
            label="Nhập lại mật khẩu mới"
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              {
                required: true,
                message: 'Hãy điền mật khẩu!',
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu mới không khớp'));
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
              icon={<i className="fa-regular fa-pen-to-square"></i>}
            >
              Cập nhập mật khẩu
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
