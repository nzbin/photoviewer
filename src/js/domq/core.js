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
    // Modify the collection by adding elements to it
    concat: function () {
        var i, value, args = []
        for (i = 0; i < arguments.length; i++) {
            value = arguments[i]
            args[i] = D.isD(value) ? value.toArray() : value
        }
        return concat.apply(D.isD(this) ? this.toArray() : this, args)
    },
    // `pluck` is borrowed from Prototype.js
    pluck: function (property) {
        return D.map(this, function (el) { return el[property] })
    },
    // Filtering
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

D.fn.init.prototype = D.fn;
