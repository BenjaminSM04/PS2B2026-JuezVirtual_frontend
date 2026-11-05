<template>
  <section v-if="userId" class="personal-practice" :aria-busy="busy">
    <header class="pp-header">
      <span class="v2-eyebrow">{{ $t('m.Practice_eyebrow') }}</span>
      <h2>{{ $t('m.Practice_title') }}</h2>
      <p class="v2-description">{{ $t('m.V2_Practice_Description') }}</p>
    </header>
    <p v-if="error" class="pp-error" role="alert">{{ error }}</p>
    <div v-if="!state && !overview && busy" class="v2-skeleton">{{ $t('m.Practice_loading') }}</div>
    <div class="pp-grid">
      <article v-if="state" class="pp-habitat">
        <template v-if="state.preferences.visible">
          <p class="pp-bubble" aria-live="polite">{{ bubble }}</p>
          <div
            class="pp-mascot"
            role="img"
            tabindex="0"
            :aria-label="$t('m.Mascot_title') + ': ' + stageLabel"
            @click="cheer"
            @keydown.enter.prevent="cheer"
            @keydown.space.prevent="cheer"
          >
            <LizardMascot
              :stage="state.stage"
              :color="state.appearance.color"
              :accessory="state.appearance.accessory"
              :animated="state.preferences.animations_enabled"
              :cheering="cheering"
            />
          </div>
        </template>
        <p v-else class="pp-hidden">{{ $t('m.Mascot_hidden') }}</p>

        <div class="pp-stage">
          <strong>{{ stageLabel }}</strong>
          <span>{{ state.solved_count }} {{ $t('m.Practice_solved') }}</span>
        </div>
        <div v-if="progress.next" class="pp-progress">
          <div
            class="pp-progress__track"
            role="progressbar"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-valuenow="Math.round(progress.ratio * 100)"
            :aria-label="progressLabel"
          >
            <span :style="{width: Math.max(4, progress.ratio * 100) + '%'}"></span>
          </div>
          <small>{{ progressLabel }}</small>
        </div>

        <details class="pp-customize">
          <summary>{{ $t('m.Mascot_customize') }}</summary>
          <fieldset>
            <legend>{{ $t('m.Mascot_color') }}</legend>
            <div class="pp-options">
              <button
                v-for="item in colors"
                :key="item.name"
                type="button"
                class="pp-swatch"
                :class="{'is-locked': item.locked}"
                :style="{'--swatch': palettes[item.name].body}"
                :aria-pressed="String(state.appearance.color === item.name)"
                :disabled="busy || item.locked"
                :title="item.locked ? $t('m.Mascot_locked', {n: item.from}) : $t('m.Mascot_' + item.name)"
                @click="update({color: item.name})"
              >
                <span class="pp-swatch__dot" aria-hidden="true"></span>
                <span>{{ $t('m.Mascot_' + item.name) }}</span>
                <small v-if="item.locked" class="pp-lock">
                  <Icon type="ios-locked-outline" aria-hidden="true"></Icon>{{ item.from }}
                  <span class="pp-sr">{{ $t('m.Mascot_locked', {n: item.from}) }}</span>
                </small>
              </button>
            </div>
          </fieldset>
          <fieldset>
            <legend>{{ $t('m.Mascot_accessory') }}</legend>
            <div class="pp-options">
              <button
                v-for="item in accessories"
                :key="item.name"
                type="button"
                class="pp-chip"
                :class="{'is-locked': item.locked}"
                :aria-pressed="String(state.appearance.accessory === item.name)"
                :disabled="busy || item.locked"
                :title="item.locked ? $t('m.Mascot_locked', {n: item.from}) : $t('m.Mascot_' + item.name)"
                @click="update({accessory: item.name})"
              >
                {{ $t('m.Mascot_' + item.name) }}
                <small v-if="item.locked" class="pp-lock">
                  <Icon type="ios-locked-outline" aria-hidden="true"></Icon>{{ item.from }}
                  <span class="pp-sr">{{ $t('m.Mascot_locked', {n: item.from}) }}</span>
                </small>
              </button>
            </div>
          </fieldset>
          <label class="pp-switch">
            <input
              type="checkbox"
              :checked="state.preferences.visible"
              :disabled="busy"
              @change="update({visible: $event.target.checked})"
            />
            <span>{{ $t('m.Mascot_visible') }}</span>
          </label>
          <label class="pp-switch">
            <input
              type="checkbox"
              :checked="state.preferences.animations_enabled"
              :disabled="busy"
              @change="update({animations_enabled: $event.target.checked})"
            />
            <span>{{ $t('m.Mascot_animate') }}</span>
          </label>
        </details>
      </article>

      <div v-if="overview" class="pp-overview">
        <router-link
          v-if="overview.continue_problem"
          class="pp-continue"
          :to="'/problem/' + overview.continue_problem._id"
        >
          <span class="pp-continue__label">{{ $t('m.Practice_continue') }}</span>
          <strong>{{ overview.continue_problem.title }}</strong>
          <Icon type="arrow-right-c" aria-hidden="true"></Icon>
        </router-link>
        <router-link v-else class="pp-continue" to="/problem">
          <span class="pp-continue__label">{{ $t('m.Practice_start') }}</span>
          <strong>{{ $t('m.Practice_explore') }}</strong>
          <Icon type="arrow-right-c" aria-hidden="true"></Icon>
        </router-link>

        <div class="pp-panel">
          <h3>{{ $t('m.Practice_pending') }}</h3>
          <p v-if="!overview.pending_problems.length" class="v2-empty">{{ $t('m.V2_No_Pending') }}</p>
          <ul v-else class="pp-list">
            <li v-for="problem in overview.pending_problems" :key="problem.id">
              <router-link :to="'/problem/' + problem._id">
                <span class="pp-list__id">{{ problem._id }}</span>
                <span>{{ problem.title }}</span>
              </router-link>
            </li>
          </ul>
        </div>

        <div class="pp-panel">
          <h3>{{ $t('m.Practice_recent') }}</h3>
          <p v-if="!overview.recent_submissions.length" class="v2-empty">{{ $t('m.V2_No_Recent') }}</p>
          <ul v-else class="pp-list">
            <li v-for="item in overview.recent_submissions" :key="item.id">
              <router-link :to="'/status/' + item.id">
                <span class="pp-verdict" :class="item.result === 0 ? 'is-ok' : 'is-ko'">{{ verdictShort(item.result) }}</span>
                <span>{{ item.problem__title }}</span>
                <small>{{ item.language }}</small>
              </router-link>
            </li>
          </ul>
        </div>

        <div v-if="overview.topics.length" class="pp-panel">
          <h3>{{ $t('m.Practice_topics') }}</h3>
          <div class="pp-topics">
            <span class="v2-chip v2-chip--mint" v-for="topic in overview.topics" :key="topic.tags__name || 'none'">
              {{ topic.tags__name || $t('m.Practice_no_topic') }} · {{ topic.solved }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import api from '@/utils/tutorApi'
import {JUDGE_STATUS} from '@/utils/constants'
import {ACCESSORIES, COLORS, PALETTES, stageProgress} from '@/utils/mascot'
import LizardMascot from './LizardMascot.vue'

export default {
  name: 'PersonalPractice',
  components: {LizardMascot},
  props: {userId: {type: Number, default: null}},
  data () {
    return {state: null, overview: null, error: '', busy: false, epoch: 0, cheering: false, palettes: PALETTES}
  },
  computed: {
    stageLabel () {
      return this.$t('m.Mascot_' + this.state.stage)
    },
    progress () {
      return stageProgress(this.state.solved_count)
    },
    progressLabel () {
      const values = {n: this.progress.remaining, stage: this.$t('m.Mascot_' + this.progress.next)}
      return this.$tc('m.Mascot_progress', this.progress.remaining, values)
    },
    colors () {
      return COLORS.map(item => ({...item, locked: this.state.unlocked_colors.indexOf(item.name) === -1}))
    },
    accessories () {
      return ACCESSORIES.map(item => ({...item, locked: this.state.unlocked_accessories.indexOf(item.name) === -1}))
    },
    bubble () {
      if (this.cheering) return this.$t('m.Mascot_bubble_cheer')
      const stage = this.state.stage
      const solved = this.state.solved_count
      if (stage === 'egg') return this.$t('m.Mascot_bubble_egg')
      if (stage === 'adult') return this.$t('m.Mascot_bubble_adult' + (solved % 2 + 1))
      return this.$t('m.Mascot_bubble_grow' + (solved % 3 + 1), {n: this.progress.remaining})
    }
  },
  created () {
    this.load()
  },
  beforeDestroy () {
    this.epoch++
    clearTimeout(this.cheerTimer)
  },
  watch: {
    userId () {
      this.load()
    }
  },
  methods: {
    verdictShort (result) {
      const status = JUDGE_STATUS[result]
      return status ? status.short : '?'
    },
    cheer () {
      clearTimeout(this.cheerTimer)
      this.cheering = true
      this.cheerTimer = setTimeout(() => { this.cheering = false }, 2200)
    },
    async load () {
      const epoch = ++this.epoch
      this.error = ''
      this.state = this.overview = null
      if (!this.userId) return
      this.busy = true
      try {
        const data = await Promise.all([api.mascot(), api.overview()])
        if (epoch === this.epoch) {
          this.state = data[0]
          this.overview = data[1]
        }
      } catch (error) {
        if (epoch === this.epoch) this.error = error.message
      } finally {
        if (epoch === this.epoch) this.busy = false
      }
    },
    async update (data) {
      const epoch = this.epoch
      this.busy = true
      try {
        const state = await api.updateMascot(data)
        if (epoch === this.epoch) {
          this.state = state
          if (data.color || data.accessory) this.cheer()
        }
      } catch (error) {
        if (epoch === this.epoch) this.error = error.message
      } finally {
        if (epoch === this.epoch) this.busy = false
      }
    }
  }
}
</script>

<style scoped>
.personal-practice {
  padding: clamp(18px, 3vw, 30px);
  margin: 20px auto;
  max-width: 100%;
  background: var(--lj-surface, #fff);
  border: 1px solid var(--lj-border, #dce7e1);
  border-radius: var(--lj-radius, 18px);
  box-shadow: var(--lj-shadow);
  overflow-wrap: anywhere;
}
.pp-header h2 { margin: 6px 0 4px; font-size: clamp(22px, 2.6vw, 28px); letter-spacing: -.6px; color: var(--lj-text); }
.pp-error { color: var(--lj-primary); margin: 12px 0; }
.pp-grid { display: grid; grid-template-columns: minmax(0, 340px) minmax(0, 1fr); gap: 22px; margin-top: 20px; align-items: start; }
.pp-habitat {
  position: relative;
  padding: 18px 18px 16px;
  border-radius: 16px;
  background: linear-gradient(180deg, var(--lj-mint) 0%, var(--lj-surface) 78%);
  border: 1px solid var(--lj-border);
  text-align: center;
}
.pp-bubble {
  position: relative;
  margin: 0 auto 6px;
  max-width: 260px;
  padding: 10px 14px;
  border-radius: 14px;
  background: var(--lj-surface);
  border: 1px solid var(--lj-border);
  color: var(--lj-text);
  font-size: 13px;
  line-height: 1.45;
  box-shadow: var(--lj-shadow);
}
.pp-bubble::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -7px;
  width: 12px;
  height: 12px;
  background: var(--lj-surface);
  border-right: 1px solid var(--lj-border);
  border-bottom: 1px solid var(--lj-border);
  transform: translateX(-50%) rotate(45deg);
}
.pp-mascot { width: min(220px, 70%); margin: 4px auto 0; cursor: pointer; border-radius: 50%; }
.pp-hidden { padding: 28px 8px; color: var(--lj-muted); font-size: 13px; }
.pp-stage { display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; align-items: baseline; color: var(--lj-muted); font-size: 13px; }
.pp-stage strong { color: var(--lj-green); font-size: 16px; }
.pp-progress { margin: 10px auto 4px; max-width: 260px; }
.pp-progress__track { height: 9px; border-radius: 99px; background: var(--lj-soft); overflow: hidden; border: 1px solid var(--lj-border); }
.pp-progress__track span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #5aa469, #8b2346); transition: width .6s ease; }
.pp-progress small { display: block; margin-top: 6px; color: var(--lj-muted); font-size: 12px; }
.pp-customize { margin-top: 14px; text-align: left; border-top: 1px dashed var(--lj-border); padding-top: 10px; }
.pp-customize summary { cursor: pointer; font-weight: 650; color: var(--lj-green); font-size: 13px; }
.pp-customize fieldset { border: 0; padding: 0; margin: 12px 0 0; }
.pp-customize legend { font-size: 12px; font-weight: 650; color: var(--lj-muted); margin-bottom: 6px; }
.pp-options { display: flex; flex-wrap: wrap; gap: 6px; }
.pp-swatch, .pp-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 34px;
  padding: 6px 10px;
  border-radius: 10px;
  border: 1px solid var(--lj-border);
  background: var(--lj-surface);
  color: var(--lj-text);
  font-size: 12px;
  cursor: pointer;
  text-align: left;
}
.pp-swatch__dot { width: 14px; height: 14px; border-radius: 50%; background: var(--swatch); box-shadow: inset 0 0 0 2px rgba(255,255,255,.5); }
.pp-swatch[aria-pressed='true'], .pp-chip[aria-pressed='true'] { border-color: var(--lj-green); box-shadow: 0 0 0 2px var(--lj-mint); font-weight: 650; }
.pp-swatch.is-locked, .pp-chip.is-locked { opacity: .55; cursor: not-allowed; }
.pp-lock { display: inline-flex; align-items: center; gap: 3px; color: var(--lj-muted); font-size: 11px; }
.pp-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.pp-switch { display: flex; align-items: center; gap: 8px; margin: 10px 0 0; font-size: 13px; color: var(--lj-text); }
.pp-switch input { width: 16px; height: 16px; accent-color: #245e50; }
.pp-overview { display: grid; gap: 14px; min-width: 0; }
.pp-continue {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 2px 12px;
  padding: 16px 18px;
  border-radius: 14px;
  color: #fff;
  background: linear-gradient(120deg, #245e50, #8b2346);
  transition: transform .2s ease, box-shadow .2s ease;
}
.pp-continue:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(36, 94, 80, .2); color: #fff; }
.pp-continue__label { grid-column: 1; font-size: 11px; letter-spacing: 1.2px; text-transform: uppercase; opacity: .85; }
.pp-continue strong { grid-column: 1; font-size: 16px; }
.pp-continue .ivu-icon { grid-column: 2; grid-row: 1 / span 2; font-size: 20px; }
.pp-panel { padding: 14px 16px; border-radius: 14px; border: 1px solid var(--lj-border); background: var(--lj-surface); }
.pp-panel h3 { margin: 0 0 8px; font-size: 14px; color: var(--lj-text); }
.pp-list { list-style: none; margin: 0; padding: 0; }
.pp-list li + li { border-top: 1px solid var(--lj-border); }
.pp-list a { display: flex; align-items: center; gap: 10px; padding: 8px 4px; color: var(--lj-text); font-size: 13px; min-width: 0; }
.pp-list a:hover { color: var(--lj-green); }
.pp-list a > span:not(.pp-verdict):not(.pp-list__id) { flex: 1; min-width: 0; }
.pp-list small { color: var(--lj-muted); font-size: 11px; white-space: nowrap; }
.pp-list__id { font-family: Consolas, monospace; font-size: 11px; color: var(--lj-muted); white-space: nowrap; }
.pp-verdict { flex: none; min-width: 38px; text-align: center; padding: 2px 6px; border-radius: 6px; font-size: 11px; font-weight: 700; }
.pp-verdict.is-ok { color: var(--lj-green); background: var(--lj-mint); }
.pp-verdict.is-ko { color: var(--lj-primary); background: var(--lj-rose); }
.pp-topics { display: flex; flex-wrap: wrap; gap: 6px; }
@media (max-width: 760px) {
  .pp-grid { grid-template-columns: 1fr; }
}
@media (prefers-reduced-motion: reduce) {
  .pp-continue, .pp-progress__track span { transition: none; }
}
</style>
