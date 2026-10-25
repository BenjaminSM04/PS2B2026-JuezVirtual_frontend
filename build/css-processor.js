'use strict'
const postcss = require('postcss')
const cssnano = require('cssnano')

// Adaptador de la API del plugin de Webpack 3 al procesador CSS mantenido.
module.exports = {
  process (css, options) {
    return postcss([cssnano({preset: ['default', {svgo: false}]})]).process(css, options)
  }
}
