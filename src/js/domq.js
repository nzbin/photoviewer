import {
  D as $,
  isPlainObject,
  isArray,
  isFunction,
  noop,
  find,
  closest,
  css,
  addClass,
  hasClass,
  removeClass,
  attr,
  removeAttr,
  append,
  remove,
  html,
  empty,
  width,
  height,
  scrollTop,
  scrollLeft,
  offset,
  offsetParent,
  position,
  on,
  off,
  show,
  hide,
  anim,
  animate,
  fadeTo,
  fadeIn
} from 'domq.js';

const methods = {
  isPlainObject,
  isArray,
  isFunction,
  noop
};

const fnMethods = {
  find,
  closest,
  css,
  addClass,
  hasClass,
  removeClass,
  attr,
  removeAttr,
  append,
  remove,
  empty,
  html,
  width,
  height,
  scrollTop,
  scrollLeft,
  offset,
  offsetParent,
  position,
  on,
  off,
  show,
  hide,
  anim,
  animate,
  fadeTo,
  fadeIn
};

$.extend(methods);
$.fn.extend(fnMethods);

export default $;
