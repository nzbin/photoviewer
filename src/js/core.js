import $ from './domq.js';
import DEFAULTS from './defaults';
import {
  $W,
  $D,
  CLICK_EVENT,
  RESIZE_EVENT,
  KEYDOWN_EVENT,
  WHEEL_EVENT,
  NS,
  CLASS_NS,
  EVENT_NS,
  PUBLIC_VARS
} from './constants';

import {
  debounce,
  preloadImage,
  requestFullscreen,
  getImageNameFromUrl,
  setGrabCursor,
  isRootNode,
  getCSSValueSum,
  isBorderBox
} from './utilities';

import draggable from './draggable';
import movable from './movable';
import resizable from './resizable';

/**
 * PhotoViewer class
 */
class PhotoViewer {
  constructor(items, options, el) {
    this.options = $.extend(true, {}, DEFAULTS, options);

    if (options && $.isArray(options.footerToolbar)) {
      this.options.footerToolbar = options.footerToolbar;
    }

    if (options && $.isArray(options.headerToolbar)) {
      this.options.headerToolbar = options.headerToolbar;
    }

    // Store element of clicked
    this.$el = $(el);

    // As we have multiple instances,
    // so every instance has following variables.

    // Modal opened flag
    this.isOpened = false;
    // Modal maximized flag
    this.isMaximized = false;
    // Image rotated flag 90*(2n+1)
    this.isRotated = false;
    // Image rotated angle
    this.rotateAngle = 0;

    // Whether modal do resize
    this.isDoResize = false;

    // Store image data in every instance
    this.imageData = {};
    // Store modal data in every instance
    this.modalData = {
      width: null,
      height: null,
      left: null,
      top: null
    };

    // Used for time comparison
    this._lastTimestamp = 0;

    this.init(items, this.options);
  }

  init(items, opts) {
    this.groupData = items;
    this.groupIndex = opts['index'];

    // Fix: https://github.com/nzbin/photoviewer/issues/7
    PUBLIC_VARS['zIndex'] = PUBLIC_VARS['zIndex'] === 0 ? opts['zIndex'] : PUBLIC_VARS['zIndex'];

    // Get image src
    const imgSrc = items[this.groupIndex]['src'];

    this.open();

    this.loadImage(imgSrc);

    // Draggable & Movable & Resizable
    if (opts.draggable) {
      this.draggable(this.$photoviewer, this.dragHandle, CLASS_NS + '-button');
    }
    if (opts.movable) {
      this.movable(this.$stage, this.$image);
    }
    if (opts.resizable) {
      this.resizable(
        this.$photoviewer,
        this.$stage,
        this.$image,
        opts.modalWidth,
        opts.modalHeight
      );
    }
  }

  _createBtns(toolbar) {
    const btns = [
      'minimize', 'maximize', 'close',
      'zoomIn', 'zoomOut', 'prev', 'next', 'fullscreen', 'actualSize', 'rotateLeft', 'rotateRight'
    ];
    let btnsHTML = '';

    $.each(toolbar, (index, item) => {
      const btnClass = `${NS}-button ${NS}-button-${item}`;

      if (btns.indexOf(item) >= 0) {
        btnsHTML +=
          `<button class="${btnClass}" title="${this.options.i18n[item]}">
          ${this.options.icons[item]}
          </button>`;
      } else if (this.options.customButtons[item]) {
        btnsHTML +=
          `<button class="${btnClass}" title="${this.options.customButtons[item].title || ''}">
          ${this.options.customButtons[item].text}
          </button>`;
      }
    });

    return btnsHTML;
  }

  _createTitle() {
    return this.options.title ? `<div class="${NS}-title"></div>` : '';
  }

  _createTemplate() {
    // PhotoViewer base HTML
    const photoviewerHTML =
      `<div class="${NS}-modal" tabindex="0">
        <div class="${NS}-inner">
          <div class="${NS}-header">
            <div class="${NS}-toolbar ${NS}-toolbar-header">
            ${this._createBtns(this.options.headerToolbar)}
            </div>
            ${this._createTitle()}
          </div>
          <div class="${NS}-stage">
            <img class="${NS}-image" src="" alt="" />
          </div>
          <div class="${NS}-footer">
            <div class="${NS}-toolbar ${NS}-toolbar-footer">
            ${this._createBtns(this.options.footerToolbar)}
            </div>
          </div>
        </div>
      </div>`;

    return photoviewerHTML;
  }

  build() {
    // Create PhotoViewer HTML string
    const photoviewerHTML = this._createTemplate();

    // Make PhotoViewer HTML string to jQuery element
    const $photoviewer = $(photoviewerHTML);

    // Get all PhotoViewer elements
    this.$photoviewer = $photoviewer;
    this.$stage = $photoviewer.find(CLASS_NS + '-stage');
    this.$title = $photoviewer.find(CLASS_NS + '-title');
    this.$image = $photoviewer.find(CLASS_NS + '-image');
    this.$close = $photoviewer.find(CLASS_NS + '-button-close');
    this.$maximize = $photoviewer.find(CLASS_NS + '-button-maximize');
    this.$minimize = $photoviewer.find(CLASS_NS + '-button-minimize');
    this.$zoomIn = $photoviewer.find(CLASS_NS + '-button-zoomIn');
    this.$zoomOut = $photoviewer.find(CLASS_NS + '-button-zoomOut');
    this.$actualSize = $photoviewer.find(CLASS_NS + '-button-actualSize');
    this.$fullscreen = $photoviewer.find(CLASS_NS + '-button-fullscreen');
    this.$rotateLeft = $photoviewer.find(CLASS_NS + '-button-rotateLeft');
    this.$rotateRight = $photoviewer.find(CLASS_NS + '-button-rotateRight');
    this.$prev = $photoviewer.find(CLASS_NS + '-button-prev');
    this.$next = $photoviewer.find(CLASS_NS + '-button-next');

    // Add class before image loaded
    this.$stage.addClass('stage-ready');
    this.$image.addClass('image-ready');

    // Reset modal `z-index` of multiple instances
    this.$photoviewer.css('z-index', PUBLIC_VARS['zIndex']);

    if (this.options.positionFixed) {
      this.$photoviewer.css({ position: 'fixed' });
    }

    // Set handle element of draggable
    if (!this.options.dragHandle || this.options.dragHandle === CLASS_NS + '-modal') {
      this.dragHandle = this.$photoviewer;
    } else {
      this.dragHandle = this.$photoviewer.find(this.options.dragHandle);
    }

    // Add PhotoViewer to DOM
    $(this.options.appendTo).eq(0).append(this.$photoviewer);

    // Store the edge value of stage
    this._stageEdgeValue = {
      horizontal: getCSSValueSum(this.$stage, ['left', 'right', 'border-left-width', 'border-right-width']),
      vertical: getCSSValueSum(this.$stage, ['top', 'bottom', 'border-top-width', 'border-bottom-width'])
    };

    // Store the edge value of modal
    this._modalEdgeValue = {
      horizontal: getCSSValueSum(this.$photoviewer, ['padding-left', 'padding-right', 'border-left-width', 'border-right-width']),
      vertical: getCSSValueSum(this.$photoviewer, ['padding-top', 'padding-bottom', 'border-top-width', 'border-bottom-width'])
    };

    this._addEvents();
    this._addCustomButtonEvents();
  }

  open() {
    this._triggerHook('beforeOpen', this);

    if (!this.options.multiInstances) {
      $(CLASS_NS + '-modal').eq(0).remove();
    }

    this.build();

    this.setInitModalPos();

    this._triggerHook('opened', this);
  }

  close() {
    this._triggerHook('beforeClose', this);

    // Remove PhotoViewer instance
    this.$photoviewer.remove();

    this.isOpened = false;
    this.isMaximized = false;
    this.isRotated = false;
    this.rotateAngle = 0;

    if (!$(CLASS_NS + '-modal').length) {
      // Reset `z-index` after close
      if (this.options.multiInstances) {
        PUBLIC_VARS['zIndex'] = this.options.zIndex;
      }

      // Off resize event
      $W.off(RESIZE_EVENT + EVENT_NS);
    }

    this._triggerHook('closed', this);
  }

  _getOffsetParentData() {
    const offsetParent = $(this.options.appendTo)[0];
    return {
      width: this.options.positionFixed || isRootNode(offsetParent) ? $W.width() : offsetParent.clientWidth,
      height: this.options.positionFixed || isRootNode(offsetParent) ? $W.height() : offsetParent.clientHeight,
      scrollLeft: this.options.positionFixed ? 0 : isRootNode(offsetParent) ? $D.scrollLeft() : offsetParent.scrollLeft,
      scrollTop: this.options.positionFixed ? 0 : isRootNode(offsetParent) ? $D.scrollTop() : offsetParent.scrollTop,
    };
  }

  setModalToCenter() {
    let initLeft = 0, initTop = 0, initRight = 0, initBottom = 0;

    // Extra width/height for `content-box`
    let extraWidth = 0, extraHeight = 0;

    if (!isBorderBox(this.$photoviewer)) {
      extraWidth += this._modalEdgeValue.horizontal;
      extraHeight += this._modalEdgeValue.vertical;
    }

    if ($.isPlainObject(this.options.initModalPos)) {
      initLeft = this.options.initModalPos.left;
      initTop = this.options.initModalPos.top;
      initRight = this.options.initModalPos.right;
      initBottom = this.options.initModalPos.bottom;
    } else {
      const offsetParentData = this._getOffsetParentData();
      initLeft = (offsetParentData.width - this.options.modalWidth - extraWidth) / 2 + offsetParentData.scrollLeft;
      initTop = (offsetParentData.height - this.options.modalHeight - extraHeight) / 2 + offsetParentData.scrollTop;
    }

    const modalInitCSS = {
      width: (this.modalData.width || this.options.modalWidth),
      height: (this.modalData.height || this.options.modalHeight),
      left: (this.modalData.left || initLeft),
      top: (this.modalData.top || initTop),
      right: (this.modalData.right || initRight),
      bottom: (this.modalData.bottom || initBottom)
    };

    this.$photoviewer.css(modalInitCSS);
  }

  setInitModalPos() {
    if (this.options.initMaximized) {
      this.maximize();

      this.isOpened = true;
    } else {
      this.setModalToCenter();
    }

    // The focus must be set after opening
    this.$photoviewer[0].focus();
  }

  setModalSize(img) {
    const offsetParentData = this._getOffsetParentData();

    // Modal size should calculate with stage css value
    let modalWidth = img.width + this._stageEdgeValue.horizontal;
    let modalHeight = img.height + this._stageEdgeValue.vertical;

    // Extra width/height for `content-box`
    let extraWidth = 0, extraHeight = 0;

    if (isBorderBox(this.$photoviewer)) {
      modalWidth += this._modalEdgeValue.horizontal;
      modalHeight += this._modalEdgeValue.vertical;
    } else {
      extraWidth += this._modalEdgeValue.horizontal;
      extraHeight += this._modalEdgeValue.vertical;
    }

    const gapThreshold = (this.options.gapThreshold > 0 ? this.options.gapThreshold : 0) + 1;

    // Modal scale relative to parent element
    const scale = Math.min(
      offsetParentData.width / ((modalWidth + extraWidth) * gapThreshold),
      offsetParentData.height / ((modalHeight + extraHeight) * gapThreshold),
      1
    );

    let minWidth = Math.max(modalWidth * scale, this.options.modalWidth);
    let minHeight = Math.max(modalHeight * scale, this.options.modalHeight);

    minWidth = this.options.fixedModalSize ? this.options.modalWidth : Math.round(minWidth);
    minHeight = this.options.fixedModalSize ? this.options.modalHeight : Math.round(minHeight);

    let transLeft = 0, transTop = 0, transRight = 0, transBottom = 0;

    if ($.isPlainObject(this.options.initModalPos)) {
      transLeft = this.options.initModalPos.left;
      transTop = this.options.initModalPos.top;
      transRight = this.options.initModalPos.right;
      transBottom = this.options.initModalPos.bottom;
    } else {
      const offsetParentData = this._getOffsetParentData();
      transLeft = (offsetParentData.width - minWidth - extraWidth) / 2 + offsetParentData.scrollLeft;
      transTop = (offsetParentData.height - minHeight - extraHeight) / 2 + offsetParentData.scrollTop;
    }

    const modalTransCSS = {
      width: minWidth,
      height: minHeight,
      left: transLeft,
      top: transTop,
      right: transRight,
      bottom: transBottom
    };

    // Add init animation for modal
    if (this.options.initAnimation) {
      this.$photoviewer.animate(modalTransCSS, this.options.animationDuration, 'ease-in-out', () => {
        this.setImageSize(img);
      });
    } else {
      this.$photoviewer.css(modalTransCSS);
      this.setImageSize(img);
    }

    this.isOpened = true;
  }

  getImageScale(stageWidth, stageHeight) {
    let scale = 1;

    if (!this.isRotated) {
      scale = Math.min(stageWidth / this.img.width, stageHeight / this.img.height, 1);
    } else {
      scale = Math.min(stageWidth / this.img.height, stageHeight / this.img.width, 1);
    }

    return scale;
  }

  setImageSize(img) {
    const stageData = {
      w: this.$stage.width(),
      h: this.$stage.height()
    };

    const scale = this.getImageScale(stageData.w, stageData.h);

    this.$image.css({
      width: Math.round(img.width * scale),
      height: Math.round(img.height * scale),
      left: (stageData.w - Math.round(img.width * scale)) / 2,
      top: (stageData.h - Math.round(img.height * scale)) / 2
    });

    // Store image initial data
    $.extend(this.imageData, {
      initWidth: img.width * scale,
      initHeight: img.height * scale,
      initLeft: (stageData.w - img.width * scale) / 2,
      initTop: (stageData.h - img.height * scale) / 2,
      width: img.width * scale,
      height: img.height * scale,
      left: (stageData.w - img.width * scale) / 2,
      top: (stageData.h - img.height * scale) / 2
    });

    // Set grab cursor
    setGrabCursor(
      {
        w: this.$image.width(),
        h: this.$image.height()
      },
      {
        w: this.$stage.width(),
        h: this.$stage.height()
      },
      this.$stage,
      this.isRotated
    );

    // Just execute before image loaded
    if (!this.imageLoaded) {
      // Loader end
      this.$photoviewer.find(CLASS_NS + '-loader').remove();

      // Remove class after image loaded
      this.$stage.removeClass('stage-ready');
      this.$image.removeClass('image-ready');

      // Add init animation for image
      if (this.options.initAnimation && !this.options.progressiveLoading) {
        this.$image.fadeIn();
      }

      this.imageLoaded = true;
    }
  }

  loadImage(imgSrc, fn, err) {
    // Reset image
    this.$image.removeAttr('style').attr('src', '');
    this.isRotated = false;
    this.rotateAngle = 0;

    this.imageLoaded = false;

    // Loader start
    this.$photoviewer.append(`<div class="${NS}-loader"></div>`);

    // Add class before image loaded
    this.$stage.addClass('stage-ready');
    this.$image.addClass('image-ready');

    if (this.options.initAnimation && !this.options.progressiveLoading) {
      this.$image.hide();
    }

    this.$image.attr('src', imgSrc);

    preloadImage(
      imgSrc,
      img => {
        // Store HTMLImageElement
        this.img = img;

        // Store original data
        this.imageData = {
          originalWidth: img.width,
          originalHeight: img.height
        };

        if (this.isMaximized || (this.isOpened && this.options.fixedModalPos)) {
          this.setImageSize(img);
        } else {
          this.setModalSize(img);
        }

        // Callback of image loaded successfully
        if (fn) {
          fn.call();
        }
      },
      () => {
        // Loader end
        this.$photoviewer.find(CLASS_NS + '-loader').remove();

        // Callback of image loading failed
        if (err) {
          err.call();
        }
      }
    );

    if (this.options.title) {
      this.setImageTitle(imgSrc);
    }
  }

  setImageTitle(url) {
    const title = this.groupData[this.groupIndex].title || getImageNameFromUrl(url);

    this.$title.html(title);
  }

  jump(step) {
    this._triggerHook('beforeChange', [this, this.groupIndex]);

    // Make sure change image after the modal animation has finished
    const now = Date.now();
    if (now - this._lastTimestamp >= this.options.animationDuration) {
      this.groupIndex = this.groupIndex + step;

      this.jumpTo(this.groupIndex);

      this._lastTimestamp = now;
    }
  }

  jumpTo(index) {
    index = index % this.groupData.length;

    if (index >= 0) {
      index = index % this.groupData.length;
    } else if (index < 0) {
      index = (this.groupData.length + index) % this.groupData.length;
    }

    this.groupIndex = index;

    this.loadImage(
      this.groupData[index].src,
      () => {
        this._triggerHook('changed', [this, index]);
      },
      () => {
        this._triggerHook('changed', [this, index]);
      }
    );
  }

  wheel(e) {
    e.preventDefault();

    let delta = 1;

    if (e.deltaY) {
      delta = e.deltaY > 0 ? 1 : -1;
    } else if (e.wheelDelta) {
      delta = -e.wheelDelta / 120;
    } else if (e.detail) {
      delta = e.detail > 0 ? 1 : -1;
    }

    // Ratio threshold
    const ratio = -delta * this.options.ratioThreshold;

    // Mouse point position relative to stage
    const pointer = {
      x: e.clientX - this.$stage.offset().left + $D.scrollLeft(),
      y: e.clientY - this.$stage.offset().top + $D.scrollTop()
    };

    this.zoom(ratio, pointer, e);
  }

  zoom(ratio, origin, e) {
    // Zoom out ratio & Zoom in ratio
    ratio = ratio < 0 ? 1 / (1 - ratio) : 1 + ratio;

    // Image ratio
    ratio = (this.$image.width() / this.imageData.originalWidth) * ratio;

    if (ratio > this.options.maxRatio || ratio < this.options.minRatio) {
      return;
    }

    this.zoomTo(ratio, origin, e);
  }

  zoomTo(ratio, origin, e) {
    const $image = this.$image;
    const $stage = this.$stage;
    const imgData = {
      w: this.imageData.width,
      h: this.imageData.height,
      x: this.imageData.left,
      y: this.imageData.top
    };

    // Image stage position
    // We will use it to calc the relative position of image
    const stageData = {
      w: $stage.width(),
      h: $stage.height(),
      x: $stage.offset().left,
      y: $stage.offset().top
    };

    const newWidth = this.imageData.originalWidth * ratio;
    const newHeight = this.imageData.originalHeight * ratio;
    // Think about it for a while
    let newLeft = origin.x - ((origin.x - imgData.x) / imgData.w) * newWidth;
    let newTop = origin.y - ((origin.y - imgData.y) / imgData.h) * newHeight;

    // δ is the difference between image new width and new height
    const δ = !this.isRotated ? 0 : (newWidth - newHeight) / 2;
    const imgNewWidth = !this.isRotated ? newWidth : newHeight;
    const imgNewHeight = !this.isRotated ? newHeight : newWidth;

    const offsetX = stageData.w - newWidth;
    const offsetY = stageData.h - newHeight;

    // Zoom out & Zoom in condition
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
    }

    // If the image scale get to the critical point
    if (
      Math.abs(this.imageData.initWidth - newWidth) <
      this.imageData.initWidth * 0.05
    ) {
      this.setImageSize(this.img);
    } else {
      $image.css({
        width: Math.round(newWidth),
        height: Math.round(newHeight),
        left: Math.round(newLeft),
        top: Math.round(newTop)
      });

      // Set grab cursor
      setGrabCursor(
        {
          w: Math.round(imgNewWidth),
          h: Math.round(imgNewHeight)
        },
        {
          w: stageData.w,
          h: stageData.h
        },
        this.$stage
      );
    }

    // Update image initial data
    $.extend(this.imageData, {
      width: newWidth,
      height: newHeight,
      left: newLeft,
      top: newTop
    });
  }

  rotate(angle) {
    this.rotateAngle = this.rotateAngle + angle;

    if ((this.rotateAngle / 90) % 2 === 0) {
      this.isRotated = false;
    } else {
      this.isRotated = true;
    }

    this.rotateTo(this.rotateAngle);
  }

  rotateTo(angle) {
    this.$image.css({
      transform: 'rotate(' + angle + 'deg)'
    });

    this.setImageSize({
      width: this.imageData.originalWidth,
      height: this.imageData.originalHeight
    });

    // Remove grab cursor when rotate
    this.$stage.removeClass('is-grab');
  }

  resize() {
    if (this.isOpened) {
      if (this.isMaximized) {
        this.setImageSize({
          width: this.imageData.originalWidth,
          height: this.imageData.originalHeight
        });
      } else {
        this.setModalSize({
          width: this.imageData.originalWidth,
          height: this.imageData.originalHeight
        });
      }
    }
  }

  maximize() {
    this.$photoviewer.addClass(NS + '-maximized');

    this.$photoviewer.css({
      width: 'auto',
      height: 'auto',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    });

    this.isMaximized = true;
  }

  exitMaximize() {
    this.$photoviewer.removeClass(NS + '-maximized');

    this.setModalToCenter();

    this.isMaximized = false;
  }

  _toggleMaximize() {
    if (!this.isMaximized) {
      let originalWidth = parseFloat(this.$photoviewer.width());
      let originalHeight = parseFloat(this.$photoviewer.height());

      if (isBorderBox(this.$photoviewer)) {
        originalWidth += this._modalEdgeValue.horizontal;
        originalHeight += this._modalEdgeValue.vertical;
      }

      // Store modal size and position before maximized
      this.modalData = {
        width: originalWidth,
        height: originalHeight,
        left: parseFloat(this.$photoviewer.css('left')),
        top: parseFloat(this.$photoviewer.css('top'))
      };

      this.maximize();
    } else {
      this.exitMaximize();
    }

    this.setImageSize({
      width: this.imageData.originalWidth,
      height: this.imageData.originalHeight
    });

    this.$photoviewer[0].focus();
  }

  fullscreen() {
    requestFullscreen(this.$photoviewer[0]);

    this.$photoviewer[0].focus();
  }

  _keydown(e) {
    if (!this.options.keyboard) {
      return false;
    }

    const keyCode = e.keyCode || e.which || e.charCode;
    const ctrlKey = e.ctrlKey || e.metaKey;
    const altKey = e.altKey || e.metaKey;

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
        this.zoom(
          this.options.ratioThreshold * 3,
          { x: this.$stage.width() / 2, y: this.$stage.height() / 2 },
          e
        );
        break;
      // -
      case 189:
        this.zoom(
          -this.options.ratioThreshold * 3,
          { x: this.$stage.width() / 2, y: this.$stage.height() / 2 },
          e
        );
        break;
      // + Firefox
      case 61:
        this.zoom(
          this.options.ratioThreshold * 3,
          { x: this.$stage.width() / 2, y: this.$stage.height() / 2 },
          e
        );
        break;
      // - Firefox
      case 173:
        this.zoom(
          -this.options.ratioThreshold * 3,
          { x: this.$stage.width() / 2, y: this.$stage.height() / 2 },
          e
        );
        break;
      // Ctrl + Alt + 0
      case 48:
        if (ctrlKey && altKey) {
          this.zoomTo(
            1,
            { x: this.$stage.width() / 2, y: this.$stage.height() / 2 },
            e
          );
        }
        break;
      // Ctrl + ,
      case 188:
        if (ctrlKey) {
          this.rotate(-90);
        }
        break;
      // Ctrl + .
      case 190:
        if (ctrlKey) {
          this.rotate(90);
        }
        break;
      // Q
      case 81:
        this.close();
        break;
      default:
    }
  }

  _addEvents() {
    this.$close.off(CLICK_EVENT + EVENT_NS).on(CLICK_EVENT + EVENT_NS, e => {
      this.close();
    });

    this.$stage.off(WHEEL_EVENT + EVENT_NS).on(WHEEL_EVENT + EVENT_NS, e => {
      this.wheel(e);
    });

    this.$zoomIn.off(CLICK_EVENT + EVENT_NS).on(CLICK_EVENT + EVENT_NS, e => {
      this.zoom(
        this.options.ratioThreshold * 3,
        { x: this.$stage.width() / 2, y: this.$stage.height() / 2 },
        e
      );
    });

    this.$zoomOut.off(CLICK_EVENT + EVENT_NS).on(CLICK_EVENT + EVENT_NS, e => {
      this.zoom(
        -this.options.ratioThreshold * 3,
        { x: this.$stage.width() / 2, y: this.$stage.height() / 2 },
        e
      );
    });

    this.$actualSize.off(CLICK_EVENT + EVENT_NS).on(CLICK_EVENT + EVENT_NS, e => {
      this.zoomTo(
        1,
        { x: this.$stage.width() / 2, y: this.$stage.height() / 2 },
        e
      );
    });

    this.$prev.off(CLICK_EVENT + EVENT_NS).on(CLICK_EVENT + EVENT_NS, () => {
      this.jump(-1);
    });

    this.$fullscreen.off(CLICK_EVENT + EVENT_NS).on(CLICK_EVENT + EVENT_NS, () => {
      this.fullscreen();
    });

    this.$next.off(CLICK_EVENT + EVENT_NS).on(CLICK_EVENT + EVENT_NS, () => {
      this.jump(1);
    });

    this.$rotateLeft.off(CLICK_EVENT + EVENT_NS).on(CLICK_EVENT + EVENT_NS, () => {
      this.rotate(-90);
    });

    this.$rotateRight.off(CLICK_EVENT + EVENT_NS).on(CLICK_EVENT + EVENT_NS, () => {
      this.rotate(90);
    });

    this.$maximize.off(CLICK_EVENT + EVENT_NS).on(CLICK_EVENT + EVENT_NS, () => {
      this._toggleMaximize();
    });

    this.$photoviewer.off(KEYDOWN_EVENT + EVENT_NS).on(KEYDOWN_EVENT + EVENT_NS, e => {
      this._keydown(e);
    });

    $W.on(RESIZE_EVENT + EVENT_NS, debounce(() => {
      this.resize();
    }, 500));
  }

  _addCustomButtonEvents() {
    for (const btnKey in this.options.customButtons) {
      this.$photoviewer.find(CLASS_NS + '-button-' + btnKey)
        .off(CLICK_EVENT + EVENT_NS).on(CLICK_EVENT + EVENT_NS, e => {
          this.options.customButtons[btnKey].click.apply(this, [this, e]);
        });
    }
  }

  _triggerHook(e, data) {
    if (this.options.callbacks[e]) {
      this.options.callbacks[e].apply(this, $.isArray(data) ? data : [data]);
    }
  }
}

/**
 * Add methods to PhotoViewer
 */
$.extend(PhotoViewer.prototype, draggable, movable, resizable);

/**
 * Add PhotoViewer to globle
 */
window.PhotoViewer = PhotoViewer;

export default PhotoViewer;
