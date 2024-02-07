import React from 'react';
import './style.css';
import { Button, Menu } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faFilm,
  faUserGear,
  faChartLine,
  faListUl,
  faShapes,
  faCheck,
  faPlus,
  faMapLocation,
  faTags,
  faDollarSign,
  faHouseChimney,
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import RoomPage from '../RoomPage';
import MoviePage from '../MoviePage';
import ProductPage from '../ProductPage';
import DashboardAdmin from '../../components/Dashboard/Admin';
import DashboardManager from '../../components/Dashboard/Manager';
import apiCaller from '../../apis/apiCaller';
import { authApi } from '../../apis/all/authApi';
import { ROUTE } from '../../constants/router';
import UserPage from '../UserPage';
import CategoryPage from '../CategoryPage';
import PromotionPage from '../PromotionPage';
import ShowtimePage from '../ShowtimePage';
import ReviewPage from '../ReviewPage';
import ManagerPage from '../ManagerPage';
import { addSelectedKey } from '../../redux/reducer/adminSlide';
import GenrePeoplePage from '../GenrePeoplePage';
import MapPage from '../MapPage';
import FarePage from '../FarePage';
import MytheaterPage from '../MytheaterPage';

function getItem(label, key, icon, children, type) {
  return {
    key,
    icon,
    children,
    label,
    type,
  };
}
export default function AdminPage() {
  const dispatch = useDispatch();
  const selectedKey = useSelector((state) => state.admin.selectedKey);
  const path = useParams().id;
  const handleMenuClick = (key) => {
    dispatch(addSelectedKey({ selectedKey: key }));
  };
  const access_token = localStorage.getItem('admin_access_token');
  const navigate = useNavigate();
  const renderAdminPage = (key) => {
    switch (key) {
      case '1':
        return <DashboardAdmin />;
      case '2':
        return <UserPage />;
      case '3':
        return <ManagerPage mode="approval" />;
      case '4':
        return <ManagerPage mode="list" />;
      case '5':
        return <MoviePage />;
      case '6':
        return <GenrePeoplePage />;
      case '7':
        return <MapPage />;
      default:
        return <></>;
    }
  };
  const itemsAdmin = [
    getItem('Dashboard', '1', <FontAwesomeIcon icon={faChartLine} />),
    getItem('Users', '2', <FontAwesomeIcon icon={faUser} />),
    getItem('Managers', 'sub1', <FontAwesomeIcon icon={faUserGear} />, [
      getItem('Approval', '3', <FontAwesomeIcon icon={faCheck} />),
      getItem('List Manager', '4', <FontAwesomeIcon icon={faListUl} />),
    ]),
    getItem('Movies', '5', <FontAwesomeIcon icon={faFilm} />),
    getItem('Genres & People', '6', <FontAwesomeIcon icon={faShapes} />),
    getItem('Maps', '7', <FontAwesomeIcon icon={faMapLocation} />),
  ];
  const renderManagerPage = (key) => {
    switch (key) {
      case '1':
        return <DashboardManager />;
      case '2':
        return <MytheaterPage />;
      case '3':
        return <RoomPage />;
      case '4':
        return <PromotionPage />;
      case '5':
        return <ProductPage />;
      case '6':
        return <ShowtimePage />;
      case '7':
        return <ReviewPage />;
      case '8':
        return <FarePage />;
      default:
        return <></>;
    }
  };
  const itemsManager = [
    getItem('Dashboard', '1', <FontAwesomeIcon icon={faChartLine} />),
    getItem('My Theater', '2', <FontAwesomeIcon icon={faHouseChimney} />),
    getItem('Rooms', '3', <FontAwesomeIcon icon={faUser} />),
    getItem('Promotions', '4', <FontAwesomeIcon icon={faTags} />),
    getItem('Products', '5', <FontAwesomeIcon icon={faFilm} />),
    getItem('Showtime', '6', <FontAwesomeIcon icon={faUserGear} />),
    getItem('Reviews', '7', <FontAwesomeIcon icon={faUser} />),
    getItem('Fares', '8', <FontAwesomeIcon icon={faDollarSign} />),
  ];
  const logOut = async () => {
    const errorHandler = (error) => {
      console.log('Fail: ', error);
    };
    const response = await apiCaller({
      request: authApi.logout(access_token),
      errorHandler,
    });
    if (response) {
      localStorage.removeItem('admin_access_token');
      localStorage.removeItem('admin_refresh_token');
      localStorage.removeItem('admin_user');
      navigate(`../${ROUTE.SIGNIN}`, { replace: true });
    }
  };
  return (
    <div className="grid grid-cols-5 ">
      <div className="col-span-1 menu flex flex-col justify-between h-[100vh]">
        <div>
          <p className="m-0 text-3xl p-5 font-bold text-blue-500"># {path === 'admin' ? 'ADMIN' : 'MANAGER'}</p>
          {path === 'manager' ? <div /> : null}
          <Menu
            className="custom-menu"
            mode="inline"
            items={path === 'admin' ? itemsAdmin : itemsManager}
            selectedKeys={[selectedKey]}
            onClick={({ key }) => handleMenuClick(key)}
          />
        </div>
        <Button type="primary" size="large" onClick={logOut} className="m-4">
          Đăng xuất
        </Button>
      </div>
      <div className="col-span-4 p-5">
        {path === 'admin' ? renderAdminPage(selectedKey) : renderManagerPage(selectedKey)}
      </div>
    </div>
  );
}