<template>
  <div v-if="message" class="verdict-buddy" :class="accepted ? 'is-ok' : 'is-ko'" role="status" aria-live="polite">
    <div v-if="mascot" class="verdict-buddy__mascot" aria-hidden="true">
      <LizardMascot
        :stage="mascot.stage"
        :color="mascot.appearance.color"
        :accessory="mascot.appearance.accessory"
        :animated="mascot.preferences.animations_enabled"
        :cheering="accepted"
      />
    </div>
    <p>{{ message }}</p>
  </div>
</template>

<script>
import api from '@/utils/tutorApi'
import LizardMascot from './LizardMascot.vue'

const MESSAGES = {'-2': 'ce', '-1': 'wa', '0': 'ac', '1': 'tle', '2': 'tle', '3': 'mle', '4': 're', '5': 'se', '8': 'pa'}

export default {
  name: 'VerdictBuddy',
  components: {LizardMascot},
  props: {
    result: {type: Number, default: null},
    userId: {type: Number, default: null}
  },
  data () {
    return {mascot: null, requested: false}
  },
  computed: {
    accepted () {
      return this.result === 0
    },
    message () {
      const key = MESSAGES[this.result]
      return key ? this.$t('m.Buddy_' + key) : ''
    }
  },
  watch: {
    result: {
      immediate: true,
      handler (value) {
        // La mascota se consulta una sola vez, al primer veredicto final.
        if (MESSAGES[value] && this.userId && !this.requested) this.load()
      }
    }
  },
  methods: {
    async load () {
      this.requested = true
      try {
        const state = await api.mascot()
        this.mascot = state.preferences.visible ? state : null
      } catch (error) {
        this.mascot = null
      }
    }
  }
}
</script>

<style scoped>
.verdict-buddy {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
  padding: 8px 12px;
  border-radius: 12px;
  border: 1px solid var(--lj-border, #dce7e1);
  background: var(--lj-surface, #fff);
  max-width: 420px;
}
.verdict-buddy.is-ok { background: var(--lj-mint, #e5f3eb); }
.verdict-buddy.is-ko { background: var(--lj-rose, #f5e8ee); }
.verdict-buddy__mascot { flex: none; width: 64px; }
.verdict-buddy p { margin: 0; font-size: 13px; line-height: 1.45; color: var(--lj-text, #233d37); }
</style>
