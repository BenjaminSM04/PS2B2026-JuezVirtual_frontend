/* Pruebas de reintentos, respuestas tardías y estado autorizado por servidor. */
const assert = require('assert')
const fs = require('fs')
const path = require('path')
const Module = require('module')
const babel = require('babel-core')
const Vue = require('vue')
const axios = require('axios')
require('babel-polyfill')
global.window = {crypto: require('crypto').webcrypto}
const root = path.resolve(__dirname, '..')
const resolve = Module._resolveFilename
Module._resolveFilename = function (request, parent, ...rest) {
  return resolve.call(this, request.startsWith('@/') ? path.join(root, 'src', request.slice(2)) : request, parent, ...rest)
}
const compile = source => babel.transform(source, {babelrc: false, presets: ['env', 'stage-2']}).code
require.extensions['.vue'] = (module, file) => module._compile(compile(fs.readFileSync(file, 'utf8').match(/<script>([\s\S]*?)<\/script>/)[1]), file)
const originalJS = require.extensions['.js']
require.extensions['.js'] = (module, file) => {
  if (file === path.join(root, 'src/utils/tutorApi.js')) module._compile(compile(fs.readFileSync(file, 'utf8')), file)
  else originalJS(module, file)
}
let calls = [], handler
axios.defaults.adapter = config => {
  const call = {url: config.url, method: config.method, data: config.data && JSON.parse(config.data), params: config.params}
  calls.push(call)
  return Promise.resolve().then(() => handler(call)).then(data => ({data: {error: null, data}, status: 200, config, headers: {}}))
}
const Tutor = require('../src/pages/oj/views/problem/components/TutorPanel.vue').default
const Pedagogy = require('../src/pages/admin/components/PedagogyConfig.vue').default
const make = (component, props) => new (Vue.extend(component))({propsData: props, beforeCreate () { this.$t = key => key }})
const tick = async () => { for (let i = 0; i < 50; i++) await Promise.resolve(); await Vue.nextTick() }
const session = () => ({id: '12345678-1234-4234-8234-123456789012', feedback: [], concepts: ['Sumas'], highest_help_level: 0, allowed_help_level: 1, attempt_count: 1})

async function main () {
  calls = []
  let attempts = 0
  handler = () => { if (++attempts === 1) throw new Error('Fallo recuperable'); return {id: 'respuesta', content: 'Orientación', rating: null} }
  let vm = make(Tutor, {session: session()})
  await vm.ask('explain')
  assert(vm.error)
  await vm.ask('explain')
  assert.strictEqual(calls[0].data.request_id, calls[1].data.request_id, 'Un reintento conserva su clave de idempotencia')
  assert.strictEqual(vm.session.highest_help_level, 0, 'El navegador no escribe el nivel')
  handler = call => ({feedback_id: call.data.feedback_id, value: call.data.value})
  await vm.rate('useful')
  assert.strictEqual(vm.response.rating, 'useful')
  vm.$destroy()

  calls = []
  let release
  handler = () => new Promise(resolve => { release = resolve })
  vm = make(Tutor, {session: session()})
  const pending = vm.ask('explain')
  await tick()
  vm.$destroy()
  release({id: 'tardia', content: 'Respuesta de otra vista'})
  await pending
  assert.strictEqual(vm.response, null, 'Una respuesta tardía no restaura la vista destruida')

  calls = []
  const state = session()
  state.feedback = [{id: 'previa', action: 'hint', level: 1, content: 'Concepto previo'}]
  vm = make(Tutor, {session: state})
  vm.hint(1)
  assert.strictEqual(vm.response.id, 'previa')
  assert.strictEqual(calls.length, 0, 'Releer una pista no genera otra respuesta')
  vm.$destroy()

  calls = []
  handler = call => call.params && call.params.problem_id === 2 ? [{id: 20, status: 'draft'}] : []
  vm = make(Pedagogy, {problemId: 1})
  await tick()
  vm.selected = 10
  let old
  handler = call => {
    if (call.method === 'post') return {id: 10}
    if (call.params.problem_id === 1) return new Promise(resolve => { old = resolve })
    return [{id: 20, status: 'draft'}]
  }
  const activation = vm.activate()
  await tick()
  vm.problemId = 2
  await tick()
  old([{id: 10, status: 'active'}])
  await activation
  assert.strictEqual(vm.versions[0].id, 20, 'Cambiar de problema conserva la configuración de la vista nueva')
  vm.$destroy()
  console.log('5 pruebas adicionales de tutor y edición pedagógica: OK')
}
main().catch(error => { console.error(error); process.exitCode = 1 })
