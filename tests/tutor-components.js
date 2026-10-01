/* Pruebas de estado con los componentes Vue reales y transporte HTTP simulado. */
const assert = require('assert')
const fs = require('fs')
const path = require('path')
const Module = require('module')
const babel = require('babel-core')
require('babel-polyfill')
const Vue = require('vue')
const axios = require('axios')
const root = path.resolve(__dirname, '..')

const resolve = Module._resolveFilename
Module._resolveFilename = function (request, parent, ...rest) {
  return resolve.call(this, request.startsWith('@/') ? path.join(root, 'src', request.slice(2)) : request, parent, ...rest)
}
const compile = source => babel.transform(source, {babelrc: false, presets: ['env', 'stage-2']}).code
require.extensions['.vue'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8').match(/<script>([\s\S]*?)<\/script>/)[1]
  module._compile(compile(source), filename)
}
const originalJS = require.extensions['.js']
require.extensions['.js'] = (module, filename) => {
  if (filename === path.join(root, 'src/utils/tutorApi.js')) {
    module._compile(compile(fs.readFileSync(filename, 'utf8')), filename)
  } else {
    originalJS(module, filename)
  }
}

let calls, handler
axios.defaults.adapter = config => {
  const call = {url: config.url, method: config.method, params: config.params, data: config.data && JSON.parse(config.data)}
  calls.push(call)
  return Promise.resolve().then(() => handler(call)).then(data => ({data: {error: null, data}, status: 200, config, headers: {}}))
}
const TrainingSession = require('../src/pages/oj/components/TrainingSession.vue').default
const TrainingConfig = require('../src/pages/admin/components/TrainingConfig.vue').default
const tick = async () => { for (let i = 0; i < 50; i++) await Promise.resolve(); await Vue.nextTick() }
const session = {id: '12345678-1234-4234-8234-123456789012', problem_id: 1, state: 'active', highest_help_level: 0,
  created_at: '2026-09-30T10:00:00Z', updated_at: '2026-09-30T10:00:00Z', attempts: [], attempt_count: 0}
const make = (component, props) => new (Vue.extend(component))({propsData: props, mocks: {},
  beforeCreate () { this.$t = key => key }})
const setup = fn => { calls = []; handler = fn }

async function main () {
  setup(call => call.url.endsWith('availability') ? {enabled: true, can_start: true} : null)
  let vm = make(TrainingSession, {problemId: 1, userId: 7})
  await tick()
  assert.strictEqual(vm.session, null)
  assert(!calls.some(c => c.method === 'post'), 'Consultar no debe crear sesión')
  vm.$destroy()

  setup(call => { assert(call.url.endsWith('availability')); return {enabled: true, can_start: false} })
  vm = make(TrainingSession, {problemId: 1, userId: null})
  await tick()
  assert.strictEqual(calls.length, 1, 'Visitante no consulta sesiones privadas')
  vm.$destroy()

  setup(call => call.url.endsWith('availability') ? {enabled: true, can_start: true} : session)
  vm = make(TrainingSession, {problemId: 1, userId: 7})
  await tick()
  assert.strictEqual(vm.session.id, session.id)
  assert(calls.some(c => c.method === 'post' && c.url.endsWith('session')), 'Recuperar reconcilia intentos')
  vm.$destroy()

  setup(call => {
    if (call.url.endsWith('availability')) return {enabled: true, can_start: true}
    if (call.url.endsWith('attempt')) throw new Error('Red no disponible')
    return session
  })
  vm = make(TrainingSession, {problemId: 1, userId: 7})
  await tick()
  await vm.registerSubmission('entrega-final', -1)
  assert(vm.error, 'El fallo de registro debe ser recuperable')
  assert.strictEqual(vm.session.id, session.id)
  await vm.registerSubmission('pendiente', 6)
  assert.strictEqual(calls.filter(c => c.url.endsWith('attempt')).length, 1, 'No registrar pendiente')
  vm.$destroy()

  let release
  setup(call => {
    if (call.params && call.params.problem_id === 1) return new Promise(resolve => { release = resolve })
    return call.url.endsWith('availability') ? {enabled: false, can_start: false} : null
  })
  vm = make(TrainingSession, {problemId: 1, userId: 7})
  await tick()
  vm.problemId = 2
  await tick()
  release({enabled: true, can_start: true})
  await tick()
  assert.strictEqual(vm.session, null)
  assert.strictEqual(vm.availability.enabled, false, 'Respuesta de problema anterior no debe restaurar estado')
  vm.$destroy()

  setup(call => call.method === 'put' ? {problem_id: 1, enabled: true} : {problem_id: 1, enabled: false})
  vm = make(TrainingConfig, {problemId: 1})
  await tick()
  vm.enabled = true
  await vm.save()
  assert.deepStrictEqual(calls.find(c => c.method === 'put').data, {problem_id: 1, enabled: true})
  assert.strictEqual(vm.enabled, true)
  vm.$destroy()
  console.log('6 pruebas de componentes del tutor: OK')
}
main().catch(error => { console.error(error); process.exitCode = 1 })
