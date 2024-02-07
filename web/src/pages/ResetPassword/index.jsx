import React, { useEffect, useState } from 'react';
import { Form, Input, Button } from 'antd';
import { toast } from 'react-toastify';
import OtpInput from 'react-otp-input';

import './style.scss';
import { userApi } from '../../apis/userApi';
import apiCaller from '../../apis/apiCaller';
import { Loading } from '../../components/loading';
import Timer from '../../components/timer';

export default function ResetPassword(props) {
  const data = JSON.parse(localStorage.getItem('verify_token'));
  const [otp, setOtp] = useState('');
  const [canResend, setCanResend] = useState(false);

  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const errorHandler = (error) => {
    setLoading(false);
    setResendLoading(false);
    props.onError(error);
  };

  const handleSubmit = async (values) => {
    setLoading(true);

    const response = await apiCaller({
      request: userApi.resetPassword({
        resetPasswordToken: data.resetPasswordToken,
        newPassword: values.password,
        otp,
      }),
      errorHandler,
    });

    if (response) {
      toast.success(response.message, { autoClose: 3000, theme: 'colored' });
      localStorage.removeItem('verify_token');
      setLoading(false);
      props.onChangePage(0);
    }
  };

  const handleSendOtp = async () => {
    setResendLoading(true);

    const response = await apiCaller({
      request: userApi.forgotPassword({
        email: data?.email,
      }),
      errorHandler,
    });

    if (response) {
      toast.success(response.message, { autoClose: 3000, theme: 'colored' });
      localStorage.setItem(
        'verify_token',
        JSON.stringify({
          email: data.email,
          resetPasswordToken: response.data.resetPasswordToken,
        }),
      );
      setResendLoading(false);
      setCanResend(false);
    }
  };

  useEffect(() => {
    if (!data) props.onChangePage(0);
  }, []);

  return (
    <div className="reset-password-container">
      {data ? (
        <section className="opt-section px-5 pt-4 pb-1 rounded-3">
          <div className="m-2 w-100 h-100">
            <div className="otp-row">
              <div className="text-center">
                <p className="text-body my-0 fw-bold fs-4">Đặt lại mật khẩu!</p>
                <p className="text-body my-0 fs-6">
                  Đặt lại mật khẩu cho email <span>{`'${data?.email}'` ?? 'của bạn'}</span>
                </p>
              </div>
            </div>

            <div className="my-4 otp-content">
              <div className="">
                {!canResend ? (
                  <Timer
                    title="Có thể nhận lại mã OTP sau"
                    className="text-body d-flex justify-content-end align-items-center gap-2"
                    initialMinute={0}
                    initialSeconds={30}
                    onTimedout={() => setCanResend(true)}
                  />
                ) : (
                  <div className="text-end">
                    <Button
                      loading={resendLoading}
                      ghost
                      className="mb-3 border-0 !p-0 !m-0 text-danger"
                      onClick={handleSendOtp}
                    >
                      <span className="text-muted text-decoration-underline cusor-pointer custom-hover">
                        Nhận lại mã OTP
                      </span>
                    </Button>
                  </div>
                )}
              </div>
              <OtpInput
                inputType="number"
                value={otp}
                onChange={setOtp}
                numInputs={6}
                renderSeparator={<span className="mx-2" />}
                renderInput={(props) => <input {...props} className="otp-content-input" />}
              />
            </div>

            {/* Form */}
            {otp?.length === 6 ? (
              <Form size="large" className="" layout="vertical" onFinish={handleSubmit}>
                <Form.Item
                  className="mb-1"
                  label="Mật khẩu mới"
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
                  label="Nhập lại mật khẩu"
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
                    Xác nhận
                  </Button>
                </div>
              </Form>
            ) : null}
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
        </section>
      ) : (
        <Loading />
      )}
    </div>
  );
}
