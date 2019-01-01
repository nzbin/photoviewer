import D from './d-class';
import { document, rootNodeRE } from './vars';
import { funcArg, isWindow } from './utils';

D.fn.extend({
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
        if (value === undefined) return hasScrollTop
            ? this[0].scrollTop
            : isWindow(this[0])
                ? this[0].pageYOffset
                : this[0].defaultView.pageYOffset;
        return this.each(hasScrollTop ?
            function () { this.scrollTop = value } :
            function () { this.scrollTo(this.scrollX, value) })
    },
    scrollLeft: function (value) {
        if (!this.length) return
        var hasScrollLeft = 'scrollLeft' in this[0]
        if (value === undefined) return hasScrollLeft
            ? this[0].scrollLeft
            : isWindow(this[0])
                ? this[0].pageXOffset
                : this[0].defaultView.pageXOffset;
        return this.each(hasScrollLeft ?
            function () { this.scrollLeft = value } :
            function () { this.scrollTo(value, this.scrollY) })
    },
    offsetParent: function () {
        return this.map(function () {
            var parent = this.offsetParent || document.body
            while (parent && !rootNodeRE.test(parent.nodeName) && D(parent).css('position') == 'static')
                parent = parent.offsetParent
            return parent
        })
    }
});