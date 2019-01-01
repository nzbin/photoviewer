import D from './d-class';
import { emptyArray } from './vars';
import { className, classRE, funcArg } from './utils';

D.fn.extend({
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
            classList.length && className(this, cls + (cls ? ' ' : '') + classList.join(' '))
        })
    },
    removeClass: function (name) {
        var classList = [];
        return this.each(function (idx) {
            if (!('className' in this)) return
            if (name === undefined) return className(this, '')
            classList = className(this)
            funcArg(this, name, idx, classList).split(/\s+/g).forEach(function (klass) {
                classList = classList.replace(classRE(klass), ' ')
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
                (when === undefined ? !$this.hasClass(klass) : when)
                    ? $this.addClass(klass)
                    : $this.removeClass(klass)
            })
        })
    }
});