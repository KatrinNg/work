import React, {Component} from 'react';

export const normalizeWheelEventDelta = (evt) => {
  let delta = Math.sqrt(evt.deltaX * evt.deltaX + evt.deltaY * evt.deltaY);
  let angle = Math.atan2(evt.deltaY, evt.deltaX);
  if (-0.25 * Math.PI < angle && angle < 0.75 * Math.PI) {
    delta = -delta;
  }

  const MOUSE_DOM_DELTA_PIXEL_MODE = 0;
  const MOUSE_DOM_DELTA_LINE_MODE = 1;
  const MOUSE_PIXELS_PER_LINE = 30;
  const MOUSE_LINES_PER_PAGE = 30;
  const MOUSE_WHEEL_DELTA_PER_PAGE_SCALE = 3.0;

  if (evt.deltaMode === MOUSE_DOM_DELTA_PIXEL_MODE) {
    delta /= MOUSE_PIXELS_PER_LINE * MOUSE_LINES_PER_PAGE;
  } else if (evt.deltaMode === MOUSE_DOM_DELTA_LINE_MODE) {
    delta /= MOUSE_LINES_PER_PAGE;
  }

  return delta * MOUSE_WHEEL_DELTA_PER_PAGE_SCALE;
};

export const convertToBlob = (url, callback) => {
  fetch(url).then(function (response) {
      return response.blob();
  }).then((blob) => {
    const url = window.URL.createObjectURL(new Blob([blob], {type: 'application/pdf'}));
    callback(url);
  });
};