/*!
 *     ____  __  ______  __________ _    _____________       ____________
 *    / __ \/ / / / __ \/_  __/ __ \ |  / /  _/ ____/ |     / / ____/ __ \
 *   / /_/ / /_/ / / / / / / / / / / | / // // __/  | | /| / / __/ / /_/ /
 *  / ____/ __  / /_/ / / / / /_/ /| |/ // // /___  | |/ |/ / /___/ _, _/
 * /_/   /_/ /_/\____/ /_/  \____/ |___/___/_____/  |__/|__/_____/_/ |_|
 *
 * photoviewer - v3.10.3
 * A JS plugin to view images just like in Windows.
 * https://nzbin.github.io/photoviewer/
 *
 * Copyright (c) 2018-present nzbin
 * Released under MIT License
 */

'use strict';

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
  }
}
function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", {
    writable: false
  });
  return Constructor;
}
function _defineProperty(obj, key, value) {
  key = _toPropertyKey(key);
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
function _toPrimitive(input, hint) {
  if (typeof input !== "object" || input === null) return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== undefined) {
    var res = prim.call(input, hint || "default");
    if (typeof res !== "object") return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (hint === "string" ? String : Number)(input);
}
function _toPropertyKey(arg) {
  var key = _toPrimitive(arg, "string");
  return typeof key === "symbol" ? key : String(key);
}

// Class D
var D = function (selector, context) {
  return new D.fn.init(selector, context);
};

var document$1 = window.document,
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
  // special attributes that should be get/set via method calls
  methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'],

  table = document$1.createElement('table'),
  tableRow = document$1.createElement('tr'),
  containers = {
    'tr': document$1.createElement('tbody'),
    'tbody': table,
    'thead': table,
    'tfoot': table,
    'td': tableRow,
    'th': tableRow,
    '*': document$1.createElement('div')
  },
  simpleSelectorRE = /^[\w-]*$/,
  class2type = {},
  toString = class2type.toString,
  tempParent = document$1.createElement('div'),
  isArray = Array.isArray || function (arg) {
    return Object.prototype.toString.call(arg) === '[object Array]';
  },
  contains = document$1.documentElement.contains
    ? function (parent, node) {
      return parent !== node && parent.contains(node);
    }
    : function (parent, node) {
      while (node && (node = node.parentNode))
        if (node === parent) return true;
      return false;
    };

function type(obj) {
  return obj == null
    ? String(obj)
    : class2type[toString.call(obj)] || 'object';
}

function isString(obj) {
  return typeof obj == 'string';
}

function isFunction(value) {
  return type(value) == 'function';
}

function isWindow(obj) {
  return obj != null && obj == obj.window;
}

function isDocument(obj) {
  return obj != null && obj.nodeType == obj.DOCUMENT_NODE;
}

function isObject(obj) {
  return type(obj) == 'object';
}

function isPlainObject(obj) {
  return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype;
}

function likeArray(obj) {
  var length = !!obj && 'length' in obj && obj.length,
    typeRes = type(obj);

  return 'function' != typeRes && !isWindow(obj) && (
    'array' == typeRes || length === 0 ||
    (typeof length == 'number' && length > 0 && (length - 1) in obj)
  );
}

function compact(array) {
  return filter.call(array, function (item) {
    return item != null;
  });
}

function dasherize$1(str) {
  return str.replace(/::/g, '/')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    .replace(/([a-z\d])([A-Z])/g, '$1_$2')
    .replace(/_/g, '-')
    .toLowerCase();
}

function maybeAddPx(name, value) {
  return (typeof value == 'number' && !cssNumber[dasherize$1(name)]) ? value + 'px' : value;
}

function camelize(str) {
  return str.replace(/-+(.)?/g, function (match, chr) {
    return chr ? chr.toUpperCase() : '';
  });
}

function classRE(name) {
  return name in classCache ?
    classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'));
}

function defaultDisplay(nodeName) {
  var element, display;
  if (!elementDisplay[nodeName]) {
    element = document$1.createElement(nodeName);
    document$1.body.appendChild(element);
    display = getComputedStyle(element, '').getPropertyValue('display');
    element.parentNode.removeChild(element);
    display == 'none' && (display = 'block');
    elementDisplay[nodeName] = display;
  }
  return elementDisplay[nodeName];
}

function flatten(array) {
  return array.length > 0 ? D.fn.concat.apply([], array) : array;
}

function isD(object) {
  return object instanceof D;
}

function funcArg(context, arg, idx, payload) {
  return isFunction(arg) ? arg.call(context, idx, payload) : arg;
}

function setAttribute(node, name, value) {
  value == null ? node.removeAttribute(name) : node.setAttribute(name, value);
}

// access className property while respecting SVGAnimatedString
function className(node, value) {
  var klass = node.className || '',
    svg = klass && klass.baseVal !== undefined;

  if (value === undefined) return svg ? klass.baseVal : klass;
  svg ? (klass.baseVal = value) : (node.className = value);
}

function nodeName(elem, name) {
  return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
}

D.fn = D.prototype = {
  constuctor: D,
  length: 0,
  // Because a collection acts like an array
  // copy over these useful array functions.
  forEach: emptyArray.forEach,
  reduce: emptyArray.reduce,
  push: emptyArray.push,
  sort: emptyArray.sort,
  splice: emptyArray.splice,
  indexOf: emptyArray.indexOf,
  // D's counterpart to jQuery's `$.fn.init` and
  // takes a CSS selector and an optional context (and handles various
  // special cases).
  init: function (selector, context) {
    var dom;
    // If nothing given, return an empty D collection
    if (!selector) {
      return this;
    }
    // Optimize for string selectors
    else if (typeof selector == 'string') {
      selector = selector.trim();
      // If it's a html fragment, create nodes from it
      // Note: In both Chrome 21 and Firefox 15, DOM error 12
      // is thrown if the fragment doesn't begin with <
      if (selector[0] == '<' && fragmentRE.test(selector)) {
        dom = D.fragment(selector, RegExp.$1, context);
        selector = null;
      }
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) {
        return D(context).find(selector);
      }
      // If it's a CSS selector, use it to select nodes.
      else {
        dom = D.qsa(document$1, selector);
      }
    }
    // If a function is given, call it when the DOM is ready
    else if (isFunction(selector)) {
      return D(document$1).ready(selector);
    }
    // If a D collection is given, just return it
    else if (isD(selector)) {
      return selector;
    }
    // normalize array if an array of nodes is given
    else if (isArray(selector)) {
      dom = compact(selector);
    }
    // Wrap DOM nodes.
    else if (isObject(selector)) {
      dom = [selector], selector = null;
    }
    // If there's a context, create a collection on that context first, and select
    // nodes from there
    else if (context !== undefined) {
      return D(context).find(selector);
    }
    // And last but no least, if it's a CSS selector, use it to select nodes.
    else {
      dom = D.qsa(document$1, selector);
    }
    // create a new D collection from the nodes found
    return D.makeArray(dom, selector, this);
  },
  // Modify the collection by adding elements to it
  concat: function () {
    var i, value, args = [];
    for (i = 0; i < arguments.length; i++) {
      value = arguments[i];
      args[i] = isD(value) ? value.toArray() : value;
    }
    return concat.apply(isD(this) ? this.toArray() : this, args);
  },
  // `pluck` is borrowed from Prototype.js
  pluck: function (property) {
    return D.map(this, function (el) { return el[property]; });
  },
  toArray: function () {
    return this.get();
  },
  get: function (idx) {
    return idx === undefined
      ? slice.call(this)
      : this[idx >= 0 ? idx : idx + this.length];
  },
  size: function () {
    return this.length;
  },
  each: function (callback) {
    emptyArray.every.call(this, function (el, idx) {
      return callback.call(el, idx, el) !== false;
    });
    return this;
  },
  map: function (fn) {
    return D(D.map(this, function (el, i) { return fn.call(el, i, el); }));
  },
  slice: function () {
    return D(slice.apply(this, arguments));
  },
  first: function () {
    var el = this[0];
    return el && !isObject(el) ? el : D(el);
  },
  last: function () {
    var el = this[this.length - 1];
    return el && !isObject(el) ? el : D(el);
  },
  eq: function (idx) {
    return idx === -1 ? this.slice(idx) : this.slice(idx, +idx + 1);
  }
};

D.extend = D.fn.extend = function () {
  var options, name, src, copy, copyIsArray, clone,
    target = arguments[0] || {},
    i = 1,
    length = arguments.length,
    deep = false;

  // Handle a deep copy situation
  if (typeof target === 'boolean') {
    deep = target;

    // Skip the boolean and the target
    target = arguments[i] || {};
    i++;
  }
  // Handle case when target is a string or something (possible in deep copy)
  if (typeof target !== 'object' && !isFunction(target)) {
    target = {};
  }
  // Extend D itself if only one argument is passed
  if (i === length) {
    target = this;
    i--;
  }
  for (; i < length; i++) {
    // Only deal with non-null/undefined values
    if ((options = arguments[i]) != null) {
      // Extend the base object
      for (name in options) {
        src = target[name];
        copy = options[name];
        // Prevent never-ending loop
        if (target === copy) {
          continue;
        }
        // Recurse if we're merging plain objects or arrays
        if (deep && copy && (isPlainObject(copy) ||
          (copyIsArray = isArray(copy)))) {
          if (copyIsArray) {
            copyIsArray = false;
            clone = src && isArray(src) ? src : [];
          } else {
            clone = src && isPlainObject(src) ? src : {};
          }
          // Never move original objects, clone them
          target[name] = D.extend(deep, clone, copy);
          // Don't bring in undefined values
        } else if (copy !== undefined) {
          target[name] = copy;
        }
      }
    }
  }
  // Return the modified object
  return target;
};

D.extend({
  // Make DOM Array
  makeArray: function (dom, selector, me) {
    var i, len = dom ? dom.length : 0;
    for (i = 0; i < len; i++) me[i] = dom[i];
    me.length = len;
    me.selector = selector || '';
    return me;
  },
  merge: function (first, second) {
    var len = +second.length,
      j = 0,
      i = first.length;
    for (; j < len; j++) first[i++] = second[j];
    first.length = i;
    return first;
  },
  // D's CSS selector
  qsa: function (element, selector) {
    var found,
      maybeID = selector[0] == '#',
      maybeClass = !maybeID && selector[0] == '.',
      // Ensure that a 1 char tag name still gets checked
      nameOnly = maybeID || maybeClass ? selector.slice(1) : selector,
      isSimple = simpleSelectorRE.test(nameOnly);
    return (
      // Safari DocumentFragment doesn't have getElementById
      element.getElementById && isSimple && maybeID)
      // eslint-disable-next-line no-cond-assign
      ? (found = element.getElementById(nameOnly))
        ? [found]
        : []
      : element.nodeType !== 1 && element.nodeType !== 9 && element.nodeType !== 11
        ? []
        : slice.call(
          // DocumentFragment doesn't have getElementsByClassName/TagName
          isSimple && !maybeID && element.getElementsByClassName
            ? maybeClass
              // If it's simple, it could be a class
              ? element.getElementsByClassName(nameOnly)
              // Or a tag
              : element.getElementsByTagName(selector)
            // Or it's not simple, and we need to query all
            : element.querySelectorAll(selector)
        );
  },
  // Html -> Node
  fragment: function (html, name, properties) {
    var dom, nodes, container;

    // A special case optimization for a single tag
    if (singleTagRE.test(html)) dom = D(document$1.createElement(RegExp.$1));

    if (!dom) {
      if (html.replace) html = html.replace(tagExpanderRE, '<$1></$2>');
      if (name === undefined) name = fragmentRE.test(html) && RegExp.$1;
      if (!(name in containers)) name = '*';

      container = containers[name];
      container.innerHTML = '' + html;
      dom = D.each(slice.call(container.childNodes), function () {
        container.removeChild(this);
      });
    }

    if (isPlainObject(properties)) {
      nodes = D(dom);
      D.each(properties, function (key, value) {
        if (methodAttributes.indexOf(key) > -1) nodes[key](value);
        else nodes.attr(key, value);
      });
    }

    return dom;
  },
  matches: function (element, selector) {
    if (!selector || !element || element.nodeType !== 1) return false;
    var matchesSelector = element.matches || element.webkitMatchesSelector ||
      element.mozMatchesSelector || element.oMatchesSelector ||
      element.matchesSelector;
    if (matchesSelector) return matchesSelector.call(element, selector);
    // fall back to performing a selector:
    var match, parent = element.parentNode,
      temp = !parent;
    if (temp) (parent = tempParent).appendChild(element);
    match = ~D.qsa(parent, selector).indexOf(element);
    temp && tempParent.removeChild(element);
    return match;
  },
  each: function (elements, callback) {
    var i, key;
    if (likeArray(elements)) {
      for (i = 0; i < elements.length; i++)
        if (callback.call(elements[i], i, elements[i]) === false) return elements;
    } else {
      for (key in elements)
        if (callback.call(elements[key], key, elements[key]) === false) return elements;
    }
    return elements;
  },
  map: function (elements, callback) {
    var value, values = [],
      i, key;
    if (likeArray(elements))
      for (i = 0; i < elements.length; i++) {
        value = callback(elements[i], i);
        if (value != null) values.push(value);
      }
    else
      for (key in elements) {
        value = callback(elements[key], key);
        if (value != null) values.push(value);
      }
    return flatten(values);
  }
});

// Populate the class2type map
D.each('Boolean Number String Function Array Date RegExp Object Error'.split(' '), function (i, name) {
  class2type['[object ' + name + ']'] = name.toLowerCase();
});

D.fn.init.prototype = D.fn;

function noop() {
}

function css(property, value) {
  if (arguments.length < 2) {
    var element = this[0];
    if (typeof property == 'string') {
      if (!element) return;
      return element.style[camelize(property)] || getComputedStyle(element, '').getPropertyValue(property);
    } else if (isArray(property)) {
      if (!element) return;
      var props = {};
      var computedStyle = getComputedStyle(element, '');
      D.each(property, function (_, prop) {
        props[prop] = (element.style[camelize(prop)] || computedStyle.getPropertyValue(prop));
      });
      return props;
    }
  }

  var css = '';
  if (type(property) == 'string') {
    if (!value && value !== 0) {
      this.each(function () {
        this.style.removeProperty(dasherize$1(property));
      });
    } else {
      css = dasherize$1(property) + ':' + maybeAddPx(property, value);
    }
  } else {
    for (var key in property) {
      if (!property[key] && property[key] !== 0) {
        this.each(function () { this.style.removeProperty(dasherize$1(key)); });
      } else {
        css += dasherize$1(key) + ':' + maybeAddPx(key, property[key]) + ';';
      }
    }
  }

  return this.each(function () { this.style.cssText += ';' + css; });
}

function hasClass(name) {
  if (!name) return false;
  return emptyArray.some.call(this, function (el) {
    return this.test(className(el));
  }, classRE(name));
}

function addClass(name) {
  var classList = [];
  if (!name) return this;
  return this.each(function (idx) {
    if (!('className' in this)) return;
    classList = [];
    var cls = className(this),
      newName = funcArg(this, name, idx, cls);
    newName.split(/\s+/g).forEach(function (klass) {
      if (!D(this).hasClass(klass)) classList.push(klass);
    }, this);
    classList.length && className(this, cls + (cls ? ' ' : '') + classList.join(' '));
  });
}

function removeClass(name) {
  var classList = [];
  return this.each(function (idx) {
    if (!('className' in this)) return;
    if (name === undefined) return className(this, '');
    classList = className(this);
    funcArg(this, name, idx, classList).split(/\s+/g).forEach(function (klass) {
      classList = classList.replace(classRE(klass), ' ');
    });
    className(this, classList.trim());
  });
}

function offset(coordinates) {
  if (coordinates) return this.each(function (index) {
    var $this = D(this),
      coords = funcArg(this, coordinates, index, $this.offset()),
      parentOffset = $this.offsetParent().offset(),
      props = {
        top: coords.top - parentOffset.top,
        left: coords.left - parentOffset.left
      };

    if ($this.css('position') == 'static') props['position'] = 'relative';
    $this.css(props);
  });
  if (!this.length) return null;
  if (document$1.documentElement !== this[0] && !contains(document$1.documentElement, this[0]))
    return { top: 0, left: 0 };
  var obj = this[0].getBoundingClientRect();
  return {
    left: obj.left + window.pageXOffset,
    top: obj.top + window.pageYOffset,
    width: Math.round(obj.width),
    height: Math.round(obj.height)
  };
}

function position() {
  if (!this.length) return;

  var elem = this[0], offset,
    // Get *real* offset parent
    offsetParent = this.offsetParent(),
    parentOffset = rootNodeRE.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset();

  // `position: fixed` elements are offset from the viewport, which itself always has zero offset
  if (D(elem).css('position') === 'fixed') {
    // Assume `position: fixed` implies availability of getBoundingClientRect
    offset = elem.getBoundingClientRect();
  } else {
    offset = this.offset();

    // Incorporate borders into its offset, since they are outside its content origin
    parentOffset.top += parseFloat(D(offsetParent[0]).css('border-top-width')) || 0;
    parentOffset.left += parseFloat(D(offsetParent[0]).css('border-left-width')) || 0;
  }

  // Subtract parent offsets and element margins
  // note: when an element has `margin: auto` the offsetLeft and marginLeft
  // are the same in Safari causing `offset.left` to incorrectly be 0
  return {
    top: offset.top - parentOffset.top - parseFloat(D(elem).css('margin-top')) || 0,
    left: offset.left - parentOffset.left - parseFloat(D(elem).css('margin-left')) || 0
  };
}

function scrollTop(value) {
  if (!this.length) return;
  var hasScrollTop = 'scrollTop' in this[0];
  if (value === undefined) return hasScrollTop
    ? this[0].scrollTop
    : isWindow(this[0])
      ? this[0].pageYOffset
      : this[0].defaultView.pageYOffset;
  return this.each(hasScrollTop ?
    function () { this.scrollTop = value; } :
    function () { this.scrollTo(this.scrollX, value); });
}

function scrollLeft(value) {
  if (!this.length) return;
  var hasScrollLeft = 'scrollLeft' in this[0];
  if (value === undefined) return hasScrollLeft
    ? this[0].scrollLeft
    : isWindow(this[0])
      ? this[0].pageXOffset
      : this[0].defaultView.pageXOffset;
  return this.each(hasScrollLeft ?
    function () { this.scrollLeft = value; } :
    function () { this.scrollTo(value, this.scrollY); });
}

function offsetParent() {
  return this.map(function () {
    var parent = this.offsetParent || document$1.body;
    while (parent && !rootNodeRE.test(parent.nodeName) && D(parent).css('position') == 'static')
      parent = parent.offsetParent;
    return parent;
  });
}

function attr(name, value) {
  var result;
  return (typeof name == 'string' && !(1 in arguments))
    ? (0 in this && this[0].nodeType == 1 && (result = this[0].getAttribute(name)) != null
      ? result
      : undefined)
    : this.each(function (idx) {
      if (this.nodeType !== 1) return;
      if (isObject(name))
        for (var key in name) setAttribute(this, key, name[key]);
      else setAttribute(this, name, funcArg(this, value, idx, this.getAttribute(name)));
    });
}

function removeAttr(name) {
  return this.each(function () {
    this.nodeType === 1 && name.split(' ').forEach(function (attribute) {
      setAttribute(this, attribute);
    }, this);
  });
}

function find(selector) {
  var result, $this = this;
  if (!selector) result = D();
  else if (typeof selector == 'object')
    result = D(selector).filter(function () {
      var node = this;
      return emptyArray.some.call($this, function (parent) {
        return contains(parent, node);
      });
    });
  else if (this.length == 1) result = D(D.qsa(this[0], selector));
  else result = this.map(function () { return D.qsa(this, selector); });
  return result;
}

function closest(selector, context) {
  var nodes = [],
    collection = typeof selector == 'object' && D(selector);
  this.each(function (_, node) {
    while (node && !(collection ? collection.indexOf(node) >= 0 : D.matches(node, selector)))
      node = node !== context && !isDocument(node) && node.parentNode;
    if (node && nodes.indexOf(node) < 0) nodes.push(node);
  });
  return D(nodes);
}

function isIE() {
  var ua = window.navigator.userAgent;
  var msie = ua.indexOf('MSIE ');
  return msie > 0 || !!navigator.userAgent.match(/Trident.*rv:11\./);
}

function subtract(el, dimen) {
  var offsetMap = {
    width: ['padding-left', 'padding-right', 'border-left-width', 'border-right-width'],
    height: ['padding-top', 'padding-bottom', 'border-top-width', 'border-bottom-width']
  };
  return el.css('box-sizing') === 'border-box' && !isIE()
    ? parseFloat(el.css(dimen))
      - parseFloat(el.css(offsetMap[dimen][0]))
      - parseFloat(el.css(offsetMap[dimen][1]))
      - parseFloat(el.css(offsetMap[dimen][2]))
      - parseFloat(el.css(offsetMap[dimen][3]))
    : parseFloat(el.css(dimen));
}

function calc(dimension, value) {
  var dimensionProperty = dimension.replace(/./, function (m) { return m[0].toUpperCase(); });
  var el = this[0];
  if (value === undefined) return isWindow(el)
    ? el.document.documentElement['client' + dimensionProperty]
    : isDocument(el)
      ? el.documentElement['scroll' + dimensionProperty]
      : subtract(this, dimension);
  else return this.each(function (idx) {
    el = D(this);
    el.css(dimension, funcArg(this, value, idx, el[dimension]()));
  });
}

// Export

function width(value) {
  return calc.call(this, 'width', value);
}

function height(value) {
  return calc.call(this, 'height', value);
}

var _zid = 1,
  handlers = {},
  focusinSupported = 'onfocusin' in window,
  focus = { focus: 'focusin', blur: 'focusout' },
  hover = { mouseenter: 'mouseover', mouseleave: 'mouseout' },
  ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$|webkitMovement[XY]$)/,
  returnTrue = function () { return true; },
  returnFalse = function () { return false; },
  eventMethods = {
    preventDefault: 'isDefaultPrevented',
    stopImmediatePropagation: 'isImmediatePropagationStopped',
    stopPropagation: 'isPropagationStopped'
  };

function zid(element) {
  return element._zid || (element._zid = _zid++);
}

function compatible(event, source) {
  if (source || !event.isDefaultPrevented) {
    source || (source = event);

    D.each(eventMethods, function (name, predicate) {
      var sourceMethod = source[name];
      event[name] = function () {
        this[predicate] = returnTrue;
        return sourceMethod && sourceMethod.apply(source, arguments);
      };
      event[predicate] = returnFalse;
    });

    try {
      event.timeStamp || (event.timeStamp = Date.now());
    } catch (ignored) {
      console.warn(ignored);
    }

    if (source.defaultPrevented !== undefined ? source.defaultPrevented :
      'returnValue' in source ? source.returnValue === false :
        source.getPreventDefault && source.getPreventDefault())
      event.isDefaultPrevented = returnTrue;
  }
  return event;
}

function parse(event) {
  var parts = ('' + event).split('.');
  return { e: parts[0], ns: parts.slice(1).sort().join(' ') };
}

function matcherFor(ns) {
  return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)');
}

function findHandlers(element, event, fn, selector) {
  event = parse(event);
  if (event.ns) var matcher = matcherFor(event.ns);
  return (handlers[zid(element)] || []).filter(function (handler) {
    return handler
      && (!event.e || handler.e == event.e)
      && (!event.ns || matcher.test(handler.ns))
      && (!fn || zid(handler.fn) === zid(fn))
      && (!selector || handler.sel == selector);
  });
}

function eventCapture(handler, captureSetting) {
  return handler.del &&
    (!focusinSupported && (handler.e in focus)) ||
    !!captureSetting;
}

function realEvent(type) {
  return hover[type] || (focusinSupported && focus[type]) || type;
}

function addEvent(element, events, fn, data, selector, delegator, capture) {
  var id = zid(element), set = (handlers[id] || (handlers[id] = []));
  events.split(/\s/).forEach(function (event) {
    if (event == 'ready') return D(document$1).ready(fn);
    var handler = parse(event);
    handler.fn = fn;
    handler.sel = selector;
    // emulate mouseenter, mouseleave
    if (handler.e in hover) fn = function (e) {
      var related = e.relatedTarget;
      if (!related || (related !== this && !contains(this, related)))
        return handler.fn.apply(this, arguments);
    };
    handler.del = delegator;
    var callback = delegator || fn;
    handler.proxy = function (e) {
      e = compatible(e);
      if (e.isImmediatePropagationStopped()) return;
      e.data = data;
      var result = callback.apply(element, e._args == undefined ? [e] : [e].concat(e._args));
      if (result === false) e.preventDefault(), e.stopPropagation();
      return result;
    };
    handler.i = set.length;
    set.push(handler);
    if ('addEventListener' in element)
      element.addEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture));
  });
}

function removeEvent(element, events, fn, selector, capture) {
  var id = zid(element);
  (events || '').split(/\s/).forEach(function (event) {
    findHandlers(element, event, fn, selector).forEach(function (handler) {
      delete handlers[id][handler.i];
      if ('removeEventListener' in element)
        element.removeEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture));
    });
  });
}

function createProxy(event) {
  var key, proxy = { originalEvent: event };
  for (key in event)
    if (!ignoreProperties.test(key) && event[key] !== undefined) proxy[key] = event[key];

  return compatible(proxy, event);
}

function traverseNode(node, fn) {
  fn(node);
  for (var i = 0, len = node.childNodes.length; i < len; i++)
    traverseNode(node.childNodes[i], fn);
}

// inside => append, prepend
function domMani(elem, args, fn, inside) {
  // arguments can be nodes, arrays of nodes, D objects and HTML strings
  var argType,
    nodes = D.map(args, function (arg) {
      var arr = [];
      argType = type(arg);
      if (argType == 'array') {
        arg.forEach(function (el) {
          if (el.nodeType !== undefined) return arr.push(el);
          else if (isD(el)) return arr = arr.concat(el.get());
          arr = arr.concat(D.fragment(el));
        });
        return arr;
      }
      return argType == 'object' || arg == null ? arg : D.fragment(arg);
    }),
    parent,
    copyByClone = elem.length > 1;

  if (nodes.length < 1) return elem;

  return elem.each(function (_, target) {
    parent = inside ? target : target.parentNode;
    var parentInDocument = contains(document$1.documentElement, parent);

    nodes.forEach(function (node) {
      if (copyByClone) node = node.cloneNode(true);
      else if (!parent) return D(node).remove();

      fn.call(target, node);

      if (parentInDocument) {
        traverseNode(node, function (el) {
          if (el.nodeName != null && el.nodeName.toUpperCase() === 'SCRIPT' &&
            (!el.type || el.type === 'text/javascript') && !el.src) {
            var target = el.ownerDocument ? el.ownerDocument.defaultView : window;
            target['eval'].call(target, el.innerHTML);
          }
        });
      }
    });
  });
}

function getAll(context, tag) {
  var ret;
  if (typeof context.getElementsByTagName !== 'undefined') {
    ret = context.getElementsByTagName(tag || '*');
  } else if (typeof context.querySelectorAll !== 'undefined') {
    ret = context.querySelectorAll(tag || '*');
  } else {
    ret = [];
  }
  if (tag === undefined || tag && nodeName(context, tag)) {
    return D.merge([context], ret);
  }
  return ret;
}

function cleanData(elems) {
  var events, elem,
    i = 0;
  for (; (elem = elems[i]) !== undefined; i++) {
    if (elem._zid && (events = handlers[elem._zid])) {
      events.forEach(evt => {
        const type = evt.e + '.' + evt.ns.split(' ').join('.');
        removeEvent(elem, type, evt.fn, evt.sel);
      });
    }
  }
}

// Export

function remove() {
  return this.each(function () {
    if (this.nodeType === 1) {
      // Prevent memory leaks
      cleanData(getAll(this));
    }

    if (this.parentNode != null)
      this.parentNode.removeChild(this);
  });
}

function empty() {
  return this.each(function () {
    this.innerHTML = '';
  });
}

function html(html) {
  return 0 in arguments
    ? this.each(function (idx) {
      var originHtml = this.innerHTML;
      D(this).empty().append(funcArg(this, html, idx, originHtml));
    })
    : (0 in this ? this[0].innerHTML : null);
}

function append() {
  return domMani(this, arguments, function (elem) {
    this.insertBefore(elem, null);
  }, true);
}

function on(event, selector, data, callback, one) {
  var autoRemove, delegator, $this = this;
  if (event && !isString(event)) {
    D.each(event, function (type, fn) {
      $this.on(type, selector, data, fn, one);
    });
    return $this;
  }

  if (!isString(selector) && !isFunction(callback) && callback !== false)
    callback = data, data = selector, selector = undefined;
  if (callback === undefined || data === false)
    callback = data, data = undefined;

  if (callback === false) callback = returnFalse;

  return $this.each(function (_, element) {
    if (one) autoRemove = function (e) {
      removeEvent(element, e.type, callback);
      return callback.apply(this, arguments);
    };

    if (selector) delegator = function (e) {
      var evt, match = D(e.target).closest(selector, element).get(0);
      if (match && match !== element) {
        evt = D.extend(createProxy(e), { currentTarget: match, liveFired: element });
        return (autoRemove || callback).apply(match, [evt].concat(slice.call(arguments, 1)));
      }
    };

    addEvent(element, event, callback, data, selector, delegator || autoRemove);
  });
}

function off(event, selector, callback) {
  var $this = this;
  if (event && !isString(event)) {
    D.each(event, function (type, fn) {
      $this.off(type, selector, fn);
    });
    return $this;
  }

  if (!isString(selector) && !isFunction(callback) && callback !== false)
    callback = selector, selector = undefined;

  if (callback === false) callback = returnFalse;

  return $this.each(function () {
    removeEvent(this, event, callback, selector);
  });
}

var prefix = '',
  eventPrefix,
  vendors = { Webkit: 'webkit', Moz: '', O: 'o' },
  testEl = document$1.createElement('div'),
  testTransitionProperty = testEl.style.transitionProperty;

if (testEl.style.transform === undefined) D.each(vendors, function (vendor, event) {
  if (testEl.style[vendor + 'TransitionProperty'] !== undefined) {
    prefix = '-' + vendor.toLowerCase() + '-';
    eventPrefix = event;
    return false;
  }
});

testEl = null;

// fx cannot seperate
function normalizeEvent(name) {
  return eventPrefix ? eventPrefix + name : name.toLowerCase();
}

D.fx = {
  off: (eventPrefix === undefined && testTransitionProperty === undefined),
  speeds: { _default: 400, fast: 200, slow: 600 },
  cssPrefix: prefix,
  transitionEnd: normalizeEvent('TransitionEnd'),
  animationEnd: normalizeEvent('AnimationEnd')
};

var supportedTransforms = /^((translate|rotate|scale)(X|Y|Z|3d)?|matrix(3d)?|perspective|skew(X|Y)?)$/i,
  transform,
  transitionProperty, transitionDuration, transitionTiming, transitionDelay,
  animationName, animationDuration, animationTiming, animationDelay,
  cssReset = {};

function dasherize(str) { return str.replace(/([A-Z])/g, '-$1').toLowerCase(); }

transform = prefix + 'transform';
cssReset[transitionProperty = prefix + 'transition-property'] =
  cssReset[transitionDuration = prefix + 'transition-duration'] =
  cssReset[transitionDelay = prefix + 'transition-delay'] =
  cssReset[transitionTiming = prefix + 'transition-timing-function'] =
  cssReset[animationName = prefix + 'animation-name'] =
  cssReset[animationDuration = prefix + 'animation-duration'] =
  cssReset[animationDelay = prefix + 'animation-delay'] =
  cssReset[animationTiming = prefix + 'animation-timing-function'] = '';

function anim$1(properties, duration, ease, callback, delay) {
  var key, cssValues = {}, cssProperties, transforms = '',
    that = this, wrappedCallback, endEvent = D.fx.transitionEnd,
    fired = false;

  if (duration === undefined) duration = D.fx.speeds._default / 1000;
  if (delay === undefined) delay = 0;
  if (D.fx.off) duration = 0;

  if (typeof properties == 'string') {
    // keyframe animation
    cssValues[animationName] = properties;
    cssValues[animationDuration] = duration + 's';
    cssValues[animationDelay] = delay + 's';
    cssValues[animationTiming] = (ease || 'linear');
    endEvent = D.fx.animationEnd;
  } else {
    cssProperties = [];
    // CSS transitions
    for (key in properties)
      if (supportedTransforms.test(key)) transforms += key + '(' + properties[key] + ') ';
      else cssValues[key] = properties[key], cssProperties.push(dasherize(key));

    if (transforms) cssValues[transform] = transforms, cssProperties.push(transform);
    if (duration > 0 && typeof properties === 'object') {
      cssValues[transitionProperty] = cssProperties.join(', ');
      cssValues[transitionDuration] = duration + 's';
      cssValues[transitionDelay] = delay + 's';
      cssValues[transitionTiming] = (ease || 'linear');
    }
  }

  wrappedCallback = function (event) {
    if (typeof event !== 'undefined') {
      if (event.target !== event.currentTarget) return; // makes sure the event didn't bubble from "below"
      D(event.target).off(endEvent, wrappedCallback);
    } else
      D(this).off(endEvent, wrappedCallback); // triggered by setTimeout

    fired = true;
    D(this).css(cssReset);
    callback && callback.call(this);
  };
  if (duration > 0) {
    this.on(endEvent, wrappedCallback);
    // transitionEnd is not always firing on older Android phones
    // so make sure it gets fired
    setTimeout(function () {
      if (fired) return;
      wrappedCallback.call(that);
    }, ((duration + delay) * 1000) + 25);
  }

  // trigger page reflow so new elements can animate
  this.size() && this.get(0).clientLeft;

  this.css(cssValues);

  if (duration <= 0) setTimeout(function () {
    that.each(function () { wrappedCallback.call(this); });
  }, 0);

  return this;
}

function animate(properties, duration, ease, callback, delay) {
  if (isFunction(duration))
    callback = duration, ease = undefined, duration = undefined;
  if (isFunction(ease))
    callback = ease, ease = undefined;
  if (isPlainObject(duration))
    ease = duration.easing, callback = duration.complete, delay = duration.delay, duration = duration.duration;
  if (duration) duration = (typeof duration == 'number' ? duration :
    (D.fx.speeds[duration] || D.fx.speeds._default)) / 1000;
  if (delay) delay = parseFloat(delay) / 1000;
  return this.anim(properties, duration, ease, callback, delay);
}

function origShow() {
  return this.each(function () {
    this.style.display == 'none' && (this.style.display = '');
    if (getComputedStyle(this, '').getPropertyValue('display') == 'none')
      this.style.display = defaultDisplay(this.nodeName);
  });
}

function origHide() {
  return this.css('display', 'none');
}

function anim(el, speed, opacity, scale, callback) {
  if (typeof speed == 'function' && !callback) callback = speed, speed = undefined;
  var props = { opacity: opacity };
  if (scale) {
    props.scale = scale;
    el.css(D.fx.cssPrefix + 'transform-origin', '0 0');
  }
  return el.animate(props, speed, null, callback);
}

function hideHelper(el, speed, scale, callback) {
  return anim(el, speed, 0, scale, function () {
    origHide.call(D(this));
    callback && callback.call(this);
  });
}

// Export

function show(speed, callback) {
  origShow.call(this);
  if (speed === undefined) speed = 0;
  else this.css('opacity', 0);
  return anim(this, speed, 1, '1,1', callback);
}

function hide(speed, callback) {
  if (speed === undefined) return origHide.call(this);
  else return hideHelper(this, speed, '0,0', callback);
}

function fadeTo(speed, opacity, callback) {
  return anim(this, speed, opacity, null, callback);
}

function fadeIn(speed, callback) {
  var target = this.css('opacity');
  if (target > 0) this.css('opacity', 0);
  else target = 1;
  return origShow.call(this).fadeTo(speed, target, callback);
}

var methods = {
  isPlainObject: isPlainObject,
  isArray: isArray,
  isFunction: isFunction,
  noop: noop
};
var fnMethods = {
  find: find,
  closest: closest,
  css: css,
  addClass: addClass,
  hasClass: hasClass,
  removeClass: removeClass,
  attr: attr,
  removeAttr: removeAttr,
  append: append,
  remove: remove,
  empty: empty,
  html: html,
  width: width,
  height: height,
  scrollTop: scrollTop,
  scrollLeft: scrollLeft,
  offset: offset,
  offsetParent: offsetParent,
  position: position,
  on: on,
  off: off,
  show: show,
  hide: hide,
  anim: anim$1,
  animate: animate,
  fadeTo: fadeTo,
  fadeIn: fadeIn
};
D.extend(methods);
D.fn.extend(fnMethods);

var DEFAULTS = {
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
  footerToolbar: ['zoomIn', 'zoomOut', 'prev', 'fullscreen', 'next', 'actualSize', 'rotateRight'],
  // Custom icon for button
  icons: {
    minimize: "<svg viewBox=\"0 0 24 24\" class=\"svg-inline-icon\">\n        <path fill=\"currentColor\" d=\"M20,14H4V10H20\"></path>\n      </svg>",
    maximize: "<svg viewBox=\"0 0 24 24\" class=\"svg-inline-icon\">\n        <path fill=\"currentColor\" d=\"M4,4H20V20H4V4M6,8V18H18V8H6Z\"></path>\n      </svg>",
    close: "<svg viewBox=\"0 0 24 24\" class=\"svg-inline-icon\">\n        <path fill=\"currentColor\" d=\"M13.46,12L19,17.54V19H17.54L12,13.46L6.46,19H5V17.54L10.54,12\n        L5,6.46V5H6.46L12,10.54L17.54,5H19V6.46L13.46,12Z\"></path>\n      </svg>",
    zoomIn: "<svg viewBox=\"0 0 24 24\" class=\"svg-inline-icon\">\n        <path fill=\"currentColor\" d=\"M15.5,14L20.5,19L19,20.5L14,15.5V14.71L13.73,14.43\n        C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3A6.5,6.5 0 0,1 16,9.5\n        C16,11.11 15.41,12.59 14.43,13.73L14.71,14H15.5M9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5\n        C7,5 5,7 5,9.5C5,12 7,14 9.5,14M12,10H10V12H9V10H7V9H9V7H10V9H12V10Z\"></path>\n      </svg>",
    zoomOut: "<svg viewBox=\"0 0 24 24\" class=\"svg-inline-icon\">\n        <path fill=\"currentColor\" d=\"M15.5,14H14.71L14.43,13.73C15.41,12.59 16,11.11 16,9.5\n        A6.5,6.5 0 0,0 9.5,3A6.5,6.5 0 0,0 3,9.5A6.5,6.5 0 0,0 9.5,16\n        C11.11,16 12.59,15.41 13.73,14.43L14,14.71V15.5L19,20.5L20.5,19L15.5,14M9.5,14\n        C7,14 5,12 5,9.5C5,7 7,5 9.5,5C12,5 14,7 14,9.5C14,12 12,14 9.5,14M7,9H12V10H7V9Z\"></path>\n      </svg>",
    prev: "<svg viewBox=\"0 0 24 24\" class=\"svg-inline-icon\">\n        <path fill=\"currentColor\" d=\"M6,18V6H8V18H6M9.5,12L18,6V18L9.5,12Z\"></path>\n      </svg>",
    next: "<svg viewBox=\"0 0 24 24\" class=\"svg-inline-icon\">\n        <path fill=\"currentColor\" d=\"M16,18H18V6H16M6,18L14.5,12L6,6V18Z\"></path>\n      </svg>",
    fullscreen: "<svg viewBox=\"0 0 24 24\" class=\"svg-inline-icon\">\n        <path fill=\"currentColor\" d=\"M8.5,12.5L11,15.5L14.5,11L19,17H5M23,18V6A2,2 0 0,0 21,4H3\n        A2,2 0 0,0 1,6V18A2,2 0 0,0 3,20H21A2,2 0 0,0 23,18Z\"></path>\n      </svg>",
    actualSize: "<svg viewBox=\"0 0 24 24\" class=\"svg-inline-icon\">\n        <path fill=\"currentColor\" d=\"M9.5,13.09L10.91,14.5L6.41,19H10V21H3V14H5V17.59L9.5,13.09\n        M10.91,9.5L9.5,10.91L5,6.41V10H3V3H10V5H6.41L10.91,9.5M14.5,13.09L19,17.59V14H21V21H14V19\n        H17.59L13.09,14.5L14.5,13.09M13.09,9.5L17.59,5H14V3H21V10H19V6.41L14.5,10.91\n        L13.09,9.5Z\"></path>\n      </svg>",
    rotateLeft: "<svg viewBox=\"0 0 24 24\" class=\"svg-inline-icon\">\n        <path fill=\"currentColor\" d=\"M13,4.07V1L8.45,5.55L13,10V6.09C15.84,6.57 18,9.03 18,12\n        C18,14.97 15.84,17.43 13,17.91V19.93C16.95,19.44 20,16.08 20,12C20,7.92 16.95,4.56 13,4.07\n        M7.1,18.32C8.26,19.22 9.61,19.76 11,19.93V17.9C10.13,17.75 9.29,17.41 8.54,16.87L7.1,18.32\n        M6.09,13H4.07C4.24,14.39 4.79,15.73 5.69,16.89L7.1,15.47C6.58,14.72 6.23,13.88 6.09,13\n        M7.11,8.53L5.7,7.11C4.8,8.27 4.24,9.61 4.07,11H6.09C6.23,10.13 6.58,9.28 7.11,8.53Z\"></path>\n      </svg>",
    rotateRight: "<svg viewBox=\"0 0 24 24\" class=\"svg-inline-icon\">\n        <path fill=\"currentColor\" d=\"M16.89,15.5L18.31,16.89C19.21,15.73 19.76,14.39 19.93,13H17.91\n        C17.77,13.87 17.43,14.72 16.89,15.5M13,17.9V19.92C14.39,19.75 15.74,19.21 16.9,18.31\n        L15.46,16.87C14.71,17.41 13.87,17.76 13,17.9M19.93,11C19.76,9.61 19.21,8.27 18.31,7.11\n        L16.89,8.53C17.43,9.28 17.77,10.13 17.91,11M15.55,5.55L11,1V4.07C7.06,4.56 4,7.92 4,12\n        C4,16.08 7.05,19.44 11,19.93V17.91C8.16,17.43 6,14.97 6,12C6,9.03 8.16,6.57 11,6.09V10\n        L15.55,5.55Z\"></path>\n      </svg>"
  },
  // Custom title for button
  i18n: {
    minimize: 'Minimize',
    maximize: 'Maximize (Alt+X)',
    close: 'Close (Q)',
    zoomIn: 'Zoom-in (+)',
    zoomOut: 'Zoom-out (-)',
    prev: 'Prev (←)',
    next: 'Next (→)',
    fullscreen: 'Fullscreen (F)',
    actualSize: 'Actual-size (Ctrl+Alt+0)',
    rotateLeft: 'Rotate-left (Ctrl+,)',
    rotateRight: 'Rotate-right (Ctrl+.)'
  },
  // Whether to enable multiple instances
  multiInstances: true,
  // Whether to enable modal transform animation
  initAnimation: true,
  // Modal transform animation duration
  animationDuration: 400,
  // Modal transform animation easing function
  animationEasing: 'ease-in-out',
  // Whether to disable modal translate to center after image changed
  fixedModalPos: false,
  // Modal css `z-index`
  zIndex: 1090,
  // Selector of drag handler
  dragHandle: null,
  // Callback events
  callbacks: {
    beforeOpen: D.noop,
    opened: D.noop,
    beforeClose: D.noop,
    closed: D.noop,
    beforeChange: D.noop,
    changed: D.noop
  },
  // Start index of images
  index: 0,
  // Whether to load the image progressively
  progressiveLoading: true,
  // The DOM element which photoviewer will be attached to
  appendTo: 'body',
  // Custom Buttons
  customButtons: {},
  // Whether to set modal css `position: fixed`
  positionFixed: true,
  // Init modal position `{top: 0, right: 0, bottom: 0, left: 0}`
  initModalPos: null,
  // Error message when image could not be loaded
  errorMsg: ''
};

var document = window.document;

/**
 * Debounce function
 *
 * @param {function} fn - The function will be triggered
 * @param {number} delay - The debounce delay time
 * @return {function}
 */
function debounce(fn, delay) {
  var timer = null;
  return function () {
    var context = this;
    var args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function () {
      fn.apply(context, args);
    }, delay);
  };
}

/**
 * Preload a image
 *
 * @param {string} src - The image src
 * @param {function} success - The callback of success
 * @param {function} error - The callback of error
 */
function preloadImage(src, success, error) {
  var img = new Image();
  img.onload = function () {
    success(img);
  };
  img.onerror = function () {
    error(img);
  };
  img.src = src;
}

/**
 * Request fullscreen
 *
 * @param {type} element
 */
function requestFullscreen(element) {
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen();
  }
}

/**
 * Get the image name from its url
 *
 * @param {string} url - The image src
 * @return {string}
 */
function getImageNameFromUrl(url) {
  var reg = /^.*?\/*([^/?]*)\.[a-z]+(\?.+|$)/gi;
  var txt = url.replace(reg, '$1');
  return txt;
}

/**
 * Set grab cursor when move the image
 *
 * @param {object} imageData - The image data
 * @param {object} stageData - The stage data
 * @param {object} $stage - The stage element of domq
 * @param {boolean} isRotate - Whether the image rotated
 */
function setGrabCursor(imageData, stageData, $stage, isRotated) {
  var imageWidth = !isRotated ? imageData.w : imageData.h;
  var imageHeight = !isRotated ? imageData.h : imageData.w;
  if (imageHeight > stageData.h || imageWidth > stageData.w) {
    $stage.addClass('is-grab');
  }
  if (imageHeight <= stageData.h && imageWidth <= stageData.w) {
    $stage.removeClass('is-grab');
  }
}

/**
 * Check whether the browser support touch event
 *
 * @return {boolean}
 */
function supportTouch() {
  return !!('ontouchstart' in window || window.DocumentTouch && document instanceof window.DocumentTouch);
}

/**
 * Check whether element is root node (`body` or `html`)
 *
 * @param {object} elem - The DOM element
 * @return {boolean}
 */
function isRootNode(elem) {
  return /^(?:body|html)$/i.test(elem.nodeName);
}

/**
 * Get sum value of CSS props
 *
 * @param {object} $elem - The domq element
 * @param {array} props - The array of CSS props
 * @return {number}
 */
function getCSSValueSum($elem, props) {
  return props.reduce(function (acc, cur) {
    return acc + parseFloat($elem.css(cur));
  }, 0);
}

/**
 * Check whether element's CSS `box-sizing` is `border-box`
 *
 * @param {object} $elem - The domq element
 * @return {boolean}
 */
function isBorderBox($elem) {
  return $elem.css('box-sizing') === 'border-box';
}

/**
 * Get the image scale in stage
 *
 * @param {number} imageWidth - The image width
 * @param {number} imageHeight - The image height
 * @param {number} stageWidth - The stage width
 * @param {number} stageHeight - The stage height
 * @param {boolean} isRotated - Whether the image rotated
 * @returns {number}
 */
function getImageScale(imageWidth, imageHeight, stageWidth, stageHeight, isRotated) {
  var scale = 1;
  if (!isRotated) {
    scale = Math.min(stageWidth / imageWidth, stageHeight / imageHeight, 1);
  } else {
    scale = Math.min(stageWidth / imageHeight, stageHeight / imageWidth, 1);
  }
  return scale;
}

var $W = D(window);
var $D = D(document);
var CLICK_EVENT = 'click';
var RESIZE_EVENT = 'resize';
var KEYDOWN_EVENT = 'keydown';
var WHEEL_EVENT = 'wheel mousewheel DOMMouseScroll';
var TOUCH_START_EVENT = supportTouch() ? 'touchstart' : 'mousedown';
var TOUCH_MOVE_EVENT = supportTouch() ? 'touchmove' : 'mousemove';
var TOUCH_END_EVENT = supportTouch() ? 'touchend' : 'mouseup';
var NS = 'photoviewer';
var CLASS_NS = '.' + NS;
var EVENT_NS = '.' + NS;
var PUBLIC_VARS = {
  // Whether image is moving
  isMoving: false,
  // Whether modal is resizing
  isResizing: false,
  // Modal's `z-index`
  zIndex: 0
};

/**
 * Modal draggable
 *
 * @param {object} $modal - The modal element of domq
 * @param {object} dragHandle - The handle element when dragging
 * @param {object} dragCancel - The cancel element when dragging
 */
function draggable($modal, dragHandle, dragCancel) {
  var _this = this;
  var startX = 0;
  var startY = 0;
  var left = 0;
  var top = 0;
  var dragStart = function dragStart(e) {
    e = e || window.event;

    // Must be removed
    // e.preventDefault();

    $modal[0].focus();

    // Get clicked button
    var elemCancel = D(e.target).closest(dragCancel);
    // Stop modal moving when click buttons
    if (elemCancel.length) {
      return true;
    }
    if (_this.options.multiInstances) {
      $modal.css('z-index', ++PUBLIC_VARS['zIndex']);
    }
    startX = e.type === 'touchstart' ? e.targetTouches[0].pageX : e.clientX;
    startY = e.type === 'touchstart' ? e.targetTouches[0].pageY : e.clientY;

    // Get the modal's current position
    left = parseFloat($modal.css('left'));
    top = parseFloat($modal.css('top'));

    // Reset the modal's position with left and top value
    $modal.css({
      left: left,
      top: top,
      right: '',
      bottom: ''
    });
    $D.on(TOUCH_MOVE_EVENT + EVENT_NS, dragMove).on(TOUCH_END_EVENT + EVENT_NS, dragEnd);
  };
  var dragMove = function dragMove(e) {
    e = e || window.event;
    e.preventDefault();
    if (!PUBLIC_VARS['isMoving'] && !PUBLIC_VARS['isResizing'] && !_this.isMaximized) {
      var endX = e.type === 'touchmove' ? e.targetTouches[0].pageX : e.clientX;
      var endY = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.clientY;
      var relativeX = endX - startX;
      var relativeY = endY - startY;
      $modal.css({
        left: relativeX + left,
        top: relativeY + top
      });
    }
  };
  var dragEnd = function dragEnd() {
    $D.off(TOUCH_MOVE_EVENT + EVENT_NS, dragMove).off(TOUCH_END_EVENT + EVENT_NS, dragEnd);
  };
  D(dragHandle).on(TOUCH_START_EVENT + EVENT_NS, dragStart);
}

var ELEMS_WITH_GRABBING_CURSOR = "html, body, .".concat(NS, "-modal, .").concat(NS, "-stage, .").concat(NS, "-button, .").concat(NS, "-resizable-handle");

/**
 * Image movable
 *
 * 1. No movable
 * 2. Vertical movable
 * 3. Horizontal movable
 * 4. Vertical & Horizontal movable
 *
 * @param {object} $stage - The stage element of domq
 * @param {object} $image - The image element of domq
 */
function movable($stage, $image) {
  var _this = this;
  var startX = 0;
  var startY = 0;
  var left = 0;
  var top = 0;
  var widthDiff = 0;
  var heightDiff = 0;
  var δ = 0;
  var dragStart = function dragStart(e) {
    e = e || window.event;
    e.preventDefault();
    var imageWidth = $image.width();
    var imageHeight = $image.height();
    var stageWidth = $stage.width();
    var stageHeight = $stage.height();
    startX = e.type === 'touchstart' ? e.targetTouches[0].pageX : e.clientX;
    startY = e.type === 'touchstart' ? e.targetTouches[0].pageY : e.clientY;

    // δ is the difference between image width and height
    δ = !_this.isRotated ? 0 : (imageWidth - imageHeight) / 2;

    // Width or height difference can be use to limit image right or top position
    widthDiff = !_this.isRotated ? imageWidth - stageWidth : imageHeight - stageWidth;
    heightDiff = !_this.isRotated ? imageHeight - stageHeight : imageWidth - stageHeight;

    // Modal can be dragging if image is smaller to stage
    PUBLIC_VARS['isMoving'] = widthDiff > 0 || heightDiff > 0 ? true : false;

    // Reclac the element position when mousedown
    // Fix the issue of stage with a border
    left = $image.position().left - δ;
    top = $image.position().top + δ;

    // Add the grabbing cursor
    if ($stage.hasClass('is-grab')) {
      D(ELEMS_WITH_GRABBING_CURSOR).addClass('is-grabbing');
    }
    $D.on(TOUCH_MOVE_EVENT + EVENT_NS, dragMove).on(TOUCH_END_EVENT + EVENT_NS, dragEnd);
  };
  var dragMove = function dragMove(e) {
    e = e || window.event;
    e.preventDefault();
    var endX = e.type === 'touchmove' ? e.targetTouches[0].pageX : e.clientX;
    var endY = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.clientY;
    var relativeX = endX - startX;
    var relativeY = endY - startY;
    var newLeft = relativeX + left;
    var newTop = relativeY + top;

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
    $image.css({
      left: newLeft,
      top: newTop
    });

    // Update image initial data
    D.extend(_this.imageData, {
      left: newLeft,
      top: newTop
    });
  };
  var dragEnd = function dragEnd() {
    $D.off(TOUCH_MOVE_EVENT + EVENT_NS, dragMove).off(TOUCH_END_EVENT + EVENT_NS, dragEnd);
    PUBLIC_VARS['isMoving'] = false;

    // Remove the grabbing cursor
    D(ELEMS_WITH_GRABBING_CURSOR).removeClass('is-grabbing');
  };
  $stage.on(TOUCH_START_EVENT + EVENT_NS, dragStart);
}

var ELEMS_WITH_RESIZE_CURSOR = "html, body, .".concat(NS, "-modal, .").concat(NS, "-stage, .").concat(NS, "-button");

/**
 * Modal resizable
 *
 * 1. Can be resized in 8 directions
 * 2. Keep image in stage center
 * 3. Other restrictions for image
 *
 * @param {object} $modal - The modal element of domq
 * @param {object} $stage - The stage element of domq
 * @param {object} $image - The image element of domq
 * @param {object} options - The options of PhotoViewer
 */
function resizable($modal, $stage, $image, options) {
  var _this = this;
  var resizableHandleE = D("<div class=\"".concat(NS, "-resizable-handle ").concat(NS, "-resizable-handle-e\"></div>"));
  var resizableHandleW = D("<div class=\"".concat(NS, "-resizable-handle ").concat(NS, "-resizable-handle-w\"></div>"));
  var resizableHandleS = D("<div class=\"".concat(NS, "-resizable-handle ").concat(NS, "-resizable-handle-s\"></div>"));
  var resizableHandleN = D("<div class=\"".concat(NS, "-resizable-handle ").concat(NS, "-resizable-handle-n\"></div>"));
  var resizableHandleSE = D("<div class=\"".concat(NS, "-resizable-handle ").concat(NS, "-resizable-handle-se\"></div>"));
  var resizableHandleSW = D("<div class=\"".concat(NS, "-resizable-handle ").concat(NS, "-resizable-handle-sw\"></div>"));
  var resizableHandleNE = D("<div class=\"".concat(NS, "-resizable-handle ").concat(NS, "-resizable-handle-ne\"></div>"));
  var resizableHandleNW = D("<div class=\"".concat(NS, "-resizable-handle ").concat(NS, "-resizable-handle-nw\"></div>"));
  var resizableHandles = {
    e: resizableHandleE,
    s: resizableHandleS,
    se: resizableHandleSE,
    n: resizableHandleN,
    w: resizableHandleW,
    nw: resizableHandleNW,
    ne: resizableHandleNE,
    sw: resizableHandleSW
  };
  $modal.append(resizableHandleE, resizableHandleW, resizableHandleS, resizableHandleN, resizableHandleSE, resizableHandleSW, resizableHandleNE, resizableHandleNW);
  var startX = 0;
  var startY = 0;
  var modalData = {
    w: 0,
    h: 0,
    x: 0,
    y: 0
  };
  var stageData = {
    w: 0,
    h: 0,
    x: 0,
    y: 0
  };
  var imageData = {
    w: 0,
    h: 0,
    x: 0,
    y: 0
  };
  // δ is the difference between image width and height
  var δ = 0;
  var imgFrameWidth = 0;
  var imgFrameHeight = 0;
  var direction = '';
  var minModalWidth = options.modalWidth,
    minModalHeight = options.modalHeight;

  // Modal CSS
  var getModalCSS = function getModalCSS(dir, offsetX, offsetY) {
    // Modal shouldn't move when its width to the min-width
    var modalLeft = -offsetX + modalData.w > minModalWidth ? offsetX + modalData.x : modalData.x + modalData.w - minModalWidth;
    var modalTop = -offsetY + modalData.h > minModalHeight ? offsetY + modalData.y : modalData.y + modalData.h - minModalHeight;
    var dirsCSS = {
      e: {
        width: Math.max(offsetX + modalData.w, minModalWidth)
      },
      s: {
        height: Math.max(offsetY + modalData.h, minModalHeight)
      },
      se: {
        width: Math.max(offsetX + modalData.w, minModalWidth),
        height: Math.max(offsetY + modalData.h, minModalHeight)
      },
      w: {
        width: Math.max(-offsetX + modalData.w, minModalWidth),
        left: modalLeft
      },
      n: {
        height: Math.max(-offsetY + modalData.h, minModalHeight),
        top: modalTop
      },
      nw: {
        width: Math.max(-offsetX + modalData.w, minModalWidth),
        height: Math.max(-offsetY + modalData.h, minModalHeight),
        top: modalTop,
        left: modalLeft
      },
      ne: {
        width: Math.max(offsetX + modalData.w, minModalWidth),
        height: Math.max(-offsetY + modalData.h, minModalHeight),
        top: modalTop
      },
      sw: {
        width: Math.max(-offsetX + modalData.w, minModalWidth),
        height: Math.max(offsetY + modalData.h, minModalHeight),
        left: modalLeft
      }
    };
    return dirsCSS[dir];
  };

  // Image CSS
  var getImageCSS = function getImageCSS(dir, offsetX, offsetY) {
    // Image shouldn't move when modal width to the min-width
    // The min-width is modal width, so we should clac the stage min-width
    var widthDiff = offsetX + modalData.w > minModalWidth ? stageData.w - imgFrameWidth + offsetX - δ : minModalWidth - (modalData.w - stageData.w) - imgFrameWidth - δ;
    var heightDiff = offsetY + modalData.h > minModalHeight ? stageData.h - imgFrameHeight + offsetY + δ : minModalHeight - (modalData.h - stageData.h) - imgFrameHeight + δ;
    var widthDiff2 = -offsetX + modalData.w > minModalWidth ? stageData.w - imgFrameWidth - offsetX - δ : minModalWidth - (modalData.w - stageData.w) - imgFrameWidth - δ;
    var heightDiff2 = -offsetY + modalData.h > minModalHeight ? stageData.h - imgFrameHeight - offsetY + δ : minModalHeight - (modalData.h - stageData.h) - imgFrameHeight + δ;

    // Get the image position on resizing
    var $imageLeft = $image.position().left;
    var $imageTop = $image.position().top;
    var imgLeft = (widthDiff > 0 ? $imageLeft : Math.min($imageLeft, 0)) - δ;
    var imgTop = (heightDiff > 0 ? $imageTop : Math.min($imageTop, 0)) + δ;
    var imgLeft2 = (widthDiff2 > 0 ? $imageLeft : Math.min($imageLeft, 0)) - δ;
    var imgTop2 = (heightDiff2 > 0 ? $imageTop : Math.min($imageTop, 0)) + δ;
    var dirsCSS = {
      e: {
        left: widthDiff >= -δ ? (widthDiff - δ) / 2 : Math.max(imgLeft, widthDiff)
      },
      s: {
        top: heightDiff >= δ ? (heightDiff + δ) / 2 : Math.max(imgTop, heightDiff)
      },
      se: {
        top: heightDiff >= δ ? (heightDiff + δ) / 2 : Math.max(imgTop, heightDiff),
        left: widthDiff >= -δ ? (widthDiff - δ) / 2 : Math.max(imgLeft, widthDiff)
      },
      w: {
        left: widthDiff2 >= -δ ? (widthDiff2 - δ) / 2 : Math.max(imgLeft2, widthDiff2)
      },
      n: {
        top: heightDiff2 >= δ ? (heightDiff2 + δ) / 2 : Math.max(imgTop2, heightDiff2)
      },
      nw: {
        top: heightDiff2 >= δ ? (heightDiff2 + δ) / 2 : Math.max(imgTop2, heightDiff2),
        left: widthDiff2 >= -δ ? (widthDiff2 - δ) / 2 : Math.max(imgLeft2, widthDiff2)
      },
      ne: {
        top: heightDiff2 >= δ ? (heightDiff2 + δ) / 2 : Math.max(imgTop2, heightDiff2),
        left: widthDiff >= -δ ? (widthDiff - δ) / 2 : Math.max(imgLeft, widthDiff)
      },
      sw: {
        top: heightDiff >= δ ? (heightDiff + δ) / 2 : Math.max(imgTop, heightDiff),
        left: widthDiff2 >= -δ ? (widthDiff2 - δ) / 2 : Math.max(imgLeft2, widthDiff2)
      }
    };
    return dirsCSS[dir];
  };
  var dragStart = function dragStart(dir, e) {
    e = e || window.event;
    e.preventDefault();
    PUBLIC_VARS['isResizing'] = true;
    startX = e.type === 'touchstart' ? e.targetTouches[0].pageX : e.clientX;
    startY = e.type === 'touchstart' ? e.targetTouches[0].pageY : e.clientY;

    // Reclac the modal data when mousedown
    modalData = {
      w: $modal.width() + (isBorderBox($modal) ? _this._modalEdgeValue.horizontal : 0),
      h: $modal.height() + (isBorderBox($modal) ? _this._modalEdgeValue.vertical : 0),
      x: $modal.position().left,
      y: $modal.position().top
    };
    stageData = {
      w: $stage.width(),
      h: $stage.height(),
      x: $stage.position().left,
      y: $stage.position().top
    };
    imageData = {
      w: $image.width(),
      h: $image.height(),
      x: $image.position().left,
      y: $image.position().top
    };

    // δ is the difference between image width and height
    δ = !_this.isRotated ? 0 : (imageData.w - imageData.h) / 2;
    imgFrameWidth = !_this.isRotated ? imageData.w : imageData.h;
    imgFrameHeight = !_this.isRotated ? imageData.h : imageData.w;
    direction = dir;

    // Add the resizable cursor
    D(ELEMS_WITH_RESIZE_CURSOR).css('cursor', dir + '-resize');
    $D.on(TOUCH_MOVE_EVENT + EVENT_NS, dragMove).on(TOUCH_END_EVENT + EVENT_NS, dragEnd);
  };
  var dragMove = function dragMove(e) {
    e = e || window.event;
    e.preventDefault();
    if (!_this.isMaximized) {
      var endX = e.type === 'touchmove' ? e.targetTouches[0].pageX : e.clientX;
      var endY = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.clientY;
      var relativeX = endX - startX;
      var relativeY = endY - startY;
      var modalCSS = getModalCSS(direction, relativeX, relativeY);
      $modal.css(modalCSS);
      var imageCSS = getImageCSS(direction, relativeX, relativeY);
      $image.css(imageCSS);
    }
  };
  var dragEnd = function dragEnd() {
    $D.off(TOUCH_MOVE_EVENT + EVENT_NS, dragMove).off(TOUCH_END_EVENT + EVENT_NS, dragEnd);

    // Reclac the stage size because it has changed
    var stageWidth = $stage.width();
    var stageHeight = $stage.height();
    if (PUBLIC_VARS['isResizing']) {
      setGrabCursor({
        w: imgFrameWidth,
        h: imgFrameHeight
      }, {
        w: stageWidth,
        h: stageHeight
      }, $stage);
    }
    PUBLIC_VARS['isResizing'] = false;

    // Remove the resizable cursor
    D(ELEMS_WITH_RESIZE_CURSOR).css('cursor', '');

    // Update the image initial data
    var _this$imageData = _this.imageData,
      imgOriginalWidth = _this$imageData.originalWidth,
      imgOriginalHeight = _this$imageData.originalHeight;
    var scale = getImageScale(imgOriginalWidth, imgOriginalHeight, stageWidth, stageHeight, _this.isRotated);
    var imgInitWidth = imgOriginalWidth * scale;
    var imgInitHeight = imgOriginalHeight * scale;
    D.extend(_this.imageData, {
      initWidth: imgInitWidth,
      initHeight: imgInitHeight,
      initLeft: (stageWidth - imgInitWidth) / 2,
      initTop: (stageHeight - imgInitHeight) / 2
    });
  };
  D.each(resizableHandles, function (dir, handle) {
    handle.on(TOUCH_START_EVENT + EVENT_NS, function (e) {
      dragStart(dir, e);
    });
  });
}

/**
 * PhotoViewer class
 */
var PhotoViewer = /*#__PURE__*/function () {
  function PhotoViewer(items, options) {
    _classCallCheck(this, PhotoViewer);
    // Whether modal opened
    _defineProperty(this, "isOpened", false);
    // Whether modal maximized
    _defineProperty(this, "isMaximized", false);
    // Whether image rotated (`90*(2n+1)`)
    _defineProperty(this, "isRotated", false);
    // Image rotation degree
    _defineProperty(this, "rotationDegree", 0);
    // Store image data in every instance
    _defineProperty(this, "imageData", {});
    // Store modal data in every instance
    _defineProperty(this, "modalData", {
      width: null,
      height: null,
      left: null,
      top: null
    });
    // Store previous index
    _defineProperty(this, "prevIndex", null);
    // Used for time comparison
    _defineProperty(this, "_lastTimestamp", 0);
    this.init(items, options);
  }
  _createClass(PhotoViewer, [{
    key: "init",
    value: function init(items, options) {
      this.options = D.extend(true, {}, DEFAULTS, options);
      if (options && D.isArray(options.footerToolbar)) {
        this.options.footerToolbar = options.footerToolbar;
      }
      if (options && D.isArray(options.headerToolbar)) {
        this.options.headerToolbar = options.headerToolbar;
      }

      // Reset public `z-index` with option
      PUBLIC_VARS['zIndex'] = PUBLIC_VARS['zIndex'] === 0 ? this.options['zIndex'] : PUBLIC_VARS['zIndex'];
      this.open();
      this.images = items;
      this.index = this.options['index'];
      this._loadImage(this.index);
      if (this.options.draggable) {
        this.draggable(this.$photoviewer, this.dragHandle, CLASS_NS + '-button');
      }
      if (this.options.movable) {
        this.movable(this.$stage, this.$image);
      }
      if (this.options.resizable) {
        this.resizable(this.$photoviewer, this.$stage, this.$image, this.options);
      }
    }
  }, {
    key: "_createBtns",
    value: function _createBtns(toolbar) {
      var _this = this;
      var btns = ['minimize', 'maximize', 'close', 'zoomIn', 'zoomOut', 'prev', 'next', 'fullscreen', 'actualSize', 'rotateLeft', 'rotateRight'];
      var btnsHTML = '';
      D.each(toolbar, function (index, item) {
        var btnClass = "".concat(NS, "-button ").concat(NS, "-button-").concat(item);
        if (btns.indexOf(item) >= 0) {
          btnsHTML += "<button class=\"".concat(btnClass, "\" title=\"").concat(_this.options.i18n[item], "\">\n          ").concat(_this.options.icons[item], "\n          </button>");
        } else if (_this.options.customButtons[item]) {
          btnsHTML += "<button class=\"".concat(btnClass, "\" title=\"").concat(_this.options.customButtons[item].title || '', "\">\n          ").concat(_this.options.customButtons[item].text, "\n          </button>");
        }
      });
      return btnsHTML;
    }
  }, {
    key: "_createTitle",
    value: function _createTitle() {
      return this.options.title ? "<div class=\"".concat(NS, "-title\"></div>") : '';
    }
  }, {
    key: "_createTemplate",
    value: function _createTemplate() {
      var photoviewerHTML = "<div class=\"".concat(NS, "-modal\" tabindex=\"0\" role=\"dialog\">\n        <div class=\"").concat(NS, "-inner\">\n          <div class=\"").concat(NS, "-header\">\n            <div class=\"").concat(NS, "-toolbar ").concat(NS, "-toolbar-header\">\n            ").concat(this._createBtns(this.options.headerToolbar), "\n            </div>\n            ").concat(this._createTitle(), "\n          </div>\n          <div class=\"").concat(NS, "-stage\">\n            <img class=\"").concat(NS, "-image\" src=\"\" alt=\"\" />\n          </div>\n          <div class=\"").concat(NS, "-footer\">\n            <div class=\"").concat(NS, "-toolbar ").concat(NS, "-toolbar-footer\">\n            ").concat(this._createBtns(this.options.footerToolbar), "\n            </div>\n          </div>\n        </div>\n      </div>");
      return photoviewerHTML.replace(/>\s+</g, '><');
    }
  }, {
    key: "_build",
    value: function _build() {
      // Create PhotoViewer HTML string
      var photoviewerHTML = this._createTemplate();

      // Trans PhotoViewer HTML string to Domq element
      var $photoviewer = D(photoviewerHTML);

      // Get and store all PhotoViewer elements
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

      // Reset the modal `z-index` of multiple instances
      this.$photoviewer.css('z-index', PUBLIC_VARS['zIndex']);
      if (this.options.positionFixed) {
        this.$photoviewer.css({
          position: 'fixed'
        });
      }

      // Set the handle element for dragging
      if (!this.options.dragHandle || this.options.dragHandle === CLASS_NS + '-modal') {
        this.dragHandle = this.$photoviewer;
      } else {
        this.dragHandle = this.$photoviewer.find(this.options.dragHandle);
      }

      // Add PhotoViewer to DOM
      D(this.options.appendTo).eq(0).append(this.$photoviewer);

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
  }, {
    key: "open",
    value: function open() {
      this._triggerHook('beforeOpen', this);
      if (!this.options.multiInstances && PhotoViewer.instances.length > 0) {
        PhotoViewer.instances[0].close();
      }
      this._build();
      this._setInitModalPos();
      PhotoViewer.instances.push(this);
      this._triggerHook('opened', this);
    }
  }, {
    key: "close",
    value: function close() {
      var _this2 = this;
      this._triggerHook('beforeClose', this);

      // Remove the DOM and all bound events
      this.$photoviewer.remove();
      PhotoViewer.instances = PhotoViewer.instances.filter(function (p) {
        return p !== _this2;
      });
      if (PhotoViewer.instances.length === 0) {
        // Reset `z-index` after close
        PUBLIC_VARS['zIndex'] = this.options.zIndex;
        // Remove the bound event on windows
        $W.off(RESIZE_EVENT + EVENT_NS);
      }
      this._triggerHook('closed', this);
    }
  }, {
    key: "_getOffsetParentData",
    value: function _getOffsetParentData() {
      var offsetParent = D(this.options.appendTo)[0];
      return {
        width: this.options.positionFixed || isRootNode(offsetParent) ? $W.width() : offsetParent.clientWidth,
        height: this.options.positionFixed || isRootNode(offsetParent) ? $W.height() : offsetParent.clientHeight,
        scrollLeft: this.options.positionFixed ? 0 : isRootNode(offsetParent) ? $D.scrollLeft() : offsetParent.scrollLeft,
        scrollTop: this.options.positionFixed ? 0 : isRootNode(offsetParent) ? $D.scrollTop() : offsetParent.scrollTop
      };
    }
  }, {
    key: "_setModalToCenter",
    value: function _setModalToCenter() {
      var initLeft, initTop, initRight, initBottom;

      // Extra width/height for `content-box`
      var extraWidth = 0,
        extraHeight = 0;
      if (!isBorderBox(this.$photoviewer)) {
        extraWidth += this._modalEdgeValue.horizontal;
        extraHeight += this._modalEdgeValue.vertical;
      }
      if (D.isPlainObject(this.options.initModalPos)) {
        initLeft = this.options.initModalPos.left;
        initTop = this.options.initModalPos.top;
        initRight = this.options.initModalPos.right;
        initBottom = this.options.initModalPos.bottom;
      } else {
        var offsetParentData = this._getOffsetParentData();
        initLeft = (offsetParentData.width - this.options.modalWidth - extraWidth) / 2 + offsetParentData.scrollLeft;
        initTop = (offsetParentData.height - this.options.modalHeight - extraHeight) / 2 + offsetParentData.scrollTop;
      }
      var modalInitCSS = {
        width: this.modalData.width || this.options.modalWidth,
        height: this.modalData.height || this.options.modalHeight,
        left: this.modalData.left || initLeft,
        top: this.modalData.top || initTop,
        right: this.modalData.right || initRight,
        bottom: this.modalData.bottom || initBottom
      };
      this.$photoviewer.css(modalInitCSS);
    }
  }, {
    key: "_setInitModalPos",
    value: function _setInitModalPos() {
      if (this.options.initMaximized) {
        this.maximize();
        this.isOpened = true;
      } else {
        this._setModalToCenter();
      }

      // The focus must be set after opening
      this.$photoviewer[0].focus();
    }
  }, {
    key: "_setModalSize",
    value: function _setModalSize() {
      var _this3 = this;
      // Modal size should calculate with stage css value
      var modalWidth = this.imageData.originalWidth + this._stageEdgeValue.horizontal;
      var modalHeight = this.imageData.originalHeight + this._stageEdgeValue.vertical;

      // Extra width/height for `content-box`
      var extraWidth = 0,
        extraHeight = 0;
      if (isBorderBox(this.$photoviewer)) {
        modalWidth += this._modalEdgeValue.horizontal;
        modalHeight += this._modalEdgeValue.vertical;
      } else {
        extraWidth += this._modalEdgeValue.horizontal;
        extraHeight += this._modalEdgeValue.vertical;
      }
      var offsetParentData = this._getOffsetParentData();
      var gapThreshold = Math.max(this.options.gapThreshold, 0) + 1;
      // Modal scale relative to parent element
      var scale = Math.min(offsetParentData.width / ((modalWidth + extraWidth) * gapThreshold), offsetParentData.height / ((modalHeight + extraHeight) * gapThreshold), 1);
      var minWidth = Math.max(modalWidth * scale, this.options.modalWidth);
      var minHeight = Math.max(modalHeight * scale, this.options.modalHeight);
      minWidth = this.options.fixedModalSize ? this.options.modalWidth : Math.round(minWidth);
      minHeight = this.options.fixedModalSize ? this.options.modalHeight : Math.round(minHeight);
      var transLeft, transTop, transRight, transBottom;
      if (D.isPlainObject(this.options.initModalPos)) {
        transLeft = this.options.initModalPos.left;
        transTop = this.options.initModalPos.top;
        transRight = this.options.initModalPos.right;
        transBottom = this.options.initModalPos.bottom;
      } else {
        transLeft = (offsetParentData.width - minWidth - extraWidth) / 2 + offsetParentData.scrollLeft;
        transTop = (offsetParentData.height - minHeight - extraHeight) / 2 + offsetParentData.scrollTop;
      }
      var modalTransCSS = {
        width: minWidth,
        height: minHeight,
        left: transLeft,
        top: transTop,
        right: transRight,
        bottom: transBottom
      };

      // Add init animation for modal
      if (this.options.initAnimation) {
        this.$photoviewer.animate(modalTransCSS, this.options.animationDuration, this.options.animationEasing, function () {
          _this3._setImageSize();
        });
      } else {
        this.$photoviewer.css(modalTransCSS);
        this._setImageSize();
      }
      this.isOpened = true;
    }
  }, {
    key: "_setImageSize",
    value: function _setImageSize() {
      var stageWidth = this.$stage.width();
      var stageHeight = this.$stage.height();
      var _this$imageData = this.imageData,
        imgOriginalWidth = _this$imageData.originalWidth,
        imgOriginalHeight = _this$imageData.originalHeight;
      var scale = getImageScale(imgOriginalWidth, imgOriginalHeight, stageWidth, stageHeight, this.isRotated);
      var imgWidth = imgOriginalWidth * scale;
      var imgHeight = imgOriginalHeight * scale;
      this.$image.css({
        width: Math.round(imgWidth),
        height: Math.round(imgHeight),
        left: (stageWidth - Math.round(imgWidth)) / 2,
        top: (stageHeight - Math.round(imgHeight)) / 2
      });

      // Store the image initial data
      D.extend(this.imageData, {
        initWidth: imgWidth,
        initHeight: imgHeight,
        initLeft: (stageWidth - imgWidth) / 2,
        initTop: (stageHeight - imgHeight) / 2,
        width: imgWidth,
        height: imgHeight,
        left: (stageWidth - imgWidth) / 2,
        top: (stageHeight - imgHeight) / 2
      });
      setGrabCursor({
        w: imgWidth,
        h: imgHeight
      }, {
        w: stageWidth,
        h: stageHeight
      }, this.$stage, this.isRotated);

      // Just execute before image loaded
      if (!this.imageLoaded) {
        // Loader end
        this.$photoviewer.find(CLASS_NS + '-loader').remove();
        // The class must be removed after image loaded
        this.$stage.removeClass(NS + '-align-center');

        // Add init animation for image
        if (this.options.initAnimation && !this.options.progressiveLoading) {
          this.$image.fadeIn();
        }
        this.imageLoaded = true;
        this._triggerHook('changed', [this, this.index]);
      }
    }
  }, {
    key: "_loadImage",
    value: function _loadImage(index) {
      var _this$images$index,
        _this$images$index2,
        _this4 = this;
      // Flag for both image loaded and animation finished
      this.imageLoaded = false;
      this._triggerHook('beforeChange', [this, this.prevIndex]);
      this._removeErrorMsg();

      // Reset the image src and rotation status
      this.$image.removeAttr('style').attr('src', '');
      this.isRotated = false;
      this.rotationDegree = 0;

      // Loader start
      this.$photoviewer.append("<div class=\"".concat(NS, "-loader\"></div>"));
      // Used for centering image
      this.$stage.addClass(NS + '-align-center');
      if (this.options.initAnimation && !this.options.progressiveLoading) {
        this.$image.hide();
      }

      // The image src must be a string
      var imgSrc = ((_this$images$index = this.images[index]) === null || _this$images$index === void 0 ? void 0 : _this$images$index.src) == null ? '' : this.images[index].src.toString();

      // Get image with src
      this.$image.attr('src', imgSrc);
      var title = ((_this$images$index2 = this.images[index]) === null || _this$images$index2 === void 0 ? void 0 : _this$images$index2.title) || getImageNameFromUrl(imgSrc);
      if (this.options.title) {
        this.$title.html(title);
      }
      this.$image.attr('alt', title);
      preloadImage(imgSrc, function (img) {
        // Store the original image size
        _this4.imageData = {
          originalWidth: img.width,
          originalHeight: img.height
        };
        if (_this4.isMaximized || _this4.isOpened && _this4.options.fixedModalPos) {
          _this4._setImageSize();
        } else {
          _this4._setModalSize();
        }
      }, function () {
        // Loader end
        _this4.$photoviewer.find(CLASS_NS + '-loader').remove();
        _this4._triggerHook('changed', [_this4, index]);
        _this4._setErrorMsg();
      });
    }
  }, {
    key: "_setErrorMsg",
    value: function _setErrorMsg() {
      var errorMsg = D.isFunction(this.options.errorMsg) ? this.options.errorMsg(this, this.index) : this.options.errorMsg;
      if (errorMsg) {
        this.$stage.append("<span class=\"".concat(NS, "-error-msg\">").concat(errorMsg, "</span>"));
        this.$image.addClass(NS + '-image-error');
      }
    }
  }, {
    key: "_removeErrorMsg",
    value: function _removeErrorMsg() {
      this.$stage.find(CLASS_NS + '-error-msg').remove();
      this.$image.removeClass(NS + '-image-error');
    }
  }, {
    key: "jump",
    value: function jump(step) {
      // Allow to change image only after the modal animation has finished
      var now = Date.now();
      if (now - this._lastTimestamp >= this.options.animationDuration) {
        var newIndex = this.index + step;
        this.jumpTo(newIndex);
        this._lastTimestamp = now;
      }
    }
  }, {
    key: "jumpTo",
    value: function jumpTo(index) {
      this.prevIndex = this.index;
      var newIndex = index % this.images.length;
      if (newIndex <= 0) {
        newIndex = (newIndex + this.images.length) % this.images.length;
      }
      this.index = newIndex;
      this._loadImage(this.index);
    }
  }, {
    key: "_wheel",
    value: function _wheel(e) {
      e.preventDefault();
      var delta = 1;
      if (e.deltaY) {
        delta = e.deltaY > 0 ? 1 : -1;
      } else if (e.wheelDelta) {
        delta = -e.wheelDelta / 120;
      } else if (e.detail) {
        delta = e.detail > 0 ? 1 : -1;
      }

      // Ratio threshold
      var ratio = -delta * this.options.ratioThreshold;

      // Mouse point position relative to stage
      var pointer = {
        x: e.clientX - this.$stage.offset().left + $D.scrollLeft(),
        y: e.clientY - this.$stage.offset().top + $D.scrollTop()
      };
      this.zoom(ratio, pointer);
    }
  }, {
    key: "zoom",
    value: function zoom(ratio, origin) {
      // Zoom-out ratio & Zoom-in ratio
      ratio = ratio < 0 ? 1 / (1 - ratio) : 1 + ratio;

      // Image ratio
      ratio = this.$image.width() / this.imageData.originalWidth * ratio;
      if (ratio > this.options.maxRatio || ratio < this.options.minRatio) {
        return;
      }
      this.zoomTo(ratio, origin);
    }
  }, {
    key: "zoomTo",
    value: function zoomTo(ratio, origin) {
      var _this$imageData2 = this.imageData,
        imgOriginalWidth = _this$imageData2.originalWidth,
        imgOriginalHeight = _this$imageData2.originalHeight,
        imgWidth = _this$imageData2.width,
        imgHeight = _this$imageData2.height,
        imgLeft = _this$imageData2.left,
        imgTop = _this$imageData2.top,
        imgInitWidth = _this$imageData2.initWidth;

      // We will use the stage size to calc the relative position of image
      var stageWidth = this.$stage.width();
      var stageHeight = this.$stage.height();

      // Set the default origin coordinates (center of stage)
      if (origin === void 0) {
        origin = {
          x: stageWidth / 2,
          y: stageHeight / 2
        };
      }

      // Get the new size of the image
      var newWidth = imgOriginalWidth * ratio;
      var newHeight = imgOriginalHeight * ratio;

      // Get the new position of the image, think about it for a while
      var newLeft = origin.x - (origin.x - imgLeft) / imgWidth * newWidth;
      var newTop = origin.y - (origin.y - imgTop) / imgHeight * newHeight;

      // δ is the difference between new width and new height of the image
      var δ = !this.isRotated ? 0 : (newWidth - newHeight) / 2;
      // The width and height should be exchanged after rotated
      var imgFrameWidth = !this.isRotated ? newWidth : newHeight;
      var imgFrameHeight = !this.isRotated ? newHeight : newWidth;

      // The difference between stage size and new image size
      var diffX = stageWidth - newWidth;
      var diffY = stageHeight - newHeight;

      // Zoom-out & Zoom-in condition
      // It's important and it takes me a lot of time to get it
      // The conditions with image rotated 90 degree drive me crazy alomst!
      if (imgFrameWidth <= stageWidth) {
        newLeft = diffX / 2;
      } else {
        newLeft = newLeft > -δ ? -δ : Math.max(newLeft, diffX + δ);
      }
      if (imgFrameHeight <= stageHeight) {
        newTop = diffY / 2;
      } else {
        newTop = newTop > δ ? δ : Math.max(newTop, diffY - δ);
      }

      // Whether the image scale get to the critical point
      if (Math.abs(imgInitWidth - newWidth) < imgInitWidth * 0.05) {
        this._setImageSize();
      } else {
        this.$image.css({
          width: Math.round(newWidth),
          height: Math.round(newHeight),
          left: Math.round(newLeft),
          top: Math.round(newTop)
        });
        setGrabCursor({
          w: Math.round(imgFrameWidth),
          h: Math.round(imgFrameHeight)
        }, {
          w: stageWidth,
          h: stageHeight
        }, this.$stage);
      }

      // Update the image initial data
      D.extend(this.imageData, {
        width: newWidth,
        height: newHeight,
        left: newLeft,
        top: newTop
      });
    }
  }, {
    key: "rotate",
    value: function rotate(degree) {
      this.rotationDegree = this.rotationDegree + degree;
      if (this.rotationDegree / 90 % 2 === 0) {
        this.isRotated = false;
      } else {
        this.isRotated = true;
      }
      this.rotateTo(this.rotationDegree);
    }
  }, {
    key: "rotateTo",
    value: function rotateTo(degree) {
      this.$image.css({
        transform: 'rotate(' + degree + 'deg)'
      });
      this._setImageSize();
    }
  }, {
    key: "maximize",
    value: function maximize() {
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
  }, {
    key: "exitMaximize",
    value: function exitMaximize() {
      this.$photoviewer.removeClass(NS + '-maximized');
      this._setModalToCenter();
      this.isMaximized = false;
    }
  }, {
    key: "toggleMaximize",
    value: function toggleMaximize() {
      if (!this.isMaximized) {
        var originalWidth = this.$photoviewer.width();
        var originalHeight = this.$photoviewer.height();
        if (isBorderBox(this.$photoviewer)) {
          originalWidth += this._modalEdgeValue.horizontal;
          originalHeight += this._modalEdgeValue.vertical;
        }

        // Store the modal's size and position before maximized
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
      this._setImageSize();
      this.$photoviewer[0].focus();
    }
  }, {
    key: "fullscreen",
    value: function fullscreen() {
      requestFullscreen(this.$photoviewer[0]);
      this.$photoviewer[0].focus();
    }
  }, {
    key: "resize",
    value: function resize() {
      if (this.isOpened) {
        if (this.isMaximized) {
          this._setImageSize();
        } else {
          this._setModalSize();
        }
      }
    }
  }, {
    key: "_keydown",
    value: function _keydown(e) {
      if (!this.options.keyboard) {
        return;
      }
      var keyCode = e.keyCode || e.which || e.charCode;
      var ctrlKey = e.ctrlKey || e.metaKey;
      var altKey = e.altKey;
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
          this.zoom(this.options.ratioThreshold * 3, {
            x: this.$stage.width() / 2,
            y: this.$stage.height() / 2
          }, e);
          break;
        // -
        case 189:
          this.zoom(-this.options.ratioThreshold * 3, {
            x: this.$stage.width() / 2,
            y: this.$stage.height() / 2
          }, e);
          break;
        // + Firefox
        case 61:
          this.zoom(this.options.ratioThreshold * 3, {
            x: this.$stage.width() / 2,
            y: this.$stage.height() / 2
          }, e);
          break;
        // - Firefox
        case 173:
          this.zoom(-this.options.ratioThreshold * 3, {
            x: this.$stage.width() / 2,
            y: this.$stage.height() / 2
          }, e);
          break;
        // Ctrl + Alt + 0
        case 48:
          if (ctrlKey && altKey) {
            this.zoomTo(1, {
              x: this.$stage.width() / 2,
              y: this.$stage.height() / 2
            }, e);
          }
          break;
        // Ctrl + ,
        case 188:
          if (ctrlKey) {
            // `⌘ + ,` is the hotkey of browser settings
            e.preventDefault();
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
        // Alt + X
        case 88:
          if (altKey) {
            this.toggleMaximize();
          }
          break;
        // F
        case 70:
          this.fullscreen();
          break;
      }
    }
  }, {
    key: "_addEvents",
    value: function _addEvents() {
      var _this5 = this;
      this.$close.on(CLICK_EVENT + EVENT_NS, function () {
        _this5.close();
      });
      this.$stage.on(WHEEL_EVENT + EVENT_NS, function (e) {
        _this5._wheel(e);
      });
      this.$zoomIn.on(CLICK_EVENT + EVENT_NS, function () {
        _this5.zoom(_this5.options.ratioThreshold * 3);
      });
      this.$zoomOut.on(CLICK_EVENT + EVENT_NS, function () {
        _this5.zoom(-_this5.options.ratioThreshold * 3);
      });
      this.$actualSize.on(CLICK_EVENT + EVENT_NS, function () {
        _this5.zoomTo(1);
      });
      this.$prev.on(CLICK_EVENT + EVENT_NS, function () {
        _this5.jump(-1);
      });
      this.$next.on(CLICK_EVENT + EVENT_NS, function () {
        _this5.jump(1);
      });
      this.$rotateLeft.on(CLICK_EVENT + EVENT_NS, function () {
        _this5.rotate(-90);
      });
      this.$rotateRight.on(CLICK_EVENT + EVENT_NS, function () {
        _this5.rotate(90);
      });
      this.$maximize.on(CLICK_EVENT + EVENT_NS, function () {
        _this5.toggleMaximize();
      });
      this.$fullscreen.on(CLICK_EVENT + EVENT_NS, function () {
        _this5.fullscreen();
      });
      this.$photoviewer.on(KEYDOWN_EVENT + EVENT_NS, function (e) {
        _this5._keydown(e);
      });
      $W.on(RESIZE_EVENT + EVENT_NS, debounce(function () {
        return _this5.resize();
      }, 500));
    }
  }, {
    key: "_addCustomButtonEvents",
    value: function _addCustomButtonEvents() {
      var _this6 = this;
      var _loop = function _loop(btnKey) {
        _this6.$photoviewer.find(CLASS_NS + '-button-' + btnKey).on(CLICK_EVENT + EVENT_NS, function (e) {
          _this6.options.customButtons[btnKey].click.apply(_this6, [_this6, e]);
        });
      };
      for (var btnKey in this.options.customButtons) {
        _loop(btnKey);
      }
    }
  }, {
    key: "_triggerHook",
    value: function _triggerHook(e, data) {
      if (this.options.callbacks[e]) {
        this.options.callbacks[e].apply(this, D.isArray(data) ? data : [data]);
      }
    }
  }]);
  return PhotoViewer;
}();
/**
 * Add methods to PhotoViewer
 */
// Store modal instances
_defineProperty(PhotoViewer, "instances", []);
D.extend(PhotoViewer.prototype, {
  draggable: draggable
}, {
  movable: movable
}, {
  resizable: resizable
});

module.exports = PhotoViewer;
