<template>
  <section class="training-config" :aria-busy="loading">
    <label>
      <input type="checkbox" role="switch" :aria-checked="enabled" v-model="enabled" :disabled="loading || !ready" @change="save">
      {{ $t('m.Tutor_enable') }}
    </label>
    <p>{{ $t('m.Tutor_config_scope') }}</p>
    <p v-if="message" role="status">{{ message }}</p>
    <p v-if="error" role="alert">{{ error }}</p>
    <button v-if="error" type="button" :disabled="loading" @click="load">{{ $t('m.Tutor_refresh') }}</button>
  </section>
</template>

<script>
import api from '@/utils/tutorApi'

export default {
  name: 'TrainingConfig',
  props: {problemId: {type: Number, required: true}},
  data () {
    return {enabled: false, saved: false, ready: false, loading: false, error: '', message: '', epoch: 0}
  },
  created () { this.load() },
  beforeDestroy () { this.epoch++ },
  watch: {problemId () { this.load() }},
  methods: {
    async load () {
      const epoch = ++this.epoch
      this.ready = false
      this.enabled = false
      this.error = ''
      this.message = ''
      this.loading = true
      try {
        const config = await api.getConfig(this.problemId)
        if (epoch !== this.epoch) return
        this.enabled = this.saved = config.enabled
        this.ready = true
      } catch (error) {
        if (epoch === this.epoch) this.error = error.message
      } finally {
        if (epoch === this.epoch) this.loading = false
      }
    },
    async save () {
      if (!this.ready || this.loading) return
      const epoch = this.epoch
      this.loading = true
      this.error = ''
      this.message = ''
      try {
        const config = await api.saveConfig(this.problemId, this.enabled)
        if (epoch !== this.epoch) return
        this.enabled = this.saved = config.enabled
        this.message = this.$t('m.Tutor_saved')
      } catch (error) {
        if (epoch === this.epoch) {
          this.enabled = this.saved
          this.error = error.message
        }
      } finally {
        if (epoch === this.epoch) this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.training-config { margin: 16px 0; padding: 16px; background: #f1f7f3; border-radius: 6px; overflow-wrap: anywhere; }
.training-config label { cursor: pointer; font-weight: 600; }
.training-config input { margin-right: 8px; accent-color: #267653; }
.training-config p { margin: 8px 0 0; }
.training-config button { margin-top: 8px; padding: 6px 12px; }
</style>
