import dayjs from 'dayjs';
import { default as lte } from 'dayjs/plugin/isSameOrBefore';
import relativeTime from 'dayjs/plugin/relativeTime';

import { DayOfWeek } from '../constants/values';

dayjs.extend(lte);

export const getVietNamFormatDate = (date, showTime = true) => {
  const _format = showTime ? 'HH:mm DD/MM/YYYY' : 'DD/MM/YYYY';

  return dayjs(date).format(_format);
};

export const getNameOfDayOfWeek = (date) => {
  return DayOfWeek[dayjs(date).day()];
};

export const getListOfConsecutiveShowtimes = (startDate, endDate) => {
  if (!startDate || !endDate) return;

  const showtimes = [
    {
      date: dayjs(startDate).format('DD/MM'),
      name: getNameOfDayOfWeek(startDate),
      value: dayjs(startDate).format('YYYY-MM-DD'),
    },
  ];

  const diff = dayjs(endDate).diff(startDate, 'day');
  for (let idx = 1; idx <= diff; idx++) {
    const _date = dayjs(startDate).add(idx, 'day');
    showtimes.push({
      date: dayjs(_date).format('DD/MM'),
      name: getNameOfDayOfWeek(_date),
      value: dayjs(_date).format('YYYY-MM-DD'),
    });
  }

  return showtimes;
};

export const getTemplateOfDate = (date, template) => {
  return dayjs(date).format(template);
};

export const addAmountOfTime = (date, amount) => {
  const splittedArray = amount.match(new RegExp('([0-9]+)|([a-zA-Z]+)', 'g'));

  return dayjs(date).add(splittedArray[0], splittedArray[1]);
};

export const getTimeAgo = (date) => {
  dayjs.extend(relativeTime);
  return dayjs(date).fromNow();
};

export const getUnixTimestamp = (date) => {
  return dayjs(date).unix();
};
