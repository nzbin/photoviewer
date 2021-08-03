import $ from './domq.js';
import {
  $D,
  TOUCH_START_EVENT,
  TOUCH_MOVE_EVENT,
  TOUCH_END_EVENT,
  EVENT_NS,
  PUBLIC_VARS
} from './constants';

export default {
  /**
   * Draggable
   * @param {Object} $modal - The modal element of domq
   * @param {Object} dragHandle - The handle element when dragging
   * @param {Object} dragCancel - The cancel element when dragging
   */
  draggable($modal, dragHandle, dragCancel) {
    let isDragging = false;

    let startX = 0;
    let startY = 0;
    let left = 0;
    let top = 0;

    const dragStart = e => {
      e = e || window.event;

      // Must be removed
      // e.preventDefault();

      // Fix focus scroll issue on Chrome
      $modal[0].blur();

      // Get clicked button
      const elemCancel = $(e.target).closest(dragCancel);
      // Stop modal moving when click buttons
      if (elemCancel.length) {
        return true;
      }

      if (this.options.multiInstances) {
        $modal.css('z-index', ++PUBLIC_VARS['zIndex']);
      }

      isDragging = true;

      startX = e.type === 'touchstart' ? e.targetTouches[0].pageX : e.clientX;
      startY = e.type === 'touchstart' ? e.targetTouches[0].pageY : e.clientY;

      // Get current position of the modal
      left = parseFloat($modal.css('left'));
      top = parseFloat($modal.css('top'));

      $D.on(TOUCH_MOVE_EVENT + EVENT_NS, dragMove).on(
        TOUCH_END_EVENT + EVENT_NS,
        dragEnd
      );
    };

    const dragMove = e => {
      e = e || window.event;

      e.preventDefault();

      if (
        isDragging &&
        !PUBLIC_VARS['isMoving'] &&
        !PUBLIC_VARS['isResizing'] &&
        !this.isMaximized
      ) {
        const endX = e.type === 'touchmove' ? e.targetTouches[0].pageX : e.clientX;
        const endY = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.clientY;
        const relativeX = endX - startX;
        const relativeY = endY - startY;

        $modal.css({
          left: relativeX + left,
          top: relativeY + top
        });
      }
    };

    const dragEnd = () => {
      $D.off(TOUCH_MOVE_EVENT + EVENT_NS, dragMove).off(
        TOUCH_END_EVENT + EVENT_NS,
        dragEnd
      );

      isDragging = false;

      // Focus must be executed after drag end
      $modal[0].focus();
    };

    $(dragHandle).on(TOUCH_START_EVENT + EVENT_NS, dragStart);
  }
};
