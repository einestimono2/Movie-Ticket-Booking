import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Button, Result } from 'antd';
import { ROUTE } from '../constants/router';
import AdminPage from '../pages/AdminPage';
import SignInPage from '../pages/SignInPage';
import SignUpPage from '../pages/SignUpPage';
import PrivateRouter from '../components/PrivateRoute';

export default function AppRouter() {
  const navigate = useNavigate();
  const routes = [
    { path: ROUTE.ADMIN, element: AdminPage, isPrivate: true },
    { path: ROUTE.SIGNIN, element: SignInPage, isPrivate: false },
    { path: ROUTE.SIGNUP, element: SignUpPage, isPrivate: false },
    {
      path: ROUTE.NOTFOUND,
      element: (
        <Result
          status="404"
          title="404"
          subTitle="Sorry, the page you visited does not exist."
          extra={
            <Button onClick={() => navigate(ROUTE.ADMIN)} type="primary">
              Back Home
            </Button>
          }
        />
      ),
      isPrivate: true,
    },
  ];
  return (
    <Routes>
      {routes.map((route) => {
        const { element: Component } = route;
        return (
          <Route
            key={route.path}
            {...route}
            element={
              route.isPrivate ? (
                <PrivateRouter>
                  <Component />
                </PrivateRouter>
              ) : (
                <Component />
              )
            }
          />
        );
      })}
    </Routes>
  );
}
