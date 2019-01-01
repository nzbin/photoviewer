import D from './d-class';
import { emptyArray, filter, slice } from './vars';
import { children, filtered, isDocument, isFunction, isObject, likeArray, uniq } from './utils';

D.fn.extend({
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
    filter: function (selector) {
        if (isFunction(selector)) return this.not(this.not(selector))
        return D(filter.call(this, function (element) {
            return D.matches(element, selector)
        }))
    },
    has: function (selector) {
        return this.filter(function () {
            return isObject(selector) ?
                D.contains(this, selector) :
                D(this).find(selector).size()
        })
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

    add: function (selector, context) {
        return D(uniq(this.concat(D(selector, context))))
    },
    contents: function () {
        return this.map(function () { return this.contentDocument || slice.call(this.childNodes) })
    },

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
    prev: function (selector) {
        return D(this.pluck('previousElementSibling')).filter(selector || '*')
    },
    next: function (selector) {
        return D(this.pluck('nextElementSibling')).filter(selector || '*')
    }
});