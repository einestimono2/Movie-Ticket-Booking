import React, { useState } from 'react';
import { Image, Skeleton } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import { ReadMore } from '../../components/truncate/index';
import { getTemplateOfDate } from '../../utils/date';
import apiCaller from '../../apis/apiCaller';
import { personApi } from '../../apis/personApi';
import { useEffect } from 'react';

export default function PersonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [person, setPerson] = useState();

  const errorHandler = (error) => {
    setLoading(false);
    toast.error(error.message, { autoClose: 3000, theme: 'colored' });
  };

  const getPersonDetails = async () => {
    if (!id) return;

    setLoading(true);
    const response = await apiCaller({
      request: personApi.getPersonDetails(id),
      errorHandler,
    });

    if (response) {
      setPerson(response.data);
      setLoading(false);
    }
  };

  useEffect(() => {
    getPersonDetails();
  }, []);

  return (
    <div className="container mt-3 d-flex flex-column">
      <div className="w-50">
        {loading ? (
          <>
            <div className="w-100 my-3 d-flex gap-3 align-items-center">
              <Skeleton.Input style={{ minHeight: '8rem' }} className="w-25" />
              <div className="w-100 h-100">
                <Skeleton.Input className="w-100 my-1" style={{ height: '1.5rem' }} />
                <Skeleton.Input className="w-100 mb-1" style={{ height: '6rem' }} />
              </div>
            </div>
            <div className="w-100 h-100 mt-4">
              <Skeleton.Input className="w-50" style={{ height: '2rem' }} />
              <Skeleton.Input className="my-2 w-100" style={{ height: '15rem' }} />
            </div>
          </>
        ) : (
          <>
            <div className="w-100 my-3 d-flex gap-3 align-items-center">
              <div className="w-25">
                <Image
                  src={person?.avatar}
                  style={{ minHeight: '8rem' }}
                  className="rounded-3"
                  preview={{ maskClassName: 'rounded-3' }}
                />
              </div>
              <div className="w-100" style={{ height: 'fit-content' }}>
                <p className="my-1 fw-bold fs-5 text-body">{person?.fullName}</p>
                <p className="mb-1 fs-6 text-body text-justify">
                  <ReadMore more="Xem thêm" less="Thu gọn" lines={4}>
                    {person?.summary ?? 'Chưa có thông tin'}
                  </ReadMore>
                </p>
              </div>
            </div>
            {person.movies?.length && (
              <div className="w-100 h-100 mt-4">
                <h2 className="fw-bold border-5 border-start border-primary ps-2">NHỮNG BỘ PHIM GÓP MẶT</h2>
                <div className="d-flex gap-3 overflow-auto" style={{ maxWidth: '50vw' }}>
                  {person.movies?.map((movie) => (
                    <div key={movie._id} className="my-2">
                      <Image
                        src={movie.poster}
                        className="rounded-3"
                        style={{ width: '10rem', height: '12.5rem' }}
                        preview={{ maskClassName: 'rounded-3' }}
                      />
                      <p className="my-1 fw-bold fs-6 text-muted">
                        {movie.releaseDate ? getTemplateOfDate(movie.releaseDate, 'DD/MM/YYYY') : 'Không xác định'}
                      </p>
                      <p
                        className="my-0 fw-bold fs-6 text-body cusor-pointer custom-hover"
                        onClick={() => navigate(`/movies/${movie._id}`)}
                      >
                        {movie.title}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
