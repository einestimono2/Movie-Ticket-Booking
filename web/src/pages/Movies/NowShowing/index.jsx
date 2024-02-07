import React, { useEffect, useState } from 'react';
import { Select, Skeleton, Modal } from 'antd';
import { toast } from 'react-toastify';

import './style.scss';
import apiCaller from '../../../apis/apiCaller';
import { genreApi } from '../../../apis/genreApi';
import { movieApi } from '../../../apis/movieApi';
import { MovieCardVertical } from '../../../components/movie-card';
import { Video } from '../../../components/video/index';
import NoDataCard from '../../../components/no-data-card';

export default function NowShowing() {
  const [sortType, setSortType] = useState(1);
  const [genreType, setGenreType] = useState();

  const [genres, setGenres] = useState([]);
  const [nowShowingMovie, setNowShowingMovie] = useState([]);

  const [genreLoading, setGenreLoading] = useState(true);
  const [movieLoading, setMovieLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState('');

  const errorHandler = (error) => {
    toast.error(error.message, { autoClose: 3000, theme: 'colored' });
  };

  const getListGenre = async () => {
    setGenreLoading(true);
    const response = await apiCaller({
      request: genreApi.listGenre(),
      errorHandler,
    });

    if (response) {
      setGenres(response.data);
      setGenreLoading(false);
    }
  };

  const listMovieNowShowing = async () => {
    setMovieLoading(true);
    const response = await apiCaller({
      request: movieApi.listMovieNowShowing({
        sort: sortType,
        genre: genreType,
      }),
      errorHandler,
    });

    if (response) {
      setNowShowingMovie(response.data);
      setMovieLoading(false);
    }
  };

  useEffect(() => {
    getListGenre();
  }, []);

  useEffect(() => {
    listMovieNowShowing();
  }, [sortType, genreType]);

  return (
    <section className="movieList">
      <div className="container mb-3 mt-3">
        <div className="row mt-3" style={{ width: '100%' }}>
          <div className="col-md-2">
            <h2 className="fw-bold border-5 border-start border-primary ps-2 me-5 mb-4">Bộ lọc</h2>
            <p className="mb-2">Nổi bật</p>
            <Select
              defaultValue={1}
              size="large"
              style={{ width: '100%' }}
              onChange={(value) => setSortType(value)}
              options={[
                {
                  value: 2,
                  label: 'Mới nhất',
                },
                {
                  value: 1,
                  label: 'Phổ biến',
                },
              ]}
            />
            <p className="mt-3 mb-2">Thể loại</p>
            <Select
              loading={genreLoading}
              style={{ width: '100%' }}
              defaultValue={null}
              size="large"
              onChange={(value) => setGenreType(value)}
              options={[
                {
                  value: null,
                  label: 'Tất cả',
                },
                ...genres.map((genre) => {
                  return {
                    value: genre.name,
                    label: genre.name,
                  };
                }),
              ]}
            />
          </div>
          <div className="col-md-10">
            <h2 className="ms-3 fw-bold border-5 border-start border-primary ps-2 me-5 mb-4">Phim đang chiếu</h2>
            <div className="ms-2 row row-cols-1 row-cols-md-4 gy-4">
              {movieLoading ? (
                Array(4)
                  .fill(1)
                  .map((_e, idx) => (
                    <Skeleton.Input key={idx} style={{ height: 380, width: 240 }} className="rounded-3" />
                  ))
              ) : nowShowingMovie?.length === 0 ? (
                <NoDataCard className="container h-5" text="Hiện tại chưa có lịch chiếu tương ứng!" />
              ) : (
                nowShowingMovie?.map((movie) => (
                  <MovieCardVertical
                    key={movie._id}
                    movie={movie}
                    backgroundColor="'white'"
                    openTrailer={(trailer) => setModalOpen(trailer)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
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
    </section>
  );
}
