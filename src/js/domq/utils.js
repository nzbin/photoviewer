import D from './d-class';
import {
  filter,
  slice,
  document,
  elementDisplay,
  classCache,
  cssNumber,
  class2type,
  toString
} from './vars';

function type(obj) {
  return obj == null
    ? String(obj)
    : class2type[toString.call(obj)] || "object"
}

function isFunction(value) {
  return type(value) == "function"
}

function isWindow(obj) {
  return obj != null && obj == obj.window
}

function isDocument(obj) {
  return obj != null && obj.nodeType == obj.DOCUMENT_NODE
}

function isObject(obj) {
  return type(obj) == "object"
}

function isPlainObject(obj) {
  return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype
}

function likeArray(obj) {
  var length = !!obj && 'length' in obj && obj.length,
    typeRes = type(obj);

  return 'function' != typeRes && !isWindow(obj) && (
    'array' == typeRes || length === 0 ||
    (typeof length == 'number' && length > 0 && (length - 1) in obj)
  )
}

function compact(array) {
  return filter.call(array, function (item) {
    return item != null
  })
}

function flatten(array) {
  return array.length > 0 ? D.fn.concat.apply([], array) : array
}

function dasherize(str) {
  return str.replace(/::/g, '/')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    .replace(/([a-z\d])([A-Z])/g, '$1_$2')
    .replace(/_/g, '-')
    .toLowerCase()
}

function maybeAddPx(name, value) {
  return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value
}

function uniq(array) {
  return filter.call(array, function (item, idx) {
    return array.indexOf(item) == idx
  })
}

function camelize(str) {
  return str.replace(/-+(.)?/g, function (match, chr) {
    return chr ? chr.toUpperCase() : ''
  })
}

function classRE(name) {
  return name in classCache ?
    classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'))
}

function defaultDisplay(nodeName) {
  var element, display
  if (!elementDisplay[nodeName]) {
    element = document.createElement(nodeName)
    document.body.appendChild(element)
    display = getComputedStyle(element, '').getPropertyValue("display")
    element.parentNode.removeChild(element)
    display == "none" && (display = "block")
    elementDisplay[nodeName] = display
  }
  return elementDisplay[nodeName]
}

function children(element) {
  return 'children' in element ?
    slice.call(element.children) :
    D.map(element.childNodes, function (node) {
      if (node.nodeType == 1) return node
    })
}

// "true"  => true
// "false" => false
// "null"  => null
// "42"    => 42
// "42.5"  => 42.5
// "08"    => "08"
// JSON    => parse if valid
// String  => self
function deserializeValue(value) {
  try {
    return value ?
      value == "true" ||
      (value == "false" ? false :
        value == "null" ? null :
          +value + "" == value ? +value :
            /^[\[\{]/.test(value) ? JSON.parse(value) :
              value) :
      value
  } catch (e) {
    return value
  }
}
function filtered(nodes, selector) {
  return selector == null ? D(nodes) : D(nodes).filter(selector)
}

function funcArg(context, arg, idx, payload) {
  return isFunction(arg) ? arg.call(context, idx, payload) : arg
}

function setAttribute(node, name, value) {
  value == null ? node.removeAttribute(name) : node.setAttribute(name, value)
}

// access className property while respecting SVGAnimatedString
function className(node, value) {
  var klass = node.className || '',
    svg = klass && klass.baseVal !== undefined

  if (value === undefined) return svg ? klass.baseVal : klass
  svg ? (klass.baseVal = value) : (node.className = value)
}

export {
  type,
  isFunction,
  isWindow,
  isDocument,
  isObject,
  isPlainObject,
  likeArray,
  compact,
  flatten,
  dasherize,
  maybeAddPx,
  uniq,
  camelize,
  classRE,
  defaultDisplay,
  deserializeValue,
  children,
  filtered,
  funcArg,
  setAttribute,
  className
}


