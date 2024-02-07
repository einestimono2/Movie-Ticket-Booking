import React, { useEffect, useState } from 'react';
import { Modal, Skeleton } from 'antd';
import { toast } from 'react-toastify';

import { Video } from '../../../components/video';
import apiCaller from '../../../apis/apiCaller';
import { movieApi } from '../../../apis/movieApi';
import NoDataCard from '../../../components/no-data-card';
import { SneakShowCard } from '../../../components/movie-card';

export default function SneakShow() {
  const [modalOpen, setModalOpen] = useState('');
  const [loading, setLoading] = useState(true);

  const [listMovie, setListMovie] = useState();

  const errorHandler = (error) => {
    toast.error(error.message, { autoClose: 3000, theme: 'colored' });
  };

  const listSneakShow = async () => {
    setLoading(true);
    const response = await apiCaller({
      request: movieApi.listMovieSneakShow(),
      errorHandler,
    });

    if (response) {
      setListMovie(response.data);
      setLoading(false);
    }
  };

  useEffect(() => {
    listSneakShow();
  }, []);

  return (
    <div className="container mt-3">
      <div style={{ width: '60%' }} className="d-flex flex-column gap-3">
        <h2 className="text-center fw-bold text-body my-2">PHIM CHIẾU SỚM</h2>
        {loading ? (
          <Skeleton.Input className="d-flex gap-3 rounded-3 z-3" style={{ minHeight: '18rem', width: '100%' }} />
        ) : listMovie?.length === 0 ? (
          <NoDataCard
            className="w-100 text-center d-flex flex-column justify-content-center"
            text={
              <div>
                <h2 className="text-center fw-bold text-body mb-0 text-danger">Hiện tại chưa có suất chiếu sớm nào!</h2>
                <h2 className="text-center fw-bold text-body my-2 text-danger">Vui lòng quay lại sau</h2>
              </div>
            }
          />
        ) : (
          listMovie?.map((movie) => (
            <SneakShowCard
              movie={movie}
              key={movie._id}
              onError={errorHandler}
              onOpenModal={() => setModalOpen(movie?.trailer)}
            />
          ))
        )}
      </div>
      {modalOpen && (
        <Modal
          footer={null}
          closeIcon={false}
          centered
          width={'70%'}
          open
          className="modal-trailer"
          onCancel={() => setModalOpen('')}
        >
          <Video url={modalOpen} />
        </Modal>
      )}
    </div>
  );
}
