// Metadatos públicos de la imagen, sin secretos de ejecución.
const fs = require('fs')
const path = require('path')
fs.writeFileSync(path.join(__dirname, '../dist/version.json'),
  JSON.stringify({revision: process.env.APP_REVISION || 'desarrollo'}) + '\n')
