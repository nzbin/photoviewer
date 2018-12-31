import D from './d-class';
import { isFunction } from './utils';

D.fn.extend({
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
    }
});