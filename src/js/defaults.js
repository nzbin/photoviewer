import $ from './domq.js';
export default {
  // Whether to enable modal dragging
  draggable: true,

  // Whether to enable modal resizing
  resizable: true,

  // Whether to enable image moving
  movable: true,

  // Whether to enable keyboard navigation
  keyboard: true,

  // Whether to show the title
  title: true,

  // Min width of modal
  modalWidth: 320,

  // Min height of modal
  modalHeight: 320,

  // Whether to change the modal size after image loaded
  fixedModalSize: false,

  // Whether to set maximized on init
  initMaximized: false,

  // Threshold of modal relative to browser window
  gapThreshold: 0.02,

  // Threshold of image ratio
  ratioThreshold: 0.1,

  // Min ratio of image when zoom out
  minRatio: 0.05,

  // Max ratio of image when zoom in
  maxRatio: 16,

  // Toolbar options in header
  headerToolbar: ['maximize', 'close'],

  // Toolbar options in footer
  footerToolbar: [
    'zoomIn',
    'zoomOut',
    'prev',
    'fullscreen',
    'next',
    'actualSize',
    'rotateRight'
  ],

  // Customize button icon
  icons: {
    minimize:
      `<svg viewBox="0 0 24 24" class="svg-inline-icon">
        <path fill="currentColor" d="M20,14H4V10H20"></path>
      </svg>`,
    maximize:
      `<svg viewBox="0 0 24 24" class="svg-inline-icon">
        <path fill="currentColor" d="M4,4H20V20H4V4M6,8V18H18V8H6Z"></path>
      </svg>`,
    close:
      `<svg viewBox="0 0 24 24" class="svg-inline-icon">
        <path fill="currentColor" d="M13.46,12L19,17.54V19H17.54L12,13.46L6.46,19H5V17.54L10.54,12
        L5,6.46V5H6.46L12,10.54L17.54,5H19V6.46L13.46,12Z"></path>
      </svg>`,
    zoomIn:
      `<svg viewBox="0 0 24 24" class="svg-inline-icon">
        <path fill="currentColor" d="M15.5,14L20.5,19L19,20.5L14,15.5V14.71L13.73,14.43
        C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3A6.5,6.5 0 0,1 16,9.5
        C16,11.11 15.41,12.59 14.43,13.73L14.71,14H15.5M9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5
        C7,5 5,7 5,9.5C5,12 7,14 9.5,14M12,10H10V12H9V10H7V9H9V7H10V9H12V10Z"></path>
      </svg>`,
    zoomOut:
      `<svg viewBox="0 0 24 24" class="svg-inline-icon">
        <path fill="currentColor" d="M15.5,14H14.71L14.43,13.73C15.41,12.59 16,11.11 16,9.5
        A6.5,6.5 0 0,0 9.5,3A6.5,6.5 0 0,0 3,9.5A6.5,6.5 0 0,0 9.5,16
        C11.11,16 12.59,15.41 13.73,14.43L14,14.71V15.5L19,20.5L20.5,19L15.5,14M9.5,14
        C7,14 5,12 5,9.5C5,7 7,5 9.5,5C12,5 14,7 14,9.5C14,12 12,14 9.5,14M7,9H12V10H7V9Z"></path>
      </svg>`,
    prev:
      `<svg viewBox="0 0 24 24" class="svg-inline-icon">
        <path fill="currentColor" d="M6,18V6H8V18H6M9.5,12L18,6V18L9.5,12Z"></path>
      </svg>`,
    next:
      `<svg viewBox="0 0 24 24" class="svg-inline-icon">
        <path fill="currentColor" d="M16,18H18V6H16M6,18L14.5,12L6,6V18Z"></path>
      </svg>`,
    fullscreen:
      `<svg viewBox="0 0 24 24" class="svg-inline-icon">
        <path fill="currentColor" d="M8.5,12.5L11,15.5L14.5,11L19,17H5M23,18V6A2,2 0 0,0 21,4H3
        A2,2 0 0,0 1,6V18A2,2 0 0,0 3,20H21A2,2 0 0,0 23,18Z"></path>
      </svg>`,
    actualSize:
      `<svg viewBox="0 0 24 24" class="svg-inline-icon">
        <path fill="currentColor" d="M9.5,13.09L10.91,14.5L6.41,19H10V21H3V14H5V17.59L9.5,13.09
        M10.91,9.5L9.5,10.91L5,6.41V10H3V3H10V5H6.41L10.91,9.5M14.5,13.09L19,17.59V14H21V21H14V19
        H17.59L13.09,14.5L14.5,13.09M13.09,9.5L17.59,5H14V3H21V10H19V6.41L14.5,10.91
        L13.09,9.5Z"></path>
      </svg>`,
    rotateLeft:
      `<svg viewBox="0 0 24 24" class="svg-inline-icon">
        <path fill="currentColor" d="M13,4.07V1L8.45,5.55L13,10V6.09C15.84,6.57 18,9.03 18,12
        C18,14.97 15.84,17.43 13,17.91V19.93C16.95,19.44 20,16.08 20,12C20,7.92 16.95,4.56 13,4.07
        M7.1,18.32C8.26,19.22 9.61,19.76 11,19.93V17.9C10.13,17.75 9.29,17.41 8.54,16.87L7.1,18.32
        M6.09,13H4.07C4.24,14.39 4.79,15.73 5.69,16.89L7.1,15.47C6.58,14.72 6.23,13.88 6.09,13
        M7.11,8.53L5.7,7.11C4.8,8.27 4.24,9.61 4.07,11H6.09C6.23,10.13 6.58,9.28 7.11,8.53Z"></path>
      </svg>`,
    rotateRight:
      `<svg viewBox="0 0 24 24" class="svg-inline-icon">
        <path fill="currentColor" d="M16.89,15.5L18.31,16.89C19.21,15.73 19.76,14.39 19.93,13H17.91
        C17.77,13.87 17.43,14.72 16.89,15.5M13,17.9V19.92C14.39,19.75 15.74,19.21 16.9,18.31
        L15.46,16.87C14.71,17.41 13.87,17.76 13,17.9M19.93,11C19.76,9.61 19.21,8.27 18.31,7.11
        L16.89,8.53C17.43,9.28 17.77,10.13 17.91,11M15.55,5.55L11,1V4.07C7.06,4.56 4,7.92 4,12
        C4,16.08 7.05,19.44 11,19.93V17.91C8.16,17.43 6,14.97 6,12C6,9.03 8.16,6.57 11,6.09V10
        L15.55,5.55Z"></path>
      </svg>`
  },

  // Customize language of button title
  i18n: {
    minimize: 'minimize',
    maximize: 'maximize',
    close: 'close',
    zoomIn: 'zoom-in (+)',
    zoomOut: 'zoom-out (-)',
    prev: 'prev (←)',
    next: 'next (→)',
    fullscreen: 'fullscreen',
    actualSize: 'actual-size (Ctrl+Alt+0)',
    rotateLeft: 'rotate-left (Ctrl+,)',
    rotateRight: 'rotate-right (Ctrl+.)'
  },

  // Whether to enable multiple instances
  multiInstances: true,

  // Whether to enable modal transform animation
  initAnimation: true,

  // Modal transform animation duration
  animationDuration: 400,

  // Whether to disable modal translate to center after image changed
  fixedModalPos: false,

  // Modal css `z-index`
  zIndex: 1090,

  // Selector of drag handler
  dragHandle: null,

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

  // Whether to load the image progressively
  progressiveLoading: true,

  // The DOM element to which viewer will be attached
  appendTo: 'body',

  // Custom Buttons
  customButtons: {},

  // Whether to set modal css `position: fixed`
  positionFixed: true,

  // Init modal position `{top: 0, right: 0, bottom: 0, left: 0}`
  initModalPos: null
};
