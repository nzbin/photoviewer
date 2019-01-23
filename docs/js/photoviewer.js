
/*!
 *  ____  _   _  ___  _____  ___  _   _ _____ ____ _    _ ____ ____
 * |  _ \| | | |/ _ \|_   _|/ _ \| | | |_   _|  __| |  | |  __|  _ \
 * | |_| | |_| | | | | | | | | | | | | | | | | |__| |  | | |__| |_| |
 * |  __/|  _  | | | | | | | | | | |_| | | | |  __| |/\| |  __|    /
 * | |   | | | | |_| | | | | |_| |\   / _| |_| |__|  /\  | |__| |\ \
 * |_|   |_| |_|\___/  |_|  \___/  \_/ |_____|____|_/  \_|____|_| \_\
 *
 * photoviewer - v3.0.1
 * A JS plugin to view images just like in Windows
 * https://nzbin.github.io/photoviewer/
 *
 * Copyright (c) 2018 nzbin
 * Released under MIT License
 */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.photoviewer = factory());
}(this, (function () { 'use strict';

    // Class D
    var D = function (selector, context) {
        return new D.fn.init(selector, context);
    };

    var document = window.document,
      emptyArray = [],
      concat = emptyArray.concat,
      filter = emptyArray.filter,
      slice = emptyArray.slice,
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
      isArray = Array.isArray || function (arg) {
        return Object.prototype.toString.call(arg) === '[object Array]';
      },
      contains = document.documentElement.contains
        ? function (parent, node) {
          return parent !== node && parent.contains(node)
        }
        : function (parent, node) {
          while (node && (node = node.parentNode))
            if (node === parent) return true
          return false
        };

    function type(obj) {
      return obj == null
        ? String(obj)
        : class2type[toString.call(obj)] || 'object'
    }

    function isFunction(value) {
      return type(value) == 'function'
    }

    function isWindow(obj) {
      return obj != null && obj == obj.window
    }

    function isDocument(obj) {
      return obj != null && obj.nodeType == obj.DOCUMENT_NODE
    }

    function isObject(obj) {
      return type(obj) == 'object'
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

    function dasherize(str) {
      return str.replace(/::/g, '/')
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
        .replace(/([a-z\d])([A-Z])/g, '$1_$2')
        .replace(/_/g, '-')
        .toLowerCase()
    }

    function maybeAddPx(name, value) {
      return (typeof value == 'number' && !cssNumber[dasherize(name)]) ? value + 'px' : value
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

    function flatten(array) {
      return array.length > 0 ? D.fn.concat.apply([], array) : array
    }

    function isD(object) {
      return object instanceof D
    }

    function funcArg(context, arg, idx, payload) {
      return isFunction(arg) ? arg.call(context, idx, payload) : arg
    }

    function setAttribute(node, name, value) {
      value == null ? node.removeAttribute(name) : node.setAttribute(name, value);
    }

    // access className property while respecting SVGAnimatedString
    function className(node, value) {
      var klass = node.className || '',
        svg = klass && klass.baseVal !== undefined;

      if (value === undefined) return svg ? klass.baseVal : klass
      svg ? (klass.baseVal = value) : (node.className = value);
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
                return this
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
                    return D(context).find(selector)
                }
                // If it's a CSS selector, use it to select nodes.
                else {
                    dom = D.qsa(document, selector);
                }
            }
            // If a function is given, call it when the DOM is ready
            else if (isFunction(selector)) {
                return D(document).ready(selector)
            }
            // If a D collection is given, just return it
            else if (isD(selector)) {
                return selector
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
                return D(context).find(selector)
            }
            // And last but no least, if it's a CSS selector, use it to select nodes.
            else {
                dom = D.qsa(document, selector);
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
            return concat.apply(isD(this) ? this.toArray() : this, args)
        },
        // `pluck` is borrowed from Prototype.js
        pluck: function (property) {
            return D.map(this, function (el) { return el[property] })
        },
        toArray: function () {
            return this.get()
        },
        get: function (idx) {
            return idx === undefined
                ? slice.call(this)
                : this[idx >= 0 ? idx : idx + this.length]
        },
        size: function () {
            return this.length
        },
        each: function (callback) {
            emptyArray.every.call(this, function (el, idx) {
                return callback.call(el, idx, el) !== false
            });
            return this
        },
        map: function (fn) {
            return D(D.map(this, function (el, i) { return fn.call(el, i, el) }))
        },
        slice: function () {
            return D(slice.apply(this, arguments))
        },
        first: function () {
            var el = this[0];
            return el && !isObject(el) ? el : D(el)
        },
        last: function () {
            var el = this[this.length - 1];
            return el && !isObject(el) ? el : D(el)
        },
        eq: function (idx) {
            return idx === -1 ? this.slice(idx) : this.slice(idx, +idx + 1)
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
                    )
        },
        // Html -> Node
        fragment: function (html, name, properties) {
            var dom, nodes, container;

            // A special case optimization for a single tag
            if (singleTagRE.test(html)) dom = D(document.createElement(RegExp.$1));

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

            return dom
        },
        matches: function (element, selector) {
            if (!selector || !element || element.nodeType !== 1) return false
            var matchesSelector = element.matches || element.webkitMatchesSelector ||
                element.mozMatchesSelector || element.oMatchesSelector ||
                element.matchesSelector;
            if (matchesSelector) return matchesSelector.call(element, selector)
            // fall back to performing a selector:
            var match, parent = element.parentNode,
                temp = !parent;
            if (temp) (parent = tempParent).appendChild(element);
            match = ~D.qsa(parent, selector).indexOf(element);
            temp && tempParent.removeChild(element);
            return match
        },
        each: function (elements, callback) {
            var i, key;
            if (likeArray(elements)) {
                for (i = 0; i < elements.length; i++)
                    if (callback.call(elements[i], i, elements[i]) === false) return elements
            } else {
                for (key in elements)
                    if (callback.call(elements[key], key, elements[key]) === false) return elements
            }

            return elements
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
            return flatten(values)
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
                if (!element) return
                return element.style[camelize(property)] || getComputedStyle(element, '').getPropertyValue(property)
            } else if (isArray(property)) {
                if (!element) return
                var props = {};
                var computedStyle = getComputedStyle(element, '');
                D.each(property, function (_, prop) {
                    props[prop] = (element.style[camelize(prop)] || computedStyle.getPropertyValue(prop));
                });
                return props
            }
        }

        var css = '';
        if (type(property) == 'string') {
            if (!value && value !== 0) {
                this.each(function () {
                    this.style.removeProperty(dasherize(property));
                });
            } else {
                css = dasherize(property) + ":" + maybeAddPx(property, value);
            }
        } else {
            for (var key in property) {
                if (!property[key] && property[key] !== 0) {
                    this.each(function () { this.style.removeProperty(dasherize(key)); });
                } else {
                    css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';';
                }
            }
        }

        return this.each(function () { this.style.cssText += ';' + css; })
    }

    function hasClass(name) {
        if (!name) return false
        return emptyArray.some.call(this, function (el) {
            return this.test(className(el))
        }, classRE(name))
    }

    function addClass(name) {
        var classList = [];
        if (!name) return this
        return this.each(function (idx) {
            if (!('className' in this)) return
            classList = [];
            var cls = className(this),
                newName = funcArg(this, name, idx, cls);
            newName.split(/\s+/g).forEach(function (klass) {
                if (!D(this).hasClass(klass)) classList.push(klass);
            }, this);
            classList.length && className(this, cls + (cls ? ' ' : '') + classList.join(' '));
        })
    }

    function removeClass(name) {
        var classList = [];
        return this.each(function (idx) {
            if (!('className' in this)) return
            if (name === undefined) return className(this, '')
            classList = className(this);
            funcArg(this, name, idx, classList).split(/\s+/g).forEach(function (klass) {
                classList = classList.replace(classRE(klass), ' ');
            });
            className(this, classList.trim());
        })
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
        })
        if (!this.length) return null
        if (document.documentElement !== this[0] && !contains(document.documentElement, this[0]))
            return { top: 0, left: 0 }
        var obj = this[0].getBoundingClientRect();
        return {
            left: obj.left + window.pageXOffset,
            top: obj.top + window.pageYOffset,
            width: Math.round(obj.width),
            height: Math.round(obj.height)
        }
    }

    function position() {
        if (!this.length) return

        var elem = this[0],
            // Get *real* offsetParent
            offsetParent = this.offsetParent(),
            // Get correct offsets
            offset = this.offset(),
            parentOffset = rootNodeRE.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset();

        // Subtract element margins
        // note: when an element has margin: auto the offsetLeft and marginLeft
        // are the same in Safari causing offset.left to incorrectly be 0
        offset.top -= parseFloat(D(elem).css('margin-top')) || 0;
        offset.left -= parseFloat(D(elem).css('margin-left')) || 0;

        // Add offsetParent borders
        parentOffset.top += parseFloat(D(offsetParent[0]).css('border-top-width')) || 0;
        parentOffset.left += parseFloat(D(offsetParent[0]).css('border-left-width')) || 0;

        // Subtract the two offsets
        return {
            top: offset.top - parentOffset.top,
            left: offset.left - parentOffset.left
        }
    }

    function scrollTop(value) {
        if (!this.length) return
        var hasScrollTop = 'scrollTop' in this[0];
        if (value === undefined) return hasScrollTop
            ? this[0].scrollTop
            : isWindow(this[0])
                ? this[0].pageYOffset
                : this[0].defaultView.pageYOffset;
        return this.each(hasScrollTop ?
            function () { this.scrollTop = value; } :
            function () { this.scrollTo(this.scrollX, value); })
    }

    function scrollLeft(value) {
        if (!this.length) return
        var hasScrollLeft = 'scrollLeft' in this[0];
        if (value === undefined) return hasScrollLeft
            ? this[0].scrollLeft
            : isWindow(this[0])
                ? this[0].pageXOffset
                : this[0].defaultView.pageXOffset;
        return this.each(hasScrollLeft ?
            function () { this.scrollLeft = value; } :
            function () { this.scrollTo(value, this.scrollY); })
    }

    function offsetParent() {
        return this.map(function () {
            var parent = this.offsetParent || document.body;
            while (parent && !rootNodeRE.test(parent.nodeName) && D(parent).css('position') == 'static')
                parent = parent.offsetParent;
            return parent
        })
    }

    function attr(name, value) {
        var result;
        return (typeof name == 'string' && !(1 in arguments))
            ? (0 in this && this[0].nodeType == 1 && (result = this[0].getAttribute(name)) != null ? result : undefined)
            : this.each(function (idx) {
                if (this.nodeType !== 1) return
                if (isObject(name))
                    for (var key in name) setAttribute(this, key, name[key]);
                else setAttribute(this, name, funcArg(this, value, idx, this.getAttribute(name)));
            })
    }

    function removeAttr(name) {
        return this.each(function () {
            this.nodeType === 1 && name.split(' ').forEach(function (attribute) {
                setAttribute(this, attribute);
            }, this);
        })
    }

    function find(selector) {
        var result, $this = this;
        if (!selector) result = D();
        else if (typeof selector == 'object')
            result = D(selector).filter(function () {
                var node = this;
                return emptyArray.some.call($this, function (parent) {
                    return contains(parent, node)
                })
            });
        else if (this.length == 1) result = D(D.qsa(this[0], selector));
        else result = this.map(function () { return D.qsa(this, selector) });
        return result
    }

    function closest(selector, context) {
        var nodes = [],
            collection = typeof selector == 'object' && D(selector);
        this.each(function (_, node) {
            while (node && !(collection ? collection.indexOf(node) >= 0 : D.matches(node, selector)))
                node = node !== context && !isDocument(node) && node.parentNode;
            if (node && nodes.indexOf(node) < 0) nodes.push(node);
        });
        return D(nodes)
    }

    function subtract(el, dimen) {
        return el.css('box-sizing') === 'border-box'
            ? dimen === 'width'
                ? (parseFloat(el.css(dimen))
                    - parseFloat(el.css('padding-left'))
                    - parseFloat(el.css('padding-right'))
                    - parseFloat(el.css('border-left-width'))
                    - parseFloat(el.css('border-right-width')))
                : (parseFloat(el.css(dimen))
                    - parseFloat(el.css('padding-top'))
                    - parseFloat(el.css('padding-bottom'))
                    - parseFloat(el.css('border-top-width'))
                    - parseFloat(el.css('border-bottom-width')))
            : parseFloat(el.css(dimen))
    }

    function calc(dimension, value) {
        var dimensionProperty =
            dimension.replace(/./, function (m) { return m[0].toUpperCase() });

        var el = this[0];
        if (value === undefined) return isWindow(el)
            ? el['inner' + dimensionProperty]
            : isDocument(el)
                ? el.documentElement['scroll' + dimensionProperty]
                : subtract(this, dimension)
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

    var traverseNode = function (node, fn) {
        fn(node);
        for (var i = 0, len = node.childNodes.length; i < len; i++)
            traverseNode(node.childNodes[i], fn);
    };

    // inside => append, prepend
    var domMani = function (elem, args, fn, inside) {
        // arguments can be nodes, arrays of nodes, D objects and HTML strings
        var argType,
            nodes = D.map(args, function (arg) {
                var arr = [];
                argType = type(arg);
                if (argType == 'array') {
                    arg.forEach(function (el) {
                        if (el.nodeType !== undefined) return arr.push(el)
                        else if (isD(el)) return arr = arr.concat(el.get())
                        arr = arr.concat(D.fragment(el));
                    });
                    return arr
                }
                return argType == 'object' || arg == null ? arg : D.fragment(arg)
            }),
            parent,
            copyByClone = elem.length > 1;

        if (nodes.length < 1) return elem

        return elem.each(function (_, target) {
            parent = inside ? target : target.parentNode;
            var parentInDocument = contains(document.documentElement, parent);

            nodes.forEach(function (node) {
                if (copyByClone) node = node.cloneNode(true);
                else if (!parent) return D(node).remove()

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
    };

    // Export
    function remove() {
        return this.each(function () {
            if (this.parentNode != null)
                this.parentNode.removeChild(this);
        })
    }

    function empty() {
        return this.each(function () { this.innerHTML = ''; })
    }

    function html(html) {
        return 0 in arguments
            ? this.each(function (idx) {
                var originHtml = this.innerHTML;
                D(this).empty().append(funcArg(this, html, idx, originHtml));
            })
            : (0 in this ? this[0].innerHTML : null)
    }

    function append() {
        return domMani(this, arguments, function (elem) {
            this.insertBefore(elem, null);
        }, true);
    }

    var _zid = 1;
    function zid(element) {
      return element._zid || (element._zid = _zid++)
    }

    function isString(obj) {
      return typeof obj == 'string'
    }

    var returnTrue = function () { return true },
      returnFalse = function () { return false },
      eventMethods = {
        preventDefault: 'isDefaultPrevented',
        stopImmediatePropagation: 'isImmediatePropagationStopped',
        stopPropagation: 'isPropagationStopped'
      };

    function compatible(event, source) {
      if (source || !event.isDefaultPrevented) {
        source || (source = event);

        D.each(eventMethods, function (name, predicate) {
          var sourceMethod = source[name];
          event[name] = function () {
            this[predicate] = returnTrue;
            return sourceMethod && sourceMethod.apply(source, arguments)
          };
          event[predicate] = returnFalse;
        });

        try {
          event.timeStamp || (event.timeStamp = Date.now());
        } catch (ignored) { }

        if (source.defaultPrevented !== undefined ? source.defaultPrevented :
          'returnValue' in source ? source.returnValue === false :
            source.getPreventDefault && source.getPreventDefault())
          event.isDefaultPrevented = returnTrue;
      }
      return event
    }

    var handlers = {},
      focusinSupported = 'onfocusin' in window,
      focus = { focus: 'focusin', blur: 'focusout' },
      hover = { mouseenter: 'mouseover', mouseleave: 'mouseout' },
      ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$|webkitMovement[XY]$)/;

    function parse(event) {
      var parts = ('' + event).split('.');
      return { e: parts[0], ns: parts.slice(1).sort().join(' ') }
    }
    function matcherFor(ns) {
      return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)')
    }

    function findHandlers(element, event, fn, selector) {
      event = parse(event);
      if (event.ns) var matcher = matcherFor(event.ns);
      return (handlers[zid(element)] || []).filter(function (handler) {
        return handler
          && (!event.e || handler.e == event.e)
          && (!event.ns || matcher.test(handler.ns))
          && (!fn || zid(handler.fn) === zid(fn))
          && (!selector || handler.sel == selector)
      })
    }

    function eventCapture(handler, captureSetting) {
      return handler.del &&
        (!focusinSupported && (handler.e in focus)) ||
        !!captureSetting
    }

    function realEvent(type$$1) {
      return hover[type$$1] || (focusinSupported && focus[type$$1]) || type$$1
    }

    function add$1(element, events, fn, data, selector, delegator, capture) {
      var id = zid(element), set = (handlers[id] || (handlers[id] = []));
      events.split(/\s/).forEach(function (event) {
        if (event == 'ready') return D(document).ready(fn)
        var handler = parse(event);
        handler.fn = fn;
        handler.sel = selector;
        // emulate mouseenter, mouseleave
        if (handler.e in hover) fn = function (e) {
          var related = e.relatedTarget;
          if (!related || (related !== this && !contains(this, related)))
            return handler.fn.apply(this, arguments)
        };
        handler.del = delegator;
        var callback = delegator || fn;
        handler.proxy = function (e) {
          e = compatible(e);
          if (e.isImmediatePropagationStopped()) return
          e.data = data;
          var result = callback.apply(element, e._args == undefined ? [e] : [e].concat(e._args));
          if (result === false) e.preventDefault(), e.stopPropagation();
          return result
        };
        handler.i = set.length;
        set.push(handler);
        if ('addEventListener' in element)
          element.addEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture));
      });
    }

    function remove$1(element, events, fn, selector, capture) {
      var id = zid(element)
        ; (events || '').split(/\s/).forEach(function (event) {
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

      return compatible(proxy, event)
    }

    var on = function (event, selector, data, callback, one) {
      var autoRemove, delegator, $this = this;
      if (event && !isString(event)) {
        D.each(event, function (type$$1, fn) {
          $this.on(type$$1, selector, data, fn, one);
        });
        return $this
      }

      if (!isString(selector) && !isFunction(callback) && callback !== false)
        callback = data, data = selector, selector = undefined;
      if (callback === undefined || data === false)
        callback = data, data = undefined;

      if (callback === false) callback = returnFalse;

      return $this.each(function (_, element) {
        if (one) autoRemove = function (e) {
          remove$1(element, e.type, callback);
          return callback.apply(this, arguments)
        };

        if (selector) delegator = function (e) {
          var evt, match = D(e.target).closest(selector, element).get(0);
          if (match && match !== element) {
            evt = D.extend(createProxy(e), { currentTarget: match, liveFired: element });
            return (autoRemove || callback).apply(match, [evt].concat(slice.call(arguments, 1)))
          }
        };

        add$1(element, event, callback, data, selector, delegator || autoRemove);
      })
    };

    var off = function (event, selector, callback) {
      var $this = this;
      if (event && !isString(event)) {
        D.each(event, function (type$$1, fn) {
          $this.off(type$$1, selector, fn);
        });
        return $this
      }

      if (!isString(selector) && !isFunction(callback) && callback !== false)
        callback = selector, selector = undefined;

      if (callback === false) callback = returnFalse;

      return $this.each(function () {
        remove$1(this, event, callback, selector);
      })
    };

    var prefix = '',
      eventPrefix,
      vendors = { Webkit: 'webkit', Moz: '', O: 'o' },
      testEl = document.createElement('div'),
      testTransitionProperty = testEl.style.transitionProperty;
    if (testEl.style.transform === undefined) D.each(vendors, function (vendor, event) {
      if (testEl.style[vendor + 'TransitionProperty'] !== undefined) {
        prefix = '-' + vendor.toLowerCase() + '-';
        eventPrefix = event;
        return false
      }
    });

    testEl = null;

    // fx cannot seperate
    function normalizeEvent(name) {
      return eventPrefix ? eventPrefix + name : name.toLowerCase()
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

    function dasherize$1(str) { return str.replace(/([A-Z])/g, '-$1').toLowerCase() }

    transform = prefix + 'transform';
    cssReset[transitionProperty = prefix + 'transition-property'] =
      cssReset[transitionDuration = prefix + 'transition-duration'] =
      cssReset[transitionDelay = prefix + 'transition-delay'] =
      cssReset[transitionTiming = prefix + 'transition-timing-function'] =
      cssReset[animationName = prefix + 'animation-name'] =
      cssReset[animationDuration = prefix + 'animation-duration'] =
      cssReset[animationDelay = prefix + 'animation-delay'] =
      cssReset[animationTiming = prefix + 'animation-timing-function'] = '';

    var anim = function (properties, duration, ease, callback, delay) {
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
          else cssValues[key] = properties[key], cssProperties.push(dasherize$1(key));

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
          if (event.target !== event.currentTarget) return // makes sure the event didn't bubble from "below"
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
          if (fired) return
          wrappedCallback.call(that);
        }, ((duration + delay) * 1000) + 25);
      }

      // trigger page reflow so new elements can animate
      this.size() && this.get(0).clientLeft;

      this.css(cssValues);

      if (duration <= 0) setTimeout(function () {
        that.each(function () { wrappedCallback.call(this); });
      }, 0);

      return this
    };

    var animate = function (properties, duration, ease, callback, delay) {
      if (isFunction(duration))
        callback = duration, ease = undefined, duration = undefined;
      if (isFunction(ease))
        callback = ease, ease = undefined;
      if (isPlainObject(duration))
        ease = duration.easing, callback = duration.complete, delay = duration.delay, duration = duration.duration;
      if (duration) duration = (typeof duration == 'number' ? duration :
        (D.fx.speeds[duration] || D.fx.speeds._default)) / 1000;
      if (delay) delay = parseFloat(delay) / 1000;
      return this.anim(properties, duration, ease, callback, delay)
    };

    var origShow = function () {
      return this.each(function () {
        this.style.display == "none" && (this.style.display = '');
        if (getComputedStyle(this, '').getPropertyValue("display") == "none")
          this.style.display = defaultDisplay(this.nodeName);
      })
    };

    var origHide = function () {
      return this.css("display", "none")
    };

    function anim$1(el, speed, opacity, scale, callback) {
      if (typeof speed == 'function' && !callback) callback = speed, speed = undefined;
      var props = { opacity: opacity };
      if (scale) {
        props.scale = scale;
        el.css(D.fx.cssPrefix + 'transform-origin', '0 0');
      }
      return el.animate(props, speed, null, callback)
    }

    function hideHelper(el, speed, scale, callback) {
      return anim$1(el, speed, 0, scale, function () {
        origHide.call(D(this));
        callback && callback.call(this);
      })
    }

    // Export
    var show = function (speed, callback) {
      origShow.call(this);
      if (speed === undefined) speed = 0;
      else this.css('opacity', 0);
      return anim$1(this, speed, 1, '1,1', callback)
    };

    var hide = function (speed, callback) {
      if (speed === undefined) return origHide.call(this)
      else return hideHelper(this, speed, '0,0', callback)
    };

    var fadeTo = function (speed, opacity, callback) {
      return anim$1(this, speed, opacity, null, callback)
    };

    var fadeIn = function (speed, callback) {
      var target = this.css('opacity');
      if (target > 0) this.css('opacity', 0);
      else target = 1;
      return origShow.call(this).fadeTo(speed, target, callback)
    };

    var $$1 = D;
    var methods = {
      isArray: isArray,
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
      anim: anim,
      animate: animate,
      fadeTo: fadeTo,
      fadeIn: fadeIn
    };
    $$1.extend(methods);
    $$1.fn.extend(fnMethods);

    var defaults = {
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
      minRatio: 0.05,
      // Max ratio of image when zoom in
      maxRatio: 16,
      // Toolbar options in header
      headToolbar: ['maximize', 'close'],
      // Toolbar options in footer
      footToolbar: ['zoomIn', 'zoomOut', 'prev', 'fullscreen', 'next', 'actualSize', 'rotateRight'],
      // Customize button icon
      icons: {
        minimize: "<svg viewBox=\"0 0 24 24\" class=\"svg-inline-icon\">\n               <path fill=\"currentColor\" d=\"M20,14H4V10H20\"></path>\n               </svg>",
        maximize: "<svg viewBox=\"0 0 24 24\" class=\"svg-inline-icon\">\n               <path fill=\"currentColor\" d=\"M4,4H20V20H4V4M6,8V18H18V8H6Z\"></path>\n               </svg>",
        close: "<svg viewBox=\"0 0 24 24\" class=\"svg-inline-icon\">\n            <path fill=\"currentColor\" d=\"M13.46,12L19,17.54V19H17.54L12,13.46\n            L6.46,19H5V17.54L10.54,12L5,6.46V5H6.46L12,10.54L17.54,5H19V6.46\n            L13.46,12Z\"></path>\n            </svg>",
        zoomIn: "<svg viewBox=\"0 0 24 24\" class=\"svg-inline-icon\">\n             <path fill=\"currentColor\" d=\"M15.5,14L20.5,19L19,20.5L14,15.5V14.71\n             L13.73,14.43C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,\n             6.5 0 0,1 9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.43,\n             13.73L14.71,14H15.5M9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5C7,5 5,\n             7 5,9.5C5,12 7,14 9.5,14M12,10H10V12H9V10H7V9H9V7H10V9H12V10Z\"></path>\n            </svg>",
        zoomOut: "<svg viewBox=\"0 0 24 24\" class=\"svg-inline-icon\">\n              <path fill=\"currentColor\" d=\"M15.5,14H14.71L14.43,13.73C15.41,\n              12.59 16,11.11 16,9.5A6.5,6.5 0 0,0 9.5,3A6.5,6.5 0 0,0 3,9.5A6.5,\n              6.5 0 0,0 9.5,16C11.11,16 12.59,15.41 13.73,14.43L14,14.71V15.5\n              L19,20.5L20.5,19L15.5,14M9.5,14C7,14 5,12 5,9.5C5,7 7,5 9.5,5C12,\n              5 14,7 14,9.5C14,12 12,14 9.5,14M7,9H12V10H7V9Z\"></path>\n              </svg>",
        prev: "<svg viewBox=\"0 0 24 24\" class=\"svg-inline-icon\">\n           <path fill=\"currentColor\" d=\"M6,18V6H8V18H6M9.5,12L18,6V18L9.5,12Z\"></path>\n           </svg>",
        next: "<svg viewBox=\"0 0 24 24\" class=\"svg-inline-icon\">\n           <path fill=\"currentColor\" d=\"M16,18H18V6H16M6,18L14.5,12L6,6V18Z\"></path>\n           </svg>",
        fullscreen: "<svg viewBox=\"0 0 24 24\" class=\"svg-inline-icon\">\n                 <path fill=\"currentColor\" d=\"M8.5,12.5L11,15.5L14.5,11L19,17H5\n                 M23,18V6A2,2 0 0,0 21,4H3A2,2 0 0,0 1,6V18A2,2 0 0,0 3,20H21A2,\n                 2 0 0,0 23,18Z\"></path>\n                 </svg>",
        actualSize: "<svg viewBox=\"0 0 24 24\" class=\"svg-inline-icon\">\n                 <path fill=\"currentColor\" d=\"M9.5,13.09L10.91,14.5L6.41,19H10V21\n                 H3V14H5V17.59L9.5,13.09M10.91,9.5L9.5,10.91L5,6.41V10H3V3H10V5\n                 H6.41L10.91,9.5M14.5,13.09L19,17.59V14H21V21H14V19H17.59L13.09,\n                 14.5L14.5,13.09M13.09,9.5L17.59,5H14V3H21V10H19V6.41L14.5,10.91\n                 L13.09,9.5Z\"></path>\n                </svg>",
        rotateLeft: "<svg viewBox=\"0 0 24 24\" class=\"svg-inline-icon\">\n                 <path fill=\"currentColor\" d=\"M13,4.07V1L8.45,5.55L13,10V6.09\n                 C15.84,6.57 18,9.03 18,12C18,14.97 15.84,17.43 13,17.91V19.93\n                 C16.95,19.44 20,16.08 20,12C20,7.92 16.95,4.56 13,4.07M7.1,18.32\n                 C8.26,19.22 9.61,19.76 11,19.93V17.9C10.13,17.75 9.29,17.41 8.54,\n                 16.87L7.1,18.32M6.09,13H4.07C4.24,14.39 4.79,15.73 5.69,16.89\n                 L7.1,15.47C6.58,14.72 6.23,13.88 6.09,13M7.11,8.53L5.7,7.11C4.8,\n                 8.27 4.24,9.61 4.07,11H6.09C6.23,10.13 6.58,9.28 7.11,8.53Z\"></path>\n                 </svg>",
        rotateRight: "<svg viewBox=\"0 0 24 24\" class=\"svg-inline-icon\">\n                  <path fill=\"currentColor\" d=\"M16.89,15.5L18.31,16.89C19.21,\n                  15.73 19.76,14.39 19.93,13H17.91C17.77,13.87 17.43,14.72 16.89,\n                  15.5M13,17.9V19.92C14.39,19.75 15.74,19.21 16.9,18.31L15.46,\n                  16.87C14.71,17.41 13.87,17.76 13,17.9M19.93,11C19.76,9.61 19.21,\n                  8.27 18.31,7.11L16.89,8.53C17.43,9.28 17.77,10.13 17.91,11M15.55,\n                  5.55L11,1V4.07C7.06,4.56 4,7.92 4,12C4,16.08 7.05,19.44 11,19.93\n                  V17.91C8.16,17.43 6,14.97 6,12C6,9.03 8.16,6.57 11,6.09V10L15.55,\n                  5.55Z\"></path>\n                  </svg>"
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
        beforeOpen: $$1.noop,
        opened: $$1.noop,
        beforeClose: $$1.noop,
        closed: $$1.noop,
        beforeChange: $$1.noop,
        changed: $$1.noop
      },
      // Start images index
      index: 0,
      // Load the image progressively
      progressiveLoading: true
    };

    var document$1 = window.document;
    /**
     * [throttle]
     * @param  {Function} fn    [description]
     * @param  {[Number]} delay [description]
     * @return {Function}       [description]
     */

    function throttle(fn, delay) {
      var timer = null;
      return function () {
        var context = this,
            args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function () {
          fn.apply(context, args);
        }, delay);
      };
    }
    /**
     * [preloadImg]
     * @param  {[String]}  src      [image src]
     * @param  {Function}  success  [callbacks]
     * @param  {Function}  error    [callbacks]
     */

    function preloadImg(src, success, error) {
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
     * [requestFullscreen]
     * @param  {[type]} element [description]
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
     * [getImageNameFromUrl]
     * @param  {[String]} url [description]
     * @return {[String]}     [description]
     */

    function getImageNameFromUrl(url) {
      var reg = /^.*?\/*([^/?]*)\.[a-z]+(\?.+|$)/ig,
          txt = url.replace(reg, '$1');
      return txt;
    }
    /**
     * [hasScrollbar]
     * @return {[Boolean]}       [description]
     */

    function hasScrollbar() {
      return document$1.body.scrollHeight > (window.innerHeight || document$1.documentElement.clientHeight);
    }
    /**
     * [getScrollbarWidth]
     * @return {[Number]}       [description]
     */

    function getScrollbarWidth() {
      var scrollDiv = document$1.createElement('div');
      scrollDiv.style.cssText = 'width: 99px; height: 99px; overflow: scroll; position: absolute; top: -9999px;';
      document$1.body.appendChild(scrollDiv);
      var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
      document$1.body.removeChild(scrollDiv);
      return scrollbarWidth;
    }
    /**
     * [setGrabCursor]
     * @param {[Object]}  imageData    [description]
     * @param {[Object]}  stageData    [description]
     * @param {[Object]}  stage        [description]
     * @param {[Boolean]} isRotate     [description]
     */

    function setGrabCursor(imageData, stageData, stage, isRotated) {
      var imageWidth = !isRotated ? imageData.w : imageData.h,
          imageHeight = !isRotated ? imageData.h : imageData.w;

      if (imageHeight > stageData.h || imageWidth > stageData.w) {
        stage.addClass('is-grab');
      }

      if (imageHeight <= stageData.h && imageWidth <= stageData.w) {
        stage.removeClass('is-grab');
      }
    }
    /**
     * [supportTouch]
     * @return {[Boolean]}     [description]
     */

    function supportTouch() {
      return !!('ontouchstart' in window || window.DocumentTouch && document$1 instanceof DocumentTouch);
    }

    var $W = $$1(window);
    var $D = $$1(document$1);
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
      // image moving flag
      isMoving: false,
      // modal resizing flag
      isResizing: false,
      // modal z-index setting
      zIndex: defaults.zIndex
    };

    var draggable = {
      /**
       * [draggable]
       * @param  {[Object]} modal       [the modal element]
       * @param  {[Object]} dragHandle  [the handle element when dragging]
       * @param  {[Object]} dragCancel  [the cancel element when dragging]
       */
      draggable: function draggable(modal, dragHandle, dragCancel) {
        var _this = this;

        var isDragging = false;
        var startX = 0,
            startY = 0,
            left = 0,
            top = 0;

        var dragStart = function dragStart(e) {
          e = e || window.event; // Must be removed
          // e.preventDefault();

          if (_this.options.multiInstances) {
            modal.css('z-index', ++PUBLIC_VARS['zIndex']);
          } // Get clicked button


          var elemCancel = $$1(e.target).closest(dragCancel); // Stop modal moving when click buttons

          if (elemCancel.length) {
            return true;
          }

          isDragging = true;
          startX = e.type === 'touchstart' ? e.targetTouches[0].pageX : e.clientX;
          startY = e.type === 'touchstart' ? e.targetTouches[0].pageY : e.clientY;
          left = $$1(modal).offset().left;
          top = $$1(modal).offset().top;
          $D.on(TOUCH_MOVE_EVENT + EVENT_NS, dragMove).on(TOUCH_END_EVENT + EVENT_NS, dragEnd);
        };

        var dragMove = function dragMove(e) {
          e = e || window.event;
          e.preventDefault();

          if (isDragging && !PUBLIC_VARS['isMoving'] && !PUBLIC_VARS['isResizing'] && !_this.isMaximized) {
            var endX = e.type === 'touchmove' ? e.targetTouches[0].pageX : e.clientX,
                endY = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.clientY,
                relativeX = endX - startX,
                relativeY = endY - startY;
            $$1(modal).css({
              left: relativeX + left + 'px',
              top: relativeY + top + 'px'
            });
          }
        };

        var dragEnd = function dragEnd() {
          $D.off(TOUCH_MOVE_EVENT + EVENT_NS, dragMove).off(TOUCH_END_EVENT + EVENT_NS, dragEnd);
          isDragging = false;
        };

        $$1(dragHandle).on(TOUCH_START_EVENT + EVENT_NS, dragStart);
      }
    };

    var ELEMS_WITH_GRABBING_CURSOR = "html,body,." + NS + "-modal,." + NS + "-stage,." + NS + "-button,." + NS + "-resizable-handle";
    var movable = {
      /**
       * --------------------------------------
       * 1.no movable
       * 2.vertical movable
       * 3.horizontal movable
       * 4.vertical & horizontal movable
       * --------------------------------------
       *
       * [image movable]
       * @param  {[Object]} stage   [the stage element]
       * @param  {[Object]} image   [the image element]
       */
      movable: function movable(stage, image) {
        var _this = this;

        var isDragging = false;
        var startX = 0,
            startY = 0,
            left = 0,
            top = 0,
            widthDiff = 0,
            heightDiff = 0,
            δ = 0;

        var dragStart = function dragStart(e) {
          e = e || window.event;
          e.preventDefault();
          var imageWidth = $$1(image).width(),
              imageHeight = $$1(image).height(),
              stageWidth = $$1(stage).width(),
              stageHeight = $$1(stage).height();
          startX = e.type === 'touchstart' ? e.targetTouches[0].pageX : e.clientX;
          startY = e.type === 'touchstart' ? e.targetTouches[0].pageY : e.clientY; // δ is the difference between image width and height

          δ = !_this.isRotated ? 0 : (imageWidth - imageHeight) / 2; // Width or height difference can be use to limit image right or top position

          widthDiff = !_this.isRotated ? imageWidth - stageWidth : imageHeight - stageWidth;
          heightDiff = !_this.isRotated ? imageHeight - stageHeight : imageWidth - stageHeight; // Modal can be dragging if image is smaller to stage

          isDragging = widthDiff > 0 || heightDiff > 0 ? true : false;
          PUBLIC_VARS['isMoving'] = widthDiff > 0 || heightDiff > 0 ? true : false; // Reclac the element position when mousedown
          // Fixed the issue of stage with a border

          left = $$1(image).position().left - δ;
          top = $$1(image).position().top + δ; // Add grabbing cursor

          if (stage.hasClass('is-grab')) {
            $$1(ELEMS_WITH_GRABBING_CURSOR).addClass('is-grabbing');
          }

          $D.on(TOUCH_MOVE_EVENT + EVENT_NS, dragMove).on(TOUCH_END_EVENT + EVENT_NS, dragEnd);
        };

        var dragMove = function dragMove(e) {
          e = e || window.event;
          e.preventDefault();

          if (isDragging) {
            var endX = e.type === 'touchmove' ? e.targetTouches[0].pageX : e.clientX,
                endY = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.clientY,
                relativeX = endX - startX,
                relativeY = endY - startY,
                newLeft = relativeX + left,
                newTop = relativeY + top; // vertical limit

            if (heightDiff > 0) {
              if (relativeY + top > δ) {
                newTop = δ;
              } else if (relativeY + top < -heightDiff + δ) {
                newTop = -heightDiff + δ;
              }
            } else {
              newTop = top;
            } // horizontal limit


            if (widthDiff > 0) {
              if (relativeX + left > -δ) {
                newLeft = -δ;
              } else if (relativeX + left < -widthDiff - δ) {
                newLeft = -widthDiff - δ;
              }
            } else {
              newLeft = left;
            }

            $$1(image).css({
              left: newLeft + 'px',
              top: newTop + 'px'
            }); // Update image initial data

            $$1.extend(_this.imageData, {
              left: newLeft,
              top: newTop
            });
          }
        };

        var dragEnd = function dragEnd() {
          $D.off(TOUCH_MOVE_EVENT + EVENT_NS, dragMove).off(TOUCH_END_EVENT + EVENT_NS, dragEnd);
          isDragging = false;
          PUBLIC_VARS['isMoving'] = false; // Remove grabbing cursor

          $$1(ELEMS_WITH_GRABBING_CURSOR).removeClass('is-grabbing');
        };

        $$1(stage).on(TOUCH_START_EVENT + EVENT_NS, dragStart);
      }
    };

    var ELEMS_WITH_RESIZE_CURSOR = "html,body,." + NS + "-modal,." + NS + "-stage,." + NS + "-button";
    var resizable = {
      /**
       * ------------------------------
       * 1.modal resizable
       * 2.keep image in stage center
       * 3.other image limitations
       * ------------------------------
       *
       * [resizable]
       * @param  {[Object]} modal       [the modal element]
       * @param  {[Object]} stage       [the stage element]
       * @param  {[Object]} image       [the image element]
       * @param  {[Number]} minWidth    [the option of modalWidth]
       * @param  {[Number]} minHeight   [the option of modalHeight]
       */
      resizable: function resizable(modal, stage, image, minWidth, minHeight) {
        var _this = this;

        var resizableHandleE = $$1("<div class=\"" + NS + "-resizable-handle " + NS + "-resizable-handle-e\"></div>"),
            resizableHandleW = $$1("<div class=\"" + NS + "-resizable-handle " + NS + "-resizable-handle-w\"></div>"),
            resizableHandleS = $$1("<div class=\"" + NS + "-resizable-handle " + NS + "-resizable-handle-s\"></div>"),
            resizableHandleN = $$1("<div class=\"" + NS + "-resizable-handle " + NS + "-resizable-handle-n\"></div>"),
            resizableHandleSE = $$1("<div class=\"" + NS + "-resizable-handle " + NS + "-resizable-handle-se\"></div>"),
            resizableHandleSW = $$1("<div class=\"" + NS + "-resizable-handle " + NS + "-resizable-handle-sw\"></div>"),
            resizableHandleNE = $$1("<div class=\"" + NS + "-resizable-handle " + NS + "-resizable-handle-ne\"></div>"),
            resizableHandleNW = $$1("<div class=\"" + NS + "-resizable-handle " + NS + "-resizable-handle-nw\"></div>");
        var resizableHandles = {
          'e': resizableHandleE,
          's': resizableHandleS,
          'se': resizableHandleSE,
          'n': resizableHandleN,
          'w': resizableHandleW,
          'nw': resizableHandleNW,
          'ne': resizableHandleNE,
          'sw': resizableHandleSW
        };
        $$1(modal).append(resizableHandleE, resizableHandleW, resizableHandleS, resizableHandleN, resizableHandleSE, resizableHandleSW, resizableHandleNE, resizableHandleNW);
        var isDragging = false;
        var startX = 0,
            startY = 0,
            modalData = {
          w: 0,
          h: 0,
          l: 0,
          t: 0
        },
            stageData = {
          w: 0,
          h: 0,
          l: 0,
          t: 0
        },
            imageData = {
          w: 0,
          h: 0,
          l: 0,
          t: 0
        },
            // δ is the difference between image width and height
        δ = 0,
            imgWidth = 0,
            imgHeight = 0,
            direction = ''; // modal CSS options

        var getModalOpts = function getModalOpts(dir, offsetX, offsetY) {
          // Modal should not move when its width to the minwidth
          var modalLeft = -offsetX + modalData.w > minWidth ? offsetX + modalData.l : modalData.l + modalData.w - minWidth,
              modalTop = -offsetY + modalData.h > minHeight ? offsetY + modalData.t : modalData.t + modalData.h - minHeight;
          var opts = {
            'e': {
              width: Math.max(offsetX + modalData.w, minWidth) + 'px'
            },
            's': {
              height: Math.max(offsetY + modalData.h, minHeight) + 'px'
            },
            'se': {
              width: Math.max(offsetX + modalData.w, minWidth) + 'px',
              height: Math.max(offsetY + modalData.h, minHeight) + 'px'
            },
            'w': {
              width: Math.max(-offsetX + modalData.w, minWidth) + 'px',
              left: modalLeft + 'px'
            },
            'n': {
              height: Math.max(-offsetY + modalData.h, minHeight) + 'px',
              top: modalTop + 'px'
            },
            'nw': {
              width: Math.max(-offsetX + modalData.w, minWidth) + 'px',
              height: Math.max(-offsetY + modalData.h, minHeight) + 'px',
              top: modalTop + 'px',
              left: modalLeft + 'px'
            },
            'ne': {
              width: Math.max(offsetX + modalData.w, minWidth) + 'px',
              height: Math.max(-offsetY + modalData.h, minHeight) + 'px',
              top: modalTop + 'px'
            },
            'sw': {
              width: Math.max(-offsetX + modalData.w, minWidth) + 'px',
              height: Math.max(offsetY + modalData.h, minHeight) + 'px',
              left: modalLeft + 'px'
            }
          };
          return opts[dir];
        }; // image CSS options


        var getImageOpts = function getImageOpts(dir, offsetX, offsetY) {
          // Image should not move when modal width to the min width
          // The minwidth is modal width, so we should clac the stage minwidth
          var widthDiff = offsetX + modalData.w > minWidth ? stageData.w - imgWidth + offsetX - δ : minWidth - (modalData.w - stageData.w) - imgWidth - δ,
              heightDiff = offsetY + modalData.h > minHeight ? stageData.h - imgHeight + offsetY + δ : minHeight - (modalData.h - stageData.h) - imgHeight + δ,
              widthDiff2 = -offsetX + modalData.w > minWidth ? stageData.w - imgWidth - offsetX - δ : minWidth - (modalData.w - stageData.w) - imgWidth - δ,
              heightDiff2 = -offsetY + modalData.h > minHeight ? stageData.h - imgHeight - offsetY + δ : minHeight - (modalData.h - stageData.h) - imgHeight + δ; // Get image position in dragging

          var imgLeft = (widthDiff > 0 ? $$1(image).position().left : $$1(image).position().left < 0 ? $$1(image).position().left : 0) - δ,
              imgTop = (heightDiff > 0 ? $$1(image).position().top : $$1(image).position().top < 0 ? $$1(image).position().top : 0) + δ,
              imgLeft2 = (widthDiff2 > 0 ? $$1(image).position().left : $$1(image).position().left < 0 ? $$1(image).position().left : 0) - δ,
              imgTop2 = (heightDiff2 > 0 ? $$1(image).position().top : $$1(image).position().top < 0 ? $$1(image).position().top : 0) + δ;
          var opts = {
            'e': {
              left: widthDiff >= -δ ? (widthDiff - δ) / 2 + 'px' : imgLeft > widthDiff ? imgLeft + 'px' : widthDiff + 'px'
            },
            's': {
              top: heightDiff >= δ ? (heightDiff + δ) / 2 + 'px' : imgTop > heightDiff ? imgTop + 'px' : heightDiff + 'px'
            },
            'se': {
              top: heightDiff >= δ ? (heightDiff + δ) / 2 + 'px' : imgTop > heightDiff ? imgTop + 'px' : heightDiff + 'px',
              left: widthDiff >= -δ ? (widthDiff - δ) / 2 + 'px' : imgLeft > widthDiff ? imgLeft + 'px' : widthDiff + 'px'
            },
            'w': {
              left: widthDiff2 >= -δ ? (widthDiff2 - δ) / 2 + 'px' : imgLeft2 > widthDiff2 ? imgLeft2 + 'px' : widthDiff2 + 'px'
            },
            'n': {
              top: heightDiff2 >= δ ? (heightDiff2 + δ) / 2 + 'px' : imgTop2 > heightDiff2 ? imgTop2 + 'px' : heightDiff2 + 'px'
            },
            'nw': {
              top: heightDiff2 >= δ ? (heightDiff2 + δ) / 2 + 'px' : imgTop2 > heightDiff2 ? imgTop2 + 'px' : heightDiff2 + 'px',
              left: widthDiff2 >= -δ ? (widthDiff2 - δ) / 2 + 'px' : imgLeft2 > widthDiff2 ? imgLeft2 + 'px' : widthDiff2 + 'px'
            },
            'ne': {
              top: heightDiff2 >= δ ? (heightDiff2 + δ) / 2 + 'px' : imgTop2 > heightDiff2 ? imgTop2 + 'px' : heightDiff2 + 'px',
              left: widthDiff >= -δ ? (widthDiff - δ) / 2 + 'px' : imgLeft > widthDiff ? imgLeft + 'px' : widthDiff + 'px'
            },
            'sw': {
              top: heightDiff >= δ ? (heightDiff + δ) / 2 + 'px' : imgTop > heightDiff ? imgTop + 'px' : heightDiff + 'px',
              left: widthDiff2 >= -δ ? (widthDiff2 - δ) / 2 + 'px' : imgLeft2 > widthDiff2 ? imgLeft2 + 'px' : widthDiff2 + 'px'
            }
          };
          return opts[dir];
        };

        var dragStart = function dragStart(dir, e) {
          e = e || window.event;
          e.preventDefault();
          isDragging = true;
          PUBLIC_VARS['isResizing'] = true;
          startX = e.type === 'touchstart' ? e.targetTouches[0].pageX : e.clientX;
          startY = e.type === 'touchstart' ? e.targetTouches[0].pageY : e.clientY; // Reclac the modal data when mousedown

          modalData = {
            w: $$1(modal).width(),
            h: $$1(modal).height(),
            l: $$1(modal).offset().left,
            t: $$1(modal).offset().top
          };
          stageData = {
            w: $$1(stage).width(),
            h: $$1(stage).height(),
            l: $$1(stage).offset().left,
            t: $$1(stage).offset().top
          };
          imageData = {
            w: $$1(image).width(),
            h: $$1(image).height(),
            l: $$1(image).position().left,
            t: $$1(image).position().top
          }; // δ is the difference between image width and height

          δ = !_this.isRotated ? 0 : (imageData.w - imageData.h) / 2;
          imgWidth = !_this.isRotated ? imageData.w : imageData.h;
          imgHeight = !_this.isRotated ? imageData.h : imageData.w;
          direction = dir; // Add resizable cursor

          $$1(ELEMS_WITH_RESIZE_CURSOR).css('cursor', dir + '-resize');
          $D.on(TOUCH_MOVE_EVENT + EVENT_NS, dragMove).on(TOUCH_END_EVENT + EVENT_NS, dragEnd);
        };

        var dragMove = function dragMove(e) {
          e = e || window.event;
          e.preventDefault();

          if (isDragging && !_this.isMaximized) {
            var endX = e.type === 'touchmove' ? e.targetTouches[0].pageX : e.clientX,
                endY = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.clientY,
                relativeX = endX - startX,
                relativeY = endY - startY;
            var modalOpts = getModalOpts(direction, relativeX, relativeY);
            $$1(modal).css(modalOpts);
            var imageOpts = getImageOpts(direction, relativeX, relativeY);
            $$1(image).css(imageOpts);
            _this.isDoResize = true;
          }
        };

        var dragEnd = function dragEnd() {
          $D.off(TOUCH_MOVE_EVENT + EVENT_NS, dragMove).off(TOUCH_END_EVENT + EVENT_NS, dragEnd); // Set grab cursor

          if (PUBLIC_VARS['isResizing']) {
            setGrabCursor({
              w: imgWidth,
              h: imgHeight
            }, {
              w: $$1(stage).width(),
              h: $$1(stage).height()
            }, stage);
          }

          isDragging = false;
          PUBLIC_VARS['isResizing'] = false; // Remove resizable cursor

          $$1(ELEMS_WITH_RESIZE_CURSOR).css('cursor', ''); // Update image initial data

          var scale = _this.getImageScaleToStage($$1(stage).width(), $$1(stage).height());

          $$1.extend(_this.imageData, {
            initWidth: _this.img.width * scale,
            initHeight: _this.img.height * scale,
            initLeft: ($$1(stage).width() - _this.img.width * scale) / 2,
            initTop: ($$1(stage).height() - _this.img.height * scale) / 2
          });
        };

        $$1.each(resizableHandles, function (dir, handle) {
          handle.on(TOUCH_START_EVENT + EVENT_NS, function (e) {
            dragStart(dir, e);
          });
        });
      }
    };

    /**
     * PhotoViewer Class
     */

    var PhotoViewer =
    /*#__PURE__*/
    function () {
      function PhotoViewer(items, options, el) {
        this.options = $$1.extend(true, {}, defaults, options);

        if (options && $$1.isArray(options.footToolbar)) {
          this.options.footToolbar = options.footToolbar;
        }

        if (options && $$1.isArray(options.headToolbar)) {
          this.options.headToolbar = options.headToolbar;
        } // Store element of clicked


        this.$el = $$1(el); // As we have multiple instances,
        // so every instance has following variables.
        // modal open flag

        this.isOpened = false; // modal maximize flag

        this.isMaximized = false; // image rotate 90*(2n+1) flag

        this.isRotated = false; // image rotate angle

        this.rotateAngle = 0; // if modal do resize

        this.isDoResize = false; // Store image data in every instance

        this.imageData = {}; // Store modal data in every instance

        this.modalData = {
          width: null,
          height: null,
          left: null,
          top: null
        };
        this.init(items, this.options, el);
      }

      var _proto = PhotoViewer.prototype;

      _proto.init = function init(items, opts, el) {
        this.groupData = items;
        this.groupIndex = opts['index']; // Get image src

        var imgSrc = items[this.groupIndex]['src'];
        this.open();
        this.loadImg(imgSrc); // draggable & movable & resizable

        if (opts.draggable) {
          this.draggable(this.$photoviewer, this.dragHandle, CLASS_NS + '-button');
        }

        if (opts.movable) {
          this.movable(this.$stage, this.$image);
        }

        if (opts.resizable) {
          this.resizable(this.$photoviewer, this.$stage, this.$image, opts.modalWidth, opts.modalHeight);
        }
      };

      _proto._creatBtns = function _creatBtns(toolbar, btns) {
        var btnsStr = '';
        $$1.each(toolbar, function (index, item) {
          btnsStr += btns[item];
        });
        return btnsStr;
      };

      _proto._creatTitle = function _creatTitle() {
        return this.options.title ? "<div class=\"" + NS + "-title\"></div>" : '';
      };

      _proto._creatDOM = function _creatDOM() {
        var btnsTpl = {
          minimize: "<button class=\"" + NS + "-button " + NS + "-button-minimize\"\n                  title=\"" + this.options.i18n.minimize + "\">\n                    " + this.options.icons.minimize + "\n                  </button>",
          maximize: "<button class=\"" + NS + "-button " + NS + "-button-maximize\"\n                  title=\"" + this.options.i18n.maximize + "\">\n                    " + this.options.icons.maximize + "\n                  </button>",
          close: "<button class=\"" + NS + "-button " + NS + "-button-close\"\n              title=\"" + this.options.i18n.close + "\">\n                " + this.options.icons.close + "\n              </button>",
          zoomIn: "<button class=\"" + NS + "-button " + NS + "-button-zoom-in\"\n                title=\"" + this.options.i18n.zoomIn + "\">\n                  " + this.options.icons.zoomIn + "\n                </button>",
          zoomOut: "<button class=\"" + NS + "-button " + NS + "-button-zoom-out\"\n                title=\"" + this.options.i18n.zoomOut + "\">\n                  " + this.options.icons.zoomOut + "\n                </button>",
          prev: "<button class=\"" + NS + "-button " + NS + "-button-prev\"\n              title=\"" + this.options.i18n.prev + "\">\n                " + this.options.icons.prev + "\n              </button>",
          next: "<button class=\"" + NS + "-button " + NS + "-button-next\"\n              title=\"" + this.options.i18n.next + "\">\n                " + this.options.icons.next + "\n              </button>",
          fullscreen: "<button class=\"" + NS + "-button " + NS + "-button-fullscreen\"\n                    title=\"" + this.options.i18n.fullscreen + "\">\n                    " + this.options.icons.fullscreen + "\n                  </button>",
          actualSize: "<button class=\"" + NS + "-button " + NS + "-button-actual-size\"\n                    title=\"" + this.options.i18n.actualSize + "\">\n                      " + this.options.icons.actualSize + "\n                    </button>",
          rotateLeft: "<button class=\"" + NS + "-button " + NS + "-button-rotate-left\"\n                    title=\"" + this.options.i18n.rotateLeft + "\">\n                      " + this.options.icons.rotateLeft + "\n                    </button>",
          rotateRight: "<button class=\"" + NS + "-button " + NS + "-button-rotate-right\"\n                      title=\"" + this.options.i18n.rotateRight + "\">\n                      " + this.options.icons.rotateRight + "\n                    </button>"
        }; // photoviewer base HTML

        var photoviewerHTML = "<div class=\"" + NS + "-modal\">\n        <div class=\"" + NS + "-inner\">\n          <div class=\"" + NS + "-header\">\n            <div class=\"" + NS + "-toolbar " + NS + "-toolbar-head\">\n              " + this._creatBtns(this.options.headToolbar, btnsTpl) + "\n            </div>\n            " + this._creatTitle() + "\n          </div>\n          <div class=\"" + NS + "-stage\">\n            <img class=\"" + NS + "-image\" src=\"\" alt=\"\" />\n          </div>\n          <div class=\"" + NS + "-footer\">\n            <div class=\"" + NS + "-toolbar " + NS + "-toolbar-foot\">\n              " + this._creatBtns(this.options.footToolbar, btnsTpl) + "\n            </div>\n          </div>\n        </div>\n      </div>";
        return photoviewerHTML;
      };

      _proto.build = function build() {
        // Create photoviewer HTML string
        var photoviewerHTML = this._creatDOM(); // Make photoviewer HTML string to jQuery element


        var $photoviewer = $$1(photoviewerHTML); // Get all photoviewer element

        this.$photoviewer = $photoviewer;
        this.$header = $photoviewer.find(CLASS_NS + '-header');
        this.$headToolbar = $photoviewer.find(CLASS_NS + '-toolbar-head');
        this.$footer = $photoviewer.find(CLASS_NS + '-footer');
        this.$footToolbar = $photoviewer.find(CLASS_NS + '-toolbar-foot');
        this.$stage = $photoviewer.find(CLASS_NS + '-stage');
        this.$title = $photoviewer.find(CLASS_NS + '-title');
        this.$image = $photoviewer.find(CLASS_NS + '-image');
        this.$close = $photoviewer.find(CLASS_NS + '-button-close');
        this.$maximize = $photoviewer.find(CLASS_NS + '-button-maximize');
        this.$minimize = $photoviewer.find(CLASS_NS + '-button-minimize');
        this.$zoomIn = $photoviewer.find(CLASS_NS + '-button-zoom-in');
        this.$zoomOut = $photoviewer.find(CLASS_NS + '-button-zoom-out');
        this.$actualSize = $photoviewer.find(CLASS_NS + '-button-actual-size');
        this.$fullscreen = $photoviewer.find(CLASS_NS + '-button-fullscreen');
        this.$rotateLeft = $photoviewer.find(CLASS_NS + '-button-rotate-left');
        this.$rotateRight = $photoviewer.find(CLASS_NS + '-button-rotate-right');
        this.$prev = $photoviewer.find(CLASS_NS + '-button-prev');
        this.$next = $photoviewer.find(CLASS_NS + '-button-next'); // Add class before image loaded

        this.$stage.addClass('stage-ready');
        this.$image.addClass('image-ready'); // Reset modal z-index with multiple instances

        this.$photoviewer.css('z-index', PUBLIC_VARS['zIndex']); // Set handle element of draggable

        if (!this.options.dragHandle || this.options.dragHandle === CLASS_NS + '-modal') {
          this.dragHandle = this.$photoviewer;
        } else {
          this.dragHandle = this.$photoviewer.find(this.options.dragHandle);
        }
      };

      _proto.open = function open() {
        if (!this.options.multiInstances) {
          $$1(CLASS_NS + '-modal').eq(0).remove();
        } // Fixed modal position bug


        if (!$$1(CLASS_NS + '-modal').length && this.options.fixedContent) {
          $$1('html').css({
            'overflow': 'hidden'
          });

          if (hasScrollbar()) {
            var scrollbarWidth = getScrollbarWidth();

            if (scrollbarWidth) {
              $$1('html').css({
                'padding-right': scrollbarWidth
              });
            }
          }
        }

        this.build();

        this._triggerHook('beforeOpen', this.$el); // Add PhotoViewer to DOM


        $$1('body').append(this.$photoviewer);
        this.addEvents();
        this.setModalPos(this.$photoviewer);

        this._triggerHook('opened', this.$el);
      };

      _proto.close = function close() {
        this._triggerHook('beforeClose', this.$el); // Remove instance


        this.$photoviewer.remove();
        this.isOpened = false;
        this.isMaximized = false;
        this.isRotated = false;
        this.rotateAngle = 0;
        var zeroModal = !$$1(CLASS_NS + '-modal').length; // Fixed modal position bug

        if (zeroModal && this.options.fixedContent) {
          $$1('html').css({
            'overflow': '',
            'padding-right': ''
          });
        } // Reset zIndex after close


        if (zeroModal && this.options.multiInstances) {
          PUBLIC_VARS['zIndex'] = this.options.zIndex;
        } // off events


        if (!$$1(CLASS_NS + '-modal').length) {
          $D.off(KEYDOWN_EVENT + EVENT_NS);
          $W.off(RESIZE_EVENT + EVENT_NS);
        }

        this._triggerHook('closed', this.$el);
      };

      _proto.setModalPos = function setModalPos(modal) {
        var winWidth = $W.width(),
            winHeight = $W.height(),
            scrollLeft = $D.scrollLeft(),
            scrollTop = $D.scrollTop();
        var modalWidth = this.options.modalWidth,
            modalHeight = this.options.modalHeight; // Set modal maximized when init

        if (this.options.initMaximized) {
          modal.addClass(NS + '-maximize');
          modal.css({
            width: '100%',
            height: '100%',
            left: 0,
            top: 0
          });
          this.isOpened = true;
          this.isMaximized = true;
        } else {
          // Make the modal in windows center
          modal.css({
            width: modalWidth,
            height: modalHeight,
            left: (winWidth - modalWidth) / 2 + scrollLeft + 'px',
            top: (winHeight - modalHeight) / 2 + scrollTop + 'px'
          });
        }
      };

      _proto.setModalSize = function setModalSize(img) {
        var _this = this;

        var winWidth = $W.width(),
            winHeight = $W.height(),
            scrollLeft = $D.scrollLeft(),
            scrollTop = $D.scrollTop(); // stage css value

        var stageCSS = {
          left: this.$stage.css('left'),
          right: this.$stage.css('right'),
          top: this.$stage.css('top'),
          bottom: this.$stage.css('bottom'),
          borderLeft: this.$stage.css('border-left-width'),
          borderRight: this.$stage.css('border-right-width'),
          borderTop: this.$stage.css('border-top-width'),
          borderBottom: this.$stage.css('border-bottom-width')
        }; // Modal size should calc with stage css value

        var modalWidth = img.width + parseFloat(stageCSS.left) + parseFloat(stageCSS.right) + parseFloat(stageCSS.borderLeft) + parseFloat(stageCSS.borderRight),
            modalHeight = img.height + parseFloat(stageCSS.top) + parseFloat(stageCSS.bottom) + parseFloat(stageCSS.borderTop) + parseFloat(stageCSS.borderBottom);
        var gapThreshold = (this.options.gapThreshold > 0 ? this.options.gapThreshold : 0) + 1,
            // modal scale to window
        scale = Math.min(winWidth / (modalWidth * gapThreshold), winHeight / (modalHeight * gapThreshold), 1);
        var minWidth = Math.max(modalWidth * scale, this.options.modalWidth),
            minHeight = Math.max(modalHeight * scale, this.options.modalHeight);
        minWidth = this.options.fixedModalSize ? this.options.modalWidth : Math.round(minWidth);
        minHeight = this.options.fixedModalSize ? this.options.modalHeight : Math.round(minHeight);
        var modalCSSObj = {
          width: minWidth + 'px',
          height: minHeight + 'px',
          left: (winWidth - minWidth) / 2 + scrollLeft + 'px',
          top: (winHeight - minHeight) / 2 + scrollTop + 'px'
        }; // Add modal init animation

        if (this.options.initAnimation) {
          this.$photoviewer.animate(modalCSSObj, 400, 'ease-in-out', function () {
            _this.setImageSize(img);
          });
        } else {
          this.$photoviewer.css(modalCSSObj);
          this.setImageSize(img);
        }

        this.isOpened = true;
      };

      _proto.getImageScaleToStage = function getImageScaleToStage(stageWidth, stageHeight) {
        var scale = 1;

        if (!this.isRotated) {
          scale = Math.min(stageWidth / this.img.width, stageHeight / this.img.height, 1);
        } else {
          scale = Math.min(stageWidth / this.img.height, stageHeight / this.img.width, 1);
        }

        return scale;
      };

      _proto.setImageSize = function setImageSize(img) {
        var stageData = {
          w: this.$stage.width(),
          h: this.$stage.height()
        };
        var scale = this.getImageScaleToStage(stageData.w, stageData.h);
        this.$image.css({
          width: Math.ceil(img.width * scale) + 'px',
          height: Math.ceil(img.height * scale) + 'px',
          left: (stageData.w - Math.ceil(img.width * scale)) / 2 + 'px',
          top: (stageData.h - Math.ceil(img.height * scale)) / 2 + 'px'
        }); // Store image initial data

        $$1.extend(this.imageData, {
          initWidth: img.width * scale,
          initHeight: img.height * scale,
          initLeft: (stageData.w - img.width * scale) / 2,
          initTop: (stageData.h - img.height * scale) / 2,
          width: img.width * scale,
          height: img.height * scale,
          left: (stageData.w - img.width * scale) / 2,
          top: (stageData.h - img.height * scale) / 2
        }); // Set grab cursor

        setGrabCursor({
          w: this.$image.width(),
          h: this.$image.height()
        }, {
          w: this.$stage.width(),
          h: this.$stage.height()
        }, this.$stage, this.isRotated);
        this.$stage.removeClass('stage-ready');
        this.$image.removeClass('image-ready'); // loader end

        this.$photoviewer.find(CLASS_NS + '-loader').remove(); // Add image init animation

        if (this.options.initAnimation && !this.options.progressiveLoading && this.$image.css('display') === 'none') {
          this.$image.fadeIn();
        }
      };

      _proto.loadImg = function loadImg(imgSrc, fn, err) {
        var _this2 = this;

        var loaderHTML = "<div class=\"" + NS + "-loader\"></div>"; // loader start

        this.$photoviewer.append(loaderHTML); // Add class before image loaded

        this.$stage.addClass('stage-ready');
        this.$image.addClass('image-ready'); // Reset image

        this.$image.removeAttr('style').attr('src', '');
        this.isRotated = false;
        this.rotateAngle = 0;

        if (this.options.initAnimation && !this.options.progressiveLoading) {
          this.$image.hide();
        }

        this.$image.attr('src', imgSrc);
        preloadImg(imgSrc, function (img) {
          // Store HTMLImageElement
          _this2.img = img; // Store original data

          _this2.imageData = {
            originalWidth: img.width,
            originalHeight: img.height
          };

          if (_this2.isMaximized || _this2.isOpened && _this2.options.fixedModalPos) {
            _this2.setImageSize(img);
          } else {
            _this2.setModalSize(img);
          } // callback of image loaded successfully


          if (fn) {
            fn.call();
          }
        }, function () {
          // loader end
          _this2.$photoviewer.find(CLASS_NS + '-loader').remove(); // callback of image loading failed


          if (err) {
            err.call();
          }
        });

        if (this.options.title) {
          this.setImgTitle(imgSrc);
        }
      };

      _proto.setImgTitle = function setImgTitle(url) {
        var title = this.groupData[this.groupIndex].title ? this.groupData[this.groupIndex].title : getImageNameFromUrl(url);
        this.$title.html(title);
      };

      _proto.jump = function jump(step) {
        this._triggerHook('beforeChange', this.groupIndex);

        this.groupIndex = this.groupIndex + step;
        this.jumpTo(this.groupIndex);
      };

      _proto.jumpTo = function jumpTo(index) {
        var _this3 = this;

        index = index % this.groupData.length;

        if (index >= 0) {
          index = index % this.groupData.length;
        } else if (index < 0) {
          index = (this.groupData.length + index) % this.groupData.length;
        }

        this.groupIndex = index;
        this.loadImg(this.groupData[index].src, function () {
          _this3._triggerHook('changed', index);
        }, function () {
          _this3._triggerHook('changed', index);
        });
      };

      _proto.wheel = function wheel(e) {
        e.preventDefault();
        var delta = 1;

        if (e.deltaY) {
          delta = e.deltaY > 0 ? 1 : -1;
        } else if (e.wheelDelta) {
          delta = -e.wheelDelta / 120;
        } else if (e.detail) {
          delta = e.detail > 0 ? 1 : -1;
        } // ratio threshold


        var ratio = -delta * this.options.ratioThreshold; // mouse point position relative to stage

        var pointer = {
          x: e.clientX - this.$stage.offset().left + $D.scrollLeft(),
          y: e.clientY - this.$stage.offset().top + $D.scrollTop()
        };
        this.zoom(ratio, pointer, e);
      };

      _proto.zoom = function zoom(ratio, origin, e) {
        // zoom out ratio & zoom in ratio
        ratio = ratio < 0 ? 1 / (1 - ratio) : 1 + ratio; // image ratio

        ratio = this.$image.width() / this.imageData.originalWidth * ratio; // Fixed digital error
        // if (ratio > 0.95 && ratio < 1.05) {
        //   ratio = 1;
        // }

        if (ratio > this.options.maxRatio || ratio < this.options.minRatio) {
          return;
        }

        this.zoomTo(ratio, origin, e);
      };

      _proto.zoomTo = function zoomTo(ratio, origin, e) {
        var $image = this.$image,
            $stage = this.$stage,
            imgData = {
          w: this.imageData.width,
          h: this.imageData.height,
          x: this.imageData.left,
          y: this.imageData.top
        }; // image stage position
        // We will use it to calc the relative position of image

        var stageData = {
          w: $stage.width(),
          h: $stage.height(),
          x: $stage.offset().left,
          y: $stage.offset().top
        };
        var newWidth = this.imageData.originalWidth * ratio,
            newHeight = this.imageData.originalHeight * ratio,
            // Think about it for a while
        newLeft = origin.x - (origin.x - imgData.x) / imgData.w * newWidth,
            newTop = origin.y - (origin.y - imgData.y) / imgData.h * newHeight; // δ is the difference between image new width and new height

        var δ = !this.isRotated ? 0 : (newWidth - newHeight) / 2,
            imgNewWidth = !this.isRotated ? newWidth : newHeight,
            imgNewHeight = !this.isRotated ? newHeight : newWidth;
        var offsetX = stageData.w - newWidth,
            offsetY = stageData.h - newHeight; // zoom out & zoom in condition
        // It's important and it takes me a lot of time to get it
        // The conditions with image rotate 90 degree drive me crazy alomst!

        if (imgNewHeight <= stageData.h) {
          newTop = (stageData.h - newHeight) / 2;
        } else {
          newTop = newTop > δ ? δ : newTop > offsetY - δ ? newTop : offsetY - δ;
        }

        if (imgNewWidth <= stageData.w) {
          newLeft = (stageData.w - newWidth) / 2;
        } else {
          newLeft = newLeft > -δ ? -δ : newLeft > offsetX + δ ? newLeft : offsetX + δ;
        } // if the image scale get to the critical point


        if (Math.abs(this.imageData.initWidth - newWidth) < this.imageData.initWidth * 0.05) {
          this.setImageSize(this.img);
        } else {
          $image.css({
            width: Math.round(newWidth) + 'px',
            height: Math.round(newHeight) + 'px',
            left: Math.round(newLeft) + 'px',
            top: Math.round(newTop) + 'px'
          }); // Set grab cursor

          setGrabCursor({
            w: Math.round(imgNewWidth),
            h: Math.round(imgNewHeight)
          }, {
            w: stageData.w,
            h: stageData.h
          }, this.$stage);
        } // Update image initial data


        $$1.extend(this.imageData, {
          width: newWidth,
          height: newHeight,
          left: newLeft,
          top: newTop
        });
      };

      _proto.rotate = function rotate(angle) {
        this.rotateAngle = this.rotateAngle + angle;

        if (this.rotateAngle / 90 % 2 === 0) {
          this.isRotated = false;
        } else {
          this.isRotated = true;
        }

        this.rotateTo(this.rotateAngle);
      };

      _proto.rotateTo = function rotateTo(angle) {
        this.$image.css({
          transform: 'rotate(' + angle + 'deg)'
        });
        this.setImageSize({
          width: this.imageData.originalWidth,
          height: this.imageData.originalHeight
        }); // Remove grab cursor when rotate

        this.$stage.removeClass('is-grab');
      };

      _proto.resize = function resize() {
        var _this4 = this;

        var resizeHandler = throttle(function () {
          if (_this4.isOpened) {
            if (_this4.isMaximized) {
              _this4.setImageSize({
                width: _this4.imageData.originalWidth,
                height: _this4.imageData.originalHeight
              });
            } else {
              _this4.setModalSize({
                width: _this4.imageData.originalWidth,
                height: _this4.imageData.originalHeight
              });
            }
          }
        }, 500);
        return resizeHandler;
      };

      _proto.maximize = function maximize() {
        if (!this.isMaximized) {
          // Store modal data before maximize
          this.modalData = {
            width: this.$photoviewer.width(),
            height: this.$photoviewer.height(),
            left: this.$photoviewer.offset().left,
            top: this.$photoviewer.offset().top
          };
          this.$photoviewer.addClass(NS + '-maximize');
          this.$photoviewer.css({
            width: '100%',
            height: '100%',
            left: 0,
            top: 0
          });
          this.isMaximized = true;
        } else {
          this.$photoviewer.removeClass(NS + '-maximize');
          this.$photoviewer.css({
            width: this.modalData.width ? this.modalData.width : this.options.modalWidth,
            height: this.modalData.height ? this.modalData.height : this.options.modalHeight,
            left: this.modalData.left ? this.modalData.left : ($W.width() - this.options.modalWidth) / 2 + $D.scrollLeft(),
            top: this.modalData.top ? this.modalData.top : ($W.height() - this.options.modalHeight) / 2 + $D.scrollTop()
          });
          this.isMaximized = false;
        }

        this.setImageSize({
          width: this.imageData.originalWidth,
          height: this.imageData.originalHeight
        });
      };

      _proto.fullscreen = function fullscreen() {
        requestFullscreen(this.$photoviewer[0]);
      };

      _proto.keydown = function keydown(e) {
        if (!this.options.keyboard) {
          return false;
        }

        var keyCode = e.keyCode || e.which || e.charCode,
            ctrlKey = e.ctrlKey || e.metaKey,
            altKey = e.altKey || e.metaKey;

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
          // ctrl + alt + 0

          case 48:
            if (ctrlKey && altKey) {
              this.zoomTo(1, {
                x: this.$stage.width() / 2,
                y: this.$stage.height() / 2
              }, e);
            }

            break;
          // ctrl + ,

          case 188:
            if (ctrlKey) {
              this.rotate(-90);
            }

            break;
          // ctrl + .

          case 190:
            if (ctrlKey) {
              this.rotate(90);
            }

            break;

          default:
        }
      };

      _proto.addEvents = function addEvents() {
        var _this5 = this;

        this.$close.off(CLICK_EVENT + EVENT_NS).on(CLICK_EVENT + EVENT_NS, function (e) {
          _this5.close();
        });
        this.$stage.off(WHEEL_EVENT + EVENT_NS).on(WHEEL_EVENT + EVENT_NS, function (e) {
          _this5.wheel(e);
        });
        this.$zoomIn.off(CLICK_EVENT + EVENT_NS).on(CLICK_EVENT + EVENT_NS, function (e) {
          _this5.zoom(_this5.options.ratioThreshold * 3, {
            x: _this5.$stage.width() / 2,
            y: _this5.$stage.height() / 2
          }, e);
        });
        this.$zoomOut.off(CLICK_EVENT + EVENT_NS).on(CLICK_EVENT + EVENT_NS, function (e) {
          _this5.zoom(-_this5.options.ratioThreshold * 3, {
            x: _this5.$stage.width() / 2,
            y: _this5.$stage.height() / 2
          }, e);
        });
        this.$actualSize.off(CLICK_EVENT + EVENT_NS).on(CLICK_EVENT + EVENT_NS, function (e) {
          _this5.zoomTo(1, {
            x: _this5.$stage.width() / 2,
            y: _this5.$stage.height() / 2
          }, e);
        });
        this.$prev.off(CLICK_EVENT + EVENT_NS).on(CLICK_EVENT + EVENT_NS, function () {
          _this5.jump(-1);
        });
        this.$fullscreen.off(CLICK_EVENT + EVENT_NS).on(CLICK_EVENT + EVENT_NS, function () {
          _this5.fullscreen();
        });
        this.$next.off(CLICK_EVENT + EVENT_NS).on(CLICK_EVENT + EVENT_NS, function () {
          _this5.jump(1);
        });
        this.$rotateLeft.off(CLICK_EVENT + EVENT_NS).on(CLICK_EVENT + EVENT_NS, function () {
          _this5.rotate(-90);
        });
        this.$rotateRight.off(CLICK_EVENT + EVENT_NS).on(CLICK_EVENT + EVENT_NS, function () {
          _this5.rotate(90);
        });
        this.$maximize.off(CLICK_EVENT + EVENT_NS).on(CLICK_EVENT + EVENT_NS, function () {
          _this5.maximize();
        });
        $D.off(KEYDOWN_EVENT + EVENT_NS).on(KEYDOWN_EVENT + EVENT_NS, function (e) {
          _this5.keydown(e);
        });
        $W.on(RESIZE_EVENT + EVENT_NS, this.resize());
      };

      _proto._triggerHook = function _triggerHook(e, data) {
        if (this.options.callbacks[e]) {
          this.options.callbacks[e].apply(this, $$1.isArray(data) ? data : [data]);
        }
      };

      return PhotoViewer;
    }();
    /**
     * Add methods to PhotoViewer
     */


    $$1.extend(PhotoViewer.prototype, draggable, movable, resizable);
    /**
     * Add PhotoViewer to globle
     */

    window.PhotoViewer = PhotoViewer;

    return PhotoViewer;

})));
