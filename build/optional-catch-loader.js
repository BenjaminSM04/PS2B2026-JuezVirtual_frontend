'use strict'
// Babel 6 no reconoce `catch {` (ES2019) que usa la fuente de vue-cropper; se le da un parámetro.
module.exports = function (source) {
  return source.replace(/\bcatch\s*\{/g, 'catch (lizardError) {')
}
