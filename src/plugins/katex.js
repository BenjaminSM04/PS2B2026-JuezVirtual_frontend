import 'katex/dist/katex.min.css'
import autoRender from 'katex/dist/contrib/auto-render.js'

// auto-render puede exportarse como función o como { default: fn }
// dependiendo del interop del bundler; normalizamos a una función.
const renderMathInElement = typeof autoRender === 'function' ? autoRender : autoRender.default

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

function render (el, binding) {
  if (typeof renderMathInElement !== 'function') return
  const userOptions = binding.value && binding.value.options ? binding.value.options : {}
  const options = Object.assign({}, defaultOptions, userOptions)
  try {
    renderMathInElement(el, options)
  } catch (e) {
    // No romper el render del componente si KaTeX falla.
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
