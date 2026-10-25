<template>
  <section class="tutor-panel" :aria-busy="busy">
    <button type="button" :aria-expanded="open" @click="open = !open">{{ $t('m.Tutor_panel') }}</button>
    <div v-if="open" class="tutor-body">
      <p>{{ $t('m.Tutor_limits') }}</p>
      <p v-if="error" role="alert">{{ error }}</p>
      <div class="tutor-actions">
        <button type="button" :disabled="busy || !session.attempt_count" @click="ask('explain')">{{ $t('m.Tutor_explain') }}</button>
        <button v-for="n in 3" :key="n" type="button" :disabled="busy || n > session.allowed_help_level"
                :title="$t('m.Tutor_new_attempt')" @click="hint(n)">{{ $t('m.Tutor_hint') }} {{ n }}</button>
      </div>
      <p>{{ $t('m.Tutor_new_attempt') }}</p>
      <label :for="'concept-' + session.id">{{ $t('m.Tutor_concept') }}</label>
      <select :id="'concept-' + session.id" v-model="concept" :disabled="busy">
        <option value="">{{ $t('m.Tutor_choose') }}</option>
        <option v-for="item in session.concepts" :key="item" :value="item">{{ item }}</option>
      </select>
      <button type="button" :disabled="busy || !concept" @click="ask('concept')">{{ $t('m.Tutor_concept') }}</button>
      <p v-if="busy" role="status">{{ $t('m.Tutor_loading') }}</p>
      <article v-if="response" aria-live="polite" aria-atomic="true" class="tutor-response">
        <p class="source">{{ $t('m.Tutor_source') }}: {{ response.source === 'model' ? $t('m.Tutor_model') : $t('m.Tutor_backup') }}</p>
        <p>{{ response.content }}</p>
        <p class="uncertainty">{{ response.uncertainty }}</p>
        <button type="button" :disabled="busy" :aria-pressed="response.rating === 'useful'" @click="rate('useful')">{{ $t('m.Tutor_useful') }}</button>
        <button type="button" :disabled="busy" :aria-pressed="response.rating === 'incorrect'" @click="rate('incorrect')">{{ $t('m.Tutor_incorrect') }}</button>
      </article>
      <details v-if="session.feedback && session.feedback.length">
        <summary>{{ $t('m.Tutor_responses') }}</summary>
        <ol><li v-for="item in session.feedback" :key="item.id"><button type="button" @click="response = item">{{ item.action }} · {{ item.level }} · {{ item.content.slice(0, 60) }}</button></li></ol>
      </details>
    </div>
  </section>
</template>
<script>
import api from '@/utils/tutorApi'

function requestId () {
  const values = new Uint8Array(16)
  window.crypto.getRandomValues(values)
  values[6] = (values[6] & 15) | 64
  values[8] = (values[8] & 63) | 128
  const hex = Array.from(values, x => ('0' + x.toString(16)).slice(-2)).join('')
  return [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16), hex.slice(16, 20), hex.slice(20)].join('-')
}

export default {
  name: 'TutorPanel',
  props: {session: {type: Object, required: true}},
  data () { return {open: false, busy: false, error: '', response: null, concept: '', pending: {}, epoch: 0} },
  beforeDestroy () { this.epoch++ },
  methods: {
    hint (level) {
      const existing = (this.session.feedback || []).find(item => item.action === 'hint' && item.level === level)
      if (existing) this.response = existing
      else this.ask('hint', level)
    },
    async ask (action, level) {
      if (this.busy) return
      const epoch = this.epoch
      const key = action + ':' + (level || this.concept)
      const data = {session_id: this.session.id, request_id: this.pending[key] || requestId(), action}
      this.pending[key] = data.request_id
      if (action === 'hint') data.level = level
      if (action === 'concept') data.concept = this.concept
      this.busy = true
      this.error = ''
      try {
        const response = await api.feedback(data)
        if (epoch !== this.epoch) return
        this.response = response
        delete this.pending[key]
        this.$emit('changed')
      } catch (error) {
        if (epoch === this.epoch) this.error = error.message
      } finally { if (epoch === this.epoch) this.busy = false }
    },
    async rate (value) {
      if (this.busy || !this.response) return
      const epoch = this.epoch
      const id = this.response.id
      this.busy = true
      try {
        await api.rate(id, value)
        if (epoch === this.epoch && this.response.id === id) {
          this.$set(this.response, 'rating', value)
          this.$emit('changed')
        }
      } catch (error) { if (epoch === this.epoch) this.error = error.message } finally { if (epoch === this.epoch) this.busy = false }
    }
  }
}
</script>
<style scoped>
.tutor-panel { margin: 16px 0; overflow-wrap: anywhere; min-width: 0; }
.tutor-panel button, .tutor-panel select { max-width: 100%; padding: 9px 12px; margin: 5px 8px 5px 0; border: 1px solid #7e2345; border-radius: 6px; background: var(--lj-surface, #fff); color: var(--lj-text, #63213a); cursor: pointer; white-space: normal; }
.tutor-panel button:disabled { opacity: .55; cursor: default; }
.tutor-panel :focus-visible { outline: 3px solid #3973bd; outline-offset: 3px; }
.tutor-body { padding: 14px 0; }
.tutor-response { padding: 16px; margin-top: 12px; border-left: 4px solid #8b2346; background: var(--lj-surface, #faf5f7); white-space: pre-wrap; }
.tutor-response p { margin-bottom: 12px; }
.source, .uncertainty { font-size: .9em; }
.tutor-actions { display: flex; flex-wrap: wrap; }
@media (max-width: 480px) { .tutor-panel select { display: block; width: 100%; } }
</style>
