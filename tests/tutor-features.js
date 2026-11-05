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
  // Un manejador puede devolver {envelope} para simular el formato {error, data} del proyecto.
  return Promise.resolve().then(() => handler(call)).then(data => ({data: data && data.envelope ? data.envelope : {error: null, data}, status: 200, config, headers: {}}))
}
const Tutor = require('../src/pages/oj/views/problem/components/TutorPanel.vue').default
const Pedagogy = require('../src/pages/admin/components/PedagogyConfig.vue').default
const make = (component, props) => new (Vue.extend(component))({propsData: props, beforeCreate () { this.$t = key => key }})
const failWith = (status, body) => Object.assign(new Error('Request failed with status code ' + status), {response: {status, data: body, headers: {}}})
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

  // Propuesta con IA del docente: solo rellena el formulario y nunca guarda por sí sola.
  const proposal = () => ({schema_version: '1.0', concepts: ['Bucles', ' Acumuladores ', 'Bucles'], concept_explanations: {Bucles: 'Repetir pasos.', Acumuladores: 'Guardan un total.'},
    hint_policy: {max_help_level: 3, hints: {concept: 'Piensa en repetir.', location: 'Revisa el ciclo principal.', strategy: 'Suma en cada vuelta.'}}})
  const fresh = async () => {
    calls = []
    handler = () => []
    const view = make(Pedagogy, {problemId: 7})
    await tick()
    view.confirms = []
    view.$confirm = (...args) => { view.confirms.push(args); return Promise.resolve('confirm') }
    return view
  }
  const posts = () => calls.filter(call => call.method === 'post')

  vm = await fresh()
  handler = call => { assert(call.url.endsWith('admin/ai_tutor/config/suggest')); return proposal() }
  calls = []
  await vm.suggest()
  assert.deepStrictEqual(calls.map(call => [call.method, call.url, call.data]), [['post', 'admin/ai_tutor/config/suggest', {problem_id: 7}]], 'La propuesta envía solo el problema')
  assert.strictEqual(vm.confirms.length, 0, 'Un formulario vacío no pide confirmación')
  assert.deepStrictEqual(vm.concepts, [{name: 'Bucles', explanation: 'Repetir pasos.'}, {name: 'Acumuladores', explanation: 'Guardan un total.'}], 'Conceptos limpios y sin repetidos')
  assert.strictEqual(vm.hints.location, 'Revisa el ciclo principal.')
  assert.strictEqual(vm.message, 'm.Tutor_ai_done')
  assert.strictEqual(vm.error, '')
  assert.strictEqual(vm.busy || vm.suggesting, false, 'La carga termina')
  assert.strictEqual(posts().length, 1, 'La propuesta no crea ni activa versiones')
  vm.$destroy()

  vm = await fresh()
  vm.concepts = [{name: 'Mi concepto', explanation: ''}]
  handler = () => { throw new Error('No debe llamarse al cancelar') }
  vm.$confirm = () => Promise.reject(new Error('cancel'))
  calls = []
  await vm.suggest()
  assert.strictEqual(calls.length, 0, 'Cancelar la confirmación no llama a la IA')
  assert.strictEqual(vm.concepts[0].name, 'Mi concepto', 'Cancelar conserva lo escrito')
  vm.$confirm = (...args) => { vm.confirms.push(args); return Promise.resolve('confirm') }
  handler = proposal
  await vm.suggest()
  assert.strictEqual(vm.confirms.length, 1, 'Con texto escrito se pide confirmación antes de reemplazar')
  assert.strictEqual(vm.concepts[0].name, 'Bucles')
  vm.$destroy()

  vm = await fresh()
  vm.hints.concept = 'Pista escrita a mano'
  assert.strictEqual(vm.hasContent, true, 'Una pista escrita también cuenta como contenido')
  vm.$destroy()

  for (const [label, failure, expected] of [
    ['envelope', () => ({envelope: {error: 'tutor-suggest-unavailable', data: 'Sin proveedor'}}), 'm.Tutor_ai_unavailable'],
    ['http', () => { throw failWith(503, {error: 'tutor-suggest-unavailable', data: 'Sin proveedor'}) }, 'm.Tutor_ai_unavailable'],
    ['otro error', () => { throw failWith(500, {error: 'error', data: 'Fallo interno del servidor'}) }, 'Fallo interno del servidor'],
    ['incompleta', () => ({schema_version: '1.0', concepts: ['Solo uno'], hint_policy: {hints: {concept: 'a'}}}), 'm.Tutor_ai_incomplete'],
    ['vacía', () => null, 'm.Tutor_ai_incomplete'],
    ['tiempo agotado', () => { throw Object.assign(new Error('timeout of 45000ms exceeded'), {code: 'ECONNABORTED'}) }, 'm.Tutor_ai_timeout']
  ]) {
    vm = await fresh()
    vm.concepts = [{name: 'Intacto', explanation: 'x'}]
    handler = failure
    await vm.suggest()
    assert.strictEqual(vm.error, expected, 'Error de propuesta (' + label + ')')
    assert.strictEqual(vm.message, '')
    assert.strictEqual(vm.concepts[0].name, 'Intacto', 'Un fallo no borra el formulario (' + label + ')')
    assert.strictEqual(vm.busy || vm.suggesting, false, 'Un fallo libera el formulario (' + label + ')')
    vm.$destroy()
  }

  vm = await fresh()
  handler = () => ({concepts: ['N'.repeat(400)].concat(Array.from({length: 40}, (_, i) => 'C' + i)), concept_explanations: {['N'.repeat(300)]: 'E'.repeat(3000)},
    hint_policy: {hints: {concept: 'H'.repeat(1500), location: 'l', strategy: 's'}}})
  await vm.suggest()
  assert.strictEqual(vm.concepts.length, 30, 'Máximo de 30 conceptos como el formulario')
  assert.strictEqual(vm.concepts[0].name.length, 300)
  assert.strictEqual(vm.concepts[0].explanation.length, 2000)
  assert.strictEqual(vm.hints.concept.length, 1200)
  vm.$destroy()

  vm = await fresh()
  vm.selected = 5
  vm.versions = [{id: 5, status: 'draft', concepts: [], hint_policy: {hints: {}}}]
  handler = proposal
  await vm.suggest()
  assert.strictEqual(vm.selected, '', 'Una propuesta es una versión nueva: no activa un borrador anterior por error')
  vm.$destroy()

  let late
  vm = await fresh()
  handler = () => new Promise(resolve => { late = resolve })
  const slow = vm.suggest()
  await tick()
  assert.strictEqual(vm.suggesting, true, 'Mientras espera muestra el estado de carga')
  handler = () => []
  vm.problemId = 8
  await tick()
  late(proposal())
  await slow
  assert.strictEqual(vm.concepts[0].name, '', 'Una propuesta tardía no pisa el formulario de otro problema')
  assert.strictEqual(vm.message, '')
  assert.strictEqual(vm.suggesting, false)
  vm.$destroy()

  vm = await fresh()
  handler = () => new Promise(resolve => { late = resolve })
  const abandoned = vm.suggest()
  await tick()
  vm.$destroy()
  late(proposal())
  await abandoned
  assert.strictEqual(vm.concepts[0].name, '', 'Una propuesta tardía no llega a una vista destruida')
  console.log('Pruebas del tutor, edición pedagógica y propuesta con IA: OK')
}
main().catch(error => { console.error(error); process.exitCode = 1 })
