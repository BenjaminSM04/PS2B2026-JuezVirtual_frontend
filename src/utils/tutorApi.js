import axios from 'axios'

// Transporte independiente: un fallo del tutor no altera el flujo del juez.
const client = axios.create({
  baseURL: '/api',
  xsrfHeaderName: 'X-CSRFToken',
  xsrfCookieName: 'csrftoken'
})

// El código del backend (p. ej. tutor-suggest-unavailable) o de axios (timeout) viaja en error.code.
function failure (message, code) {
  const error = new Error(message)
  if (code) error.code = code
  return error
}

function request (url, method, options = {}) {
  return client({url, method, ...options}).then(response => {
    if (response.data.error !== null) {
      throw failure(response.data.data || 'No se pudo completar la operación de entrenamiento.', response.data.error)
    }
    return response.data.data
  }, error => {
    const data = error.response && error.response.data
    throw failure((data && data.data) || error.message || 'No se pudo conectar con el entrenamiento.', (data && data.error) || error.code)
  })
}

export default {
  availability: problemId => request('ai_tutor/availability', 'get', {params: {problem_id: problemId}}),
  readSession: problemId => request('ai_tutor/session', 'get', {params: {problem_id: problemId}}),
  recoverSession: problemId => request('ai_tutor/session', 'post', {data: {problem_id: problemId}}),
  registerAttempt: (sessionId, submissionId) => request('ai_tutor/attempt', 'post', {data: {session_id: sessionId, submission_id: submissionId}}),
  feedback: data => request('ai_tutor/feedback', 'post', {data}),
  rate: (feedbackId, value) => request('ai_tutor/rating', 'post', {data: {feedback_id: feedbackId, value}}),
  mascot: () => request('mascot', 'get'),
  updateMascot: data => request('mascot', 'patch', {data}),
  overview: () => request('practice/overview', 'get'),
  versions: problemId => request('admin/ai_tutor/config/versions', 'get', {params: {problem_id: problemId}}),
  createVersion: data => request('admin/ai_tutor/config/versions', 'post', {data}),
  activateVersion: (problemId, versionId) => request('admin/ai_tutor/config/activate', 'post', {data: {problem_id: problemId, version_id: versionId}}),
  getConfig: problemId => request('admin/ai_tutor/config', 'get', {params: {problem_id: problemId}}),
  saveConfig: (problemId, enabled) => request('admin/ai_tutor/config', 'put', {data: {problem_id: problemId, enabled}}),
  // La IA puede tardar hasta 30 s: el tope de red evita un estado de carga eterno.
  suggest: problemId => request('admin/ai_tutor/config/suggest', 'post', {data: {problem_id: problemId}, timeout: 45000})
}
