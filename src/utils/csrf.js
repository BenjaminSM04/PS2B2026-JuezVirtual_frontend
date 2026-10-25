import axios from 'axios'

let pending = null
let installed = false
export function csrfHeaders () {
  if (typeof document === 'undefined') return {}
  const part = document.cookie.split(';').map(item => item.trim()).find(item => item.startsWith('csrftoken='))
  return part ? {'X-CSRFToken': decodeURIComponent(part.slice(10))} : {}
}
export function ensureCsrf () {
  if (csrfHeaders()['X-CSRFToken']) return Promise.resolve()
  if (!pending) pending = axios.get('/api/profile', {baseURL: ''}).then(() => { pending = null }, error => { pending = null; throw error })
  return pending
}
export function installCsrf () {
  if (typeof window === 'undefined' || typeof document === 'undefined') return
  if (installed) return
  installed = true
  axios.interceptors.request.use(async config => {
    const target = new URL(config.url, new URL(config.baseURL || '', window.location.origin))
    if (target.origin !== window.location.origin) return config
    if (!['get', 'head', 'options'].includes((config.method || 'get').toLowerCase())) {
      await ensureCsrf()
      config.headers = {...config.headers, ...csrfHeaders()}
    }
    return config
  })
}
