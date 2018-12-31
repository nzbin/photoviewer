import $ from './domq/index';

/**
 * [getImgSrc]
 * @param {[Object]}  el    [description]
 */
export function getImgSrc(el) {
  // Get data-src as image src at first
  let src = $(el).attr('data-src')
    ? $(el).attr('data-src')
    : $(el).attr('href');
  return src;
}

/**
 * [throttle]
 * @param  {Function} fn    [description]
 * @param  {[Number]} delay [description]
 * @return {Function}       [description]
 */
export function throttle(fn, delay) {

  let timer = null;

  return function () {
    let context = this,
      args = arguments;

    clearTimeout(timer);

    timer = setTimeout(function () {
      fn.apply(context, args);
    }, delay);
  };

}

/**
 * [preloadImg]
 * @param  {[String]}  src      [image src]
 * @param  {Function}  success  [callbacks]
 * @param  {Function}  error    [callbacks]
 */
export function preloadImg(src, success, error) {

  let img = new Image();

  img.onload = function () {
    success(img);
  };

  img.onerror = function () {
    error(img);
  };

  img.src = src;

}

/**
 * [requestFullscreen]
 * @param  {[type]} element [description]
 */
export function requestFullscreen(element) {
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen();
  }
}

/**
 * [exitFullscreen]
 */
export function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  }
}

/**
 * [getImageNameFromUrl]
 * @param  {[String]} url [description]
 * @return {[String]}     [description]
 */
export function getImageNameFromUrl(url) {
  let reg = /^.*?\/*([^/?]*)\.[a-z]+(\?.+|$)/ig,
    txt = url.replace(reg, '$1');
  return txt;
}

/**
 * [getNumFromCSSValue]
 * @param  {[String]} value [description]
 * @return {[Number]}       [description]
 */
export function getNumFromCSSValue(value) {
  let reg = /\d+/g,
    arr = value.match(reg),
    num = parseFloat(arr[0]);
  return num;
}

/**
 * [hasScrollbar]
 * @return {[Boolean]}       [description]
 */
export function hasScrollbar() {
  return document.body.scrollHeight > (window.innerHeight || document.documentElement.clientHeight);
}

/**
 * [getScrollbarWidth]
 * @return {[Number]}       [description]
 */
export function getScrollbarWidth() {

  let scrollDiv = document.createElement('div');
  scrollDiv.style.cssText = 'width: 99px; height: 99px; overflow: scroll; position: absolute; top: -9999px;';
  document.body.appendChild(scrollDiv);
  let scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
  document.body.removeChild(scrollDiv);

  return scrollbarWidth;

}

/**
 * [setGrabCursor]
 * @param {[Object]}  imageData    [description]
 * @param {[Object]}  stageData    [description]
 * @param {[Object]}  stage        [description]
 * @param {[Boolean]} isRotate     [description]
 */
export function setGrabCursor(imageData, stageData, stage, isRotated) {

  let imageWidth = !isRotated ? imageData.w : imageData.h,
    imageHeight = !isRotated ? imageData.h : imageData.w;

  if (imageHeight > stageData.h || imageWidth > stageData.w) {
    stage.addClass('is-grab');
  }
  if (imageHeight <= stageData.h && imageWidth <= stageData.w) {
    stage.removeClass('is-grab');
  }
}

/**
 * [supportTouch]
 * @return {[Boolean]}     [description]
 */
export function supportTouch() {
  return !!(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch);
}

/**
 * [fadeIn]
 */
export function fadeIn(el) {
  let opacity = 0;

  el.style.opacity = 0;
  el.style.filter = '';

  let last = +new Date();
  let tick = function () {
    opacity += (new Date() - last) / 400;
    el.style.opacity = opacity;
    el.style.filter = 'alpha(opacity=' + (100 * opacity) | 0 + ')';

    last = +new Date();

    if (opacity < 1) {
      (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16);
    }
  };

  tick();
}
