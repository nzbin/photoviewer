import D from './d-class';
import { adjacencyOperators, document } from './vars';
import { funcArg, type } from './utils';

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

    replaceWith: function (newContent) {
        return this.before(newContent).remove()
    },
});

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