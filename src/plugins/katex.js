import 'katex/dist/katex.min.css'

const noop = () => {}

const defaultOptions = {
  errorCallback: noop,
  throwOnError: false,
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
  } catch (e) {
    cachedRenderer = null
  }
  return cachedRenderer
}

function render (el, binding) {
  const renderMathInElement = resolveRenderer()
  if (typeof renderMathInElement !== 'function') return
  const userOptions = binding.value && binding.value.options ? binding.value.options : {}
  const options = Object.assign({}, defaultOptions, userOptions)
  try {
    renderMathInElement(el, options)
  } catch (e) {
    // Do not break the component render if KaTeX fails.
  }
}

export default {
  install: function (Vue) {
    Vue.directive('katex', {
      inserted: render,
      componentUpdated: render
    })
  }
}
