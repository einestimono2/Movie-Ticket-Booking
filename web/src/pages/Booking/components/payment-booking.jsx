import React, { useEffect, useState } from 'react';
import { Input, Radio, Space, Image, Collapse, Checkbox, Tag } from 'antd';
import { useDispatch, useSelector } from 'react-redux';

import { CARD_LOGO, MOMO_LOGO, VNPAY_LOGO, ZALOPAY_LOGO } from '../../../constants/images';
import apiCaller from '../../../apis/apiCaller';
import { promotionApi } from '../../../apis/promotionApi';
import { Loading } from '../../../components/loading';
import { formatVietNamCurrency } from '../../../utils/string';
import { addPromotion, deletePromotion } from '../../../redux/reducer/bookingReducer';

const { Search } = Input;

const paymentMethods = [
  { value: 0, logo: `/${CARD_LOGO}`, label: 'Thẻ ATM/VISA/MASTERCARD/QRCODE' },
  { value: 1, logo: `/${MOMO_LOGO}`, label: 'Ví MoMo' },
  { value: 2, logo: `/${VNPAY_LOGO}`, label: 'VNPAY' },
  { value: 3, logo: `/${ZALOPAY_LOGO}`, label: 'ZaloPay' },
];

const PromotionCard = (props) => {
  const promotion = props.promotion;

  return (
    <div className="d-flex justify-content-between align-items-center">
      <div>
        <div className="text-body">
          {promotion.title} (#{promotion.code})
        </div>
        <div className="text-body fw-bold max-1-lines">
          {promotion.type === 'Percentage'
            ? `${promotion.value.toFixed(2)} %`
            : formatVietNamCurrency(promotion.value.toFixed(2))}
        </div>
      </div>
      <div>
        <Checkbox onChange={props.onChange} value={props.initValue ?? false}></Checkbox>
      </div>
    </div>
  );
};

export default function PaymentBooking(props) {
  const dispatch = useDispatch();
  const selectedPromotions = useSelector((state) => state.booking.promotions);

  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);

  const [value, setValue] = useState(0);
  const [promotions, setPromotions] = useState([]);

  const errorHandler = (error) => {
    setLoading(false);
    setSearching(false);
    props.onError(error.message);
  };

  const onChange = (e) => {
    setValue(e.target.value);
  };

  const handleSearch = async (value) => {
    if (!value) return;
    if (Object.keys(selectedPromotions).includes(value)) {
      props.onError('Mã giảm giá đã được áp dụng');
      return;
    }

    const id = props.data?.showtime?.theater?._id;
    if (!id) return;

    setSearching(true);
    const response = await apiCaller({
      request: promotionApi.applyPromotion({
        theater: id,
        code: value,
        startTime: props.data?.showtime?.startTime,
      }),
      errorHandler,
    });

    if (response) {
      dispatch(addPromotion(response.data));
      setSearching(false);
    }
  };

  const getListPromotion = async () => {
    const id = props.data?.showtime?.theater?._id;
    if (!id) return;

    setLoading(true);
    const response = await apiCaller({
      request: promotionApi.listPromotionByTheater(id),
      errorHandler,
    });

    if (response) {
      setPromotions(response.data);
      setLoading(false);
    }
  };

  useEffect(() => {
    getListPromotion();
  }, [props.data]);

  return (
    <div className="px-4">
      {loading ? (
        <Loading />
      ) : (
        <>
          {/* Voucher */}
          <div className="mt-4 mb-5">
            <h2 className="mb-4 fw-bold border-5 border-start border-primary ps-2">KHUYẾN MÃI</h2>
            <div className="d-flex w-100 gap-5">
              <div className="w-100">
                <div className="w-100">
                  <Search
                    className="!rounded"
                    loading={searching}
                    placeholder="Nhập code ..."
                    allowClear
                    enterButton="Áp dụng"
                    size="large"
                    onSearch={handleSearch}
                  />
                </div>
                <div className="my-4 ms-1">
                  <div className="fw-bold">Khuyến mãi đã áp dụng</div>
                  <div className="mt-1 w-100">
                    {Object.keys(selectedPromotions).map((key) => (
                      <Tag
                        key={key}
                        closable
                        color={selectedPromotions[key].type === 'Amount' ? '#87d068' : '#f50'}
                        onClose={(e) => {
                          e.preventDefault();
                          dispatch(deletePromotion({ _id: key }));
                        }}
                      >
                        {selectedPromotions[key].code}
                      </Tag>
                    ))}
                  </div>
                </div>
              </div>
              <div className="w-100">
                {promotions?.length ? (
                  <div className="mb-4 w-100">
                    <Collapse
                      expandIconPosition="end"
                      size="small"
                      defaultActiveKey={promotions?.length ? 0 : undefined}
                      items={[
                        {
                          key: 0,
                          label: 'Khuyến mãi của rạp',
                          children: (
                            <div className="d-flex flex-column gap-3">
                              {promotions?.map((promotion) => (
                                <PromotionCard
                                  key={promotion._id}
                                  promotion={promotion}
                                  initValue={Object.keys(selectedPromotions).includes(promotion._id)}
                                  onChange={(e) => {
                                    if (e.target.checked) dispatch(addPromotion(promotion));
                                    else dispatch(deletePromotion(promotion));
                                  }}
                                />
                              ))}
                            </div>
                          ),
                        },
                      ]}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          {/* Payment */}
          <div className="mb-4 mt-5">
            <h2 className="mb-3 fw-bold border-5 border-start border-primary ps-2">PHƯƠNG THỨC THANH TOÁN</h2>
            <div className="mt-4">
              <Radio.Group onChange={onChange} value={value}>
                <Space direction="vertical">
                  {paymentMethods.map((method) => (
                    <Radio key={method.value} value={method.value}>
                      <div className="d-flex gap-3 justify-content-center align-items-center z-3">
                        <div style={{ height: '5rem', width: '5rem' }}>
                          <Image src={method.logo} preview={false} width={'100%'} height={'100%'} />
                        </div>
                        <div className="text-body fs-6">{method.label}</div>
                      </div>
                    </Radio>
                  ))}
                </Space>
              </Radio.Group>
            </div>
            <div className="my-3 d-flex">
              <div className="fw-bold text-danger me-2">(*)</div>
              Bằng việc click/chạm vào THANH TOÁN, bạn đã xác nhận hiểu rõ các Quy Định Giao Dịch Trực Tuyến của rạp.
            </div>
          </div>
        </>
      )}
    </div>
  );
}
