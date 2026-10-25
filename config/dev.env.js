// El SHA lo suministra CI; el desarrollo local también funciona sin Git.
const revision = process.env.APP_REVISION || 'desarrollo'
const version = require('fs').readFileSync(require('path').join(__dirname, '../VERSION'), 'utf8').trim()
module.exports = {
  NODE_ENV: '"development"',
  VERSION: JSON.stringify(revision),
  APP_VERSION: JSON.stringify(version),
  PUBLIC_SENTRY_DSN: JSON.stringify(process.env.PUBLIC_SENTRY_DSN || ''),
  USE_SENTRY: process.env.PUBLIC_SENTRY_DSN ? '1' : '0'
}
