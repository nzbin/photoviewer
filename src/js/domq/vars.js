var document = window.document,
  emptyArray = [],
  concat = emptyArray.concat,
  filter = emptyArray.filter,
  slice = emptyArray.slice,
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
  };

export {
  document,
  emptyArray,
  concat,
  filter,
  slice,
  elementDisplay,
  classCache,
  cssNumber,
  fragmentRE,
  singleTagRE,
  tagExpanderRE,
  rootNodeRE,
  capitalRE,
  methodAttributes,
  containers,
  simpleSelectorRE,
  class2type,
  toString,
  tempParent,
  propMap,
  isArray
}
