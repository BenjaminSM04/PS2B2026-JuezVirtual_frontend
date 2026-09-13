import Vue from 'vue'
import Raven from 'raven-js'
import RavenVue from 'raven-js/plugins/vue'

// El DSN del navegador es público; nunca incluir tokens privados de Sentry.
if (process.env.PUBLIC_SENTRY_DSN) {
  Raven.config(process.env.PUBLIC_SENTRY_DSN, {
    release: process.env.VERSION,
    ignoreUrls: [/extensions\//i, /^chrome:\/\//i, /^resource:\/\//i, /\/(gtm|ga|analytics)\.js/i]
  }).addPlugin(RavenVue, Vue).install()
}
