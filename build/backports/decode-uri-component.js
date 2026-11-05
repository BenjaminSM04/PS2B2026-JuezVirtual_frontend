'use strict'
// GHSA-qr28-fpjm-wq7f: el respaldo de decode-uri-component 0.2.2 reemplaza en tiempo
// cuadrático. La 0.5.1 corregida es solo ESM; se sustituye el respaldo por uno lineal.
module.exports = source => source.replace(
  'return customDecodeURIComponent(encodedURI);',
  'return lizardLinearDecode(encodedURI); // LIZARD_LINEAR_URI_DECODE'
) + `
// LIZARD_LINEAR_URI_DECODE: cada secuencia %XX se decodifica una sola vez.
function lizardLinearDecode(input) {
\treturn input.replace(/(%[a-f0-9]{2})+/gi, function (run) {
\t\ttry {
\t\t\treturn decodeURIComponent(run);
\t\t} catch (err) {
\t\t\treturn run.replace(/%[a-f0-9]{2}/gi, function (one) {
\t\t\t\ttry {
\t\t\t\t\treturn decodeURIComponent(one);
\t\t\t\t} catch (err2) {
\t\t\t\t\treturn '\\uFFFD';
\t\t\t\t}
\t\t\t});
\t\t}
\t});
}
`
