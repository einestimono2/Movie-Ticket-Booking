import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';

import { userApi } from '../apis/userApi';
import apiCaller from '../apis/apiCaller';

import ROUTES from '../constants/routes';
import HomePage from '../pages/Home';
import NotFoundPage from '../pages/NotFoundPage';
import BaseLayout from '../components/base-layout/layout';
import Schedule from '../pages/Schedule/schedule';
import MovieDetail from '../pages/MovieDetail/movie-detail';
import NowShowing from '../pages/Movies/NowShowing';
import ComingSoon from '../pages/Movies/ComingSoon';
import SneakShow from '../pages/Movies/SneakShow';
import TheaterDetail from '../pages/TheaterDetail';
import PersonDetail from '../pages/PersonDetail';
import Booking from '../pages/Booking';
import ProfileUser from '../pages/Profile/profile';

const routes = [
  {
    path: ROUTES.HOME,
    element: (
      <BaseLayout>
        <HomePage />
      </BaseLayout>
    ),
  },
  {
    path: ROUTES.SCHEDULE,
    element: (
      <BaseLayout>
        <Schedule />
      </BaseLayout>
    ),
  },
  {
    path: ROUTES.NOW_SHOWING,
    element: (
      <BaseLayout>
        <NowShowing />
      </BaseLayout>
    ),
  },
  {
    path: ROUTES.COMING_SOON,
    element: (
      <BaseLayout>
        <ComingSoon />
      </BaseLayout>
    ),
  },
  {
    path: ROUTES.SNEAK_SHOW,
    element: (
      <BaseLayout>
        <SneakShow />
      </BaseLayout>
    ),
  },
  {
    path: ROUTES.MOVIE_DETAIL,
    element: (
      <BaseLayout>
        <MovieDetail />
      </BaseLayout>
    ),
  },
  {
    path: ROUTES.THEATER_DETAIL,
    element: (
      <BaseLayout>
        <TheaterDetail />
      </BaseLayout>
    ),
  },
  {
    path: ROUTES.PERSON_DETAIL,
    element: (
      <BaseLayout>
        <PersonDetail />
      </BaseLayout>
    ),
  },
  {
    path: ROUTES.BOOKING,
    element: (
      <BaseLayout>
        <Booking />
      </BaseLayout>
    ),
  },
  {
    path: ROUTES.ACCOUNT,
    element: (
      <BaseLayout>
        <ProfileUser />
      </BaseLayout>
    ),
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
];

function AppRouter() {
  const getProfile = async () => {
    const errorHandler = () => {};

    await apiCaller({
      request: userApi.getProfile(),
      errorHandler,
    });
  };

  useEffect(() => {
    getProfile();
  }, []);

  return (
    <Routes>
      {routes.map((val) => (
        <Route key={val.path} path={val.path} element={val.element} />
      ))}
    </Routes>
  );
}

export default AppRouter;
