<template>
  <fieldset class="pedagogy" :disabled="busy">
    <legend>{{ $t('m.Tutor_pedagogy') }}</legend>
    <p>{{ $t('m.Tutor_version_scope') }}</p>
    <p v-if="error" role="alert">{{ error }}</p>
    <p v-if="message" role="status">{{ message }}</p>
    <label>{{ $t('m.Tutor_versions') }}
      <select v-model="selected" @change="selectVersion"><option value="">{{ $t('m.Tutor_new_version') }}</option><option v-for="version in versions" :key="version.id" :value="version.id">{{ version.version }} · {{ version.status }}</option></select>
    </label>
    <div v-for="(concept, index) in concepts" :key="index" class="concept-editor">
      <label>{{ $t('m.Tutor_concept') }} {{ index + 1 }} <input v-model="concept.name" maxlength="300"></label>
      <label>{{ $t('m.Tutor_concept_text') }} <textarea v-model="concept.explanation" maxlength="2000" rows="3"></textarea></label>
      <button type="button" :disabled="concepts.length === 1" @click="concepts.splice(index, 1)">{{ $t('m.Tutor_remove') }}</button>
    </div>
    <button type="button" :disabled="concepts.length >= 30" @click="concepts.push({name: '', explanation: ''})">{{ $t('m.Tutor_add_concept') }}</button>
    <label v-for="key in ['concept', 'location', 'strategy']" :key="key">{{ $t('m.Tutor_hint_' + key) }}<textarea v-model="hints[key]" rows="3" maxlength="1200"></textarea></label>
    <button type="button" @click="save">{{ $t('m.Tutor_save_draft') }}</button>
    <button type="button" :disabled="!selectedDraft" @click="activate">{{ $t('m.Tutor_activate') }}</button>
  </fieldset>
</template>
<script>
import api from '@/utils/tutorApi'
export default {
  name: 'PedagogyConfig', props: {problemId: {type: Number, required: true}},
  data () { return {versions: [], selected: '', concepts: [{name: '', explanation: ''}], hints: {concept: '', location: '', strategy: ''}, busy: false, error: '', message: '', epoch: 0} },
  computed: {selectedDraft () { return this.versions.find(item => item.id === this.selected && item.status === 'draft') }},
  created () { this.load() }, beforeDestroy () { this.epoch++ }, watch: {problemId () { this.load() }},
  methods: {
    async load () {
      const epoch = ++this.epoch
      this.selected = ''
      this.versions = []
      this.concepts = [{name: '', explanation: ''}]
      this.hints = {concept: '', location: '', strategy: ''}
      this.busy = true
      try { const versions = await api.versions(this.problemId); if (epoch === this.epoch) this.versions = versions }
      catch (error) { if (epoch === this.epoch) this.error = error.message }
      finally { if (epoch === this.epoch) this.busy = false }
    },
    selectVersion () {
      const version = this.versions.find(item => item.id === this.selected)
      if (!version) return
      this.concepts = version.concepts.map(name => ({name, explanation: (version.concept_explanations || {})[name] || ''}))
      this.hints = {...version.hint_policy.hints}
    },
    async save () {
      const epoch = this.epoch
      this.busy = true
      this.error = ''
      const explanations = {}
      this.concepts.forEach(item => { if (item.explanation.trim()) explanations[item.name.trim()] = item.explanation.trim() })
      try {
        const version = await api.createVersion({problem_id: this.problemId, schema_version: '1.0', concepts: this.concepts.map(item => item.name.trim()), concept_explanations: explanations, hint_policy: {max_help_level: 3, hints: this.hints}})
        if (epoch !== this.epoch) return
        this.versions.push(version)
        this.selected = version.id
        this.message = this.$t('m.Tutor_draft_saved')
      } catch (error) { if (epoch === this.epoch) this.error = error.message }
      finally { if (epoch === this.epoch) this.busy = false }
    },
    async activate () {
      const epoch = this.epoch
      const problemId = this.problemId
      this.busy = true
      try {
        await api.activateVersion(problemId, this.selected)
        if (epoch !== this.epoch) return
        const versions = await api.versions(problemId)
        if (epoch === this.epoch) {
          this.versions = versions
          this.message = this.$t('m.Tutor_activated')
        }
      } catch (error) { if (epoch === this.epoch) this.error = error.message }
      finally { if (epoch === this.epoch) this.busy = false }
    }
  }
}
</script>
<style scoped>
.pedagogy { margin-top: 20px; padding: 16px; border: 1px solid #be9baa; min-width: 0; }
.pedagogy label { display: block; margin: 14px 0; }
.pedagogy input, .pedagogy textarea, .pedagogy select { display: block; padding: 8px; width: 100%; max-width: 100%; border: 1px solid #aaa; background: var(--lj-surface, white); color: var(--lj-text, #222); }
.pedagogy button { margin: 5px; padding: 8px; }
.concept-editor { border-bottom: 1px solid #ccc; padding-bottom: 8px; }
</style>
