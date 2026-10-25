<template>
  <section v-if="userId" class="personal-practice" :aria-busy="busy">
    <h2>{{ $t('m.Practice_title') }}</h2>
    <p v-if="error" role="alert">{{ error }}</p>
    <template v-if="state">
      <div v-if="state.preferences.visible" class="mascot" :class="{animated: state.preferences.animations_enabled}" role="img" :aria-label="$t('m.Mascot_title') + ': ' + stageLabel">
        <svg v-if="state.stage === 'egg'" viewBox="0 0 160 120" aria-hidden="true"><ellipse cx="80" cy="64" rx="35" ry="47" fill="#f2e3bd" stroke="#704664" stroke-width="3"/><path d="m54 56 16 9 10-16 10 16 17-8" stroke="#8a5b41" fill="none" stroke-width="3"/></svg>
        <svg v-else viewBox="0 0 180 120" aria-hidden="true">
          <path d="M70 78Q12 105 20 60Q27 90 61 65" :fill="color"/>
          <path d="M65 74 54 99M98 74 112 99M65 51 49 39M99 51 116 39" :stroke="color" stroke-width="12" stroke-linecap="round"/>
          <ellipse cx="82" cy="63" rx="31" ry="37" :fill="color"/><ellipse cx="83" cy="30" rx="31" ry="24" :fill="color"/>
          <circle cx="71" cy="23" r="8" fill="white"/><circle cx="94" cy="23" r="8" fill="white"/><circle cx="72" cy="23" r="4" fill="#252035"/><circle cx="93" cy="23" r="4" fill="#252035"/>
          <path d="M74 39Q83 46 93 38" stroke="#252035" stroke-width="3" fill="none"/>
          <path v-if="state.appearance.accessory === 'scarf'" d="M57 48 109 48 101 60 92 60 99 83 86 87 79 60 61 60Z" fill="#8b2346"/>
          <g v-if="state.appearance.accessory === 'glasses'" fill="none" stroke="#302c49" stroke-width="3"><circle cx="71" cy="23" r="12"/><circle cx="94" cy="23" r="12"/><path d="M83 23H82"/></g>
          <rect v-if="state.appearance.accessory === 'backpack'" x="59" y="54" width="47" height="35" rx="9" fill="#a66d39" stroke="#654a2c" stroke-width="3"/>
        </svg>
      </div>
      <p>{{ stageLabel }} · {{ state.solved_count }} {{ $t('m.Practice_solved') }}</p>
      <p v-if="state.next_stage_at !== null">{{ $t('m.Mascot_next') }}: {{ state.next_stage_at }}</p>
      <details><summary>{{ $t('m.Mascot_customize') }}</summary>
        <label>{{ $t('m.Mascot_color') }} <select :value="state.appearance.color" :disabled="busy" @change="update({color: $event.target.value})"><option v-for="item in state.unlocked_colors" :key="item" :value="item">{{ $t('m.Mascot_' + item) }}</option></select></label>
        <label>{{ $t('m.Mascot_accessory') }} <select :value="state.appearance.accessory" :disabled="busy" @change="update({accessory: $event.target.value})"><option v-for="item in state.unlocked_accessories" :key="item" :value="item">{{ $t('m.Mascot_' + item) }}</option></select></label>
        <label><input type="checkbox" :checked="state.preferences.visible" :disabled="busy" @change="update({visible: $event.target.checked})"> {{ $t('m.Mascot_visible') }}</label>
        <label><input type="checkbox" :checked="state.preferences.animations_enabled" :disabled="busy" @change="update({animations_enabled: $event.target.checked})"> {{ $t('m.Mascot_animate') }}</label>
      </details>
    </template>
    <div v-if="overview">
      <router-link v-if="overview.continue_problem" :to="'/problem/' + overview.continue_problem._id">{{ $t('m.Practice_continue') }}: {{ overview.continue_problem.title }}</router-link>
      <h3>{{ $t('m.Practice_pending') }}</h3>
      <ul><li v-for="problem in overview.pending_problems" :key="problem.id"><router-link :to="'/problem/' + problem._id">{{ problem.title }}</router-link></li></ul>
      <h3>{{ $t('m.Practice_recent') }}</h3>
      <ul><li v-for="item in overview.recent_submissions" :key="item.id"><router-link :to="'/status/' + item.id">{{ item.problem__title }} · {{ item.language }}</router-link></li></ul>
      <p v-for="topic in overview.topics" :key="topic.tags__name || 'none'">{{ topic.tags__name || $t('m.Practice_no_topic') }}: {{ topic.solved }}</p>
    </div>
  </section>
</template>
<script>
import api from '@/utils/tutorApi'
export default {
  name: 'PersonalPractice',
  props: {userId: {type: Number, default: null}},
  data () { return {state: null, overview: null, error: '', busy: false, epoch: 0} },
  computed: {
    color () { return ({green: '#4b9957', blue: '#317aaa', amber: '#ad741a', violet: '#8650ab'})[this.state.appearance.color] },
    stageLabel () { return this.$t('m.Mascot_' + this.state.stage) }
  },
  created () { this.load() },
  beforeDestroy () { this.epoch++ },
  watch: {userId () { this.load() }},
  methods: {
    async load () {
      const epoch = ++this.epoch
      this.error = ''
      this.state = this.overview = null
      if (!this.userId) return
      this.busy = true
      try {
        const data = await Promise.all([api.mascot(), api.overview()])
        if (epoch === this.epoch) { this.state = data[0]; this.overview = data[1] }
      } catch (error) { if (epoch === this.epoch) this.error = error.message } finally { if (epoch === this.epoch) this.busy = false }
    },
    async update (data) {
      const epoch = this.epoch
      this.busy = true
      try { const state = await api.updateMascot(data); if (epoch === this.epoch) this.state = state } catch (error) { if (epoch === this.epoch) this.error = error.message } finally { if (epoch === this.epoch) this.busy = false }
    }
  }
}
</script>
<style scoped>
.personal-practice { padding: 24px; margin: 20px auto; max-width: 100%; background: var(--lj-surface, #fff); border: 1px solid #d2b8c2; border-radius: 12px; overflow-wrap: anywhere; }
.personal-practice label { display: block; margin: 12px 0; }
.personal-practice select { max-width: 100%; padding: 6px; }
.personal-practice h3 { margin-top: 16px; }
.mascot { width: 150px; max-width: 100%; }
.mascot.animated { animation: breathe 4s ease-in-out infinite; }
@keyframes breathe { 50% { transform: translateY(-3px); } }
@media (prefers-reduced-motion: reduce) { .mascot.animated { animation: none; } }
</style>
