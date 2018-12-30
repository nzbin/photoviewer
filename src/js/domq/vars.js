var emptyArray = [],
  concat = emptyArray.concat,
  filter = emptyArray.filter,
  slice = emptyArray.slice,
  document = window.document,
  elementDisplay = {},
  classCache = {},
  cssNumber = {
    'column-count': 1,
    'columns': 1,
    'font-weight': 1,
    'line-height': 1,
    'opacity': 1,
    'z-index': 1,
    'zoom': 1
  },
  fragmentRE = /^\s*<(\w+|!)[^>]*>/,
  singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
  tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
  rootNodeRE = /^(?:body|html)$/i,
  capitalRE = /([A-Z])/g,

  // special attributes that should be get/set via method calls
  methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'],

  adjacencyOperators = ['after', 'prepend', 'before', 'append'],
  dimensions= ['width', 'height'],

  table = document.createElement('table'),
  tableRow = document.createElement('tr'),
  containers = {
    'tr': document.createElement('tbody'),
    'tbody': table,
    'thead': table,
    'tfoot': table,
    'td': tableRow,
    'th': tableRow,
    '*': document.createElement('div')
  },
  simpleSelectorRE = /^[\w-]*$/,
  class2type = {},
  toString = class2type.toString,
  tempParent = document.createElement('div'),
  propMap = {
    'tabindex': 'tabIndex',
    'readonly': 'readOnly',
    'for': 'htmlFor',
    'class': 'className',
    'maxlength': 'maxLength',
    'cellspacing': 'cellSpacing',
    'cellpadding': 'cellPadding',
    'rowspan': 'rowSpan',
    'colspan': 'colSpan',
    'usemap': 'useMap',
    'frameborder': 'frameBorder',
    'contenteditable': 'contentEditable'
  },
  isArray = Array.isArray || function (arg) {
    return Object.prototype.toString.call(arg) === '[object Array]';
  },
  // Using in Event
  handlers = {},
  specialEvents = {
    click: 'MouseEvents',
    mousedown: 'MouseEvents',
    mouseup: 'MouseEvents',
    mousemove: 'MouseEvents',
  },
  focusinSupported = 'onfocusin' in window,
  focus = { focus: 'focusin', blur: 'focusout' },
  hover = { mouseenter: 'mouseover', mouseleave: 'mouseout' },
  ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$|webkitMovement[XY]$)/,
  eventMethods = {
    preventDefault: 'isDefaultPrevented',
    stopImmediatePropagation: 'isImmediatePropagationStopped',
    stopPropagation: 'isPropagationStopped'
  };

export {
  emptyArray,
  concat,
  filter,
  slice,
  document,
  elementDisplay,
  classCache,
  cssNumber,
  fragmentRE,
  singleTagRE,
  tagExpanderRE,
  rootNodeRE,
  capitalRE,
  methodAttributes,
  adjacencyOperators,
  dimensions,
  containers,
  simpleSelectorRE,
  class2type,
  toString,
  tempParent,
  propMap,
  isArray,
  handlers,
  specialEvents,
  focusinSupported,
  focus,
  hover,
  ignoreProperties,
  eventMethods,
}


