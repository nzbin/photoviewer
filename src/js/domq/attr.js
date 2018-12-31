import D from './d-class';
import { funcArg, isObject, setAttribute } from './utils';

D.fn.extend({
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
    }
});