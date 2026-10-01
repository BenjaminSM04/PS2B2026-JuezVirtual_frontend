import axios from 'axios'

// Transporte independiente: un fallo del tutor no altera el flujo del juez.
const client = axios.create({
  baseURL: '/api',
  xsrfHeaderName: 'X-CSRFToken',
  xsrfCookieName: 'csrftoken'
})

function request (url, method, options = {}) {
  return client({url, method, ...options}).then(response => {
    if (response.data.error !== null) {
      throw new Error(response.data.data || 'No se pudo completar la operación de entrenamiento.')
    }
    return response.data.data
  }).catch(error => {
    const data = error.response && error.response.data
    throw new Error((data && data.data) || error.message || 'No se pudo conectar con el entrenamiento.')
  })
}

export default {
  availability: problemId => request('ai_tutor/availability', 'get', {params: {problem_id: problemId}}),
  readSession: problemId => request('ai_tutor/session', 'get', {params: {problem_id: problemId}}),
  recoverSession: problemId => request('ai_tutor/session', 'post', {data: {problem_id: problemId}}),
  registerAttempt: (sessionId, submissionId) => request('ai_tutor/attempt', 'post', {data: {session_id: sessionId, submission_id: submissionId}}),
  getConfig: problemId => request('admin/ai_tutor/config', 'get', {params: {problem_id: problemId}}),
  saveConfig: (problemId, enabled) => request('admin/ai_tutor/config', 'put', {data: {problem_id: problemId, enabled}})
}
