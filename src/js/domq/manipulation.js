import D from './d-class';
import { document } from './vars';
import { funcArg, type } from './utils';

var traverseNode = function (node, fn) {
    fn(node)
    for (var i = 0, len = node.childNodes.length; i < len; i++)
        traverseNode(node.childNodes[i], fn)
}

// inside => append, prepend
var domMani = function (elem, args, fn, inside) {
    // arguments can be nodes, arrays of nodes, D objects and HTML strings
    var argType,
        nodes = D.map(args, function (arg) {
            var arr = []
            argType = type(arg)
            if (argType == 'array') {
                arg.forEach(function (el) {
                    if (el.nodeType !== undefined) return arr.push(el)
                    else if (D.isD(el)) return arr = arr.concat(el.get())
                    arr = arr.concat(D.fragment(el))
                })
                return arr
            }
            return argType == 'object' || arg == null ? arg : D.fragment(arg)
        }),
        copyByClone = elem.length > 1;

    if (nodes.length < 1) return elem

    return elem.each(function (_, target) {
        parent = inside ? target : target.parentNode;
        var parentInDocument = D.contains(document.documentElement, parent);

        nodes.forEach(function (node) {
            if (copyByClone) node = node.cloneNode(true)
            else if (!parent) return D(node).remove()

            fn.call(target, node);

            if (parentInDocument) {
                traverseNode(node, function (el) {
                    if (el.nodeName != null && el.nodeName.toUpperCase() === 'SCRIPT' &&
                        (!el.type || el.type === 'text/javascript') && !el.src) {
                        var target = el.ownerDocument ? el.ownerDocument.defaultView : window
                        target['eval'].call(target, el.innerHTML)
                    }
                });
            }
        });
    });
}

D.fn.extend({
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
    html: function (html) {
        return 0 in arguments
            ? this.each(function (idx) {
                var originHtml = this.innerHTML
                D(this).empty().append(funcArg(this, html, idx, originHtml))
            })
            : (0 in this ? this[0].innerHTML : null)
    },
    text: function (text) {
        return 0 in arguments
            ? this.each(function (idx) {
                var newText = funcArg(this, text, idx, this.textContent)
                this.textContent = newText == null ? '' : '' + newText
            })
            : (0 in this ? this.pluck('textContent').join('') : null)
    },
    replaceWith: function (newContent) {
        return this.before(newContent).remove()
    },
    append: function () {
        return domMani(this, arguments, function (elem) {
            this.insertBefore(elem, null);
        }, true);
    },
    prepend: function () {
        return domMani(this, arguments, function (elem) {
            this.insertBefore(elem, this.firstChild);
        }, true);
    },
    after: function () {
        return domMani(this, arguments, function (elem) {
            this.parentNode.insertBefore(elem, this.nextSibling);
        }, false);
    },
    before: function () {
        return domMani(this, arguments, function (elem) {
            this.parentNode.insertBefore(elem, this);
        }, false);
    }
});

D.each({
    appendTo: 'append',
    prependTo: 'prepend',
    insertBefore: 'before',
    insertAfter: 'after',
    replaceAll: 'replaceWith'
}, function (name, original) {
    D.fn[name] = function (html) {
        D(html)[original](this);
        return this;
    }
});