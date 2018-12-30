import D from './d-class';

import {
    emptyArray,
    concat,
    filter,
    slice,
    document,
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
    tempParent,
    propMap,
    isArray
} from './vars';

import {
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
} from './utils';

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
            selector = selector.trim()
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
                dom = D.qsa(document, selector)
            }
        }
        // If a function is given, call it when the DOM is ready
        else if (isFunction(selector)) {
            return D(document).ready(selector)
        }
        // If a D collection is given, just return it
        else if (D.isD(selector)) {
            return selector
        }
        // normalize array if an array of nodes is given
        else if (isArray(selector)) {
            dom = compact(selector)
        }
        // Wrap DOM nodes.
        else if (isObject(selector)) {
            dom = [selector], selector = null
        }
        // If there's a context, create a collection on that context first, and select
        // nodes from there
        else if (context !== undefined) {
            return D(context).find(selector)
        }
        // And last but no least, if it's a CSS selector, use it to select nodes.
        else {
            dom = D.qsa(document, selector)
        }
        // create a new D collection from the nodes found
        return D.makeArray(dom, selector, this);
    }
}

D.extend = D.fn.extend = function () {
    var options, name, src, copy, copyIsArray, clone,
        target = arguments[0] || {},
        i = 1,
        length = arguments.length,
        deep = false;

    // Handle a deep copy situation
    if (typeof target === "boolean") {
        deep = target;

        // Skip the boolean and the target
        target = arguments[i] || {};
        i++;
    }
    // Handle case when target is a string or something (possible in deep copy)
    if (typeof target !== "object" && !isFunction(target)) {
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
                if (deep && copy && (D.isPlainObject(copy) ||
                    (copyIsArray = Array.isArray(copy)))) {
                    if (copyIsArray) {
                        copyIsArray = false;
                        clone = src && Array.isArray(src) ? src : [];
                    } else {
                        clone = src && D.isPlainObject(src) ? src : {};
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
}

D.extend({
    type: type,
    isFunction: isFunction,
    isWindow: isWindow,
    isPlainObject: isPlainObject,
    camelCase: camelize,
    isArray: isArray,
    isEmptyObject: function (obj) {
        var name
        for (name in obj) return false
        return true
    },
    isNumeric: function (val) {
        var num = Number(val),
            type = typeof val
        return val != null && type != 'boolean' &&
            (type != 'string' || val.length) &&
            !isNaN(num) && isFinite(num) || false
    },
    inArray: function (elem, array, i) {
        return emptyArray.indexOf.call(array, elem, i)
    },
    trim: function (str) {
        return str == null ? "" : String.prototype.trim.call(str)
    },
    noop: function () { },
    map: function (elements, callback) {
        var value, values = [],
            i, key
        if (likeArray(elements))
            for (i = 0; i < elements.length; i++) {
                value = callback(elements[i], i)
                if (value != null) values.push(value)
            }
        else
            for (key in elements) {
                value = callback(elements[key], key)
                if (value != null) values.push(value)
            }
        return flatten(values)
    },
    each: function (elements, callback) {
        var i, key
        if (likeArray(elements)) {
            for (i = 0; i < elements.length; i++)
                if (callback.call(elements[i], i, elements[i]) === false) return elements
        } else {
            for (key in elements)
                if (callback.call(elements[key], key, elements[key]) === false) return elements
        }

        return elements
    },
    grep: function (elements, callback) {
        return filter.call(elements, callback)
    },
    contains: function () {
        return (document.documentElement.contains
            ? function (parent, node) {
                return parent !== node && parent.contains(node)
            }
            : function (parent, node) {
                while (node && (node = node.parentNode))
                    if (node === parent) return true
                return false
            });
    },

    // Make DOM Array
    makeArray: function (dom, selector, me) {
        var i, len = dom ? dom.length : 0
        for (i = 0; i < len; i++) me[i] = dom[i]
        me.length = len
        me.selector = selector || ''
        return me;
    },
    // Html -> Node
    fragment: function (html, name, properties) {
        var dom, nodes, container

        // A special case optimization for a single tag
        if (singleTagRE.test(html)) {
            dom = D(document.createElement(RegExp.$1))
        }

        if (!dom) {

            if (html.replace) {
                html = html.replace(tagExpanderRE, "<$1></$2>")
            }

            if (name === undefined) {
                name = fragmentRE.test(html) && RegExp.$1
            }

            if (!(name in containers)) {
                name = '*'
            }

            container = containers[name]
            container.innerHTML = '' + html
            dom = D.each(slice.call(container.childNodes), function () {
                container.removeChild(this)
            })
        }

        if (isPlainObject(properties)) {
            nodes = D(dom)
            D.each(properties, function (key, value) {
                if (methodAttributes.indexOf(key) > -1) nodes[key](value)
                else nodes.attr(key, value)
            })
        }

        return dom
    },
    // D's CSS selector
    qsa: function (element, selector) {
        var found,
            maybeID = selector[0] == '#',
            maybeClass = !maybeID && selector[0] == '.',
            // Ensure that a 1 char tag name still gets checked
            nameOnly = maybeID || maybeClass ? selector.slice(1) : selector,
            isSimple = simpleSelectorRE.test(nameOnly)
        return (
            // Safari DocumentFragment doesn't have getElementById
            element.getElementById && isSimple && maybeID)
            ? (
                (found = element.getElementById(nameOnly))
                    ? [found]
                    : []
            ) : (
                element.nodeType !== 1 && element.nodeType !== 9 && element.nodeType !== 11
            )
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
    isD: function (object) {
        return object instanceof D
    },
    matches: function (element, selector) {
        if (!selector || !element || element.nodeType !== 1) return false
        var matchesSelector = element.matches || element.webkitMatchesSelector ||
            element.mozMatchesSelector || element.oMatchesSelector ||
            element.matchesSelector
        if (matchesSelector) return matchesSelector.call(element, selector)
        // fall back to performing a selector:
        var match, parent = element.parentNode,
            temp = !parent
        if (temp) (parent = tempParent).appendChild(element)
        match = ~D.qsa(parent, selector).indexOf(element)
        temp && tempParent.removeChild(element)
        return match
    }
});

// Populate the class2type map
D.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function (i, name) {
    class2type["[object " + name + "]"] = name.toLowerCase()
});

// Methods in Prototype
D.fn.extend({
    // 💔 Modify the collection by adding elements to it
    concat: function () {
        var i, value, args = []
        for (i = 0; i < arguments.length; i++) {
            value = arguments[i]
            args[i] = D.isD(value) ? value.toArray() : value
        }
        return concat.apply(D.isD(this) ? this.toArray() : this, args)
    },
    // 💔 `pluck` is borrowed from Prototype.js
    pluck: function (property) {
        return D.map(this, function (el) { return el[property] })
    },

    /* Traversing */
    // Filtering
    filter: function (selector) {
        if (isFunction(selector)) return this.not(this.not(selector))
        return D(filter.call(this, function (element) {
            return D.matches(element, selector)
        }))
    },
    not: function (selector) {
        var nodes = []
        if (isFunction(selector) && selector.call !== undefined)
            this.each(function (idx) {
                if (!selector.call(this, idx)) nodes.push(this)
            })
        else {
            var excludes = typeof selector == 'string' ? this.filter(selector) :
                (likeArray(selector) && isFunction(selector.item)) ? slice.call(selector) : D(selector)
            this.forEach(function (el) {
                if (excludes.indexOf(el) < 0) nodes.push(el)
            })
        }
        return D(nodes)
    },
    is: function (selector) {
        return typeof selector == 'string'
            ? this.length > 0 && D.matches(this[0], selector)
            : selector && this.selector == selector.selector
    },
    has: function (selector) {
        return this.filter(function () {
            return isObject(selector) ?
                D.contains(this, selector) :
                D(this).find(selector).size()
        })
    },
    eq: function (idx) {
        return idx === -1 ? this.slice(idx) : this.slice(idx, +idx + 1)
    },
    first: function () {
        var el = this[0]
        return el && !isObject(el) ? el : D(el)
    },
    last: function () {
        var el = this[this.length - 1]
        return el && !isObject(el) ? el : D(el)
    },
    slice: function () {
        return D(slice.apply(this, arguments))
    },
    find: function (selector) {
        var result, $this = this
        if (!selector) result = D()
        else if (typeof selector == 'object')
            result = D(selector).filter(function () {
                var node = this
                return emptyArray.some.call($this, function (parent) {
                    return D.contains(parent, node)
                })
            })
        else if (this.length == 1) result = D(D.qsa(this[0], selector))
        else result = this.map(function () { return D.qsa(this, selector) })
        return result
    },
    // Miscellaneous Traversing
    add: function (selector, context) {
        return D(uniq(this.concat(D(selector, context))))
    },
    contents: function () {
        return this.map(function () { return this.contentDocument || slice.call(this.childNodes) })
    },
    // Tree Traversal
    closest: function (selector, context) {
        var nodes = [],
            collection = typeof selector == 'object' && D(selector)
        this.each(function (_, node) {
            while (node && !(collection ? collection.indexOf(node) >= 0 : D.matches(node, selector)))
                node = node !== context && !isDocument(node) && node.parentNode
            if (node && nodes.indexOf(node) < 0) nodes.push(node)
        })
        return D(nodes)
    },
    parents: function (selector) {
        var ancestors = [],
            nodes = this
        while (nodes.length > 0)
            nodes = D.map(nodes, function (node) {
                if ((node = node.parentNode) && !isDocument(node) && ancestors.indexOf(node) < 0) {
                    ancestors.push(node)
                    return node
                }
            })
        return filtered(ancestors, selector)
    },
    parent: function (selector) {
        return filtered(uniq(this.pluck('parentNode')), selector)
    },
    children: function (selector) {
        return filtered(this.map(function () { return children(this) }), selector)
    },
    siblings: function (selector) {
        return filtered(this.map(function (i, el) {
            return filter.call(children(el.parentNode), function (child) { return child !== el })
        }), selector)
    },
    offsetParent: function () {
        return this.map(function () {
            var parent = this.offsetParent || document.body
            while (parent && !rootNodeRE.test(parent.nodeName) && D(parent).css("position") == "static")
                parent = parent.offsetParent
            return parent
        })
    },
    prev: function (selector) {
        return D(this.pluck('previousElementSibling')).filter(selector || '*')
    },
    next: function (selector) {
        return D(this.pluck('nextElementSibling')).filter(selector || '*')
    },

    /* Attribute */
    // General Attributes
    attr: function (name, value) {
        var result
        return (typeof name == 'string' && !(1 in arguments)) ?
            (0 in this && this[0].nodeType == 1 && (result = this[0].getAttribute(name)) != null ? result : undefined) :
            this.each(function (idx) {
                if (this.nodeType !== 1) return
                if (isObject(name))
                    for (var key in name) setAttribute(this, key, name[key])
                else setAttribute(this, name, funcArg(this, value, idx, this.getAttribute(name)))
            })
    },
    removeAttr: function (name) {
        return this.each(function () {
            this.nodeType === 1 && name.split(' ').forEach(function (attribute) {
                setAttribute(this, attribute)
            }, this)
        })
    },
    prop: function (name, value) {
        name = propMap[name] || name
        return (typeof name == 'string' && !(1 in arguments)) ?
            (this[0] && this[0][name]) :
            this.each(function (idx) {
                if (isObject(name))
                    for (var key in name) this[propMap[key] || key] = name[key]
                else this[name] = funcArg(this, value, idx, this[name])
            })
    },
    removeProp: function (name) {
        name = propMap[name] || name
        return this.each(function () { delete this[name] })
    },
    val: function (value) {
        if (0 in arguments) {
            if (value == null) value = ""
            return this.each(function (idx) {
                this.value = funcArg(this, value, idx, this.value)
            })
        } else {
            return this[0] && (this[0].multiple ?
                D(this[0]).find('option').filter(function () { return this.selected }).pluck('value') :
                this[0].value)
        }
    },
    // Class Attributes
    hasClass: function (name) {
        if (!name) return false
        return emptyArray.some.call(this, function (el) {
            return this.test(className(el))
        }, classRE(name))
    },
    addClass: function (name) {
        var classList = [];
        if (!name) return this
        return this.each(function (idx) {
            if (!('className' in this)) return
            classList = []
            var cls = className(this),
                newName = funcArg(this, name, idx, cls)
            newName.split(/\s+/g).forEach(function (klass) {
                if (!D(this).hasClass(klass)) classList.push(klass)
            }, this)
            classList.length && className(this, cls + (cls ? " " : "") + classList.join(" "))
        })
    },
    removeClass: function (name) {
        var classList = [];
        return this.each(function (idx) {
            if (!('className' in this)) return
            if (name === undefined) return className(this, '')
            classList = className(this)
            funcArg(this, name, idx, classList).split(/\s+/g).forEach(function (klass) {
                classList = classList.replace(classRE(klass), " ")
            })
            className(this, classList.trim())
        })
    },
    toggleClass: function (name, when) {
        if (!name) return this
        return this.each(function (idx) {
            var $this = D(this),
                names = funcArg(this, name, idx, className(this))
            names.split(/\s+/g).forEach(function (klass) {
                (when === undefined ? !$this.hasClass(klass) : when) ?
                    $this.addClass(klass) : $this.removeClass(klass)
            })
        })
    },
    // DOM Insertion
    html: function (html) {
        return 0 in arguments ?
            this.each(function (idx) {
                var originHtml = this.innerHTML
                D(this).empty().append(funcArg(this, html, idx, originHtml))
            }) :
            (0 in this ? this[0].innerHTML : null)
    },
    text: function (text) {
        return 0 in arguments ?
            this.each(function (idx) {
                var newText = funcArg(this, text, idx, this.textContent)
                this.textContent = newText == null ? '' : '' + newText
            }) :
            (0 in this ? this.pluck('textContent').join("") : null)
    },

    /* CSS */
    css: function (property, value) {
        if (arguments.length < 2) {
            var element = this[0]
            if (typeof property == 'string') {
                if (!element) return
                return element.style[camelize(property)] || getComputedStyle(element, '').getPropertyValue(property)
            } else if (isArray(property)) {
                if (!element) return
                var props = {}
                var computedStyle = getComputedStyle(element, '');
                D.each(property, function (_, prop) {
                    props[prop] = (element.style[camelize(prop)] || computedStyle.getPropertyValue(prop))
                });
                return props
            }
        }

        var css = ''
        if (type(property) == 'string') {
            if (!value && value !== 0) {
                this.each(function () {
                    this.style.removeProperty(dasherize(property));
                });
            } else {
                css = dasherize(property) + ":" + maybeAddPx(property, value)
            }
        } else {
            for (var key in property) {
                if (!property[key] && property[key] !== 0) {
                    this.each(function () { this.style.removeProperty(dasherize(key)) })
                } else {
                    css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';'
                }
            }
        }

        return this.each(function () { this.style.cssText += ';' + css })
    },
    offset: function (coordinates) {
        if (coordinates) return this.each(function (index) {
            var $this = D(this),
                coords = funcArg(this, coordinates, index, $this.offset()),
                parentOffset = $this.offsetParent().offset(),
                props = {
                    top: coords.top - parentOffset.top,
                    left: coords.left - parentOffset.left
                }

            if ($this.css('position') == 'static') props['position'] = 'relative'
            $this.css(props)
        })
        if (!this.length) return null
        if (document.documentElement !== this[0] && !D.contains(document.documentElement, this[0]))
            return { top: 0, left: 0 }
        var obj = this[0].getBoundingClientRect()
        return {
            left: obj.left + window.pageXOffset,
            top: obj.top + window.pageYOffset,
            width: Math.round(obj.width),
            height: Math.round(obj.height)
        }
    },
    position: function () {
        if (!this.length) return

        var elem = this[0],
            // Get *real* offsetParent
            offsetParent = this.offsetParent(),
            // Get correct offsets
            offset = this.offset(),
            parentOffset = rootNodeRE.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset()

        // Subtract element margins
        // note: when an element has margin: auto the offsetLeft and marginLeft
        // are the same in Safari causing offset.left to incorrectly be 0
        offset.top -= parseFloat(D(elem).css('margin-top')) || 0
        offset.left -= parseFloat(D(elem).css('margin-left')) || 0

        // Add offsetParent borders
        parentOffset.top += parseFloat(D(offsetParent[0]).css('border-top-width')) || 0
        parentOffset.left += parseFloat(D(offsetParent[0]).css('border-left-width')) || 0

        // Subtract the two offsets
        return {
            top: offset.top - parentOffset.top,
            left: offset.left - parentOffset.left
        }
    },
    scrollTop: function (value) {
        if (!this.length) return
        var hasScrollTop = 'scrollTop' in this[0]
        if (value === undefined) return hasScrollTop ? this[0].scrollTop : this[0].pageYOffset
        return this.each(hasScrollTop ?
            function () { this.scrollTop = value } :
            function () { this.scrollTo(this.scrollX, value) })
    },
    scrollLeft: function (value) {
        if (!this.length) return
        var hasScrollLeft = 'scrollLeft' in this[0]
        if (value === undefined) return hasScrollLeft ? this[0].scrollLeft : this[0].pageXOffset
        return this.each(hasScrollLeft ?
            function () { this.scrollLeft = value } :
            function () { this.scrollTo(value, this.scrollY) })
    },

    /* DOM */
    remove: function () {
        return this.each(function () {
            if (this.parentNode != null)
                this.parentNode.removeChild(this)
        })
    },
    empty: function () {
        return this.each(function () { this.innerHTML = '' })
    },
    clone: function () {
        return this.map(function () { return this.cloneNode(true) })
    },
    wrap: function (structure) {
        var func = isFunction(structure)
        if (this[0] && !func)
            var dom = D(structure).get(0),
                clone = dom.parentNode || this.length > 1

        return this.each(function (index) {
            D(this).wrapAll(
                func ? structure.call(this, index) :
                    clone ? dom.cloneNode(true) : dom
            )
        })
    },
    wrapAll: function (structure) {
        if (this[0]) {
            D(this[0]).before(structure = D(structure))
            var children
            // drill down to the inmost element
            while ((children = structure.children()).length) structure = children.first()
            D(structure).append(this)
        }
        return this
    },
    wrapInner: function (structure) {
        var func = isFunction(structure)
        return this.each(function (index) {
            var self = D(this),
                contents = self.contents(),
                dom = func ? structure.call(this, index) : structure
            contents.length ? contents.wrapAll(dom) : self.append(dom)
        })
    },
    unwrap: function () {
        this.parent().each(function () {
            D(this).replaceWith(D(this).children())
        })
        return this
    },
    replaceWith: function (newContent) {
        return this.before(newContent).remove()
    },

    /* Miscellaneous */
    toArray: function () {
        return this.get()
    },
    each: function (callback) {
        emptyArray.every.call(this, function (el, idx) {
            return callback.call(el, idx, el) !== false
        })
        return this
    },
    map: function (fn) {
        return D(
            D.map(this, function (el, i) { return fn.call(el, i, el) })
        )
    },
    get: function (idx) {
        return idx === undefined ? slice.call(this) : this[idx >= 0 ? idx : idx + this.length]
    },
    size: function () {
        return this.length
    },
    index: function (element) {
        return element ? this.indexOf(D(element)[0]) : this.parent().children().indexOf(this[0])
    },

    /* Events */
    ready: function (callback) {
        // don't use "interactive" on IE <= 10 (it can fired premature)
        if (document.readyState === "complete" ||
            (document.readyState !== "loading" && !document.documentElement.doScroll))
            setTimeout(function () { callback(D) }, 0)
        else {
            var handler = function () {
                document.removeEventListener("DOMContentLoaded", handler, false)
                window.removeEventListener("load", handler, false)
                callback(D)
            }
            document.addEventListener("DOMContentLoaded", handler, false)
            window.addEventListener("load", handler, false)
        }
        return this
    },

    /* Data */
    data: function (name, value) {
        var attrName = 'data-' + name.replace(capitalRE, '-$1').toLowerCase()

        var data = (1 in arguments) ?
            this.attr(attrName, value) :
            this.attr(attrName)

        return data !== null ? deserializeValue(data) : undefined
    },

    /* Effects */
    show: function () {
        return this.each(function () {
            this.style.display == "none" && (this.style.display = '')
            if (getComputedStyle(this, '').getPropertyValue("display") == "none")
                this.style.display = defaultDisplay(this.nodeName)
        })
    },
    hide: function () {
        return this.css("display", "none")
    },
});

dimensions.forEach(function (dimension) {
    var dimensionProperty =
        dimension.replace(/./, function (m) { return m[0].toUpperCase() })

    D.fn[dimension] = function (value) {
        var offset, el = this[0]
        if (value === undefined) return isWindow(el)
            ? el['inner' + dimensionProperty]
            : isDocument(el)
                ? el.documentElement['scroll' + dimensionProperty]
                : parseFloat(this.css(dimension))
        else return this.each(function (idx) {
            el = D(this)
            el.css(dimension, funcArg(this, value, idx, el[dimension]()))
        })
    }
})

function traverseNode(node, fn) {
    fn(node)
    for (var i = 0, len = node.childNodes.length; i < len; i++)
        traverseNode(node.childNodes[i], fn)
}

// Generate the `after`, `prepend`, `before`, `append`,
// `insertAfter`, `insertBefore`, `appendTo`, and `prependTo` methods.
adjacencyOperators.forEach(function (operator, operatorIndex) {
    var inside = operatorIndex % 2 //=> prepend, append

    D.fn[operator] = function () {
        // arguments can be nodes, arrays of nodes, D objects and HTML strings
        var argType,
            nodes = D.map(arguments, function (arg) {
                var arr = []
                argType = type(arg)
                if (argType == "array") {
                    arg.forEach(function (el) {
                        if (el.nodeType !== undefined) return arr.push(el)
                        else if (D.isD(el)) return arr = arr.concat(el.get())
                        arr = arr.concat(D.fragment(el))
                    })
                    return arr
                }

                return argType == "object" || arg == null
                    ? arg
                    : D.fragment(arg)
            }),
            parent,
            copyByClone = this.length > 1;

        if (nodes.length < 1) return this

        return this.each(function (_, target) {
            parent = inside ? target : target.parentNode

            // convert all methods to a "before" operation
            target = operatorIndex == 0
                ? target.nextSibling
                : operatorIndex == 1
                    ? target.firstChild
                    : operatorIndex == 2
                        ? target : null

            var parentInDocument = D.contains(document.documentElement, parent)

            nodes.forEach(function (node) {

                if (copyByClone) {
                    node = node.cloneNode(true)
                } else if (!parent) {
                    return D(node).remove()
                }

                parent.insertBefore(node, target)

                if (parentInDocument) {
                    traverseNode(node, function (el) {
                        if (el.nodeName != null && el.nodeName.toUpperCase() === 'SCRIPT' &&
                            (!el.type || el.type === 'text/javascript') && !el.src) {
                            var target = el.ownerDocument ? el.ownerDocument.defaultView : window
                            target['eval'].call(target, el.innerHTML)
                        }
                    });
                }
            })
        })
    }

    // after    => insertAfter
    // prepend  => prependTo
    // before   => insertBefore
    // append   => appendTo
    D.fn[inside ? operator + 'To' : 'insert' + (operatorIndex ? 'Before' : 'After')] = function (html) {
        D(html)[operator](this)
        return this
    }
});

D.fn.init.prototype = D.fn;
