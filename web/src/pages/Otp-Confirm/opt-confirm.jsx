import React, { useEffect, useState } from 'react';
import { Button, Image } from 'antd';
import OtpInput from 'react-otp-input';
import { toast } from 'react-toastify';

import { OTP_IMAGE } from '../../constants/images';
import { userApi } from '../../apis/userApi';
import apiCaller from '../../apis/apiCaller';
import './opt-confirm.scss';
import { Loading } from '../../components/loading';
import Timer from '../../components/timer';

function OtpConfirm(props) {
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

  const onConfirm = async () => {
    setLoading(true);

    const response = await apiCaller({
      request: userApi.activate({
        activationToken: data.activationToken,
        otp: otp,
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
      request: userApi.resend_activate({
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
          activationToken: response.data.activationToken,
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
    <>
      {data ? (
        <section className="opt-section px-5 pt-4 pb-1 rounded-3">
          <div className="m-2 w-100 h-100">
            <div className="otp-row">
              <div className="img-otp mx-auto">
                <Image src={OTP_IMAGE} preview={false} />
              </div>
              <div className="text-center">
                <p className="text-body my-0 fw-bold fs-5">
                  Mã OTP đã được gửi tới email <span>{`'${data?.email}'` ?? 'của bạn'}</span>
                </p>
                <p className="text-body my-0 fs-6">
                  Vui lòng kiểm tra email và nhập mã OTP nhận được để kích hoạt tài khoản!
                </p>
              </div>
            </div>
            <div className="my-5 otp-content">
              <OtpInput
                inputType="number"
                value={otp}
                onChange={setOtp}
                numInputs={6}
                renderSeparator={<span className="mx-2" />}
                renderInput={(props) => <input {...props} className="otp-content-input" />}
              />
            </div>

            <div>
              <div>
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
                      className="mb-3 border-0 !p-0 text-danger"
                      onClick={handleSendOtp}
                    >
                      <span className="text-muted text-decoration-underline cusor-pointer custom-hover">
                        Nhận lại mã OTP
                      </span>
                    </Button>
                  </div>
                )}
              </div>
              <Button onClick={onConfirm} className="otp-btn rounded-3" size="large" loading={loading}>
                Xác nhận
              </Button>
            </div>
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
    </>
  );
}

export default OtpConfirm;
