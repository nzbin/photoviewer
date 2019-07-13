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

const ELEMS_WITH_GRABBING_CURSOR = `html,body,.${NS}-modal,.${NS}-stage,.${NS}-button,.${NS}-resizable-handle`;

export default {
  /**
   * --------------------------------------------------------------------------
   * 1. No movable
   * 2. Vertical movable
   * 3. Horizontal movable
   * 4. Vertical & Horizontal movable
   * --------------------------------------------------------------------------
   *
   * Image movable
   * @param {Object} stage - The stage element
   * @param {Object} image - The image element
   */
  movable(stage, image) {
    let isDragging = false;

    let startX = 0,
      startY = 0,
      left = 0,
      top = 0,
      widthDiff = 0,
      heightDiff = 0,
      δ = 0;

    let dragStart = e => {
      e = e || window.event;

      e.preventDefault();

      let imageWidth = $(image).width(),
        imageHeight = $(image).height(),
        stageWidth = $(stage).width(),
        stageHeight = $(stage).height();

      startX = e.type === 'touchstart' ? e.targetTouches[0].pageX : e.clientX;
      startY = e.type === 'touchstart' ? e.targetTouches[0].pageY : e.clientY;

      // δ is the difference between image width and height
      δ = !this.isRotated ? 0 : (imageWidth - imageHeight) / 2;

      // Width or height difference can be use to limit image right or top position
      widthDiff = !this.isRotated
        ? imageWidth - stageWidth
        : imageHeight - stageWidth;
      heightDiff = !this.isRotated
        ? imageHeight - stageHeight
        : imageWidth - stageHeight;

      // Modal can be dragging if image is smaller to stage
      isDragging = widthDiff > 0 || heightDiff > 0 ? true : false;
      PUBLIC_VARS['isMoving'] = widthDiff > 0 || heightDiff > 0 ? true : false;

      // Reclac the element position when mousedown
      // Fixed the issue of stage with a border
      left = $(image).position().left - δ;
      top = $(image).position().top + δ;

      // Add grabbing cursor
      if (stage.hasClass('is-grab')) {
        $(ELEMS_WITH_GRABBING_CURSOR).addClass('is-grabbing');
      }

      $D.on(TOUCH_MOVE_EVENT + EVENT_NS, dragMove).on(
        TOUCH_END_EVENT + EVENT_NS,
        dragEnd
      );
    };

    let dragMove = e => {
      e = e || window.event;

      e.preventDefault();

      if (isDragging) {
        let endX =
            e.type === 'touchmove' ? e.targetTouches[0].pageX : e.clientX,
          endY = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.clientY,
          relativeX = endX - startX,
          relativeY = endY - startY,
          newLeft = relativeX + left,
          newTop = relativeY + top;

        // Vertical limit
        if (heightDiff > 0) {
          if (relativeY + top > δ) {
            newTop = δ;
          } else if (relativeY + top < -heightDiff + δ) {
            newTop = -heightDiff + δ;
          }
        } else {
          newTop = top;
        }
        // Horizontal limit
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
        });

        // Update image initial data
        $.extend(this.imageData, {
          left: newLeft,
          top: newTop
        });
      }
    };

    let dragEnd = () => {
      $D.off(TOUCH_MOVE_EVENT + EVENT_NS, dragMove).off(
        TOUCH_END_EVENT + EVENT_NS,
        dragEnd
      );

      isDragging = false;
      PUBLIC_VARS['isMoving'] = false;

      // Remove grabbing cursor
      $(ELEMS_WITH_GRABBING_CURSOR).removeClass('is-grabbing');
    };

    $(stage).on(TOUCH_START_EVENT + EVENT_NS, dragStart);
  }
};
