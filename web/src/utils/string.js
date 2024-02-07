import { SurchargeTypes } from '../constants/values';

export const convertFromToOfFare = (from, to) => {
  if ((from !== '') & (to !== '')) {
    return `Từ ${from} đến trước ${to}`;
  } else if (from !== '') {
    return `Từ ${from}`;
  } else if (to !== '') {
    return `Trước ${to}`;
  } else {
    return '';
  }
};

export const formatVietNamCurrency = (price) => {
  return Number(price).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

export const getLabelFromSurcharge = (key, value) => {
  switch (key) {
    case SurchargeTypes.Sneakshow:
      return `Đối với những suất phim chiếu sớm: Phụ thu ${formatVietNamCurrency(value)}/vé`;
    case SurchargeTypes.Blockbuster:
      return `Đối với những phim bom tấn (Thời lượng 150 phút trở lên): Phụ thu ${formatVietNamCurrency(value)}/vé`;

    default:
      return '';
  }
};
