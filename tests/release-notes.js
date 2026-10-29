// Regresión: el historial procede de los archivos del checkout, no de la interfaz.
const assert = require('assert')
const fs = require('fs')
const path = require('path')
const os = require('os')
const {releaseManifest} = require('../build/version')
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lizard-release-'))
try {
  fs.writeFileSync(path.join(root, 'VERSION'), '2.0.0\n')
  const changelog = '## [Unreleased]\n- Borrador\n## [2.0.0] - 2026-10-25\n### Correo\n- Primer cambio\n'
  fs.writeFileSync(path.join(root, 'CHANGELOG.md'), changelog)
  const result = releaseManifest(root, 'a'.repeat(40))
  assert.strictEqual(result.local_version, '2.0.0')
  assert.strictEqual(result.update.length, 1)
  assert.deepStrictEqual(result.update[0].details, ['Correo: Primer cambio'])
  assert.strictEqual(result.update[0].is_current, true)
  assert(result.source_url.includes('/blob/' + 'a'.repeat(40) + '/CHANGELOG.md'))
  fs.writeFileSync(path.join(root, 'CHANGELOG.md'), changelog.replace('Primer cambio', 'Cambio editado'))
  assert.deepStrictEqual(releaseManifest(root).update[0].details, ['Correo: Cambio editado'])
  fs.writeFileSync(path.join(root, 'VERSION'), '../../invalido')
  assert.throws(() => releaseManifest(root))
  console.log('OK: versión y notas derivadas del repositorio y revisión exacta.')
} finally {
  fs.rmSync(root, {recursive: true})
}
