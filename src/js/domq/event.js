import D from './d-class';

import {
  slice,
  handlers,
  specialEvents,
  focusinSupported,
  focus,
  hover,
  ignoreProperties,
  eventMethods,
} from './vars';

import {
  isFunction,
  isString,
  returnTrue,
  returnFalse
} from './utils';

var _zid = 1;
function zid(element) {
  return element._zid || (element._zid = _zid++)
}
function findHandlers(element, event, fn, selector) {
  event = parse(event)
  if (event.ns) var matcher = matcherFor(event.ns)
  return (handlers[zid(element)] || []).filter(function (handler) {
    return handler
      && (!event.e || handler.e == event.e)
      && (!event.ns || matcher.test(handler.ns))
      && (!fn || zid(handler.fn) === zid(fn))
      && (!selector || handler.sel == selector)
  })
}
function parse(event) {
  var parts = ('' + event).split('.')
  return { e: parts[0], ns: parts.slice(1).sort().join(' ') }
}
function matcherFor(ns) {
  return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)')
}

function eventCapture(handler, captureSetting) {
  return handler.del &&
    (!focusinSupported && (handler.e in focus)) ||
    !!captureSetting
}

function realEvent(type) {
  return hover[type] || (focusinSupported && focus[type]) || type
}

function add(element, events, fn, data, selector, delegator, capture) {
  var id = zid(element), set = (handlers[id] || (handlers[id] = []))
  events.split(/\s/).forEach(function (event) {
    if (event == 'ready') return D(document).ready(fn)
    var handler = parse(event)
    handler.fn = fn
    handler.sel = selector
    // emulate mouseenter, mouseleave
    if (handler.e in hover) fn = function (e) {
      var related = e.relatedTarget
      if (!related || (related !== this && !D.contains(this, related)))
        return handler.fn.apply(this, arguments)
    }
    handler.del = delegator
    var callback = delegator || fn
    handler.proxy = function (e) {
      e = compatible(e)
      if (e.isImmediatePropagationStopped()) return
      e.data = data
      var result = callback.apply(element, e._args == undefined ? [e] : [e].concat(e._args))
      if (result === false) e.preventDefault(), e.stopPropagation()
      return result
    }
    handler.i = set.length
    set.push(handler)
    if ('addEventListener' in element)
      element.addEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
  })
}
function remove(element, events, fn, selector, capture) {
  var id = zid(element)
    ; (events || '').split(/\s/).forEach(function (event) {
      findHandlers(element, event, fn, selector).forEach(function (handler) {
        delete handlers[id][handler.i]
        if ('removeEventListener' in element)
          element.removeEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
      })
    })
}

function compatible(event, source) {
  if (source || !event.isDefaultPrevented) {
    source || (source = event)

    D.each(eventMethods, function (name, predicate) {
      var sourceMethod = source[name]
      event[name] = function () {
        this[predicate] = returnTrue
        return sourceMethod && sourceMethod.apply(source, arguments)
      }
      event[predicate] = returnFalse
    })

    try {
      event.timeStamp || (event.timeStamp = Date.now())
    } catch (ignored) { }

    if (source.defaultPrevented !== undefined ? source.defaultPrevented :
      'returnValue' in source ? source.returnValue === false :
        source.getPreventDefault && source.getPreventDefault())
      event.isDefaultPrevented = returnTrue
  }
  return event
}

function createProxy(event) {
  var key, proxy = { originalEvent: event }
  for (key in event)
    if (!ignoreProperties.test(key) && event[key] !== undefined) proxy[key] = event[key]

  return compatible(proxy, event)
}

D.event = { add: add, remove: remove }

D.Event = function (type, props) {
  if (!isString(type)) props = type, type = props.type
  var event = document.createEvent(specialEvents[type] || 'Events'), bubbles = true
  if (props) for (var name in props) (name == 'bubbles') ? (bubbles = !!props[name]) : (event[name] = props[name])
  event.initEvent(type, bubbles, true)
  return compatible(event)
}

D.proxy = function (fn, context) {
  var args = (2 in arguments) && slice.call(arguments, 2)
  if (isFunction(fn)) {
    var proxyFn = function () { return fn.apply(context, args ? args.concat(slice.call(arguments)) : arguments) }
    proxyFn._zid = zid(fn)
    return proxyFn
  } else if (isString(context)) {
    if (args) {
      args.unshift(fn[context], fn)
      return D.proxy.apply(null, args)
    } else {
      return D.proxy(fn[context], fn)
    }
  } else {
    throw new TypeError("expected function")
  }
}

D.fn.one = function (event, selector, data, callback) {
  return this.on(event, selector, data, callback, 1)
}

D.fn.on = function (event, selector, data, callback, one) {
  var autoRemove, delegator, $this = this
  if (event && !isString(event)) {
    D.each(event, function (type, fn) {
      $this.on(type, selector, data, fn, one)
    })
    return $this
  }

  if (!isString(selector) && !isFunction(callback) && callback !== false)
    callback = data, data = selector, selector = undefined
  if (callback === undefined || data === false)
    callback = data, data = undefined

  if (callback === false) callback = returnFalse

  return $this.each(function (_, element) {
    if (one) autoRemove = function (e) {
      remove(element, e.type, callback)
      return callback.apply(this, arguments)
    }

    if (selector) delegator = function (e) {
      var evt, match = D(e.target).closest(selector, element).get(0)
      if (match && match !== element) {
        evt = D.extend(createProxy(e), { currentTarget: match, liveFired: element })
        return (autoRemove || callback).apply(match, [evt].concat(slice.call(arguments, 1)))
      }
    }

    add(element, event, callback, data, selector, delegator || autoRemove)
  })
}

D.fn.off = function (event, selector, callback) {
  var $this = this
  if (event && !isString(event)) {
    D.each(event, function (type, fn) {
      $this.off(type, selector, fn)
    })
    return $this
  }

  if (!isString(selector) && !isFunction(callback) && callback !== false)
    callback = selector, selector = undefined

  if (callback === false) callback = returnFalse

  return $this.each(function () {
    remove(this, event, callback, selector)
  })
}

D.fn.trigger = function (event, args) {
  event = (isString(event) || D.isPlainObject(event)) ? D.Event(event) : compatible(event)
  event._args = args
  return this.each(function () {
    // handle focus(), blur() by calling them directly
    if (event.type in focus && typeof this[event.type] == "function") this[event.type]()
    // items in the collection might not be DOM elements
    else if ('dispatchEvent' in this) this.dispatchEvent(event)
    else D(this).triggerHandler(event, args)
  })
}

// triggers event handlers on current element just as if an event occurred,
// doesn't trigger an actual event, doesn't bubble
D.fn.triggerHandler = function (event, args) {
  var e, result
  this.each(function (i, element) {
    e = createProxy(isString(event) ? D.Event(event) : event)
    e._args = args
    e.target = element
    D.each(findHandlers(element, event.type || event), function (i, handler) {
      result = handler.proxy(e)
      if (e.isImmediatePropagationStopped()) return false
    })
  })
  return result
}

  // shortcut methods for `.on(event, fn)` for each event type
  ; ('focusin focusout focus blur load resize scroll unload click dblclick ' +
    'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave ' +
    'change select keydown keypress keyup error').split(' ').forEach(function (event) {
      D.fn[event] = function (callback) {
        return (0 in arguments) ?
          this.on(event, callback) :
          this.trigger(event)
      }
    })
