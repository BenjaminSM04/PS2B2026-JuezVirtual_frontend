<template>
  <section v-if="error || (availability && availability.enabled)" class="training-session" :aria-busy="loading">
    <h3>{{ $t('m.Tutor_training') }}</h3>
    <p>{{ $t('m.Tutor_scope') }}</p>
    <p v-if="error" role="alert">{{ error }}</p>
    <p v-if="!userId">{{ $t('m.Tutor_login') }}</p>
    <template v-else-if="availability && availability.can_start">
      <p v-if="session" role="status">
        {{ $t('m.Tutor_attempt_count') }}: {{ session.attempt_count }}.
        {{ $t('m.Tutor_level') }}: {{ session.highest_help_level }}.
      </p>
      <button v-if="!session" type="button" :disabled="loading" @click="start">{{ $t('m.Tutor_start') }}</button>
      <ol v-if="session && session.attempts.length" :aria-label="$t('m.Tutor_history')">
        <li v-for="attempt in session.attempts" :key="attempt.id">
          <router-link :to="'/status/' + attempt.submission_id">{{ attempt.submission_id }}</router-link>
          <span>{{ attempt.language }} · {{ verdictLabel(attempt.result) }} · {{ $t('m.Tutor_level') }} {{ attempt.help_level }}</span>
        </li>
      </ol>
    </template>
    <p v-else-if="userId && availability && availability.enabled">{{ $t('m.Tutor_unavailable') }}</p>
    <button type="button" :disabled="loading" @click="load">{{ $t('m.Tutor_refresh') }}</button>
  </section>
</template>

<script>
import api from '@/utils/tutorApi'

const finalResults = [-2, -1, 0, 1, 2, 3, 4, 5, 8]
const verdicts = {
  '-2': 'Compile_Error',
  '-1': 'Wrong_Answer',
  '0': 'Accepted',
  '1': 'Time_Limit_Exceeded',
  '2': 'Time_Limit_Exceeded',
  '3': 'Memory_Limit_Exceeded',
  '4': 'Runtime_Error',
  '5': 'System_Error',
  '8': 'Partial_Accepted'
}

export default {
  name: 'TrainingSession',
  props: {
    problemId: {type: Number, required: true},
    userId: {type: Number, default: null}
  },
  data () {
    return {availability: null, session: null, error: '', loading: false, epoch: 0}
  },
  created () {
    this.load()
  },
  beforeDestroy () {
    this.epoch++
  },
  watch: {
    problemId () { this.load() },
    userId () { this.load() }
  },
  methods: {
    verdictLabel (result) {
      return this.$t('m.' + verdicts[result])
    },
    async load () {
      const epoch = ++this.epoch
      const problemId = this.problemId
      this.availability = null
      this.session = null
      this.error = ''
      this.loading = true
      try {
        const availability = await api.availability(problemId)
        if (epoch !== this.epoch) return
        this.availability = availability
        if (!this.userId || !availability.can_start) return
        const existing = await api.readSession(problemId)
        if (epoch !== this.epoch || !existing) return
        // Solo una sesión que ya existe se recupera y reconcilia automáticamente.
        const recovered = await api.recoverSession(problemId)
        if (epoch === this.epoch) this.session = recovered
      } catch (error) {
        if (epoch === this.epoch) this.error = error.message
      } finally {
        if (epoch === this.epoch) this.loading = false
      }
    },
    async start () {
      if (this.loading || !this.userId || !this.availability || !this.availability.can_start) return
      const epoch = this.epoch
      this.loading = true
      this.error = ''
      try {
        const session = await api.recoverSession(this.problemId)
        if (epoch === this.epoch) this.session = session
      } catch (error) {
        if (epoch === this.epoch) this.error = error.message
      } finally {
        if (epoch === this.epoch) this.loading = false
      }
    },
    async registerSubmission (submissionId, result) {
      if (!this.session || finalResults.indexOf(result) === -1) return
      const epoch = this.epoch
      const sessionId = this.session.id
      const problemId = this.problemId
      try {
        await api.registerAttempt(sessionId, submissionId)
        if (epoch !== this.epoch) return
        const session = await api.readSession(problemId)
        if (epoch === this.epoch) {
          this.session = session
          this.error = ''
        }
      } catch (error) {
        if (epoch === this.epoch) this.error = error.message
      }
    }
  }
}
</script>

<style scoped>
.training-session { margin: 16px 0; padding: 16px; border: 1px solid #b7d5c7; border-radius: 8px; overflow-wrap: anywhere; }
.training-session h3 { margin-bottom: 8px; }
.training-session button { margin: 8px 12px 0 0; padding: 8px 12px; color: #154c36; background: #edf6f1; border: 1px solid #527964; border-radius: 4px; cursor: pointer; }
.training-session button:focus-visible { outline: 3px solid #307eae; outline-offset: 2px; }
.training-session button:disabled { opacity: .6; cursor: wait; }
.training-session ol { padding-left: 20px; }
.training-session li { padding: 6px 0; }
.training-session li span { display: block; }
</style>
