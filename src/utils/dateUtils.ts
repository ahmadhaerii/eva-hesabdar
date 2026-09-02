import moment from "moment-jalaali";

moment.loadPersian({ dialect: "persian-modern" });

export const toPersianDate = (isoDate: string) => {
  if (!isoDate) return "";
  const m = moment(isoDate);
  return m.format("jYYYY/jMM/jDD");
};

export const toPersianDateTime = (isoDate: string) => {
  if (!isoDate) return "";
  const m = moment(isoDate);
  return m.format(" HH:mm:ss jYYYY/jMM/jDD");
};

export const toPersianDateWithMonthName = (isoDate: string) => {
  if (!isoDate) return "";
  const m = moment(isoDate);
  return m.format("jDD jMMMM jYYYY");
};

export const toPersianTime = (isoDate: string) => {
  if (!isoDate) return "";
  const m = moment(isoDate);
  return m.format("HH:mm:ss");
};

export const toPersianRelative = (isoDate: string) => {
  if (!isoDate) return "";
  const m = moment(isoDate);
  return m.fromNow();
};

export const persianDateUtils = {
  toDate: toPersianDate,
  toDateTime: toPersianDateTime,
  toDateWithMonthName: toPersianDateWithMonthName,
  toTime: toPersianTime,
  toRelative: toPersianRelative,
};
