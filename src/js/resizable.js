import $ from './domq.js';
import {
  $D,
  TOUCH_START_EVENT,
  TOUCH_MOVE_EVENT,
  TOUCH_END_EVENT,
  NS,
  EVENT_NS,
  PUBLIC_VARS
} from './constants';
import { isBorderBox, setGrabCursor, getImageScale } from './utilities';

const ELEMS_WITH_RESIZE_CURSOR = `html, body, .${NS}-modal, .${NS}-stage, .${NS}-button`;

/**
 * Modal resizable
 *
 * 1. Can be resized in 8 directions
 * 2. Keep image in stage center
 * 3. Other restrictions for image
 *
 * @param {object} $modal - The modal element of domq
 * @param {object} $stage - The stage element of domq
 * @param {object} $image - The image element of domq
 * @param {object} options - The options of PhotoViewer
 */
export function resizable($modal, $stage, $image, options) {
  const resizableHandleE = $(`<div class="${NS}-resizable-handle ${NS}-resizable-handle-e"></div>`);
  const resizableHandleW = $(`<div class="${NS}-resizable-handle ${NS}-resizable-handle-w"></div>`);
  const resizableHandleS = $(`<div class="${NS}-resizable-handle ${NS}-resizable-handle-s"></div>`);
  const resizableHandleN = $(`<div class="${NS}-resizable-handle ${NS}-resizable-handle-n"></div>`);
  const resizableHandleSE = $(`<div class="${NS}-resizable-handle ${NS}-resizable-handle-se"></div>`);
  const resizableHandleSW = $(`<div class="${NS}-resizable-handle ${NS}-resizable-handle-sw"></div>`);
  const resizableHandleNE = $(`<div class="${NS}-resizable-handle ${NS}-resizable-handle-ne"></div>`);
  const resizableHandleNW = $(`<div class="${NS}-resizable-handle ${NS}-resizable-handle-nw"></div>`);

  const resizableHandles = {
    e: resizableHandleE,
    s: resizableHandleS,
    se: resizableHandleSE,
    n: resizableHandleN,
    w: resizableHandleW,
    nw: resizableHandleNW,
    ne: resizableHandleNE,
    sw: resizableHandleSW
  };

  $modal.append(
    resizableHandleE,
    resizableHandleW,
    resizableHandleS,
    resizableHandleN,
    resizableHandleSE,
    resizableHandleSW,
    resizableHandleNE,
    resizableHandleNW
  );

  let startX = 0;
  let startY = 0;
  let modalData = { w: 0, h: 0, x: 0, y: 0 };
  let stageData = { w: 0, h: 0, x: 0, y: 0 };
  let imageData = { w: 0, h: 0, x: 0, y: 0 };
  // δ is the difference between image width and height
  let δ = 0;
  let imgFrameWidth = 0;
  let imgFrameHeight = 0;
  let direction = '';

  const { modalWidth: minModalWidth, modalHeight: minModalHeight } = options;

  // Modal CSS
  const getModalCSS = (dir, offsetX, offsetY) => {
    // Modal shouldn't move when its width to the min-width
    const modalLeft = -offsetX + modalData.w > minModalWidth
      ? offsetX + modalData.x
      : modalData.x + modalData.w - minModalWidth;
    const modalTop = -offsetY + modalData.h > minModalHeight
      ? offsetY + modalData.y
      : modalData.y + modalData.h - minModalHeight;

    const dirsCSS = {
      e: {
        width: Math.max(offsetX + modalData.w, minModalWidth)
      },
      s: {
        height: Math.max(offsetY + modalData.h, minModalHeight)
      },
      se: {
        width: Math.max(offsetX + modalData.w, minModalWidth),
        height: Math.max(offsetY + modalData.h, minModalHeight)
      },
      w: {
        width: Math.max(-offsetX + modalData.w, minModalWidth),
        left: modalLeft
      },
      n: {
        height: Math.max(-offsetY + modalData.h, minModalHeight),
        top: modalTop
      },
      nw: {
        width: Math.max(-offsetX + modalData.w, minModalWidth),
        height: Math.max(-offsetY + modalData.h, minModalHeight),
        top: modalTop,
        left: modalLeft
      },
      ne: {
        width: Math.max(offsetX + modalData.w, minModalWidth),
        height: Math.max(-offsetY + modalData.h, minModalHeight),
        top: modalTop
      },
      sw: {
        width: Math.max(-offsetX + modalData.w, minModalWidth),
        height: Math.max(offsetY + modalData.h, minModalHeight),
        left: modalLeft
      }
    };

    return dirsCSS[dir];
  };

  // Image CSS
  const getImageCSS = (dir, offsetX, offsetY) => {
    // Image shouldn't move when modal width to the min-width
    // The min-width is modal width, so we should clac the stage min-width
    const widthDiff = offsetX + modalData.w > minModalWidth
      ? stageData.w - imgFrameWidth + offsetX - δ
      : minModalWidth - (modalData.w - stageData.w) - imgFrameWidth - δ;
    const heightDiff = offsetY + modalData.h > minModalHeight
      ? stageData.h - imgFrameHeight + offsetY + δ
      : minModalHeight - (modalData.h - stageData.h) - imgFrameHeight + δ;
    const widthDiff2 = -offsetX + modalData.w > minModalWidth
      ? stageData.w - imgFrameWidth - offsetX - δ
      : minModalWidth - (modalData.w - stageData.w) - imgFrameWidth - δ;
    const heightDiff2 = -offsetY + modalData.h > minModalHeight
      ? stageData.h - imgFrameHeight - offsetY + δ
      : minModalHeight - (modalData.h - stageData.h) - imgFrameHeight + δ;

    // Get the image position on resizing
    const $imageLeft = $image.position().left;
    const $imageTop = $image.position().top;
    const imgLeft = (widthDiff > 0 ? $imageLeft : Math.min($imageLeft, 0)) - δ;
    const imgTop = (heightDiff > 0 ? $imageTop : Math.min($imageTop, 0)) + δ;
    const imgLeft2 = (widthDiff2 > 0 ? $imageLeft : Math.min($imageLeft, 0)) - δ;
    const imgTop2 = (heightDiff2 > 0 ? $imageTop : Math.min($imageTop, 0)) + δ;

    const dirsCSS = {
      e: {
        left: widthDiff >= -δ ? (widthDiff - δ) / 2 : Math.max(imgLeft, widthDiff)
      },
      s: {
        top: heightDiff >= δ ? (heightDiff + δ) / 2 : Math.max(imgTop, heightDiff)
      },
      se: {
        top: heightDiff >= δ ? (heightDiff + δ) / 2 : Math.max(imgTop, heightDiff),
        left: widthDiff >= -δ ? (widthDiff - δ) / 2 : Math.max(imgLeft, widthDiff)
      },
      w: {
        left: widthDiff2 >= -δ ? (widthDiff2 - δ) / 2 : Math.max(imgLeft2, widthDiff2)
      },
      n: {
        top: heightDiff2 >= δ ? (heightDiff2 + δ) / 2 : Math.max(imgTop2, heightDiff2)
      },
      nw: {
        top: heightDiff2 >= δ ? (heightDiff2 + δ) / 2 : Math.max(imgTop2, heightDiff2),
        left: widthDiff2 >= -δ ? (widthDiff2 - δ) / 2 : Math.max(imgLeft2, widthDiff2)
      },
      ne: {
        top: heightDiff2 >= δ ? (heightDiff2 + δ) / 2 : Math.max(imgTop2, heightDiff2),
        left: widthDiff >= -δ ? (widthDiff - δ) / 2 : Math.max(imgLeft, widthDiff)
      },
      sw: {
        top: heightDiff >= δ ? (heightDiff + δ) / 2 : Math.max(imgTop, heightDiff),
        left: widthDiff2 >= -δ ? (widthDiff2 - δ) / 2 : Math.max(imgLeft2, widthDiff2)
      }
    };

    return dirsCSS[dir];
  };

  const dragStart = (dir, e) => {
    e = e || window.event;

    e.preventDefault();

    PUBLIC_VARS['isResizing'] = true;

    startX = e.type === 'touchstart' ? e.targetTouches[0].pageX : e.clientX;
    startY = e.type === 'touchstart' ? e.targetTouches[0].pageY : e.clientY;

    // Reclac the modal data when mousedown
    modalData = {
      w: $modal.width() + (isBorderBox($modal) ? this._modalEdgeValue.horizontal : 0),
      h: $modal.height() + (isBorderBox($modal) ? this._modalEdgeValue.vertical : 0),
      x: $modal.position().left,
      y: $modal.position().top
    };

    stageData = {
      w: $stage.width(),
      h: $stage.height(),
      x: $stage.position().left,
      y: $stage.position().top
    };

    imageData = {
      w: $image.width(),
      h: $image.height(),
      x: $image.position().left,
      y: $image.position().top
    };

    // δ is the difference between image width and height
    δ = !this.isRotated ? 0 : (imageData.w - imageData.h) / 2;
    imgFrameWidth = !this.isRotated ? imageData.w : imageData.h;
    imgFrameHeight = !this.isRotated ? imageData.h : imageData.w;

    direction = dir;

    // Add the resizable cursor
    $(ELEMS_WITH_RESIZE_CURSOR).css('cursor', dir + '-resize');

    $D.on(TOUCH_MOVE_EVENT + EVENT_NS, dragMove)
      .on(TOUCH_END_EVENT + EVENT_NS, dragEnd);
  };

  const dragMove = e => {
    e = e || window.event;

    e.preventDefault();

    if (!this.isMaximized) {
      const endX = e.type === 'touchmove' ? e.targetTouches[0].pageX : e.clientX;
      const endY = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.clientY;
      const relativeX = endX - startX;
      const relativeY = endY - startY;

      const modalCSS = getModalCSS(direction, relativeX, relativeY);

      $modal.css(modalCSS);

      const imageCSS = getImageCSS(direction, relativeX, relativeY);

      $image.css(imageCSS);
    }
  };

  const dragEnd = () => {
    $D.off(TOUCH_MOVE_EVENT + EVENT_NS, dragMove)
      .off(TOUCH_END_EVENT + EVENT_NS, dragEnd);

    // Reclac the stage size because it has changed
    const stageWidth = $stage.width();
    const stageHeight = $stage.height();

    if (PUBLIC_VARS['isResizing']) {
      setGrabCursor(
        { w: imgFrameWidth, h: imgFrameHeight },
        { w: stageWidth, h: stageHeight },
        $stage
      );
    }
    PUBLIC_VARS['isResizing'] = false;

    // Remove the resizable cursor
    $(ELEMS_WITH_RESIZE_CURSOR).css('cursor', '');

    // Update the image initial data
    const { originalWidth: imgOriginalWidth, originalHeight: imgOriginalHeight } = this.imageData;
    const scale = getImageScale(imgOriginalWidth, imgOriginalHeight, stageWidth, stageHeight, this.isRotated);
    const imgInitWidth = imgOriginalWidth * scale;
    const imgInitHeight = imgOriginalHeight * scale;

    $.extend(this.imageData, {
      initWidth: imgInitWidth,
      initHeight: imgInitHeight,
      initLeft: (stageWidth - imgInitWidth) / 2,
      initTop: (stageHeight - imgInitHeight) / 2
    });
  };

  $.each(resizableHandles, function (dir, handle) {
    handle.on(TOUCH_START_EVENT + EVENT_NS, function (e) {
      dragStart(dir, e);
    });
  });
}
