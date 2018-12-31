import D from './d-class';

var prefix = '', eventPrefix,
vendors = { Webkit: 'webkit', Moz: '', O: 'o' },
testEl = document.createElement('div'),
supportedTransforms = /^((translate|rotate|scale)(X|Y|Z|3d)?|matrix(3d)?|perspective|skew(X|Y)?)$/i,
transform,
transitionProperty, transitionDuration, transitionTiming, transitionDelay,
animationName, animationDuration, animationTiming, animationDelay,
cssReset = {}

function dasherize(str) { return str.replace(/([A-Z])/g, '-$1').toLowerCase() }
function normalizeEvent(name) { return eventPrefix ? eventPrefix + name : name.toLowerCase() }

if (testEl.style.transform === undefined) D.each(vendors, function(vendor, event){
if (testEl.style[vendor + 'TransitionProperty'] !== undefined) {
  prefix = '-' + vendor.toLowerCase() + '-'
  eventPrefix = event
  return false
}
})

transform = prefix + 'transform'
cssReset[transitionProperty = prefix + 'transition-property'] =
cssReset[transitionDuration = prefix + 'transition-duration'] =
cssReset[transitionDelay    = prefix + 'transition-delay'] =
cssReset[transitionTiming   = prefix + 'transition-timing-function'] =
cssReset[animationName      = prefix + 'animation-name'] =
cssReset[animationDuration  = prefix + 'animation-duration'] =
cssReset[animationDelay     = prefix + 'animation-delay'] =
cssReset[animationTiming    = prefix + 'animation-timing-function'] = ''

D.fx = {
off: (eventPrefix === undefined && testEl.style.transitionProperty === undefined),
speeds: { _default: 400, fast: 200, slow: 600 },
cssPrefix: prefix,
transitionEnd: normalizeEvent('TransitionEnd'),
animationEnd: normalizeEvent('AnimationEnd')
}

D.fn.animate = function(properties, duration, ease, callback, delay){
if (D.isFunction(duration))
  callback = duration, ease = undefined, duration = undefined
if (D.isFunction(ease))
  callback = ease, ease = undefined
if (D.isPlainObject(duration))
  ease = duration.easing, callback = duration.complete, delay = duration.delay, duration = duration.duration
if (duration) duration = (typeof duration == 'number' ? duration :
                (D.fx.speeds[duration] || D.fx.speeds._default)) / 1000
if (delay) delay = parseFloat(delay) / 1000
return this.anim(properties, duration, ease, callback, delay)
}

D.fn.anim = function(properties, duration, ease, callback, delay){
var key, cssValues = {}, cssProperties, transforms = '',
    that = this, wrappedCallback, endEvent = D.fx.transitionEnd,
    fired = false

if (duration === undefined) duration = D.fx.speeds._default / 1000
if (delay === undefined) delay = 0
if (D.fx.off) duration = 0

if (typeof properties == 'string') {
  // keyframe animation
  cssValues[animationName] = properties
  cssValues[animationDuration] = duration + 's'
  cssValues[animationDelay] = delay + 's'
  cssValues[animationTiming] = (ease || 'linear')
  endEvent = D.fx.animationEnd
} else {
  cssProperties = []
  // CSS transitions
  for (key in properties)
    if (supportedTransforms.test(key)) transforms += key + '(' + properties[key] + ') '
    else cssValues[key] = properties[key], cssProperties.push(dasherize(key))

  if (transforms) cssValues[transform] = transforms, cssProperties.push(transform)
  if (duration > 0 && typeof properties === 'object') {
    cssValues[transitionProperty] = cssProperties.join(', ')
    cssValues[transitionDuration] = duration + 's'
    cssValues[transitionDelay] = delay + 's'
    cssValues[transitionTiming] = (ease || 'linear')
  }
}

wrappedCallback = function(event){
  if (typeof event !== 'undefined') {
    if (event.target !== event.currentTarget) return // makes sure the event didn't bubble from "below"
    D(event.target).off(endEvent, wrappedCallback)
  } else
    D(this).off(endEvent, wrappedCallback) // triggered by setTimeout

  fired = true
  D(this).css(cssReset)
  callback && callback.call(this)
}
if (duration > 0){
  this.on(endEvent, wrappedCallback)
  // transitionEnd is not always firing on older Android phones
  // so make sure it gets fired
  setTimeout(function(){
    if (fired) return
    wrappedCallback.call(that)
  }, ((duration + delay) * 1000) + 25)
}

// trigger page reflow so new elements can animate
this.size() && this.get(0).clientLeft

this.css(cssValues)

if (duration <= 0) setTimeout(function() {
  that.each(function(){ wrappedCallback.call(this) })
}, 0)

return this
}

testEl = null