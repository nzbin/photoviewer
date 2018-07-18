export default {

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
  minRatio: 0.1,

  // Max ratio of image when zoom in
  maxRatio: 16,

  // Toolbar options in header
  headToolbar: [
    'maximize',
    'close'
  ],

  // Toolbar options in footer
  footToolbar: [
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
    minimize: 'fa fa-window-minimize',
    maximize: 'fa fa-window-maximize',
    close: 'fa fa-close',
    zoomIn: 'fa fa-search-plus',
    zoomOut: 'fa fa-search-minus',
    prev: 'fa fa-arrow-left',
    next: 'fa fa-arrow-right',
    fullscreen: 'fa fa-photo',
    actualSize: 'fa fa-arrows-alt',
    rotateLeft: 'fa fa-rotate-left',
    rotateRight: 'fa fa-rotate-right'
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
  index: 0

}
