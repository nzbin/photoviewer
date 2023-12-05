import $ from './domq.js';
import {
  $D,
  TOUCH_START_EVENT,
  TOUCH_MOVE_EVENT,
  TOUCH_END_EVENT,
  EVENT_NS,
  PUBLIC_VARS
} from './constants';

/**
 * Modal draggable
 *
 * @param {object} $modal - The modal element of domq
 * @param {object} dragHandle - The handle element when dragging
 * @param {object} dragCancel - The cancel element when dragging
 */
export function draggable($modal, dragHandle, dragCancel) {
  let startX = 0;
  let startY = 0;
  let left = 0;
  let top = 0;

  const dragStart = e => {
    e = e || window.event;

    // Must be removed
    // e.preventDefault();

    $modal[0].focus();

    // Get clicked button
    const elemCancel = $(e.target).closest(dragCancel);
    // Stop modal moving when click buttons
    if (elemCancel.length) {
      return true;
    }

    if (this.options.multiInstances) {
      $modal.css('z-index', ++PUBLIC_VARS['zIndex']);
    }

    startX = e.type === 'touchstart' ? e.targetTouches[0].pageX : e.clientX;
    startY = e.type === 'touchstart' ? e.targetTouches[0].pageY : e.clientY;

    // Get the modal's current position
    left = parseFloat($modal.css('left'));
    top = parseFloat($modal.css('top'));

    // Reset the modal's position with left and top value
    $modal.css({ left, top, right: '', bottom: '' });

    $D.on(TOUCH_MOVE_EVENT + EVENT_NS, dragMove)
      .on(TOUCH_END_EVENT + EVENT_NS, dragEnd);
  };

  const dragMove = e => {
    e = e || window.event;

    e.preventDefault();

    if (
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
    $D.off(TOUCH_MOVE_EVENT + EVENT_NS, dragMove)
      .off(TOUCH_END_EVENT + EVENT_NS, dragEnd);
  };

  $(dragHandle).on(TOUCH_START_EVENT + EVENT_NS, dragStart);
}
