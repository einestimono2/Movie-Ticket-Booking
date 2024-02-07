import { store } from '../redux/store';

import { NotificationCard } from '../components/notification-card';
import { openLogin } from '../redux/reducer/authReducer';
import { TICKET_BOOKING_CLOSING_TIME } from '../constants/booking';
import { addAmountOfTime, getTemplateOfDate } from './date';

export const isAuthenticated = ({ onSuccess }) => {
  const user = JSON.parse(localStorage.getItem('user'));

  if (user) {
    onSuccess.call();
  } else {
    NotificationCard({
      title: 'Đăng nhập để thực hiện yêu cầu!',
      reverseButtons: true,
      denyText: 'Hủy bỏ',
      confirmText: 'Đăng nhập',
      onConfirm: () => store.dispatch(openLogin(true)),
      onDeny: () => {},
      onOther: () => {},
    });
  }
};

export const checkCanBooking = ({ time, onSuccess, onError }) => {
  // const now = '2024-01-20T14:35:06.370Z';
  const now = Date.now();

  const showtimeTime = getTemplateOfDate(time, 'YYYY-MM-DD HH:mm');
  const targetTime = getTemplateOfDate(addAmountOfTime(now, TICKET_BOOKING_CLOSING_TIME), 'YYYY-MM-DD HH:mm');

  const canBooking = showtimeTime >= targetTime;

  if (!canBooking) {
    NotificationCard({
      type: 'warning',
      title: 'Sắp tới giờ chiếu!',
      content: `Thời gian an toàn để mua vé trực tuyến là ${
        TICKET_BOOKING_CLOSING_TIME.match(new RegExp('([0-9]+)|([a-zA-Z]+)', 'g'))[0]
      } phút trước giờ chiếu. Nếu bạn vẫn tiếp tục muốn đặt vé, chúng tôi không hỗ trợ giải quyết các vấn đề liên quan.`,
      reverseButtons: true,
      denyText: 'Hủy bỏ',
      confirmText: 'Tiếp tục',
      onConfirm: () => onSuccess?.call(),
      onDeny: () => onError?.call(),
      onOther: () => onError?.call(),
    });
  } else onSuccess?.call();
};
