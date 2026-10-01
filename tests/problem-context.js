/* Regresión de navegación: se ejecutan los métodos originales de Problem.vue. */
const assert = require('assert')
const fs = require('fs')
const vm = require('vm')
const babel = require('babel-core')
const Vuex = require('vuex')
const source = fs.readFileSync(require('path').join(__dirname, '../src/pages/oj/views/problem/Problem.vue'), 'utf8')
  .match(/<script>([\s\S]*?)<\/script>/)[1]
// Las dependencias visuales no participan en estos métodos; solo el transporte es simulado.
const code = babel.transform(source, {
  babelrc: false,
  presets: ['env', 'stage-2'],
  plugins: [() => ({visitor: {ImportDeclaration: node => node.remove()}})]
}).code
let resolveSubmit
const sandbox = {
  exports: {}, ...Vuex,
  types: {}, CodeMirror: {}, AnimatedNumber: {}, storage: {}, FormMixin: {},
  JUDGE_STATUS: {}, CONTEST_STATUS: {}, buildProblemCodeKey: () => '',
  TrainingSession: {}, pie: {}, largePie: {}, getItemColor: () => '', getDefaultTemplate: () => '',
  clearTimeout, setTimeout,
  api: {submitCode: () => new Promise(resolve => { resolveSubmit = resolve })}
}
vm.runInNewContext(code, sandbox)
const view = sandbox.exports.default
const make = () => ({
  refreshStatus: null, problemContext: 0, submissionId: 'entrega-anterior', submitted: true, submitting: true, statusVisible: true,
  submissionExists: true, result: {result: 6}, problem: {id: 1}, $route: {fullPath: '/problem/A'},
  code: 'código de prueba', language: 'C', contestID: null, captchaRequired: false, contestRuleType: 'ACM',
  init () {},
  checkSubmissionStatus () { this.submitted = true }
})
async function main () {
  let context = make()
  view.watch.$route.call(context)
  assert.strictEqual(context.submitted, false, 'Navegar durante juicio debe permitir enviar en el nuevo problema')
  assert.strictEqual(context.submitting, false)
  assert.strictEqual(context.statusVisible, false)
  context = make()
  context.submitted = false
  view.methods.submitCode.call(context)
  context.$route.fullPath = '/problem/B'
  view.watch.$route.call(context)
  context.problem.id = 2
  resolveSubmit({data: {data: {submission_id: 'entrega-del-problema-A'}}})
  for (let i = 0; i < 10; i++) await Promise.resolve()
  assert.strictEqual(context.submissionId, '', 'La respuesta tardía no debe introducir una entrega de otro contexto')
  assert.strictEqual(context.submitted, false)
  console.log('2 pruebas de navegación durante envío: OK')
}
main().catch(error => { console.error(error); process.exitCode = 1 })
