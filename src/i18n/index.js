import Vue from 'vue'
import VueI18n from 'vue-i18n'
import storage from '@/utils/storage'
import v2 from './v2'
import { STORAGE_KEY } from '@/utils/constants'
// ivew UI
import ivenUS from 'iview/dist/locale/en-US'
import ivesES from 'iview/dist/locale/es-ES'
// element UI
import elenUS from 'element-ui/lib/locale/lang/en'
import elesES from 'element-ui/lib/locale/lang/es'

Vue.use(VueI18n)

const languages = [
  {value: 'en-US', label: 'English', iv: ivenUS, el: elenUS},
  // Chino simplificado/tradicional deshabilitados a pedido (no se usan en Univalle).
  // Los archivos de locale se conservan; descomentar para reactivarlos.
  // {value: 'zh-CN', label: '简体中文', iv: ivzhCN, el: elzhCN},
  // {value: 'zh-TW', label: '繁體中文', iv: ivzhTW, el: elzhTW},
  {value: 'es-LA', label: 'Español (LA)', iv: ivesES, el: elesES}
]
const messages = {}

// combine admin and oj
for (let lang of languages) {
  let locale = lang.value
  let m = require(`./oj/${locale}`).m
  Object.assign(m, require(`./admin/${locale}`).m)
  Object.assign(m, v2[locale])
  let ui = Object.assign(lang.iv, lang.el)
  messages[locale] = Object.assign({m: m}, ui)
  if (locale === 'es-LA') {
    messages[locale].i.page.page = '/ página'
  }
}
// Resolver el locale inicial: si lo guardado ya no está disponible
// (p. ej. un usuario que había elegido zh-CN antes de deshabilitarlo), caer a es-LA.
const availableLocales = languages.map(lang => lang.value)
const storedLocale = storage.get(STORAGE_KEY.LANGUAGE)
const initialLocale = availableLocales.includes(storedLocale) ? storedLocale : 'es-LA'

// load language packages
const i18n = new VueI18n({
  locale: initialLocale,
  fallbackLocale: 'en-US',
  messages: messages
})
if (typeof document !== 'undefined') document.documentElement.lang = initialLocale === 'es-LA' ? 'es' : 'en'

// Change the active locale and persist it so it survives reloads.
export function setLanguage (locale) {
  i18n.locale = locale
  if (typeof document !== 'undefined') document.documentElement.lang = locale === 'es-LA' ? 'es' : 'en'
  storage.set(STORAGE_KEY.LANGUAGE, locale)
}

export default i18n

export {languages}
