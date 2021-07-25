export const document = window.document;

/**
 * Debounce function
 * @param {Function} fn - The function will be triggered
 * @param {Number} delay - The debounce delay time
 * @return {Function}
 */
export function debounce(fn, delay) {
  let timer = null;

  return function () {
    const context = this;
    const args = arguments;

    clearTimeout(timer);

    timer = setTimeout(function () {
      fn.apply(context, args);
    }, delay);
  };
}

/**
 * Throttle function
 * @param {Function} fn - The function will be triggered
 * @param {Number} timeFrame - The throttle time frame
 * @return {Function}
 */
export function throttle(fn, timeFrame) {
  let lastTime = 0;

  return function () {
    const context = this;
    const args = arguments;

    const now = Date.now();

    if (now - lastTime >= timeFrame) {
      fn.apply(context, args);
      lastTime = now;
    }
  };
}

/**
 * Preload a image
 * @param {String} src - The image src
 * @param {Function} success - The callback of success
 * @param {Function} error - The callback of error
 */
export function preloadImage(src, success, error) {
  const img = new Image();

  img.onload = function () {
    success(img);
  };

  img.onerror = function () {
    error(img);
  };

  img.src = src;
}

/**
 * Request fullscreen
 * @param {type} element
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
 * Exit fullscreen
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
 * Get the image name from its url
 * @param {String} url - The image src
 * @return {String}
 */
export function getImageNameFromUrl(url) {
  const reg = /^.*?\/*([^/?]*)\.[a-z]+(\?.+|$)/gi;
  const txt = url.replace(reg, '$1');
  return txt;
}

/**
 * Check if the document has a scrollbar
 * @return {Boolean}
 */
export function hasScrollbar() {
  return (
    document.body.scrollHeight > (window.innerHeight || document.documentElement.clientHeight)
  );
}

/**
 * Get the scrollbar width
 * @return {Number}
 */
export function getScrollbarWidth() {
  const scrollDiv = document.createElement('div');
  scrollDiv.style.cssText = 'width: 99px; height: 99px; overflow: scroll; position: absolute; top: -9999px;';
  document.body.appendChild(scrollDiv);
  const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
  document.body.removeChild(scrollDiv);

  return scrollbarWidth;
}

/**
 * Set grab cursor when move image
 * @param {Object} imageData - The image data
 * @param {Object} stageData - The stage data
 * @param {Object} stage - The stage element
 * @param {Boolean} isRotate - The image rotated flag
 */
export function setGrabCursor(imageData, stageData, stage, isRotated) {
  const imageWidth = !isRotated ? imageData.w : imageData.h;
  const imageHeight = !isRotated ? imageData.h : imageData.w;

  if (imageHeight > stageData.h || imageWidth > stageData.w) {
    stage.addClass('is-grab');
  }
  if (imageHeight <= stageData.h && imageWidth <= stageData.w) {
    stage.removeClass('is-grab');
  }
}

/**
 * Check whether browser support touch event
 * @return {Boolean}
 */
export function supportTouch() {
  return !!(
    'ontouchstart' in window || (window.DocumentTouch && document instanceof window.DocumentTouch)
  );
}

/**
 * Check whether element is root node (`body` or `html`)
 * @return {Boolean}
 */
export function isRootNode(elem) {
  return /^(?:body|html)$/i.test(elem.nodeName);
}
