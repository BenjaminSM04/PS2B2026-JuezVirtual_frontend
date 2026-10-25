'use strict'
const fs = require('fs')
const path = require('path')
const {spawnSync} = require('child_process')
const policy = require('../docs/seguridad/excepciones-compilacion.json')
const audit = spawnSync('yarn', ['audit', '--json'], {encoding: 'utf8', maxBuffer: 32 * 1024 * 1024, timeout: 120000})
if (audit.error || audit.signal) throw audit.error || new Error('Auditoría interrumpida')
const records = audit.stdout.split('\n').filter(Boolean).map(line => JSON.parse(line))
const summary = records.find(item => item.type === 'auditSummary')
if (!summary || records.some(item => item.type === 'error')) throw new Error('Auditoría incompleta')
const now = new Date().toISOString().slice(0, 10)
const findings = []
for (const item of records.filter(item => item.type === 'auditAdvisory')) {
  const advisory = item.data.advisory
  for (const group of advisory.findings) {
    for (const route of group.paths) findings.push({id: advisory.id, module: advisory.module_name, version: group.version, path: route, severity: advisory.severity, url: advisory.url})
  }
}
const unique = Array.from(new Map(findings.map(item => [JSON.stringify(item), item])).values())
const failed = unique.filter(item => ['high', 'critical'].includes(item.severity)).filter(item => {
  const exception = policy.exceptions.find(entry => entry.id === item.id && entry.module === item.module && entry.version === item.version && entry.paths.includes(item.path))
  return !exception || exception.expires < now || !exception.backport || !exception.test
})
fs.writeFileSync(path.join(__dirname, '../audit-result.json'), JSON.stringify({checked_at: now, summary: summary.data, findings: unique, unhandled: failed}, null, 2))
if (failed.length) throw new Error('Alertas altas/críticas nuevas, cambiadas o vencidas: ' + failed.map(item => item.module + '@' + item.version + ':' + item.id).join(', '))
// La excepción exige además que pasen la integridad y las regresiones del backport.
const tests = spawnSync(process.execPath, [path.join(__dirname, '../tests/build-security.js')], {stdio: 'inherit'})
if (tests.status !== 0) process.exit(tests.status || 1)
console.log('Auditoría completa: ' + JSON.stringify(summary.data.vulnerabilities) + '. Backports acotados vigentes; consultar audit-result.json y docs/seguridad.')
