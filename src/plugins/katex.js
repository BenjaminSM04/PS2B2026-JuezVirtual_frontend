import 'katex/dist/katex.min.css'
import renderMathInElement from 'katex/dist/contrib/auto-render.js'

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
  const userOptions = binding.value && binding.value.options ? binding.value.options : {}
  const options = Object.assign({}, defaultOptions, userOptions)
  renderMathInElement(el, options)
}

export default {
  install: function (Vue) {
    Vue.directive('katex', {
      inserted: render,
      componentUpdated: render
    })
  }
}
