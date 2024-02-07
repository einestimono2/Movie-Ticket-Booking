import React, { useEffect, useState } from 'react';
import { Form, Input, Button } from 'antd';
import { toast } from 'react-toastify';

import apiCaller from '../../../apis/apiCaller';
import { userApi } from '../../../apis/userApi';
import { getVietNamFormatDate } from '../../../utils/date';

export default function ProfileInfo(props) {
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const errorHandler = (error) => {
    setLoading(false);
    toast.error(error.message, { autoClose: 3000, theme: 'colored' });
  };

  const onConfirm = async (values) => {
    setLoading(true);

    const response = await apiCaller({
      request: userApi.updateProfile({
        name: values.name,
        phoneNumber: values.phoneNumber,
      }),
      errorHandler,
    });

    if (response) {
      setLoading(false);
      toast.success('Thông tin tài khoản đã được cập nhật!', { autoClose: 3000, theme: 'colored' });
      props.onSuccess(response.data, true);
    }
  };

  const onToggleEditing = () => {
    if (editing) resetDefault();
    setEditing(editing ? false : true);
  };

  const resetDefault = () => {
    form.setFieldsValue({
      name: props.user?.name,
      phoneNumber: props.user?.phoneNumber,
      email: props.user?.email,
      provider: props.user?.provider,
      createdAt: getVietNamFormatDate(props.user?.createdAt, false),
    });
    setEditing(false);
  };

  useEffect(() => {
    resetDefault();
  }, [props.user]);

  return (
    <div className="my-3 mx-5 h-100">
      <div className="d-flex align-items-center justify-content-between w-100">
        <p className="text-body fs-4 fw-bold my-0">{editing ? 'CẬP NHẬT NGƯỜI DÙNG' : 'THÔNG TIN NGƯỜI DÙNG'}</p>
        <Button
          className={editing ? 'bg-danger text-white' : 'bg-primary text-white'}
          style={{ height: '100%' }}
          icon={editing ? <i className="fa-solid fa-xmark"></i> : <i className="fa-solid fa-user-pen"></i>}
          onClick={onToggleEditing}
        >
          {editing ? 'Hủy bỏ' : 'Cập nhật'}
        </Button>
      </div>
      <div className="w-100 mt-5 h-100">
        <Form size="large" className="w-100" layout="vertical" onFinish={onConfirm} disabled={!editing} form={form}>
          <div className="d-flex w-100 gap-3 mb-1">
            <Form.Item
              className="w-50"
              label="Họ tên"
              name="name"
              rules={[
                {
                  required: true,
                  message: 'Hãy điền họ tên bạn!',
                },
              ]}
            >
              <Input placeholder="Họ và tên" />
            </Form.Item>
            <Form.Item className="w-50" label="Số điện thoại" name="phoneNumber">
              <Input placeholder="Số điện thoại" />
            </Form.Item>
          </div>

          <div className="d-flex w-100 gap-3">
            <Form.Item className="w-50" label="Email" name="email">
              <Input placeholder="Email" disabled />
            </Form.Item>
            <Form.Item className="w-50" label="Phương thức" name="provider">
              <Input placeholder="Email | Google | Facebook" disabled />
            </Form.Item>
          </div>

          <div className="d-flex w-100 gap-3">
            <Form.Item hidden={editing} className="w-50" label="Ngày tham gia" name="createdAt">
              <Input placeholder="Ngày tham gia" disabled />
            </Form.Item>
            <Form.Item hidden={editing} className="w-50" label="Mật khẩu" name="password">
              {/* <div className="position-absolute w-100"> */}
              <Input.Password defaultValue={'123456789'} disabled iconRender={() => <div></div>} />
              <div className="position-absolute bottom-0 end-0 h-100 d-flex align-items-center">
                <span className="cusor-pointer me-2 fw-bold text-primary" onClick={() => props.onChangePage(3)}>
                  Thay đổi
                </span>
              </div>
              {/* </div> */}
            </Form.Item>
          </div>

          {editing ? (
            <div className="group-button mt-5 w-100">
              <Button
                loading={loading}
                type={undefined}
                style={{ width: '100%' }}
                htmlType="submit"
                className="btn-login rounded-3"
                icon={<i className="fa-regular fa-pen-to-square"></i>}
              >
                Cập nhập tài khoản
              </Button>
            </div>
          ) : null}
        </Form>
      </div>
    </div>
  );
}
