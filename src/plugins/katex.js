import 'katex/dist/katex.min.css'

const noop = () => {}

// Tags whose contents must never be treated as math. `pre`/`code`/`textarea`
// hold sample I/O and source code where whitespace is significant — letting
// auto-render walk into them collapses spaces between (often uppercase) words.
const IGNORED_TAGS = ['script', 'noscript', 'style', 'textarea', 'pre', 'code', 'option']

const defaultOptions = {
  errorCallback: noop,
  throwOnError: false,
  ignoredTags: IGNORED_TAGS,
  delimiters: [
    {left: '$$', right: '$$', display: true},
    {left: '\\[', right: '\\]', display: true},
    {left: '\\(', right: '\\)', display: false},
    {left: '$', right: '$', display: false}
  ]
}

// Resolve KaTeX's auto-render lazily and defensively. Depending on the bundler
// interop it may be a function or be wrapped as { default: fn }; resolving it
// inside a try/catch guarantees it can never crash the app at load time.
let cachedRenderer
let rendererResolved = false
function resolveRenderer () {
  if (rendererResolved) return cachedRenderer
  rendererResolved = true
  try {
    const mod = require('katex/dist/contrib/auto-render.js')
    cachedRenderer = typeof mod === 'function' ? mod : (mod && mod.default)
    if (typeof cachedRenderer !== 'function') {
      cachedRenderer = null
      console.error('[katex] auto-render no expone una funcion; modulo recibido:', mod)
    }
  } catch (e) {
    cachedRenderer = null
    console.error('[katex] no se pudo cargar auto-render:', e)
  }
  return cachedRenderer
}

// Render math inside `el`, merging the caller's options over the safe defaults.
// Centralised so every call site goes through the guarded resolver instead of
// importing `auto-render.js` directly (a raw default import crashes under the
// webpack interop with "Object(...) is not a function"). Never throws.
export function renderMath (el, options) {
  const renderMathInElement = resolveRenderer()
  if (!el || typeof renderMathInElement !== 'function') return false
  try {
    renderMathInElement(el, Object.assign({}, defaultOptions, options))
    return true
  } catch (e) {
    // Do not break the caller if KaTeX fails on malformed input.
    console.error('[katex] renderMath fallo:', e)
    return false
  }
}

// Exposed for callers that need the raw function (or to feature-detect it).
export function getRenderer () {
  return resolveRenderer()
}

function render (el, binding) {
  const userOptions = binding.value && binding.value.options ? binding.value.options : {}
  renderMath(el, userOptions)
}

export default {
  install: function (Vue) {
    Vue.directive('katex', {
      inserted: render,
      componentUpdated: render
    })
  }
}
