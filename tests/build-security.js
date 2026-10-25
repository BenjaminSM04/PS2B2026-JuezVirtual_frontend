'use strict'
const assert = require('assert')
const fs = require('fs')
const crypto = require('crypto')
const path = require('path')
const state = JSON.parse(fs.readFileSync(path.join(__dirname, '../node_modules/.lizard-security-patches.json')))
for (const entry of state) {
  const source = fs.readFileSync(path.join(__dirname, '..', entry.file))
  assert.strictEqual(crypto.createHash('sha256').update(source).digest('hex'), entry.sha256)
  assert(source.toString().includes(entry.marker))
}
const parse = require('babylon').parse
const traverse = require('babel-traverse').default
global.__lizard_eval_probe = false
traverse(parse('String({toString: Number.constructor("global.__lizard_eval_probe = true")})'), {
  CallExpression (node) { node.evaluate() }
})
assert.strictEqual(global.__lizard_eval_probe, false, 'El compilador no ejecuta llamadas al evaluar constantes')
const minify = require('html-minifier').minify
const started = Date.now()
assert.strictEqual(minify('<p>Texto seguro</p>', {collapseWhitespace: true}), '<p>Texto seguro</p>')
let rejected = false
try { minify('<p>Texto seguro</p>' + '<% '.repeat(5000), {collapseWhitespace: true}) } catch (error) { rejected = true }
assert(rejected, 'La plantilla inválida se rechaza de forma controlada')
assert(Date.now() - started < 5000, 'El minificador no recorre el patrón vulnerable de fragmentos personalizados')
const filename = require('webpack-dev-middleware/lib/GetFilenameFromUrl')
const root = path.resolve('/tmp/lizard-build-output')
for (const prefix of ['/assets', '/assets/']) {
  for (const url of ['/assets/..%2fsecret', '/assets/%2e%2e%2fsecret', '/assets../secret']) {
    assert.strictEqual(filename(prefix, {outputPath: root}, url), false, url)
  }
  assert.strictEqual(filename(prefix, {outputPath: root}, '/assets/main.js'), path.join(root, 'main.js'))
}
for (const entry of state.filter(item => item.marker === 'LIZARD_NO_AUTO_MAP_FILES')) {
  const PreviousMap = require(path.join(__dirname, '..', entry.file))
  const original = PreviousMap.prototype.loadMap
  let observed
  PreviousMap.prototype.loadMap = function () { observed = this.annotation; return original.apply(this, arguments) }
  // Interceptar también existsSync detecta accesos incluso si el fichero objetivo no existe.
  const exists = fs.existsSync
  let accesses = 0
  fs.existsSync = () => { accesses++; return false }
  try {
    new PreviousMap('p{} /*# sourceMappingURL=../../private.map */', {from: '/tmp/input.css'}) // eslint-disable-line no-new
    assert.strictEqual(accesses, 0, entry.module + ': no lee mapas de comentarios')
    const map = {version: 3, sources: [], names: [], mappings: ''}
    assert.deepStrictEqual(JSON.parse(new PreviousMap('p{}', {map: {prev: map}}).text), map)
  } finally { fs.existsSync = exists; PreviousMap.prototype.loadMap = original }
  assert.strictEqual(typeof observed, 'undefined')
}
console.log('Backports de Babel, HTML, rutas y mapas CSS: OK')
