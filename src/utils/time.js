import moment from 'moment'
import i18n from '@/i18n'

// moment solo trae el idioma chino en el DLL; la duración legible se arma aquí.
const UNITS = {
  es: [['año', 'años', 31536000], ['mes', 'meses', 2592000], ['día', 'días', 86400], ['hora', 'horas', 3600], ['minuto', 'minutos', 60]],
  en: [['year', 'years', 31536000], ['month', 'months', 2592000], ['day', 'days', 86400], ['hour', 'hours', 3600], ['minute', 'minutes', 60]]
}

function humanize (seconds) {
  const units = UNITS[String(i18n.locale).startsWith('es') ? 'es' : 'en']
  const abs = Math.abs(seconds)
  for (const [one, many, size] of units) {
    if (abs >= size) {
      const n = Math.round(abs / size)
      return n + ' ' + (n === 1 ? one : many)
    }
  }
  return '1 ' + units[units.length - 1][0]
}

// convert utc time to localtime
function utcToLocal (utcDt, format = 'YYYY-M-D  HH:mm:ss') {
  return moment.utc(utcDt).local().format(format)
}

// get duration from startTime to endTime, return like 3 days, 2 hours, one year ..
function duration (startTime, endTime) {
  let start = moment(startTime)
  let end = moment(endTime)
  const seconds = Math.abs(start.diff(end, 'seconds'))
  if (seconds >= 86400) {
    return humanize(seconds)
  }
  const hours = Math.round(seconds / 360) / 10
  return hours + ' ' + (String(i18n.locale).startsWith('es') ? (hours === 1 ? 'hora' : 'horas') : (hours === 1 ? 'hour' : 'hours'))
}

function secondFormat (seconds) {
  let m = moment.duration(seconds, 'seconds')
  return Math.floor(m.asHours()) + ':' + m.minutes() + ':' + m.seconds()
}

export default {
  utcToLocal: utcToLocal,
  duration: duration,
  humanize: humanize,
  secondFormat: secondFormat
}
