import D from './d-class';
import { isArray } from './vars';
import { camelize, dasherize, maybeAddPx, type } from './utils';

D.fn.extend({
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
    }
});