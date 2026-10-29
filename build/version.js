// Versión y notas del repositorio exacto que se compila; sin red ni secretos.
const fs = require('fs')
const path = require('path')

function releaseManifest (root, revision = process.env.APP_REVISION || 'desarrollo') {
  const version = fs.readFileSync(path.join(root, 'VERSION'), 'utf8').trim()
  if (!/^\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?$/.test(version)) throw new Error('VERSION inválida')
  const text = fs.readFileSync(path.join(root, 'CHANGELOG.md'), 'utf8')
  if (Buffer.byteLength(text) > 131072) throw new Error('CHANGELOG demasiado grande')
  const repository = 'https://github.com/incubadoradesarrollo-source/F-LIZARD-JUDGE'
  const ref = /^[a-f0-9]{40}$/.test(revision) ? revision : 'main'
  const sourceUrl = repository + '/blob/' + ref + '/CHANGELOG.md'
  const releases = []
  let current = null
  let section = ''
  text.split(/\r?\n/).forEach(line => {
    if (line.startsWith('## ')) {
      current = null
      section = ''
      const match = line.match(/^## \[(\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?)\](?: - (\d{4}-\d{2}-\d{2}))?$/)
      if (match && releases.length < 12) {
        current = {version: match[1], title: 'LizardJudge ' + match[1], date: match[2] || '', details: [],
          source_url: sourceUrl, is_current: match[1] === version}
        releases.push(current)
      }
    } else if (line.startsWith('### ')) {
      section = line.slice(4).trim()
    } else if (current && line.startsWith('- ')) {
      current.details.push((section ? section + ': ' : '') + line.slice(2).trim())
    }
  })
  return {local_version: version, revision, source_url: sourceUrl, update: releases}
}

function writeVersion () {
  const root = path.join(__dirname, '..')
  const notes = releaseManifest(root)
  fs.mkdirSync(path.join(root, 'dist'), {recursive: true})
  fs.writeFileSync(path.join(root, 'dist/version.json'), JSON.stringify({revision: notes.revision, version: notes.local_version}) + '\n')
  fs.writeFileSync(path.join(root, 'dist/release-notes.json'), JSON.stringify(notes) + '\n')
}
if (require.main === module) writeVersion()
module.exports = {releaseManifest, writeVersion}
