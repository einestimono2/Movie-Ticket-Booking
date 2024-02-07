import React, { useEffect } from 'react';
import { Avatar } from 'antd';
import { LogoutOutlined, HeartFilled } from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import './header.scss';
import ROUTES from '../../constants/routes';
import { userApi } from '../../apis/userApi';
import apiCaller from '../../apis/apiCaller';
import { setProfile } from '../../redux/reducer/userReducer';
import { Loading } from '../loading';
import { NO_IMAGE } from '../../constants/images';

const PRIVATE_ROUTES = ['/profile', '/booking/'];

function Header(props) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const profile = useSelector((state) => state.user.profile);

  useEffect(() => {
    dispatch(setProfile(JSON.parse(localStorage.getItem('user'))));
  }, []);

  const handleLogut = async () => {
    const errorHandler = () => {};

    await apiCaller({
      request: userApi.logout(),
      errorHandler,
    });

    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    dispatch(setProfile(undefined));

    const isPrivate = PRIVATE_ROUTES.find((route) => location.pathname.startsWith(route));
    if (isPrivate) {
      navigate('/', { replace: true });
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light border-bottom border-1 shadow z-1 sticky-top">
      <div className="container-fluid px-5 mx-3">
        <Link className="navbar-brand" to="/">
          <img src="/assets/images/logo-megacine.png" alt="" />
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="ms-4 collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 align-items-center">
            <li className="nav-item">
              <Link
                className="nav-link px-3 py-1 custom-hover custom-transition border shadow-sm rounded border-secondary bg-warning"
                to={ROUTES.SCHEDULE}
              >
                <i className="fa-solid fa-star"></i> Đặt vé
              </Link>
            </li>
            <li className="mx-2 ms-3 nav-item dropdown custom-dropdown-menu">
              <Link
                className="nav-link dropdown-toggle px-3 custom-hover custom-transition"
                to="#"
                id="navbarDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Phim
              </Link>
              <ul className="dropdown-menu dropdown-menu-no-padding" aria-labelledby="navbarDropdown">
                <li>
                  <Link className="dropdown-item py-2 custom-hover" to={ROUTES.NOW_SHOWING}>
                    Phim đang chiếu
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item py-2 custom-hover" to={ROUTES.COMING_SOON}>
                    Phim sắp chiếu
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item py-2 custom-hover" to={ROUTES.SNEAK_SHOW}>
                    Phim chiếu sớm
                  </Link>
                </li>
              </ul>
            </li>
            <li className="nav-item dropdown">
              <div
                className="nav-link dropdown-toggle cusor-pointer px-3 custom-transition custom-hover"
                onClick={() => props.open.call()}
                id="navbarDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Danh sách rạp
              </div>
              <ul
                className="dropdown-menu"
                aria-labelledby="navbarDropdown"
                style={{
                  maxHeight: '50vh',
                  overflowY: 'auto',
                  minWidth: '17.5vw',
                  padding: 0,
                  borderRadius: '6px',
                  left: '-40%',
                }}
              >
                <div style={{ width: '100%' }}>
                  {props.loading ? (
                    <li>
                      <Loading height={'100%'} />
                    </li>
                  ) : (
                    props.theaters.map((theater) => (
                      <li key={theater._id} style={{ width: '100%' }}>
                        <Link
                          className="dropdown-item py-2 custom-hover d-flex align-items-center"
                          to={`/theaters/${theater._id}`}
                        >
                          <img
                            src={theater.logo ?? NO_IMAGE}
                            style={{ height: '2rem', width: '2rem', marginRight: '0.5rem' }}
                          />
                          {theater.name}
                          {theater.isFavorited && (
                            <div className="w-100 justify-content-end h-100 text-danger d-flex align-items-center">
                              <HeartFilled style={{ fontSize: '1.25rem' }} />
                            </div>
                          )}
                        </Link>
                      </li>
                    ))
                  )}
                </div>
              </ul>
            </li>
          </ul>
          {/* <form className="d-flex">
            <input className="form-control me-2" type="search" placeholder="Từ khóa..." aria-label="Search" />
          </form> */}
          <div className="action-btn-header">
            {profile ? (
              <div className="nav-item dropdown custom-dropdown-menu-2">
                <Link
                  className="nav-link dropdown-toggle"
                  to="#"
                  id="navbarDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <Avatar
                    src={profile.avatar}
                    style={{ width: '2.75rem', height: '2.75rem', minWidth: '2.75rem', minHeight: '2.75rem' }}
                  />
                  <span className="ms-2 text-body fs-6">{profile.name}</span>
                </Link>
                <ul className="dropdown-menu dropdown-menu-no-padding" aria-labelledby="navbarDropdown">
                  <li>
                    <Link className="dropdown-item cusor-pointer py-2 custom-hover" to={ROUTES.ACCOUNT}>
                      <i className="fa-solid fa-id-card me-1"></i> Tài khoản
                    </Link>
                  </li>
                  <li>
                    <p className="dropdown-item cusor-pointer py-2 mb-0 custom-hover" onClick={() => handleLogut()}>
                      <LogoutOutlined className="me-2" style={{ fontSize: '1.2rem' }} />
                      Đăng xuất
                    </p>
                  </li>
                </ul>
              </div>
            ) : (
              <Link
                className="nav-link border shadow-sm border-secondary rounded btn"
                // to={ROUTES.LOGIN}
                to="#"
                // state={{ previousPath: pathname }}
                onClick={props.onLoginClick}
              >
                <i className="fa-solid fa-right-to-bracket me-1 fs-6" /> Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Header;
