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
  throttle,
  preloadImg,
  requestFullscreen,
  getImageNameFromUrl,
  hasScrollbar,
  getScrollbarWidth,
  setGrabCursor
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

    // Modal open flag
    this.isOpened = false;
    // Modal maximize flag
    this.isMaximized = false;
    // Image rotate 90*(2n+1) flag
    this.isRotated = false;
    // Image rotate angle
    this.rotateAngle = 0;

    // If modal do resize
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

    this.init(items, this.options);
  }

  init(items, opts) {
    this.groupData = items;
    this.groupIndex = opts['index'];

    // Fix https://github.com/nzbin/photoviewer/issues/7
    PUBLIC_VARS['zIndex'] =
      PUBLIC_VARS['zIndex'] === 0 ? opts['zIndex'] : PUBLIC_VARS['zIndex'];

    // Get image src
    let imgSrc = items[this.groupIndex]['src'];

    this.open();

    this.loadImg(imgSrc);

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

  _createBtns(toolbar, btns) {
    let btnsStr = '';

    $.each(toolbar, function(index, item) {
      btnsStr += btns[item];
    });

    return btnsStr;
  }

  _createTitle() {
    return this.options.title ? `<div class="${NS}-title"></div>` : '';
  }

  render() {
    let btnsTpl = {
      minimize: `<button class="${NS}-button ${NS}-button-minimize"
                  title="${this.options.i18n.minimize}">
                    ${this.options.icons.minimize}
                  </button>`,
      maximize: `<button class="${NS}-button ${NS}-button-maximize"
                  title="${this.options.i18n.maximize}">
                    ${this.options.icons.maximize}
                  </button>`,
      close: `<button class="${NS}-button ${NS}-button-close"
              title="${this.options.i18n.close}">
                ${this.options.icons.close}
              </button>`,
      zoomIn: `<button class="${NS}-button ${NS}-button-zoom-in"
                title="${this.options.i18n.zoomIn}">
                  ${this.options.icons.zoomIn}
                </button>`,
      zoomOut: `<button class="${NS}-button ${NS}-button-zoom-out"
                title="${this.options.i18n.zoomOut}">
                  ${this.options.icons.zoomOut}
                </button>`,
      prev: `<button class="${NS}-button ${NS}-button-prev"
              title="${this.options.i18n.prev}">
                ${this.options.icons.prev}
              </button>`,
      next: `<button class="${NS}-button ${NS}-button-next"
              title="${this.options.i18n.next}">
                ${this.options.icons.next}
              </button>`,
      fullscreen: `<button class="${NS}-button ${NS}-button-fullscreen"
                    title="${this.options.i18n.fullscreen}">
                    ${this.options.icons.fullscreen}
                  </button>`,
      actualSize: `<button class="${NS}-button ${NS}-button-actual-size"
                    title="${this.options.i18n.actualSize}">
                      ${this.options.icons.actualSize}
                    </button>`,
      rotateLeft: `<button class="${NS}-button ${NS}-button-rotate-left"
                    title="${this.options.i18n.rotateLeft}">
                      ${this.options.icons.rotateLeft}
                    </button>`,
      rotateRight: `<button class="${NS}-button ${NS}-button-rotate-right"
                      title="${this.options.i18n.rotateRight}">
                      ${this.options.icons.rotateRight}
                    </button>`
    };

    // PhotoViewer base HTML
    let photoviewerHTML = `<div class="${NS}-modal">
        <div class="${NS}-inner">
          <div class="${NS}-header">
            <div class="${NS}-toolbar ${NS}-toolbar-head">
              ${this._createBtns(this.options.headToolbar, btnsTpl)}
            </div>
            ${this._createTitle()}
          </div>
          <div class="${NS}-stage">
            <img class="${NS}-image" src="" alt="" />
          </div>
          <div class="${NS}-footer">
            <div class="${NS}-toolbar ${NS}-toolbar-foot">
              ${this._createBtns(this.options.footToolbar, btnsTpl)}
            </div>
          </div>
        </div>
      </div>`;

    return photoviewerHTML;
  }

  build() {
    // Create PhotoViewer HTML string
    let photoviewerHTML = this.render();

    // Make PhotoViewer HTML string to jQuery element
    let $photoviewer = $(photoviewerHTML);

    // Get all PhotoViewer element
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
    if (
      !this.options.dragHandle ||
      this.options.dragHandle === CLASS_NS + '-modal'
    ) {
      this.dragHandle = this.$photoviewer;
    } else {
      this.dragHandle = this.$photoviewer.find(this.options.dragHandle);
    }
  }

  open() {
    if (!this.options.multiInstances) {
      $(CLASS_NS + '-modal')
        .eq(0)
        .remove();
    }

    // Fixed modal position bug
    if (!$(CLASS_NS + '-modal').length && this.options.fixedContent) {
      $('html').css({ overflow: 'hidden' });

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
    $(this.options.appendTo).eq(0).append(this.$photoviewer);

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
      $('html').css({ overflow: '', 'padding-right': '' });
    }

    // Reset zIndex after close
    if (zeroModal && this.options.multiInstances) {
      PUBLIC_VARS['zIndex'] = this.options.zIndex;
    }

    // Off events
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
    let winWidth = $W.width(),
      winHeight = $W.height(),
      scrollLeft = $D.scrollLeft(),
      scrollTop = $D.scrollTop();

    // Stage css value
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
    let modalWidth =
        img.width +
        parseFloat(stageCSS.left) +
        parseFloat(stageCSS.right) +
        parseFloat(stageCSS.borderLeft) +
        parseFloat(stageCSS.borderRight),
      modalHeight =
        img.height +
        parseFloat(stageCSS.top) +
        parseFloat(stageCSS.bottom) +
        parseFloat(stageCSS.borderTop) +
        parseFloat(stageCSS.borderBottom);

    let gapThreshold =
        (this.options.gapThreshold > 0 ? this.options.gapThreshold : 0) + 1,
      // Modal scale to window
      scale = Math.min(
        winWidth / (modalWidth * gapThreshold),
        winHeight / (modalHeight * gapThreshold),
        1
      );

    let minWidth = Math.max(modalWidth * scale, this.options.modalWidth),
      minHeight = Math.max(modalHeight * scale, this.options.modalHeight);

    minWidth = this.options.fixedModalSize
      ? this.options.modalWidth
      : Math.round(minWidth);
    minHeight = this.options.fixedModalSize
      ? this.options.modalHeight
      : Math.round(minHeight);

    let modalCSSObj = {
      width: minWidth + 'px',
      height: minHeight + 'px',
      left: (winWidth - minWidth) / 2 + scrollLeft + 'px',
      top: (winHeight - minHeight) / 2 + scrollTop + 'px'
    };

    // Add modal init animation
    if (this.options.initAnimation) {
      this.$photoviewer.animate(modalCSSObj, 400, 'ease-in-out', () => {
        this.setImageSize(img);
      });
    } else {
      this.$photoviewer.css(modalCSSObj);
      this.setImageSize(img);
    }

    this.isOpened = true;
  }

  getImageScaleToStage(stageWidth, stageHeight) {
    var scale = 1;

    if (!this.isRotated) {
      scale = Math.min(
        stageWidth / this.img.width,
        stageHeight / this.img.height,
        1
      );
    } else {
      scale = Math.min(
        stageWidth / this.img.height,
        stageHeight / this.img.width,
        1
      );
    }

    return scale;
  }

  setImageSize(img) {
    let stageData = {
      w: this.$stage.width(),
      h: this.$stage.height()
    };

    let scale = this.getImageScaleToStage(stageData.w, stageData.h);

    this.$image.css({
      width: Math.ceil(img.width * scale) + 'px',
      height: Math.ceil(img.height * scale) + 'px',
      left: (stageData.w - Math.ceil(img.width * scale)) / 2 + 'px',
      top: (stageData.h - Math.ceil(img.height * scale)) / 2 + 'px'
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
    if (!this.imgLoaded) {
      // Loader end
      this.$photoviewer.find(CLASS_NS + '-loader').remove();

      // Remove class after image loaded
      this.$stage.removeClass('stage-ready');
      this.$image.removeClass('image-ready');

      // Add image init animation
      if (this.options.initAnimation && !this.options.progressiveLoading) {
        this.$image.fadeIn();
      }

      this.imgLoaded = true;
    }
  }

  loadImg(imgSrc, fn, err) {
    // Reset image
    this.$image.removeAttr('style').attr('src', '');
    this.isRotated = false;
    this.rotateAngle = 0;

    this.imgLoaded = false;

    // Loader start
    this.$photoviewer.append(`<div class="${NS}-loader"></div>`);

    // Add class before image loaded
    this.$stage.addClass('stage-ready');
    this.$image.addClass('image-ready');

    if (this.options.initAnimation && !this.options.progressiveLoading) {
      this.$image.hide();
    }

    this.$image.attr('src', imgSrc);

    preloadImg(
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
      this.setImgTitle(imgSrc);
    }
  }

  setImgTitle(url) {
    let title = this.groupData[this.groupIndex].title
      ? this.groupData[this.groupIndex].title
      : getImageNameFromUrl(url);

    this.$title.html(title);
  }

  jump(step) {
    this._triggerHook('beforeChange', this.groupIndex);

    this.groupIndex = this.groupIndex + step;

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

    this.loadImg(
      this.groupData[index].src,
      () => {
        this._triggerHook('changed', index);
      },
      () => {
        this._triggerHook('changed', index);
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
    let ratio = -delta * this.options.ratioThreshold;

    // mouse point position relative to stage
    let pointer = {
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

    // Fixed digital error
    // if (ratio > 0.95 && ratio < 1.05) {
    //   ratio = 1;
    // }

    if (ratio > this.options.maxRatio || ratio < this.options.minRatio) {
      return;
    }

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

    // Image stage position
    // We will use it to calc the relative position of image
    let stageData = {
      w: $stage.width(),
      h: $stage.height(),
      x: $stage.offset().left,
      y: $stage.offset().top
    };

    let newWidth = this.imageData.originalWidth * ratio,
      newHeight = this.imageData.originalHeight * ratio,
      // Think about it for a while
      newLeft = origin.x - ((origin.x - imgData.x) / imgData.w) * newWidth,
      newTop = origin.y - ((origin.y - imgData.y) / imgData.h) * newHeight;

    // δ is the difference between image new width and new height
    let δ = !this.isRotated ? 0 : (newWidth - newHeight) / 2,
      imgNewWidth = !this.isRotated ? newWidth : newHeight,
      imgNewHeight = !this.isRotated ? newHeight : newWidth;

    let offsetX = stageData.w - newWidth,
      offsetY = stageData.h - newHeight;

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
      newLeft =
        newLeft > -δ ? -δ : newLeft > offsetX + δ ? newLeft : offsetX + δ;
    }

    // If the image scale get to the critical point
    if (
      Math.abs(this.imageData.initWidth - newWidth) <
      this.imageData.initWidth * 0.05
    ) {
      this.setImageSize(this.img);
    } else {
      $image.css({
        width: Math.round(newWidth) + 'px',
        height: Math.round(newHeight) + 'px',
        left: Math.round(newLeft) + 'px',
        top: Math.round(newTop) + 'px'
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
    let resizeHandler = throttle(() => {
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
    }, 500);

    return resizeHandler;
  }

  maximize() {
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
        width: this.modalData.width
          ? this.modalData.width
          : this.options.modalWidth,
        height: this.modalData.height
          ? this.modalData.height
          : this.options.modalHeight,
        left: this.modalData.left
          ? this.modalData.left
          : ($W.width() - this.options.modalWidth) / 2 + $D.scrollLeft(),
        top: this.modalData.top
          ? this.modalData.top
          : ($W.height() - this.options.modalHeight) / 2 + $D.scrollTop()
      });

      this.isMaximized = false;
    }

    this.setImageSize({
      width: this.imageData.originalWidth,
      height: this.imageData.originalHeight
    });
  }

  fullscreen() {
    requestFullscreen(this.$photoviewer[0]);
  }

  keydown(e) {
    if (!this.options.keyboard) {
      return false;
    }

    let keyCode = e.keyCode || e.which || e.charCode,
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

  addEvents() {
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

    this.$actualSize
      .off(CLICK_EVENT + EVENT_NS)
      .on(CLICK_EVENT + EVENT_NS, e => {
        this.zoomTo(
          1,
          { x: this.$stage.width() / 2, y: this.$stage.height() / 2 },
          e
        );
      });

    this.$prev.off(CLICK_EVENT + EVENT_NS).on(CLICK_EVENT + EVENT_NS, () => {
      this.jump(-1);
    });

    this.$fullscreen
      .off(CLICK_EVENT + EVENT_NS)
      .on(CLICK_EVENT + EVENT_NS, () => {
        this.fullscreen();
      });

    this.$next.off(CLICK_EVENT + EVENT_NS).on(CLICK_EVENT + EVENT_NS, () => {
      this.jump(1);
    });

    this.$rotateLeft
      .off(CLICK_EVENT + EVENT_NS)
      .on(CLICK_EVENT + EVENT_NS, () => {
        this.rotate(-90);
      });

    this.$rotateRight
      .off(CLICK_EVENT + EVENT_NS)
      .on(CLICK_EVENT + EVENT_NS, () => {
        this.rotate(90);
      });

    this.$maximize
      .off(CLICK_EVENT + EVENT_NS)
      .on(CLICK_EVENT + EVENT_NS, () => {
        this.maximize();
      });

    $D.off(KEYDOWN_EVENT + EVENT_NS).on(KEYDOWN_EVENT + EVENT_NS, e => {
      this.keydown(e);
    });

    $W.on(RESIZE_EVENT + EVENT_NS, this.resize());
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
