import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Header from '../header/header.jsx';
import Footer from '../footer/footer.jsx';
import ListTheaterCard from '../list-theater-card/index.jsx';
import AuthCard from '../auth-card/index.jsx';
import { theaterApi } from '../../apis/theaterApi';
import apiCaller from '../../apis/apiCaller';

export default function BaseLayout(props) {
  const [loading, setLoading] = useState(true);

  const [listTheater, setListTheater] = useState([]);

  const [modalListTheater, setModalListTheater] = useState(false);
  const [modalAuth, setModalAuth] = useState(false);

  const errorHandler = (error) => {
    setLoading(false);
    toast.error(error.message, { autoClose: 3000, theme: 'colored' });
  };

  const handleClickLogin = (e) => {
    e.preventDefault();
    setModalAuth(modalAuth ? false : true);
  };

  const handleError = (error) => {
    toast.error(error.message, { autoClose: 3000, theme: 'colored' });
  };

  const getListTheater = async () => {
    setLoading(true);
    const response = await apiCaller({
      request: theaterApi.listTheater(),
      errorHandler,
    });

    if (response) {
      setListTheater(response.data);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!listTheater.length) getListTheater();
  }, []);

  return (
    <div className="d-flex flex-column" style={{ minHeight: '100vh' }}>
      <Header
        open={() => setModalListTheater(modalListTheater ? false : true)}
        onLoginClick={handleClickLogin}
        loading={loading}
        theaters={listTheater}
      />

      <div className="mb-5">
        {props.children}
        <ListTheaterCard
          open={modalListTheater}
          onCancel={() => setModalListTheater(false)}
          loading={loading}
          theaters={listTheater}
        />
      </div>

      <Footer />

      <AuthCard
        open={modalAuth}
        onCancel={() => setModalAuth(false)}
        onError={handleError}
        onOpen={() => setModalAuth(true)}
      />

      <ToastContainer theme="colored" newestOnTop />
    </div>
  );
}
