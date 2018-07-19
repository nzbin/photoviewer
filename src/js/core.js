import $ from 'jquery';

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
  getImgSrc,
  throttle,
  preloadImg,
  requestFullscreen,
  getImageNameFromUrl,
  getNumFromCSSValue,
  hasScrollbar,
  getScrollbarWidth,
  setGrabCursor
} from './utilities';

import draggable from './draggable';
import movable from './movable';
import resizable from './resizable';

/**
 * PhotoViewer Class
 */
class PhotoViewer {

  constructor(items, options, el) {

    let self = this;

    this.options = $.extend(true, {}, DEFAULTS, options);

    if (options && $.isArray(options.footToolbar)) {
      this.options.footToolbar = options.footToolbar;
    }

    if (options && $.isArray(options.headToolbar)) {
      this.options.headToolbar = options.headToolbar;
    }

    // Store element of clicked
    this.$el = $(el);

    // As we have multiple instances,
    // so every instance has following variables.

    // modal open flag
    this.isOpened = false;
    // modal maximize flag
    this.isMaximized = false;
    // image rotate 90*(2n+1) flag
    this.isRotated = false;
    // image rotate angle
    this.rotateAngle = 0;

    // Store image data in every instance
    this.imageData = {};
    // Store modal data in every instance
    this.modalData = {
      width: null,
      height: null,
      left: null,
      top: null
    };

    this.init(items, self.options, el);

  }

  init(items, opts, el) {

    this.groupData = items;
    this.groupIndex = opts['index'];

    // Get image src
    let imgSrc = items[this.groupIndex]['src'];

    this.open();

    this.loadImg(imgSrc);

    // draggable & movable & resizable
    if (opts.draggable) {
      this.draggable(this.$photoviewer, this.dragHandle, CLASS_NS + '-button');
    }
    if (opts.movable) {
      this.movable(this.$stage, this.$image);
    }
    if (opts.resizable) {
      this.resizable(this.$photoviewer, this.$stage, this.$image, opts.modalWidth, opts.modalHeight);
    }

  }

  _creatBtns(toolbar, btns) {

    let btnsStr = '';

    $.each(toolbar, function (index, item) {
      btnsStr += btns[item];
    });

    return btnsStr;

  }

  _creatTitle() {
    return (this.options.title ? `<div class="${NS}-title"></div>` : '');
  }

  _creatDOM() {

    let btnsTpl = {
      minimize: `<button class="${NS}-button ${NS}-button-minimize" title="${this.options.i18n.minimize}">
                    <i class="${this.options.icons.minimize}" aria-hidden="true"></i>
                  </button>`,
      maximize: `<button class="${NS}-button ${NS}-button-maximize" title="${this.options.i18n.maximize}">
                    <i class="${this.options.icons.maximize}" aria-hidden="true"></i>\
                  </button>`,
      close: `<button class="${NS}-button ${NS}-button-close" title="${this.options.i18n.close}">\
                <i class="${this.options.icons.close}" aria-hidden="true"></i>\
              </button>`,
      zoomIn: `<button class="${NS}-button ${NS}-button-zoom-in" title="${this.options.i18n.zoomIn}">\
                  <i class="${this.options.icons.zoomIn}" aria-hidden="true"></i>\
                </button>`,
      zoomOut: `<button class="${NS}-button ${NS}-button-zoom-out" title="${this.options.i18n.zoomOut}">\
                  <i class="${this.options.icons.zoomOut}" aria-hidden="true"></i>\
                </button>`,
      prev: `<button class="${NS}-button ${NS}-button-prev" title="${this.options.i18n.prev}">\
                <i class="${this.options.icons.prev}" aria-hidden="true"></i>\
              </button>`,
      next: `<button class="${NS}-button ${NS}-button-next" title="${this.options.i18n.next}">\
                <i class="${this.options.icons.next}" aria-hidden="true"></i>\
              </button>`,
      fullscreen: `<button class="${NS}-button ${NS}-button-fullscreen" title="${this.options.i18n.fullscreen}">\
                    <i class="${this.options.icons.fullscreen}" aria-hidden="true"></i>\
                  </button>`,
      actualSize: `<button class="${NS}-button ${NS}-button-actual-size" title="${this.options.i18n.actualSize}">\
                      <i class="${this.options.icons.actualSize}" aria-hidden="true"></i>\
                    </button>`,
      rotateLeft: `<button class="${NS}-button ${NS}-button-rotate-left" title="${this.options.i18n.rotateLeft}">\
                      <i class="${this.options.icons.rotateLeft}" aria-hidden="true"></i>\
                    </button>`,
      rotateRight: `<button class="${NS}-button ${NS}-button-rotate-right" title="${this.options.i18n.rotateRight}">\
                      <i class="${this.options.icons.rotateRight}" aria-hidden="true"></i>\
                    </button>`
    };

    // photoviewer base HTML
    let photoviewerHTML = `<div class="${NS}-modal">
                            <div class="${NS}-inner">
                              <div class="${NS}-header">
                                <div class="${NS}-toolbar ${NS}-toolbar-head">
                                  ${this._creatBtns(this.options.headToolbar, btnsTpl)}
                                </div>
                                ${this._creatTitle()}
                              </div>
                              <div class="${NS}-stage">
                                <img class="${NS}-image" src="" alt="" />
                              </div>
                              <div class="${NS}-footer">
                                <div class="${NS}-toolbar ${NS}-toolbar-foot">
                                  ${this._creatBtns(this.options.footToolbar, btnsTpl)}
                                </div>
                              </div>
                            </div>
                          </div>`;

    return photoviewerHTML;

  }

  build() {

    // Create photoviewer HTML string
    let photoviewerHTML = this._creatDOM();

    // Make photoviewer HTML string to jQuery element
    let $photoviewer = $(photoviewerHTML);

    // Get all photoviewer element
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
    this.$next = $photoviewer.find(CLASS_NS + '-button-next');

    // Add class before image loaded
    this.$stage.addClass('stage-ready');
    this.$image.addClass('image-ready');

    // Reset modal z-index with multiple instances
    this.$photoviewer.css('z-index', PUBLIC_VARS['zIndex']);

    // Set handle element of draggable
    if (!this.options.dragHandle || this.options.dragHandle === CLASS_NS + '-modal') {
      this.dragHandle = this.$photoviewer;
    } else {
      this.dragHandle = this.$photoviewer.find(this.options.dragHandle);
    }

  }

  open() {

    if (!this.options.multiInstances) {
      $(CLASS_NS + '-modal').eq(0).remove();
    }

    // Fixed modal position bug
    if (!$(CLASS_NS + '-modal').length && this.options.fixedContent) {

      $('html').css({ 'overflow': 'hidden' });

      if (hasScrollbar()) {
        let scrollbarWidth = getScrollbarWidth();
        if (scrollbarWidth) {
          $('html').css({ 'padding-right': scrollbarWidth });
        }
      }

    }

    this.build();

    this._triggerHook('beforeOpen', this.$el);

    // Add PhotoViewer to DOM
    $('body').append(this.$photoviewer);

    this.addEvents();

    this.setModalPos(this.$photoviewer);

    this._triggerHook('opened', this.$el);

  }

  close() {

    this._triggerHook('beforeClose', this.$el);

    // Remove instance
    this.$photoviewer.remove();

    this.isOpened = false;
    this.isMaximized = false;
    this.isRotated = false;
    this.rotateAngle = 0;

    let zeroModal = !$(CLASS_NS + '-modal').length;

    // Fixed modal position bug
    if (zeroModal && this.options.fixedContent) {
      $('html').css({ 'overflow': '', 'padding-right': '' });
    }

    // Reset zIndex after close
    if (zeroModal && this.options.multiInstances) {
      PUBLIC_VARS['zIndex'] = this.options.zIndex;
    }

    // off events
    if (!$(CLASS_NS + '-modal').length) {
      $D.off(KEYDOWN_EVENT + EVENT_NS);
      $W.off(RESIZE_EVENT + EVENT_NS);
    }

    this._triggerHook('closed', this.$el);

  }

  setModalPos(modal) {

    let winWidth = $W.width(),
      winHeight = $W.height(),
      scrollLeft = $D.scrollLeft(),
      scrollTop = $D.scrollTop();

    let modalWidth = this.options.modalWidth,
      modalHeight = this.options.modalHeight;

    // Set modal maximized when init
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

  }

  setModalSize(img) {

    let self = this,
      winWidth = $W.width(),
      winHeight = $W.height(),
      scrollLeft = $D.scrollLeft(),
      scrollTop = $D.scrollTop();

    // stage css value
    let stageCSS = {
      left: this.$stage.css('left'),
      right: this.$stage.css('right'),
      top: this.$stage.css('top'),
      bottom: this.$stage.css('bottom'),
      borderLeft: this.$stage.css('border-left-width'),
      borderRight: this.$stage.css('border-right-width'),
      borderTop: this.$stage.css('border-top-width'),
      borderBottom: this.$stage.css('border-bottom-width')
    };

    // Modal size should calc with stage css value
    let modalWidth = img.width + getNumFromCSSValue(stageCSS.left) + getNumFromCSSValue(stageCSS.right) +
      getNumFromCSSValue(stageCSS.borderLeft) + getNumFromCSSValue(stageCSS.borderRight),
      modalHeight = img.height + getNumFromCSSValue(stageCSS.top) + getNumFromCSSValue(stageCSS.bottom) +
        getNumFromCSSValue(stageCSS.borderTop) + getNumFromCSSValue(stageCSS.borderBottom);

    let gapThreshold = (this.options.gapThreshold > 0 ? this.options.gapThreshold : 0) + 1,
      // modal scale to window
      scale = Math.min(winWidth / (modalWidth * gapThreshold), winHeight / (modalHeight * gapThreshold), 1);

    let minWidth = Math.max(modalWidth * scale, this.options.modalWidth),
      minHeight = Math.max(modalHeight * scale, this.options.modalHeight);

    minWidth = this.options.fixedModalSize ? this.options.modalWidth : Math.round(minWidth);
    minHeight = this.options.fixedModalSize ? this.options.modalHeight : Math.round(minHeight);

    let modalCSSObj = {
      width: minWidth + 'px',
      height: minHeight + 'px',
      left: (winWidth - minWidth) / 2 + scrollLeft + 'px',
      top: (winHeight - minHeight) / 2 + scrollTop + 'px'
    };

    // Add modal init animation
    if (this.options.initAnimation) {

      this.$photoviewer.animate(modalCSSObj, function () {
        self.setImageSize(img);
      });

    } else {

      this.$photoviewer.css(modalCSSObj);
      this.setImageSize(img);

    }

    this.isOpened = true;

  }

  setImageSize(img) {

    let stageData = {
      w: this.$stage.width(),
      h: this.$stage.height()
    };

    // image scale to stage
    let scale = 1;

    if (!this.isRotated) {
      scale = Math.min(stageData.w / img.width, stageData.h / img.height, 1);
    } else {
      scale = Math.min(stageData.w / img.height, stageData.h / img.width, 1);
    }

    this.$image.css({
      width: Math.ceil(img.width * scale) + 'px',
      height: Math.ceil(img.height * scale) + 'px',
      left: (stageData.w - Math.ceil(img.width * scale)) / 2 + 'px',
      top: (stageData.h - Math.ceil(img.height * scale)) / 2 + 'px'
    });

    // Store image initial data
    $.extend(this.imageData, {
      width: img.width * scale,
      height: img.height * scale,
      left: (stageData.w - img.width * scale) / 2,
      top: (stageData.h - img.height * scale) / 2
    });

    // Set grab cursor
    setGrabCursor({ w: this.$image.width(), h: this.$image.height() }, { w: this.$stage.width(), h: this.$stage.height() },
      this.$stage,
      this.isRotated
    );

    // loader end
    this.$photoviewer.find(CLASS_NS + '-loader').remove();

    // Add image init animation
    if (this.options.initAnimation) {
      this.$image.fadeIn();
    }

  }

  loadImg(imgSrc) {

    let self = this;

    let loaderHTML = `<div class="${NS}-loader"></div>`;

    // loader start
    this.$photoviewer.append(loaderHTML);

    if (this.options.initAnimation) {
      this.$image.hide();
    }

    this.$image.attr('src', imgSrc);

    preloadImg(imgSrc, function (img) {

      // Store original data
      self.imageData = {
        originalWidth: img.width,
        originalHeight: img.height
      };

      if (self.isMaximized || (self.isOpened && self.options.fixedModalPos)) {
        self.setImageSize(img);
      } else {
        self.setModalSize(img);
      }

      self.$stage.removeClass('stage-ready');
      self.$image.removeClass('image-ready');

    }, function () {
      // loader end
      self.$photoviewer.find(CLASS_NS + '-loader').remove();
    });

    if (this.options.title) {
      this.setImgTitle(imgSrc);
    }

  }

  setImgTitle(url) {

    let caption = this.groupData[this.groupIndex].caption,
      captionTxt = caption ? caption : getImageNameFromUrl(url);

    this.$title.text(captionTxt);

  }

  jump(index) {

    this.groupIndex = this.groupIndex + index;

    this.jumpTo(this.groupIndex);

  }

  jumpTo(index) {

    index = index % this.groupData.length;

    if (index >= 0) {
      index = index % this.groupData.length;
    } else if (index < 0) {
      index = (this.groupData.length + index) % this.groupData.length;
    }

    this.groupIndex = index;

    this._triggerHook('beforeChange', index);

    this.loadImg(this.groupData[index].src);

    this._triggerHook('changed', index);

  }

  wheel(e) {

    e.preventDefault();

    let delta = 1;

    if (e.originalEvent.deltaY) {
      delta = e.originalEvent.deltaY > 0 ? 1 : -1;
    } else if (e.originalEvent.wheelDelta) {
      delta = -e.originalEvent.wheelDelta / 120;
    } else if (e.originalEvent.detail) {
      delta = e.originalEvent.detail > 0 ? 1 : -1;
    }

    // ratio threshold
    let ratio = -delta * this.options.ratioThreshold;

    // mouse point position relative to stage
    let pointer = {
      x: e.originalEvent.clientX - this.$stage.offset().left + $D.scrollLeft(),
      y: e.originalEvent.clientY - this.$stage.offset().top + $D.scrollTop()
    };

    this.zoom(ratio, pointer, e);

  }

  zoom(ratio, origin, e) {

    // zoom out & zoom in
    ratio = ratio < 0 ? (1 / (1 - ratio)) : (1 + ratio);

    if (ratio > 0.95 && ratio < 1.05) {
      ratio = 1;
    }

    ratio = this.$image.width() / this.imageData.originalWidth * ratio;

    // min image size
    ratio = Math.max(ratio, this.options.minRatio);
    // max image size
    ratio = Math.min(ratio, this.options.maxRatio);

    this.zoomTo(ratio, origin, e);

  }

  zoomTo(ratio, origin, e) {

    let $image = this.$image,
      $stage = this.$stage,
      imgData = {
        w: this.imageData.width,
        h: this.imageData.height,
        x: this.imageData.left,
        y: this.imageData.top
      };

    // image stage position
    // We will use it to calc the relative position of image
    let stageData = {
      w: $stage.width(),
      h: $stage.height(),
      x: $stage.offset().left,
      y: $stage.offset().top
    };

    let newWidth = this.imageData.originalWidth * ratio,
      newHeight = this.imageData.originalHeight * ratio,
      // Think about it for a while ~~~
      newLeft = origin.x - (origin.x - imgData.x) / imgData.w * newWidth,
      newTop = origin.y - (origin.y - imgData.y) / imgData.h * newHeight;

    // δ is the difference between image new width and new height
    let δ = !this.isRotated ? 0 : (newWidth - newHeight) / 2,
      imgNewWidth = !this.isRotated ? newWidth : newHeight,
      imgNewHeight = !this.isRotated ? newHeight : newWidth;

    let offsetX = stageData.w - newWidth,
      offsetY = stageData.h - newHeight;

    // zoom out & zoom in condition
    // It's important and it takes me a lot of time to get it
    // The conditions with image rotate 90 degree drive me crazy alomst!
    if (imgNewHeight <= stageData.h) {
      newTop = (stageData.h - newHeight) / 2;
    } else {
      newTop = newTop > δ ? δ : (newTop > (offsetY - δ) ? newTop : (offsetY - δ));
    }

    if (imgNewWidth <= stageData.w) {
      newLeft = (stageData.w - newWidth) / 2;
    } else {
      newLeft = newLeft > -δ ? -δ : (newLeft > (offsetX + δ) ? newLeft : (offsetX + δ));
    }

    $image.css({
      width: Math.round(newWidth) + 'px',
      height: Math.round(newHeight) + 'px',
      left: Math.round(newLeft) + 'px',
      top: Math.round(newTop) + 'px'
    });

    // Update image initial data
    $.extend(this.imageData, {
      width: newWidth,
      height: newHeight,
      left: newLeft,
      top: newTop
    });

    // Set grab cursor
    setGrabCursor({ w: Math.round(imgNewWidth), h: Math.round(imgNewHeight) }, { w: stageData.w, h: stageData.h },
      this.$stage
    );

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

    let self = this;

    this.$image.css({
      transform: 'rotate(' + angle + 'deg)'
    });

    this.setImageSize({ width: this.imageData.originalWidth, height: this.imageData.originalHeight });

    // Remove grab cursor when rotate
    this.$stage.removeClass('is-grab');

  }

  resize() {

    let self = this;

    let resizeHandler = throttle(function () {

      if (self.isOpened) {

        if (self.isMaximized) {
          self.setImageSize({ width: self.imageData.originalWidth, height: self.imageData.originalHeight });
        } else {
          self.setModalSize({ width: self.imageData.originalWidth, height: self.imageData.originalHeight });
        }

      }

    }, 500);

    return resizeHandler;

  }

  maximize() {

    let self = this;

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

    this.setImageSize({ width: this.imageData.originalWidth, height: this.imageData.originalHeight });

  }

  fullscreen() {

    requestFullscreen(this.$photoviewer[0]);

  }

  keydown(e) {

    let self = this;

    if (!this.options.keyboard) {
      return false;
    }

    let keyCode = e.keyCode || e.which || e.charCode,
      ctrlKey = e.ctrlKey || e.metaKey,
      altKey = e.altKey || e.metaKey;

    switch (keyCode) {
      // ←
      case 37:
        self.jump(-1);
        break;
      // →
      case 39:
        self.jump(1);
        break;
      // +
      case 187:
        self.zoom(self.options.ratioThreshold * 3, { x: self.$stage.width() / 2, y: self.$stage.height() / 2 }, e);
        break;
      // -
      case 189:
        self.zoom(-self.options.ratioThreshold * 3, { x: self.$stage.width() / 2, y: self.$stage.height() / 2 }, e);
        break;
      // + Firefox
      case 61:
        self.zoom(self.options.ratioThreshold * 3, { x: self.$stage.width() / 2, y: self.$stage.height() / 2 }, e);
        break;
      // - Firefox
      case 173:
        self.zoom(-self.options.ratioThreshold * 3, { x: self.$stage.width() / 2, y: self.$stage.height() / 2 }, e);
        break;
      // ctrl + alt + 0
      case 48:
        if (ctrlKey && altKey) {
          self.zoomTo(1, { x: self.$stage.width() / 2, y: self.$stage.height() / 2 }, e);
        }
        break;
      // ctrl + ,
      case 188:
        if (ctrlKey) {
          self.rotate(-90);
        }
        break;
      // ctrl + .
      case 190:
        if (ctrlKey) {
          self.rotate(90);
        }
        break;
      default:
    }

  }

  addEvents() {

    let self = this;

    this.$close.off(CLICK_EVENT + EVENT_NS).on(CLICK_EVENT + EVENT_NS, function (e) {
      self.close();
    });

    this.$stage.off(WHEEL_EVENT + EVENT_NS).on(WHEEL_EVENT + EVENT_NS, function (e) {
      self.wheel(e);
    });

    this.$zoomIn.off(CLICK_EVENT + EVENT_NS).on(CLICK_EVENT + EVENT_NS, function (e) {
      self.zoom(self.options.ratioThreshold * 3, { x: self.$stage.width() / 2, y: self.$stage.height() / 2 }, e);
    });

    this.$zoomOut.off(CLICK_EVENT + EVENT_NS).on(CLICK_EVENT + EVENT_NS, function (e) {
      self.zoom(-self.options.ratioThreshold * 3, { x: self.$stage.width() / 2, y: self.$stage.height() / 2 }, e);
    });

    this.$actualSize.off(CLICK_EVENT + EVENT_NS).on(CLICK_EVENT + EVENT_NS, function (e) {
      self.zoomTo(1, { x: self.$stage.width() / 2, y: self.$stage.height() / 2 }, e);
    });

    this.$prev.off(CLICK_EVENT + EVENT_NS).on(CLICK_EVENT + EVENT_NS, function () {
      self.jump(-1);
    });

    this.$fullscreen.off(CLICK_EVENT + EVENT_NS).on(CLICK_EVENT + EVENT_NS, function () {
      self.fullscreen();
    });

    this.$next.off(CLICK_EVENT + EVENT_NS).on(CLICK_EVENT + EVENT_NS, function () {
      self.jump(1);
    });

    this.$rotateLeft.off(CLICK_EVENT + EVENT_NS).on(CLICK_EVENT + EVENT_NS, function () {
      self.rotate(-90);
    });

    this.$rotateRight.off(CLICK_EVENT + EVENT_NS).on(CLICK_EVENT + EVENT_NS, function () {
      self.rotate(90);
    });

    this.$maximize.off(CLICK_EVENT + EVENT_NS).on(CLICK_EVENT + EVENT_NS, function () {
      self.maximize();
    });

    $D.off(KEYDOWN_EVENT + EVENT_NS).on(KEYDOWN_EVENT + EVENT_NS, function (e) {
      self.keydown(e);
    });

    $W.on(RESIZE_EVENT + EVENT_NS, self.resize());

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

/**
 * jQuery plugin
 */

let jqEl = null,
  getImgGroup = function (list, groupName) {

    let items = [];

    $(list).each(function () {

      let src = getImgSrc(this);

      items.push({
        src: src,
        caption: $(this).attr('data-caption'),
        groupName: groupName
      });

    });

    return items;

  }

$.fn.photoviewer = function (options) {

  jqEl = $(this);

  options = options ? options : {};

  // Convert a numeric string into a number
  for (let key in options) {
    if (typeof (options[key]) === 'string' && !isNaN(options[key])) {
      options[key] = parseFloat(options[key])
    }
  }

  // Get init event, 'click' or 'dblclick'
  let opts = $.extend(true, {}, DEFAULTS, options);

  // We should get zIndex of options before plugin's init.
  PUBLIC_VARS['zIndex'] = opts.zIndex;

  if (typeof options === 'string') {

    // $(this).data('photoviewer')[options]();

  } else {

    jqEl.off(CLICK_EVENT + EVENT_NS).on(CLICK_EVENT + EVENT_NS, function (e) {

      e.preventDefault();
      // This will stop triggering data-api event
      e.stopPropagation();

      // Get image group
      let items = [],
        currentGroupName = $(this).attr('data-group'),
        groupList = $D.find('[data-group="' + currentGroupName + '"]');

      if (currentGroupName !== undefined) {
        items = getImgGroup(groupList, currentGroupName);
        options['index'] = $(this).index('[data-group="' + currentGroupName + '"]');
      } else {
        items = getImgGroup(jqEl.not('[data-group]'));
        options['index'] = $(this).index();
      }

      $(this).data(NS, new PhotoViewer(items, options, this));

    });

  }

  return jqEl;

};

/**
 * PhotoViewer DATA-API
 */
$D.on(CLICK_EVENT + EVENT_NS, '[data-' + NS + ']', function (e) {

  jqEl = $('[data-' + NS + ']');

  e.preventDefault();

  // Get image group
  let items = [],
    currentGroupName = $(this).attr('data-group'),
    groupList = $D.find('[data-group="' + currentGroupName + '"]');

  if (currentGroupName !== undefined) {
    items = getImgGroup(groupList, currentGroupName);
    DEFAULTS['index'] = $(this).index('[data-group="' + currentGroupName + '"]');
  } else {
    items = getImgGroup(jqEl.not('[data-group]'));
    DEFAULTS['index'] = $(this).index();
  }

  $(this).data(NS, new PhotoViewer(items, DEFAULTS, this));

});

export default PhotoViewer;
