'use strict'
// Backports acotados al compilador legado; una versión desconocida detiene el build.
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const hash = value => crypto.createHash('sha256').update(value).digest('hex')
const applied = []
const patchedHashes = {
  'html-webpack-plugin/lib/loader.js': 'e1a99555bc437113dcf75363076d3789351c967038ffc97ae7b709967160b33f',
  'babel-traverse/lib/path/evaluation.js': 'c848b35a5e4f457ceeb09c50742b4f84350179306cedc389ed8e60d04a677207',
  'html-minifier/src/htmlminifier.js': '5b5dd382e245b9780aed12fac42bc0b44ffcd65ea7f20e035bd0fd54ee1d5e43',
  'tar-simditor-markdown': '7ded3c9e4323d9cb74675b0ce5221ce9d3beca4d7c32b3dfe12544777e692943',
  'webpack-dev-middleware/lib/GetFilenameFromUrl.js': 'e120e401047640537bd476d11897677e22f10756a61b6caaca684de7e13b5f4f',
  'postcss@5.2.18': '2cf90ea010e69071cff2db4f37f78880a84683951ab3ca80c81177b876679524',
  'postcss@6.0.23': '2fbb986adc3ffb059b5e2b4e6c0f9c8aa7677bd6bc04cb95ffa3069c6538e5ad',
  'postcss@8.4.33': 'c61ba9314bd58ce7f21a07ec1081b84b75ea15eab17f1b7f56e2a830bc40b934'
}
function patch (module, originalHash, marker, transform, resolvedFile) {
  const file = resolvedFile || require.resolve(module)
  let source = fs.readFileSync(file, 'utf8')
  if (!source.includes(marker)) {
    if (hash(source) !== originalHash) throw new Error('Dependencia no reconocida: ' + module)
    source = transform(source)
    if (!source.includes(marker)) throw new Error('No se pudo aplicar el backport: ' + module)
    if (hash(source) !== patchedHashes[module]) throw new Error('Resultado de backport inesperado: ' + module)
    fs.writeFileSync(file, source)
  }
  if (hash(source) !== patchedHashes[module]) throw new Error('Dependencia modificada después del backport: ' + module)
  applied.push({module, file: path.relative(path.join(__dirname, '..'), file), sha256: hash(source), marker})
}
patch('babel-traverse/lib/path/evaluation.js', '9a5c8f493f06793e30c58bf2b9b8e4105f87775f41897029b74d86f6752032a5', 'LIZARD_NO_STATIC_CALLS',
  source => source.replace('if (path.isCallExpression()) {', 'if (false && path.isCallExpression()) { // LIZARD_NO_STATIC_CALLS'))
patch('html-minifier/src/htmlminifier.js', '7249ce8c391218f92c1d2e40f533a8c88c96724e5ca8d8289c61cf7e5315b5f7', 'LIZARD_NO_CUSTOM_FRAGMENTS',
  source => source.replace('exports.minify = function(value, options) {', 'exports.minify = function(value, options) {\n  options = Object.assign({}, options, {ignoreCustomFragments: []}); // LIZARD_NO_CUSTOM_FRAGMENTS'))
patch('tar-simditor-markdown', 'a102a75233903f9988556b3f32ebb0da8d3fe739a5e4e1e5114d0873f1b3e746', 'LIZARD_MARKED_API',
  source => source.replace('markdownText = marked(text);', 'markdownText = (marked.marked || marked)(text); // LIZARD_MARKED_API'))
patch('html-webpack-plugin/lib/loader.js', '6ade1ed4a91ea0eea7926b205793d2b9677c0dbe4faf75b511e6ce33547a63a4', 'LIZARD_LOADER_OPTIONS',
  source => source.replace('var options = loaderUtils.parseQuery(this.query);', 'var options = loaderUtils.getOptions(this) || {}; // LIZARD_LOADER_OPTIONS'))
patch('webpack-dev-middleware/lib/GetFilenameFromUrl.js', '7b623039fe4c2f07810de38331bd63197637f9a10198c3ef0ce33dd00a20bd52', 'LIZARD_CONTAINED_OUTPUT',
  source => source.replace('return getFilenameFromUrl(paths.publicPath, paths.outputPath, url);', `
  // LIZARD_CONTAINED_OUTPUT: validar el prefijo y la ruta ya decodificada antes de acceder a disco.
  var prefix = urlParse(paths.publicPath || '/').pathname;
  var pathname = urlParse(url).pathname;
  if (prefix.slice(-1) !== '/' && pathname !== prefix && pathname.indexOf(prefix + '/') !== 0) return false;
  var filename = getFilenameFromUrl(paths.publicPath, paths.outputPath, url);
  if (!filename || filename.indexOf('\\0') !== -1) return false;
  var path = require('path');
  var root = path.resolve(paths.outputPath);
  var full = path.resolve(filename);
  if (full !== root && full.indexOf(root + path.sep) !== 0) return false;
  return full;`))

const mapHashes = {
  '5.2.18': '972b07bfb5150203bdfed8e500a2663f80f6e27f9abd63e9a0d3380d556d8274',
  '6.0.23': '0f616602e52175ebf360c2c33d56c7fed1317f247560e9dbed69ff222497ed99',
  '8.4.33': 'b3f2473a8cfe24301d41dbccefd7d3b6434fe22d6cf93e6807810160523cc538'
}
function inspectPackages (directory) {
  if (!fs.existsSync(directory)) return
  for (const name of fs.readdirSync(directory)) {
    if (name.startsWith('.')) continue
    const folder = path.join(directory, name)
    if (!fs.lstatSync(folder).isDirectory()) continue
    if (name.startsWith('@')) { inspectPackages(folder); continue }
    const metadata = path.join(folder, 'package.json')
    if (!fs.existsSync(metadata)) continue
    const pkg = JSON.parse(fs.readFileSync(metadata, 'utf8'))
    if (pkg.name === 'postcss' && mapHashes[pkg.version]) {
      patch('postcss@' + pkg.version, mapHashes[pkg.version], 'LIZARD_NO_AUTO_MAP_FILES', source => source + `
// LIZARD_NO_AUTO_MAP_FILES: solo mapas inline o prev explícito de la configuración de confianza.
var LizardPreviousMap = module.exports.default || module.exports;
var lizardLoadMap = LizardPreviousMap.prototype.loadMap;
LizardPreviousMap.prototype.loadMap = function() {
  if (typeof this.annotation === 'string' && !/^data:/i.test(this.annotation)) this.annotation = undefined;
  return lizardLoadMap.apply(this, arguments);
};
`, path.join(folder, 'lib/previous-map.js'))
    } else if (pkg.name === 'postcss' && !require('semver').gte(pkg.version, '8.5.18')) {
      throw new Error('PostCSS sin backport reconocido: ' + pkg.version)
    }
    inspectPackages(path.join(folder, 'node_modules'))
  }
}
inspectPackages(path.join(__dirname, '../node_modules'))
fs.writeFileSync(path.join(__dirname, '../node_modules/.lizard-security-patches.json'), JSON.stringify(applied, null, 2))
console.log('Backports del compilador y compatibilidad del editor verificados.')
