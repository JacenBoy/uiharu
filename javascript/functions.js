export const toFahrenheit = (celsius) => {
  return (celsius * (9/5)) + 32;
};

export const toGallons = (liters) => {
  return liters * 0.26417;
};

export const toMPH = (mps) => {
  return mps * 2.237;
};

export const toMins = (secs) => {
  return `${`${Math.floor(secs / 60)}`.padStart(1, "0")}:${`${secs % 60}`.padStart(2, "0")}`;
};