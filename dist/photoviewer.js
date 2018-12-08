
/*!
 *  ____  _   _  ___  _____  ___  _   _ _____ ____ _    _ ____ ____
 * |  _ \| | | |/ _ \|_   _|/ _ \| | | |_   _|  __| |  | |  __|  _ \
 * | |_| | |_| | | | | | | | | | | | | | | | | |__| |  | | |__| |_| |
 * |  __/|  _  | | | | | | | | | | |_| | | | |  __| |/\| |  __|    /
 * | |   | | | | |_| | | | | |_| |\   / _| |_| |__|  /\  | |__| |\ \
 * |_|   |_| |_|\___/  |_|  \___/  \_/ |_____|____|_/  \_|____|_| \_\
 *
 * photoviewer - v2.2.0
 * A JS plugin to view images just like in Windows
 * https://github.com/nzbin/photoviewer#readme
 *
 * Copyright (c) 2018 nzbin
 * Released under MIT License
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('jquery')) :
  typeof define === 'function' && define.amd ? define(['jquery'], factory) :
  (global.photoviewer = factory(global.jQuery));
}(this, (function ($$1) { 'use strict';

  $$1 = $$1 && $$1.hasOwnProperty('default') ? $$1['default'] : $$1;

  var DEFAULTS = {
    // Enable modal to drag
    draggable: true,
    // Enable modal to resize
    resizable: true,
    // Enable image to move
    movable: true,
    // Enable keyboard navigation
    keyboard: true,
    // Shows the title
    title: true,
    // Min width of modal
    modalWidth: 320,
    // Min height of modal
    modalHeight: 320,
    // Enable the page content fixed
    fixedContent: true,
    // Disable the modal size fixed
    fixedModalSize: false,
    // Disable the image viewer maximized on init
    initMaximized: false,
    // Threshold of modal to browser window
    gapThreshold: 0.02,
    // Threshold of image ratio
    ratioThreshold: 0.1,
    // Min ratio of image when zoom out
    minRatio: 0.05,
    // Max ratio of image when zoom in
    maxRatio: 16,
    // Toolbar options in header
    headToolbar: ['maximize', 'close'],
    // Toolbar options in footer
    footToolbar: ['zoomIn', 'zoomOut', 'prev', 'fullscreen', 'next', 'actualSize', 'rotateRight'],
    // Customize button icon
    icons: {
      minimize: "<svg viewBox=\"0 0 24 24\" class=\"svg-inline-icon\">\n               <path fill=\"currentColor\" d=\"M20,14H4V10H20\"></path>\n               </svg>",
      maximize: "<svg viewBox=\"0 0 24 24\" class=\"svg-inline-icon\">\n               <path fill=\"currentColor\" d=\"M4,4H20V20H4V4M6,8V18H18V8H6Z\"></path>\n               </svg>",
      close: "<svg viewBox=\"0 0 24 24\" class=\"svg-inline-icon\">\n            <path fill=\"currentColor\" d=\"M13.46,12L19,17.54V19H17.54L12,13.46\n            L6.46,19H5V17.54L10.54,12L5,6.46V5H6.46L12,10.54L17.54,5H19V6.46\n            L13.46,12Z\"></path>\n            </svg>",
      zoomIn: "<svg viewBox=\"0 0 24 24\" class=\"svg-inline-icon\">\n             <path fill=\"currentColor\" d=\"M15.5,14L20.5,19L19,20.5L14,15.5V14.71\n             L13.73,14.43C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,\n             6.5 0 0,1 9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.43,\n             13.73L14.71,14H15.5M9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5C7,5 5,\n             7 5,9.5C5,12 7,14 9.5,14M12,10H10V12H9V10H7V9H9V7H10V9H12V10Z\"></path>\n            </svg>",
      zoomOut: "<svg viewBox=\"0 0 24 24\" class=\"svg-inline-icon\">\n              <path fill=\"currentColor\" d=\"M15.5,14H14.71L14.43,13.73C15.41,\n              12.59 16,11.11 16,9.5A6.5,6.5 0 0,0 9.5,3A6.5,6.5 0 0,0 3,9.5A6.5,\n              6.5 0 0,0 9.5,16C11.11,16 12.59,15.41 13.73,14.43L14,14.71V15.5\n              L19,20.5L20.5,19L15.5,14M9.5,14C7,14 5,12 5,9.5C5,7 7,5 9.5,5C12,\n              5 14,7 14,9.5C14,12 12,14 9.5,14M7,9H12V10H7V9Z\"></path>\n              </svg>",
      prev: "<svg viewBox=\"0 0 24 24\" class=\"svg-inline-icon\">\n           <path fill=\"currentColor\" d=\"M6,18V6H8V18H6M9.5,12L18,6V18L9.5,12Z\"></path>\n           </svg>",
      next: "<svg viewBox=\"0 0 24 24\" class=\"svg-inline-icon\">\n           <path fill=\"currentColor\" d=\"M16,18H18V6H16M6,18L14.5,12L6,6V18Z\"></path>\n           </svg>",
      fullscreen: "<svg viewBox=\"0 0 24 24\" class=\"svg-inline-icon\">\n                 <path fill=\"currentColor\" d=\"M8.5,12.5L11,15.5L14.5,11L19,17H5\n                 M23,18V6A2,2 0 0,0 21,4H3A2,2 0 0,0 1,6V18A2,2 0 0,0 3,20H21A2,\n                 2 0 0,0 23,18Z\"></path>\n                 </svg>",
      actualSize: "<svg viewBox=\"0 0 24 24\" class=\"svg-inline-icon\">\n                 <path fill=\"currentColor\" d=\"M9.5,13.09L10.91,14.5L6.41,19H10V21\n                 H3V14H5V17.59L9.5,13.09M10.91,9.5L9.5,10.91L5,6.41V10H3V3H10V5\n                 H6.41L10.91,9.5M14.5,13.09L19,17.59V14H21V21H14V19H17.59L13.09,\n                 14.5L14.5,13.09M13.09,9.5L17.59,5H14V3H21V10H19V6.41L14.5,10.91\n                 L13.09,9.5Z\"></path>\n                </svg>",
      rotateLeft: "<svg viewBox=\"0 0 24 24\" class=\"svg-inline-icon\">\n                 <path fill=\"currentColor\" d=\"M13,4.07V1L8.45,5.55L13,10V6.09\n                 C15.84,6.57 18,9.03 18,12C18,14.97 15.84,17.43 13,17.91V19.93\n                 C16.95,19.44 20,16.08 20,12C20,7.92 16.95,4.56 13,4.07M7.1,18.32\n                 C8.26,19.22 9.61,19.76 11,19.93V17.9C10.13,17.75 9.29,17.41 8.54,\n                 16.87L7.1,18.32M6.09,13H4.07C4.24,14.39 4.79,15.73 5.69,16.89\n                 L7.1,15.47C6.58,14.72 6.23,13.88 6.09,13M7.11,8.53L5.7,7.11C4.8,\n                 8.27 4.24,9.61 4.07,11H6.09C6.23,10.13 6.58,9.28 7.11,8.53Z\"></path>\n                 </svg>",
      rotateRight: "<svg viewBox=\"0 0 24 24\" class=\"svg-inline-icon\">\n                  <path fill=\"currentColor\" d=\"M16.89,15.5L18.31,16.89C19.21,\n                  15.73 19.76,14.39 19.93,13H17.91C17.77,13.87 17.43,14.72 16.89,\n                  15.5M13,17.9V19.92C14.39,19.75 15.74,19.21 16.9,18.31L15.46,\n                  16.87C14.71,17.41 13.87,17.76 13,17.9M19.93,11C19.76,9.61 19.21,\n                  8.27 18.31,7.11L16.89,8.53C17.43,9.28 17.77,10.13 17.91,11M15.55,\n                  5.55L11,1V4.07C7.06,4.56 4,7.92 4,12C4,16.08 7.05,19.44 11,19.93\n                  V17.91C8.16,17.43 6,14.97 6,12C6,9.03 8.16,6.57 11,6.09V10L15.55,\n                  5.55Z\"></path>\n                  </svg>"
    },
    // Customize language of button title
    i18n: {
      minimize: 'minimize',
      maximize: 'maximize',
      close: 'close',
      zoomIn: 'zoom-in(+)',
      zoomOut: 'zoom-out(-)',
      prev: 'prev(←)',
      next: 'next(→)',
      fullscreen: 'fullscreen',
      actualSize: 'actual-size(Ctrl+Alt+0)',
      rotateLeft: 'rotate-left(Ctrl+,)',
      rotateRight: 'rotate-right(Ctrl+.)'
    },
    // Enable multiple instances
    multiInstances: true,
    // Enable animation
    initAnimation: true,
    // Disable modal position fixed when change images
    fixedModalPos: false,
    // Modal z-index
    zIndex: 1090,
    // Selector of drag handler
    dragHandle: false,
    // Callback events
    callbacks: {
      beforeOpen: $.noop,
      opened: $.noop,
      beforeClose: $.noop,
      closed: $.noop,
      beforeChange: $.noop,
      changed: $.noop
    },
    // Start images index
    index: 0,
    // Load the image progressively
    progressiveLoading: true
  };

  /**
   * [getImgSrc]
   * @param {[Object]}  el    [description]
   */
  function getImgSrc(el) {
    // Get data-src as image src at first
    var src = $(el).attr('data-src') ? $(el).attr('data-src') : $(el).attr('href');
    return src;
  }
  /**
   * [throttle]
   * @param  {Function} fn    [description]
   * @param  {[Number]} delay [description]
   * @return {Function}       [description]
   */

  function throttle(fn, delay) {
    var timer = null;
    return function () {
      var context = this,
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

  function preloadImg(src, success, error) {
    var img = new Image();

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

  function requestFullscreen(element) {
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
   * [getImageNameFromUrl]
   * @param  {[String]} url [description]
   * @return {[String]}     [description]
   */

  function getImageNameFromUrl(url) {
    var reg = /^.*?\/*([^/?]*)\.[a-z]+(\?.+|$)/ig,
        txt = url.replace(reg, '$1');
    return txt;
  }
  /**
   * [getNumFromCSSValue]
   * @param  {[String]} value [description]
   * @return {[Number]}       [description]
   */

  function getNumFromCSSValue(value) {
    var reg = /\d+/g,
        arr = value.match(reg),
        num = parseFloat(arr[0]);
    return num;
  }
  /**
   * [hasScrollbar]
   * @return {[Boolean]}       [description]
   */

  function hasScrollbar() {
    return document.body.scrollHeight > (window.innerHeight || document.documentElement.clientHeight);
  }
  /**
   * [getScrollbarWidth]
   * @return {[Number]}       [description]
   */

  function getScrollbarWidth() {
    var scrollDiv = document.createElement('div');
    scrollDiv.style.cssText = 'width: 99px; height: 99px; overflow: scroll; position: absolute; top: -9999px;';
    document.body.appendChild(scrollDiv);
    var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
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

  function setGrabCursor(imageData, stageData, stage, isRotated) {
    var imageWidth = !isRotated ? imageData.w : imageData.h,
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

  function supportTouch() {
    return !!('ontouchstart' in window || window.DocumentTouch && document instanceof DocumentTouch);
  }

  var $W = $(window);
  var $D = $(document);
  var CLICK_EVENT = 'click';
  var RESIZE_EVENT = 'resize';
  var KEYDOWN_EVENT = 'keydown';
  var WHEEL_EVENT = 'wheel mousewheel DOMMouseScroll';
  var TOUCH_START_EVENT = supportTouch() ? 'touchstart' : 'mousedown';
  var TOUCH_MOVE_EVENT = supportTouch() ? 'touchmove' : 'mousemove';
  var TOUCH_END_EVENT = supportTouch() ? 'touchend' : 'mouseup';
  var NS = 'photoviewer';
  var CLASS_NS = '.' + NS;
  var EVENT_NS = '.' + NS;
  var PUBLIC_VARS = {
    // image moving flag
    isMoving: false,
    // modal resizing flag
    isResizing: false,
    // modal z-index setting
    zIndex: DEFAULTS.zIndex
  };

  var draggable = {
    /**
     * [draggable]
     * @param  {[Object]} modal       [the modal element]
     * @param  {[Object]} dragHandle  [the handle element when dragging]
     * @param  {[Object]} dragCancel  [the cancel element when dragging]
     */
    draggable: function draggable(modal, dragHandle, dragCancel) {
      var _this = this;

      var isDragging = false;
      var startX = 0,
          startY = 0,
          left = 0,
          top = 0;

      var dragStart = function dragStart(e) {
        e = e || window.event; // Must be removed
        // e.preventDefault();

        if (_this.options.multiInstances) {
          modal.css('z-index', ++PUBLIC_VARS['zIndex']);
        } // Get clicked button


        var elemCancel = $(e.target).closest(dragCancel); // Stop modal moving when click buttons

        if (elemCancel.length) {
          return true;
        }

        isDragging = true;
        startX = e.type === 'touchstart' ? e.originalEvent.targetTouches[0].pageX : e.clientX;
        startY = e.type === 'touchstart' ? e.originalEvent.targetTouches[0].pageY : e.clientY;
        left = $(modal).offset().left;
        top = $(modal).offset().top;
        $D.on(TOUCH_MOVE_EVENT + EVENT_NS, dragMove).on(TOUCH_END_EVENT + EVENT_NS, dragEnd);
      };

      var dragMove = function dragMove(e) {
        e = e || window.event;
        e.preventDefault();

        if (isDragging && !PUBLIC_VARS['isMoving'] && !PUBLIC_VARS['isResizing'] && !_this.isMaximized) {
          var endX = e.type === 'touchmove' ? e.originalEvent.targetTouches[0].pageX : e.clientX,
              endY = e.type === 'touchmove' ? e.originalEvent.targetTouches[0].pageY : e.clientY,
              relativeX = endX - startX,
              relativeY = endY - startY;
          $(modal).css({
            left: relativeX + left + 'px',
            top: relativeY + top + 'px'
          });
        }
      };

      var dragEnd = function dragEnd() {
        $D.off(TOUCH_MOVE_EVENT + EVENT_NS, dragMove).off(TOUCH_END_EVENT + EVENT_NS, dragEnd);
        isDragging = false;
      };

      $(dragHandle).on(TOUCH_START_EVENT + EVENT_NS, dragStart);
    }
  };

  var ELEMS_WITH_GRABBING_CURSOR = "html,body,." + NS + "-modal,." + NS + "-stage,." + NS + "-button,." + NS + "-resizable-handle";
  var movable = {
    /**
     * --------------------------------------
     * 1.no movable
     * 2.vertical movable
     * 3.horizontal movable
     * 4.vertical & horizontal movable
     * --------------------------------------
     *
     * [image movable]
     * @param  {[Object]} stage   [the stage element]
     * @param  {[Object]} image   [the image element]
     */
    movable: function movable(stage, image) {
      var _this = this;

      var isDragging = false;
      var startX = 0,
          startY = 0,
          left = 0,
          top = 0,
          widthDiff = 0,
          heightDiff = 0,
          δ = 0;

      var dragStart = function dragStart(e) {
        e = e || window.event;
        e.preventDefault();
        var imageWidth = $(image).width(),
            imageHeight = $(image).height(),
            stageWidth = $(stage).width(),
            stageHeight = $(stage).height();
        startX = e.type === 'touchstart' ? e.originalEvent.targetTouches[0].pageX : e.clientX;
        startY = e.type === 'touchstart' ? e.originalEvent.targetTouches[0].pageY : e.clientY; // δ is the difference between image width and height

        δ = !_this.isRotated ? 0 : (imageWidth - imageHeight) / 2; // Width or height difference can be use to limit image right or top position

        widthDiff = !_this.isRotated ? imageWidth - stageWidth : imageHeight - stageWidth;
        heightDiff = !_this.isRotated ? imageHeight - stageHeight : imageWidth - stageHeight; // Modal can be dragging if image is smaller to stage

        isDragging = widthDiff > 0 || heightDiff > 0 ? true : false;
        PUBLIC_VARS['isMoving'] = widthDiff > 0 || heightDiff > 0 ? true : false; // Reclac the element position when mousedown
        // Fixed the issue of stage with a border

        left = $(image).position().left - δ;
        top = $(image).position().top + δ; // Add grabbing cursor

        if (stage.hasClass('is-grab')) {
          $(ELEMS_WITH_GRABBING_CURSOR).addClass('is-grabbing');
        }

        $D.on(TOUCH_MOVE_EVENT + EVENT_NS, dragMove).on(TOUCH_END_EVENT + EVENT_NS, dragEnd);
      };

      var dragMove = function dragMove(e) {
        e = e || window.event;
        e.preventDefault();

        if (isDragging) {
          var endX = e.type === 'touchmove' ? e.originalEvent.targetTouches[0].pageX : e.clientX,
              endY = e.type === 'touchmove' ? e.originalEvent.targetTouches[0].pageY : e.clientY,
              relativeX = endX - startX,
              relativeY = endY - startY,
              newLeft = relativeX + left,
              newTop = relativeY + top; // vertical limit

          if (heightDiff > 0) {
            if (relativeY + top > δ) {
              newTop = δ;
            } else if (relativeY + top < -heightDiff + δ) {
              newTop = -heightDiff + δ;
            }
          } else {
            newTop = top;
          } // horizontal limit


          if (widthDiff > 0) {
            if (relativeX + left > -δ) {
              newLeft = -δ;
            } else if (relativeX + left < -widthDiff - δ) {
              newLeft = -widthDiff - δ;
            }
          } else {
            newLeft = left;
          }

          $(image).css({
            left: newLeft + 'px',
            top: newTop + 'px'
          }); // Update image initial data

          $.extend(_this.imageData, {
            left: newLeft,
            top: newTop
          });
        }
      };

      var dragEnd = function dragEnd() {
        $D.off(TOUCH_MOVE_EVENT + EVENT_NS, dragMove).off(TOUCH_END_EVENT + EVENT_NS, dragEnd);
        isDragging = false;
        PUBLIC_VARS['isMoving'] = false; // Remove grabbing cursor

        $(ELEMS_WITH_GRABBING_CURSOR).removeClass('is-grabbing');
      };

      $(stage).on(TOUCH_START_EVENT + EVENT_NS, dragStart);
    }
  };

  var ELEMS_WITH_RESIZE_CURSOR = "html,body,." + NS + "-modal,." + NS + "-stage,." + NS + "-button";
  var resizable = {
    /**
     * ------------------------------
     * 1.modal resizable
     * 2.keep image in stage center
     * 3.other image limitations
     * ------------------------------
     *
     * [resizable]
     * @param  {[Object]} modal       [the modal element]
     * @param  {[Object]} stage       [the stage element]
     * @param  {[Object]} image       [the image element]
     * @param  {[Number]} minWidth    [the option of modalWidth]
     * @param  {[Number]} minHeight   [the option of modalHeight]
     */
    resizable: function resizable(modal, stage, image, minWidth, minHeight) {
      var _this = this;

      var resizableHandleE = $("<div class=\"" + NS + "-resizable-handle " + NS + "-resizable-handle-e\"></div>"),
          resizableHandleW = $("<div class=\"" + NS + "-resizable-handle " + NS + "-resizable-handle-w\"></div>"),
          resizableHandleS = $("<div class=\"" + NS + "-resizable-handle " + NS + "-resizable-handle-s\"></div>"),
          resizableHandleN = $("<div class=\"" + NS + "-resizable-handle " + NS + "-resizable-handle-n\"></div>"),
          resizableHandleSE = $("<div class=\"" + NS + "-resizable-handle " + NS + "-resizable-handle-se\"></div>"),
          resizableHandleSW = $("<div class=\"" + NS + "-resizable-handle " + NS + "-resizable-handle-sw\"></div>"),
          resizableHandleNE = $("<div class=\"" + NS + "-resizable-handle " + NS + "-resizable-handle-ne\"></div>"),
          resizableHandleNW = $("<div class=\"" + NS + "-resizable-handle " + NS + "-resizable-handle-nw\"></div>");
      var resizableHandles = {
        'e': resizableHandleE,
        's': resizableHandleS,
        'se': resizableHandleSE,
        'n': resizableHandleN,
        'w': resizableHandleW,
        'nw': resizableHandleNW,
        'ne': resizableHandleNE,
        'sw': resizableHandleSW
      };
      $(modal).append(resizableHandleE, resizableHandleW, resizableHandleS, resizableHandleN, resizableHandleSE, resizableHandleSW, resizableHandleNE, resizableHandleNW);
      var isDragging = false;
      var startX = 0,
          startY = 0,
          modalData = {
        w: 0,
        h: 0,
        l: 0,
        t: 0
      },
          stageData = {
        w: 0,
        h: 0,
        l: 0,
        t: 0
      },
          imageData = {
        w: 0,
        h: 0,
        l: 0,
        t: 0
      },
          // δ is the difference between image width and height
      δ = 0,
          imgWidth = 0,
          imgHeight = 0,
          direction = ''; // modal CSS options

      var getModalOpts = function getModalOpts(dir, offsetX, offsetY) {
        // Modal should not move when its width to the minwidth
        var modalLeft = -offsetX + modalData.w > minWidth ? offsetX + modalData.l : modalData.l + modalData.w - minWidth,
            modalTop = -offsetY + modalData.h > minHeight ? offsetY + modalData.t : modalData.t + modalData.h - minHeight;
        var opts = {
          'e': {
            width: Math.max(offsetX + modalData.w, minWidth) + 'px'
          },
          's': {
            height: Math.max(offsetY + modalData.h, minHeight) + 'px'
          },
          'se': {
            width: Math.max(offsetX + modalData.w, minWidth) + 'px',
            height: Math.max(offsetY + modalData.h, minHeight) + 'px'
          },
          'w': {
            width: Math.max(-offsetX + modalData.w, minWidth) + 'px',
            left: modalLeft + 'px'
          },
          'n': {
            height: Math.max(-offsetY + modalData.h, minHeight) + 'px',
            top: modalTop + 'px'
          },
          'nw': {
            width: Math.max(-offsetX + modalData.w, minWidth) + 'px',
            height: Math.max(-offsetY + modalData.h, minHeight) + 'px',
            top: modalTop + 'px',
            left: modalLeft + 'px'
          },
          'ne': {
            width: Math.max(offsetX + modalData.w, minWidth) + 'px',
            height: Math.max(-offsetY + modalData.h, minHeight) + 'px',
            top: modalTop + 'px'
          },
          'sw': {
            width: Math.max(-offsetX + modalData.w, minWidth) + 'px',
            height: Math.max(offsetY + modalData.h, minHeight) + 'px',
            left: modalLeft + 'px'
          }
        };
        return opts[dir];
      }; // image CSS options


      var getImageOpts = function getImageOpts(dir, offsetX, offsetY) {
        // Image should not move when modal width to the min width
        // The minwidth is modal width, so we should clac the stage minwidth
        var widthDiff = offsetX + modalData.w > minWidth ? stageData.w - imgWidth + offsetX - δ : minWidth - (modalData.w - stageData.w) - imgWidth - δ,
            heightDiff = offsetY + modalData.h > minHeight ? stageData.h - imgHeight + offsetY + δ : minHeight - (modalData.h - stageData.h) - imgHeight + δ,
            widthDiff2 = -offsetX + modalData.w > minWidth ? stageData.w - imgWidth - offsetX - δ : minWidth - (modalData.w - stageData.w) - imgWidth - δ,
            heightDiff2 = -offsetY + modalData.h > minHeight ? stageData.h - imgHeight - offsetY + δ : minHeight - (modalData.h - stageData.h) - imgHeight + δ; // Get image position in dragging

        var imgLeft = (widthDiff > 0 ? $(image).position().left : $(image).position().left < 0 ? $(image).position().left : 0) - δ,
            imgTop = (heightDiff > 0 ? $(image).position().top : $(image).position().top < 0 ? $(image).position().top : 0) + δ,
            imgLeft2 = (widthDiff2 > 0 ? $(image).position().left : $(image).position().left < 0 ? $(image).position().left : 0) - δ,
            imgTop2 = (heightDiff2 > 0 ? $(image).position().top : $(image).position().top < 0 ? $(image).position().top : 0) + δ;
        var opts = {
          'e': {
            left: widthDiff >= -δ ? (widthDiff - δ) / 2 + 'px' : imgLeft > widthDiff ? imgLeft + 'px' : widthDiff + 'px'
          },
          's': {
            top: heightDiff >= δ ? (heightDiff + δ) / 2 + 'px' : imgTop > heightDiff ? imgTop + 'px' : heightDiff + 'px'
          },
          'se': {
            top: heightDiff >= δ ? (heightDiff + δ) / 2 + 'px' : imgTop > heightDiff ? imgTop + 'px' : heightDiff + 'px',
            left: widthDiff >= -δ ? (widthDiff - δ) / 2 + 'px' : imgLeft > widthDiff ? imgLeft + 'px' : widthDiff + 'px'
          },
          'w': {
            left: widthDiff2 >= -δ ? (widthDiff2 - δ) / 2 + 'px' : imgLeft2 > widthDiff2 ? imgLeft2 + 'px' : widthDiff2 + 'px'
          },
          'n': {
            top: heightDiff2 >= δ ? (heightDiff2 + δ) / 2 + 'px' : imgTop2 > heightDiff2 ? imgTop2 + 'px' : heightDiff2 + 'px'
          },
          'nw': {
            top: heightDiff2 >= δ ? (heightDiff2 + δ) / 2 + 'px' : imgTop2 > heightDiff2 ? imgTop2 + 'px' : heightDiff2 + 'px',
            left: widthDiff2 >= -δ ? (widthDiff2 - δ) / 2 + 'px' : imgLeft2 > widthDiff2 ? imgLeft2 + 'px' : widthDiff2 + 'px'
          },
          'ne': {
            top: heightDiff2 >= δ ? (heightDiff2 + δ) / 2 + 'px' : imgTop2 > heightDiff2 ? imgTop2 + 'px' : heightDiff2 + 'px',
            left: widthDiff >= -δ ? (widthDiff - δ) / 2 + 'px' : imgLeft > widthDiff ? imgLeft + 'px' : widthDiff + 'px'
          },
          'sw': {
            top: heightDiff >= δ ? (heightDiff + δ) / 2 + 'px' : imgTop > heightDiff ? imgTop + 'px' : heightDiff + 'px',
            left: widthDiff2 >= -δ ? (widthDiff2 - δ) / 2 + 'px' : imgLeft2 > widthDiff2 ? imgLeft2 + 'px' : widthDiff2 + 'px'
          }
        };
        return opts[dir];
      };

      var dragStart = function dragStart(dir, e) {
        e = e || window.event;
        e.preventDefault();
        isDragging = true;
        PUBLIC_VARS['isResizing'] = true;
        startX = e.type === 'touchstart' ? e.originalEvent.targetTouches[0].pageX : e.clientX;
        startY = e.type === 'touchstart' ? e.originalEvent.targetTouches[0].pageY : e.clientY; // Reclac the modal data when mousedown

        modalData = {
          w: $(modal).width(),
          h: $(modal).height(),
          l: $(modal).offset().left,
          t: $(modal).offset().top
        };
        stageData = {
          w: $(stage).width(),
          h: $(stage).height(),
          l: $(stage).offset().left,
          t: $(stage).offset().top
        };
        imageData = {
          w: $(image).width(),
          h: $(image).height(),
          l: $(image).position().left,
          t: $(image).position().top
        }; // δ is the difference between image width and height

        δ = !_this.isRotated ? 0 : (imageData.w - imageData.h) / 2;
        imgWidth = !_this.isRotated ? imageData.w : imageData.h;
        imgHeight = !_this.isRotated ? imageData.h : imageData.w;
        direction = dir; // Add resizable cursor

        $(ELEMS_WITH_RESIZE_CURSOR).css('cursor', dir + '-resize');
        $D.on(TOUCH_MOVE_EVENT + EVENT_NS, dragMove).on(TOUCH_END_EVENT + EVENT_NS, dragEnd);
      };

      var dragMove = function dragMove(e) {
        e = e || window.event;
        e.preventDefault();

        if (isDragging && !_this.isMaximized) {
          var endX = e.type === 'touchmove' ? e.originalEvent.targetTouches[0].pageX : e.clientX,
              endY = e.type === 'touchmove' ? e.originalEvent.targetTouches[0].pageY : e.clientY,
              relativeX = endX - startX,
              relativeY = endY - startY;
          var modalOpts = getModalOpts(direction, relativeX, relativeY);
          $(modal).css(modalOpts);
          var imageOpts = getImageOpts(direction, relativeX, relativeY);
          $(image).css(imageOpts);
          _this.isDoResize = true;
        }
      };

      var dragEnd = function dragEnd() {
        $D.off(TOUCH_MOVE_EVENT + EVENT_NS, dragMove).off(TOUCH_END_EVENT + EVENT_NS, dragEnd); // Set grab cursor

        if (PUBLIC_VARS['isResizing']) {
          setGrabCursor({
            w: imgWidth,
            h: imgHeight
          }, {
            w: $(stage).width(),
            h: $(stage).height()
          }, stage);
        }

        isDragging = false;
        PUBLIC_VARS['isResizing'] = false; // Remove resizable cursor

        $(ELEMS_WITH_RESIZE_CURSOR).css('cursor', ''); // Update image initial data

        var scale = _this.getImageScaleToStage($(stage).width(), $(stage).height());

        $.extend(_this.imageData, {
          initWidth: _this.img.width * scale,
          initHeight: _this.img.height * scale,
          initLeft: ($(stage).width() - _this.img.width * scale) / 2,
          initTop: ($(stage).height() - _this.img.height * scale) / 2
        });
      };

      $.each(resizableHandles, function (dir, handle) {
        handle.on(TOUCH_START_EVENT + EVENT_NS, function (e) {
          dragStart(dir, e);
        });
      });
    }
  };

  /**
   * PhotoViewer Class
   */

  var PhotoViewer =
  /*#__PURE__*/
  function () {
    function PhotoViewer(items, options, el) {
      this.options = $$1.extend(true, {}, DEFAULTS, options);

      if (options && $$1.isArray(options.footToolbar)) {
        this.options.footToolbar = options.footToolbar;
      }

      if (options && $$1.isArray(options.headToolbar)) {
        this.options.headToolbar = options.headToolbar;
      } // Store element of clicked


      this.$el = $$1(el); // As we have multiple instances,
      // so every instance has following variables.
      // modal open flag

      this.isOpened = false; // modal maximize flag

      this.isMaximized = false; // image rotate 90*(2n+1) flag

      this.isRotated = false; // image rotate angle

      this.rotateAngle = 0; // if modal do resize

      this.isDoResize = false; // Store image data in every instance

      this.imageData = {}; // Store modal data in every instance

      this.modalData = {
        width: null,
        height: null,
        left: null,
        top: null
      };
      this.init(items, this.options, el);
    }

    var _proto = PhotoViewer.prototype;

    _proto.init = function init(items, opts, el) {
      this.groupData = items;
      this.groupIndex = opts['index']; // Get image src

      var imgSrc = items[this.groupIndex]['src'];
      this.open();
      this.loadImg(imgSrc); // draggable & movable & resizable

      if (opts.draggable) {
        this.draggable(this.$photoviewer, this.dragHandle, CLASS_NS + '-button');
      }

      if (opts.movable) {
        this.movable(this.$stage, this.$image);
      }

      if (opts.resizable) {
        this.resizable(this.$photoviewer, this.$stage, this.$image, opts.modalWidth, opts.modalHeight);
      }
    };

    _proto._creatBtns = function _creatBtns(toolbar, btns) {
      var btnsStr = '';
      $$1.each(toolbar, function (index, item) {
        btnsStr += btns[item];
      });
      return btnsStr;
    };

    _proto._creatTitle = function _creatTitle() {
      return this.options.title ? "<div class=\"" + NS + "-title\"></div>" : '';
    };

    _proto._creatDOM = function _creatDOM() {
      var btnsTpl = {
        minimize: "<button class=\"" + NS + "-button " + NS + "-button-minimize\"\n                  title=\"" + this.options.i18n.minimize + "\">\n                    " + this.options.icons.minimize + "\n                  </button>",
        maximize: "<button class=\"" + NS + "-button " + NS + "-button-maximize\"\n                  title=\"" + this.options.i18n.maximize + "\">\n                    " + this.options.icons.maximize + "\n                  </button>",
        close: "<button class=\"" + NS + "-button " + NS + "-button-close\"\n              title=\"" + this.options.i18n.close + "\">\n                " + this.options.icons.close + "\n              </button>",
        zoomIn: "<button class=\"" + NS + "-button " + NS + "-button-zoom-in\"\n                title=\"" + this.options.i18n.zoomIn + "\">\n                  " + this.options.icons.zoomIn + "\n                </button>",
        zoomOut: "<button class=\"" + NS + "-button " + NS + "-button-zoom-out\"\n                title=\"" + this.options.i18n.zoomOut + "\">\n                  " + this.options.icons.zoomOut + "\n                </button>",
        prev: "<button class=\"" + NS + "-button " + NS + "-button-prev\"\n              title=\"" + this.options.i18n.prev + "\">\n                " + this.options.icons.prev + "\n              </button>",
        next: "<button class=\"" + NS + "-button " + NS + "-button-next\"\n              title=\"" + this.options.i18n.next + "\">\n                " + this.options.icons.next + "\n              </button>",
        fullscreen: "<button class=\"" + NS + "-button " + NS + "-button-fullscreen\"\n                    title=\"" + this.options.i18n.fullscreen + "\">\n                    " + this.options.icons.fullscreen + "\n                  </button>",
        actualSize: "<button class=\"" + NS + "-button " + NS + "-button-actual-size\"\n                    title=\"" + this.options.i18n.actualSize + "\">\n                      " + this.options.icons.actualSize + "\n                    </button>",
        rotateLeft: "<button class=\"" + NS + "-button " + NS + "-button-rotate-left\"\n                    title=\"" + this.options.i18n.rotateLeft + "\">\n                      " + this.options.icons.rotateLeft + "\n                    </button>",
        rotateRight: "<button class=\"" + NS + "-button " + NS + "-button-rotate-right\"\n                      title=\"" + this.options.i18n.rotateRight + "\">\n                      " + this.options.icons.rotateRight + "\n                    </button>"
      }; // photoviewer base HTML

      var photoviewerHTML = "<div class=\"" + NS + "-modal\">\n        <div class=\"" + NS + "-inner\">\n          <div class=\"" + NS + "-header\">\n            <div class=\"" + NS + "-toolbar " + NS + "-toolbar-head\">\n              " + this._creatBtns(this.options.headToolbar, btnsTpl) + "\n            </div>\n            " + this._creatTitle() + "\n          </div>\n          <div class=\"" + NS + "-stage\">\n            <img class=\"" + NS + "-image\" src=\"\" alt=\"\" />\n          </div>\n          <div class=\"" + NS + "-footer\">\n            <div class=\"" + NS + "-toolbar " + NS + "-toolbar-foot\">\n              " + this._creatBtns(this.options.footToolbar, btnsTpl) + "\n            </div>\n          </div>\n        </div>\n      </div>";
      return photoviewerHTML;
    };

    _proto.build = function build() {
      // Create photoviewer HTML string
      var photoviewerHTML = this._creatDOM(); // Make photoviewer HTML string to jQuery element


      var $photoviewer = $$1(photoviewerHTML); // Get all photoviewer element

      this.$photoviewer = $photoviewer;
      this.$header = $photoviewer.find(CLASS_NS + '-header');
      this.$headToolbar = $photoviewer.find(CLASS_NS + '-toolbar-head');
      this.$footer = $photoviewer.find(CLASS_NS + '-footer');
      this.$footToolbar = $photoviewer.find(CLASS_NS + '-toolbar-foot');
      this.$stage = $photoviewer.find(CLASS_NS + '-stage');
      this.$title = $photoviewer.find(CLASS_NS + '-title');
      this.$image = $photoviewer.find(CLASS_NS + '-image');
      this.$close = $photoviewer.find(CLASS_NS + '-button-close');
      this.$maximize = $photoviewer.find(CLASS_NS + '-button-maximize');
      this.$minimize = $photoviewer.find(CLASS_NS + '-button-minimize');
      this.$zoomIn = $photoviewer.find(CLASS_NS + '-button-zoom-in');
      this.$zoomOut = $photoviewer.find(CLASS_NS + '-button-zoom-out');
      this.$actualSize = $photoviewer.find(CLASS_NS + '-button-actual-size');
      this.$fullscreen = $photoviewer.find(CLASS_NS + '-button-fullscreen');
      this.$rotateLeft = $photoviewer.find(CLASS_NS + '-button-rotate-left');
      this.$rotateRight = $photoviewer.find(CLASS_NS + '-button-rotate-right');
      this.$prev = $photoviewer.find(CLASS_NS + '-button-prev');
      this.$next = $photoviewer.find(CLASS_NS + '-button-next'); // Add class before image loaded

      this.$stage.addClass('stage-ready');
      this.$image.addClass('image-ready'); // Reset modal z-index with multiple instances

      this.$photoviewer.css('z-index', PUBLIC_VARS['zIndex']); // Set handle element of draggable

      if (!this.options.dragHandle || this.options.dragHandle === CLASS_NS + '-modal') {
        this.dragHandle = this.$photoviewer;
      } else {
        this.dragHandle = this.$photoviewer.find(this.options.dragHandle);
      }
    };

    _proto.open = function open() {
      if (!this.options.multiInstances) {
        $$1(CLASS_NS + '-modal').eq(0).remove();
      } // Fixed modal position bug


      if (!$$1(CLASS_NS + '-modal').length && this.options.fixedContent) {
        $$1('html').css({
          'overflow': 'hidden'
        });

        if (hasScrollbar()) {
          var scrollbarWidth = getScrollbarWidth();

          if (scrollbarWidth) {
            $$1('html').css({
              'padding-right': scrollbarWidth
            });
          }
        }
      }

      this.build();

      this._triggerHook('beforeOpen', this.$el); // Add PhotoViewer to DOM


      $$1('body').append(this.$photoviewer);
      this.addEvents();
      this.setModalPos(this.$photoviewer);

      this._triggerHook('opened', this.$el);
    };

    _proto.close = function close() {
      this._triggerHook('beforeClose', this.$el); // Remove instance


      this.$photoviewer.remove();
      this.isOpened = false;
      this.isMaximized = false;
      this.isRotated = false;
      this.rotateAngle = 0;
      var zeroModal = !$$1(CLASS_NS + '-modal').length; // Fixed modal position bug

      if (zeroModal && this.options.fixedContent) {
        $$1('html').css({
          'overflow': '',
          'padding-right': ''
        });
      } // Reset zIndex after close


      if (zeroModal && this.options.multiInstances) {
        PUBLIC_VARS['zIndex'] = this.options.zIndex;
      } // off events


      if (!$$1(CLASS_NS + '-modal').length) {
        $D.off(KEYDOWN_EVENT + EVENT_NS);
        $W.off(RESIZE_EVENT + EVENT_NS);
      }

      this._triggerHook('closed', this.$el);
    };

    _proto.setModalPos = function setModalPos(modal) {
      var winWidth = $W.width(),
          winHeight = $W.height(),
          scrollLeft = $D.scrollLeft(),
          scrollTop = $D.scrollTop();
      var modalWidth = this.options.modalWidth,
          modalHeight = this.options.modalHeight; // Set modal maximized when init

      if (this.options.initMaximized) {
        modal.addClass(NS + '-maximize');
        modal.css({
          width: '100%',
          height: '100%',
          left: 0,
          top: 0
        });
        this.isOpened = true;
        this.isMaximized = true;
      } else {
        // Make the modal in windows center
        modal.css({
          width: modalWidth,
          height: modalHeight,
          left: (winWidth - modalWidth) / 2 + scrollLeft + 'px',
          top: (winHeight - modalHeight) / 2 + scrollTop + 'px'
        });
      }
    };

    _proto.setModalSize = function setModalSize(img) {
      var _this = this;

      var winWidth = $W.width(),
          winHeight = $W.height(),
          scrollLeft = $D.scrollLeft(),
          scrollTop = $D.scrollTop(); // stage css value

      var stageCSS = {
        left: this.$stage.css('left'),
        right: this.$stage.css('right'),
        top: this.$stage.css('top'),
        bottom: this.$stage.css('bottom'),
        borderLeft: this.$stage.css('border-left-width'),
        borderRight: this.$stage.css('border-right-width'),
        borderTop: this.$stage.css('border-top-width'),
        borderBottom: this.$stage.css('border-bottom-width')
      }; // Modal size should calc with stage css value

      var modalWidth = img.width + getNumFromCSSValue(stageCSS.left) + getNumFromCSSValue(stageCSS.right) + getNumFromCSSValue(stageCSS.borderLeft) + getNumFromCSSValue(stageCSS.borderRight),
          modalHeight = img.height + getNumFromCSSValue(stageCSS.top) + getNumFromCSSValue(stageCSS.bottom) + getNumFromCSSValue(stageCSS.borderTop) + getNumFromCSSValue(stageCSS.borderBottom);
      var gapThreshold = (this.options.gapThreshold > 0 ? this.options.gapThreshold : 0) + 1,
          // modal scale to window
      scale = Math.min(winWidth / (modalWidth * gapThreshold), winHeight / (modalHeight * gapThreshold), 1);
      var minWidth = Math.max(modalWidth * scale, this.options.modalWidth),
          minHeight = Math.max(modalHeight * scale, this.options.modalHeight);
      minWidth = this.options.fixedModalSize ? this.options.modalWidth : Math.round(minWidth);
      minHeight = this.options.fixedModalSize ? this.options.modalHeight : Math.round(minHeight);
      var modalCSSObj = {
        width: minWidth + 'px',
        height: minHeight + 'px',
        left: (winWidth - minWidth) / 2 + scrollLeft + 'px',
        top: (winHeight - minHeight) / 2 + scrollTop + 'px'
      }; // Add modal init animation

      if (this.options.initAnimation) {
        this.$photoviewer.animate(modalCSSObj, function () {
          _this.setImageSize(img);
        });
      } else {
        this.$photoviewer.css(modalCSSObj);
        this.setImageSize(img);
      }

      this.isOpened = true;
    };

    _proto.getImageScaleToStage = function getImageScaleToStage(stageWidth, stageHeight) {
      var scale = 1;

      if (!this.isRotated) {
        scale = Math.min(stageWidth / this.img.width, stageHeight / this.img.height, 1);
      } else {
        scale = Math.min(stageWidth / this.img.height, stageHeight / this.img.width, 1);
      }

      return scale;
    };

    _proto.setImageSize = function setImageSize(img) {
      var stageData = {
        w: this.$stage.width(),
        h: this.$stage.height()
      };
      var scale = this.getImageScaleToStage(stageData.w, stageData.h);
      this.$image.css({
        width: Math.ceil(img.width * scale) + 'px',
        height: Math.ceil(img.height * scale) + 'px',
        left: (stageData.w - Math.ceil(img.width * scale)) / 2 + 'px',
        top: (stageData.h - Math.ceil(img.height * scale)) / 2 + 'px'
      }); // Store image initial data

      $$1.extend(this.imageData, {
        initWidth: img.width * scale,
        initHeight: img.height * scale,
        initLeft: (stageData.w - img.width * scale) / 2,
        initTop: (stageData.h - img.height * scale) / 2,
        width: img.width * scale,
        height: img.height * scale,
        left: (stageData.w - img.width * scale) / 2,
        top: (stageData.h - img.height * scale) / 2
      }); // Set grab cursor

      setGrabCursor({
        w: this.$image.width(),
        h: this.$image.height()
      }, {
        w: this.$stage.width(),
        h: this.$stage.height()
      }, this.$stage, this.isRotated);
      this.$stage.removeClass('stage-ready');
      this.$image.removeClass('image-ready'); // loader end

      this.$photoviewer.find(CLASS_NS + '-loader').remove(); // Add image init animation

      if (this.options.initAnimation && !this.options.progressiveLoading) {
        this.$image.fadeIn();
      }
    };

    _proto.loadImg = function loadImg(imgSrc, fn, err) {
      var _this2 = this;

      var loaderHTML = "<div class=\"" + NS + "-loader\"></div>"; // loader start

      this.$photoviewer.append(loaderHTML); // Add class before image loaded

      this.$stage.addClass('stage-ready');
      this.$image.addClass('image-ready'); // Reset image

      this.$image.removeAttr('style').attr('src', '');

      if (this.options.initAnimation && !this.options.progressiveLoading) {
        this.$image.hide();
      }

      this.$image.attr('src', imgSrc);
      preloadImg(imgSrc, function (img) {
        // Store HTMLImageElement
        _this2.img = img; // Store original data

        _this2.imageData = {
          originalWidth: img.width,
          originalHeight: img.height
        };

        if (_this2.isMaximized || _this2.isOpened && _this2.options.fixedModalPos) {
          _this2.setImageSize(img);
        } else {
          _this2.setModalSize(img);
        } // callback of image loaded successfully


        if (fn) {
          fn.call();
        }
      }, function () {
        // loader end
        _this2.$photoviewer.find(CLASS_NS + '-loader').remove(); // callback of image loading failed


        if (err) {
          err.call();
        }
      });

      if (this.options.title) {
        this.setImgTitle(imgSrc);
      }
    };

    _proto.setImgTitle = function setImgTitle(url) {
      var title = this.groupData[this.groupIndex].title ? this.groupData[this.groupIndex].title : getImageNameFromUrl(url);
      this.$title.html(title);
    };

    _proto.jump = function jump(step) {
      this._triggerHook('beforeChange', this.groupIndex);

      this.groupIndex = this.groupIndex + step;
      this.jumpTo(this.groupIndex);
    };

    _proto.jumpTo = function jumpTo(index) {
      var _this3 = this;

      index = index % this.groupData.length;

      if (index >= 0) {
        index = index % this.groupData.length;
      } else if (index < 0) {
        index = (this.groupData.length + index) % this.groupData.length;
      }

      this.groupIndex = index;
      this.loadImg(this.groupData[index].src, function () {
        _this3._triggerHook('changed', index);
      }, function () {
        _this3._triggerHook('changed', index);
      });
    };

    _proto.wheel = function wheel(e) {
      e.preventDefault();
      var delta = 1;

      if (e.originalEvent.deltaY) {
        delta = e.originalEvent.deltaY > 0 ? 1 : -1;
      } else if (e.originalEvent.wheelDelta) {
        delta = -e.originalEvent.wheelDelta / 120;
      } else if (e.originalEvent.detail) {
        delta = e.originalEvent.detail > 0 ? 1 : -1;
      } // ratio threshold


      var ratio = -delta * this.options.ratioThreshold; // mouse point position relative to stage

      var pointer = {
        x: e.originalEvent.clientX - this.$stage.offset().left + $D.scrollLeft(),
        y: e.originalEvent.clientY - this.$stage.offset().top + $D.scrollTop()
      };
      this.zoom(ratio, pointer, e);
    };

    _proto.zoom = function zoom(ratio, origin, e) {
      // zoom out ratio & zoom in ratio
      ratio = ratio < 0 ? 1 / (1 - ratio) : 1 + ratio; // image ratio

      ratio = this.$image.width() / this.imageData.originalWidth * ratio; // Fixed digital error
      // if (ratio > 0.95 && ratio < 1.05) {
      //   ratio = 1;
      // }

      if (ratio > this.options.maxRatio || ratio < this.options.minRatio) {
        return;
      }

      this.zoomTo(ratio, origin, e);
    };

    _proto.zoomTo = function zoomTo(ratio, origin, e) {
      var $image = this.$image,
          $stage = this.$stage,
          imgData = {
        w: this.imageData.width,
        h: this.imageData.height,
        x: this.imageData.left,
        y: this.imageData.top
      }; // image stage position
      // We will use it to calc the relative position of image

      var stageData = {
        w: $stage.width(),
        h: $stage.height(),
        x: $stage.offset().left,
        y: $stage.offset().top
      };
      var newWidth = this.imageData.originalWidth * ratio,
          newHeight = this.imageData.originalHeight * ratio,
          // Think about it for a while
      newLeft = origin.x - (origin.x - imgData.x) / imgData.w * newWidth,
          newTop = origin.y - (origin.y - imgData.y) / imgData.h * newHeight; // δ is the difference between image new width and new height

      var δ = !this.isRotated ? 0 : (newWidth - newHeight) / 2,
          imgNewWidth = !this.isRotated ? newWidth : newHeight,
          imgNewHeight = !this.isRotated ? newHeight : newWidth;
      var offsetX = stageData.w - newWidth,
          offsetY = stageData.h - newHeight; // zoom out & zoom in condition
      // It's important and it takes me a lot of time to get it
      // The conditions with image rotate 90 degree drive me crazy alomst!

      if (imgNewHeight <= stageData.h) {
        newTop = (stageData.h - newHeight) / 2;
      } else {
        newTop = newTop > δ ? δ : newTop > offsetY - δ ? newTop : offsetY - δ;
      }

      if (imgNewWidth <= stageData.w) {
        newLeft = (stageData.w - newWidth) / 2;
      } else {
        newLeft = newLeft > -δ ? -δ : newLeft > offsetX + δ ? newLeft : offsetX + δ;
      } // if the image scale get to the critical point


      if (Math.abs(this.imageData.initWidth - newWidth) < this.imageData.initWidth * 0.05) {
        this.setImageSize(this.img);
      } else {
        $image.css({
          width: Math.round(newWidth) + 'px',
          height: Math.round(newHeight) + 'px',
          left: Math.round(newLeft) + 'px',
          top: Math.round(newTop) + 'px'
        }); // Set grab cursor

        setGrabCursor({
          w: Math.round(imgNewWidth),
          h: Math.round(imgNewHeight)
        }, {
          w: stageData.w,
          h: stageData.h
        }, this.$stage);
      } // Update image initial data


      $$1.extend(this.imageData, {
        width: newWidth,
        height: newHeight,
        left: newLeft,
        top: newTop
      });
    };

    _proto.rotate = function rotate(angle) {
      this.rotateAngle = this.rotateAngle + angle;

      if (this.rotateAngle / 90 % 2 === 0) {
        this.isRotated = false;
      } else {
        this.isRotated = true;
      }

      this.rotateTo(this.rotateAngle);
    };

    _proto.rotateTo = function rotateTo(angle) {
      this.$image.css({
        transform: 'rotate(' + angle + 'deg)'
      });
      this.setImageSize({
        width: this.imageData.originalWidth,
        height: this.imageData.originalHeight
      }); // Remove grab cursor when rotate

      this.$stage.removeClass('is-grab');
    };

    _proto.resize = function resize() {
      var _this4 = this;

      var resizeHandler = throttle(function () {
        if (_this4.isOpened) {
          if (_this4.isMaximized) {
            _this4.setImageSize({
              width: _this4.imageData.originalWidth,
              height: _this4.imageData.originalHeight
            });
          } else {
            _this4.setModalSize({
              width: _this4.imageData.originalWidth,
              height: _this4.imageData.originalHeight
            });
          }
        }
      }, 500);
      return resizeHandler;
    };

    _proto.maximize = function maximize() {
      if (!this.isMaximized) {
        // Store modal data before maximize
        this.modalData = {
          width: this.$photoviewer.width(),
          height: this.$photoviewer.height(),
          left: this.$photoviewer.offset().left,
          top: this.$photoviewer.offset().top
        };
        this.$photoviewer.addClass(NS + '-maximize');
        this.$photoviewer.css({
          width: '100%',
          height: '100%',
          left: 0,
          top: 0
        });
        this.isMaximized = true;
      } else {
        this.$photoviewer.removeClass(NS + '-maximize');
        this.$photoviewer.css({
          width: this.modalData.width ? this.modalData.width : this.options.modalWidth,
          height: this.modalData.height ? this.modalData.height : this.options.modalHeight,
          left: this.modalData.left ? this.modalData.left : ($W.width() - this.options.modalWidth) / 2 + $D.scrollLeft(),
          top: this.modalData.top ? this.modalData.top : ($W.height() - this.options.modalHeight) / 2 + $D.scrollTop()
        });
        this.isMaximized = false;
      }

      this.setImageSize({
        width: this.imageData.originalWidth,
        height: this.imageData.originalHeight
      });
    };

    _proto.fullscreen = function fullscreen() {
      requestFullscreen(this.$photoviewer[0]);
    };

    _proto.keydown = function keydown(e) {
      if (!this.options.keyboard) {
        return false;
      }

      var keyCode = e.keyCode || e.which || e.charCode,
          ctrlKey = e.ctrlKey || e.metaKey,
          altKey = e.altKey || e.metaKey;

      switch (keyCode) {
        // ←
        case 37:
          this.jump(-1);
          break;
        // →

        case 39:
          this.jump(1);
          break;
        // +

        case 187:
          this.zoom(this.options.ratioThreshold * 3, {
            x: this.$stage.width() / 2,
            y: this.$stage.height() / 2
          }, e);
          break;
        // -

        case 189:
          this.zoom(-this.options.ratioThreshold * 3, {
            x: this.$stage.width() / 2,
            y: this.$stage.height() / 2
          }, e);
          break;
        // + Firefox

        case 61:
          this.zoom(this.options.ratioThreshold * 3, {
            x: this.$stage.width() / 2,
            y: this.$stage.height() / 2
          }, e);
          break;
        // - Firefox

        case 173:
          this.zoom(-this.options.ratioThreshold * 3, {
            x: this.$stage.width() / 2,
            y: this.$stage.height() / 2
          }, e);
          break;
        // ctrl + alt + 0

        case 48:
          if (ctrlKey && altKey) {
            this.zoomTo(1, {
              x: this.$stage.width() / 2,
              y: this.$stage.height() / 2
            }, e);
          }

          break;
        // ctrl + ,

        case 188:
          if (ctrlKey) {
            this.rotate(-90);
          }

          break;
        // ctrl + .

        case 190:
          if (ctrlKey) {
            this.rotate(90);
          }

          break;

        default:
      }
    };

    _proto.addEvents = function addEvents() {
      var _this5 = this;

      this.$close.off(CLICK_EVENT + EVENT_NS).on(CLICK_EVENT + EVENT_NS, function (e) {
        _this5.close();
      });
      this.$stage.off(WHEEL_EVENT + EVENT_NS).on(WHEEL_EVENT + EVENT_NS, function (e) {
        _this5.wheel(e);
      });
      this.$zoomIn.off(CLICK_EVENT + EVENT_NS).on(CLICK_EVENT + EVENT_NS, function (e) {
        _this5.zoom(_this5.options.ratioThreshold * 3, {
          x: _this5.$stage.width() / 2,
          y: _this5.$stage.height() / 2
        }, e);
      });
      this.$zoomOut.off(CLICK_EVENT + EVENT_NS).on(CLICK_EVENT + EVENT_NS, function (e) {
        _this5.zoom(-_this5.options.ratioThreshold * 3, {
          x: _this5.$stage.width() / 2,
          y: _this5.$stage.height() / 2
        }, e);
      });
      this.$actualSize.off(CLICK_EVENT + EVENT_NS).on(CLICK_EVENT + EVENT_NS, function (e) {
        _this5.zoomTo(1, {
          x: _this5.$stage.width() / 2,
          y: _this5.$stage.height() / 2
        }, e);
      });
      this.$prev.off(CLICK_EVENT + EVENT_NS).on(CLICK_EVENT + EVENT_NS, function () {
        _this5.jump(-1);
      });
      this.$fullscreen.off(CLICK_EVENT + EVENT_NS).on(CLICK_EVENT + EVENT_NS, function () {
        _this5.fullscreen();
      });
      this.$next.off(CLICK_EVENT + EVENT_NS).on(CLICK_EVENT + EVENT_NS, function () {
        _this5.jump(1);
      });
      this.$rotateLeft.off(CLICK_EVENT + EVENT_NS).on(CLICK_EVENT + EVENT_NS, function () {
        _this5.rotate(-90);
      });
      this.$rotateRight.off(CLICK_EVENT + EVENT_NS).on(CLICK_EVENT + EVENT_NS, function () {
        _this5.rotate(90);
      });
      this.$maximize.off(CLICK_EVENT + EVENT_NS).on(CLICK_EVENT + EVENT_NS, function () {
        _this5.maximize();
      });
      $D.off(KEYDOWN_EVENT + EVENT_NS).on(KEYDOWN_EVENT + EVENT_NS, function (e) {
        _this5.keydown(e);
      });
      $W.on(RESIZE_EVENT + EVENT_NS, this.resize());
    };

    _proto._triggerHook = function _triggerHook(e, data) {
      if (this.options.callbacks[e]) {
        this.options.callbacks[e].apply(this, $$1.isArray(data) ? data : [data]);
      }
    };

    return PhotoViewer;
  }();
  /**
   * Add methods to PhotoViewer
   */


  $$1.extend(PhotoViewer.prototype, draggable, movable, resizable);
  /**
   * Add PhotoViewer to globle
   */

  window.PhotoViewer = PhotoViewer;
  /**
   * jQuery plugin
   */

  var jqEl = null,
      getImgGroup = function getImgGroup(list, groupName) {
    var items = [];
    $$1(list).each(function () {
      var src = getImgSrc(this);
      items.push({
        src: src,
        title: $$1(this).attr('data-title'),
        groupName: groupName
      });
    });
    return items;
  };

  $$1.fn.photoviewer = function (options) {
    jqEl = $$1(this);
    options = options ? options : {}; // Convert a numeric string into a number

    for (var key in options) {
      if (typeof options[key] === 'string' && !isNaN(options[key])) {
        options[key] = parseFloat(options[key]);
      }
    } // Get init event, 'click' or 'dblclick'


    var opts = $$1.extend(true, {}, DEFAULTS, options); // We should get zIndex of options before plugin's init.

    PUBLIC_VARS['zIndex'] = opts.zIndex;

    if (typeof options === 'string') ; else {
      jqEl.off(CLICK_EVENT + EVENT_NS).on(CLICK_EVENT + EVENT_NS, function (e) {
        e.preventDefault(); // This will stop triggering data-api event

        e.stopPropagation(); // Get image group

        var items = [],
            currentGroupName = $$1(this).attr('data-group'),
            groupList = $D.find('[data-group="' + currentGroupName + '"]');

        if (currentGroupName !== undefined) {
          items = getImgGroup(groupList, currentGroupName);
          options['index'] = $$1(this).index('[data-group="' + currentGroupName + '"]');
        } else {
          items = getImgGroup(jqEl.not('[data-group]'));
          options['index'] = $$1(this).index();
        }

        $$1(this).data(NS, new PhotoViewer(items, options, this));
      });
    }

    return jqEl;
  };
  /**
   * PhotoViewer DATA-API
   */


  $D.on(CLICK_EVENT + EVENT_NS, '[data-' + NS + ']', function (e) {
    jqEl = $$1('[data-' + NS + ']');
    e.preventDefault(); // Get image group

    var items = [],
        currentGroupName = $$1(this).attr('data-group'),
        groupList = $D.find('[data-group="' + currentGroupName + '"]');

    if (currentGroupName !== undefined) {
      items = getImgGroup(groupList, currentGroupName);
      DEFAULTS['index'] = $$1(this).index('[data-group="' + currentGroupName + '"]');
    } else {
      items = getImgGroup(jqEl.not('[data-group]'));
      DEFAULTS['index'] = $$1(this).index();
    }

    $$1(this).data(NS, new PhotoViewer(items, DEFAULTS, this));
  });

  return PhotoViewer;

})));
//# sourceMappingURL=photoviewer.js.map
