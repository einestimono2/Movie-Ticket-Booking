import React, { useEffect, useState } from 'react';
import { Button, Image } from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';

import { formatVietNamCurrency } from '../../../utils/string';
import apiCaller from '../../../apis/apiCaller';
import { productApi } from '../../../apis/productApi';
import { Loading } from '../../../components/loading';
import NoDataCard from '../../../components/no-data-card';
import { NO_IMAGE } from '../../../constants/images';
import { addProduct, deleteProduct } from '../../../redux/reducer/bookingReducer';

const ProductCard = (props) => {
  const dispatch = useDispatch();
  const product = props.product;

  const [amount, setAmount] = useState(props.initAmount ?? 0);

  const handlePlus = () => {
    dispatch(addProduct(product));
    setAmount(amount + 1);
  };
  const handleMinus = () => {
    dispatch(deleteProduct(product));
    setAmount(amount - 1);
  };

  return (
    <div className="row d-flex justify-content-between" style={{ height: 'fit-content' }}>
      <div className="col-3" style={{ minHeight: '7rem' }}>
        <Image
          src={product.images ?? `/${NO_IMAGE}`}
          width={'100%'}
          height={'100%'}
          preview={false}
          className="rounded-3"
        />
      </div>
      <div className="col-6">
        <div className="mx-0">
          <p className="my-0 text-body max-2-lines fs-5 text-justify">{product.name}</p>
          <p className="my-1 text-dark max-3-lines text-justify">{product.description}</p>
          <p className="mb-0 mt-2 text-body fw-bold text-justify">
            Giá: {formatVietNamCurrency(product.price.toFixed(2))}
          </p>
        </div>
      </div>
      <div className="col-3 d-flex justify-content-end align-items-center">
        <div className="d-flex flex-row gap-2 align-items-center border rounded-3 shadow-sm z-3">
          <Button
            className="border-0"
            ghost
            disabled={amount === 0}
            onClick={handleMinus}
            icon={<MinusOutlined style={{ fontSize: '0.85rem', color: 'black' }} />}
          ></Button>
          <div className="fw-bold" style={{ fontSize: '1.15rem' }}>
            {amount}
          </div>
          <Button
            className="border-0"
            ghost
            onClick={handlePlus}
            icon={<PlusOutlined style={{ fontSize: '0.85rem', color: 'black' }} />}
          ></Button>
        </div>
      </div>
    </div>
  );
};

export default function ProductBooking(props) {
  const selectedProducts = useSelector((state) => state.booking.products);
  const [loading, setLoading] = useState(true);

  const [products, setProducts] = useState([]);

  const errorHandler = (error) => {
    setLoading(false);
    props.onError(error.message);
  };

  const getProducts = async () => {
    const id = props.data?.showtime?.theater?._id;
    if (!id) return;

    setLoading(true);
    const response = await apiCaller({
      request: productApi.listProductByTheater(id),
      errorHandler,
    });

    if (response) {
      setProducts(response.data);
      setLoading(false);
    }
  };

  useEffect(() => {
    getProducts();
  }, [props.data]);

  return (
    <div className="my-4 px-4">
      {loading ? (
        <Loading />
      ) : products?.length ? (
        <>
          <h2 className="mb-3 fw-bold border-5 border-start border-primary ps-2">CHỌN COMBO</h2>
          <div className="d-flex flex-column gap-4">
            {products.map((product, idx) => (
              <div key={product._id} className={idx === 0 ? 'pt-3' : 'border-top pt-3'}>
                <ProductCard product={product} initAmount={selectedProducts[product._id]?.quantity} />
              </div>
            ))}
          </div>
        </>
      ) : (
        <NoDataCard className="my-5" text="Hiện tại, rạp chưa có combo nào!" />
      )}
    </div>
  );
}
