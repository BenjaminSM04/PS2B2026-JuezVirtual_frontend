<template>
  <section class="release-feed" :aria-busy="loading">
    <div class="release-feed__intro">
      <span class="v2-eyebrow">{{ $t('m.V2_Release_Origin') }}</span>
      <p>{{ $t('m.V2_Release_Explanation') }}</p>
    </div>
    <div v-if="loading" class="v2-skeleton" aria-live="polite">{{ $t('m.V2_Loading') }}</div>
    <div v-else-if="error" class="v2-empty" role="status">
      <i class="el-icon-fa-code-fork" aria-hidden="true"></i>
      <p>{{ $t('m.V2_Release_Unavailable') }}</p>
      <button class="v2-retry" type="button" @click="load">{{ $t('m.V2_Retry') }}</button>
    </div>
    <template v-else>
      <article v-for="release in notes.update" :key="release.version" class="release-entry">
        <header>
          <div>
            <h3>{{ release.title }}</h3>
            <time v-if="release.date" :datetime="release.date">{{ release.date }}</time>
          </div>
          <span v-if="release.is_current" class="v2-chip v2-chip--mint">{{ $t('m.V2_Installed') }}</span>
        </header>
        <ul>
          <li v-for="(detail, index) in release.details" :key="index">{{ detail }}</li>
        </ul>
      </article>
      <p v-if="!notes.update.length" class="v2-empty">{{ $t('m.No_Release_Notes') }}</p>
      <a v-if="sourceUrl" class="v2-source-link" :href="sourceUrl" target="_blank" rel="noopener noreferrer">
        <i class="el-icon-fa-github" aria-hidden="true"></i> {{ $t('m.V2_View_Source') }}
        <span v-if="notes.revision && notes.revision !== 'desarrollo'">· {{ notes.revision.slice(0, 7) }}</span>
      </a>
    </template>
  </section>
</template>
<script>
import axios from 'axios'
export default {
  data () {
    return { loading: true, error: false, notes: { update: [] } }
  },
  computed: {
    sourceUrl () {
      const url = this.notes.source_url || ''
      return /^https:\/\/github\.com\/incubadoradesarrollo-source\/F-LIZARD-JUDGE\/blob\/(?:main|[a-f0-9]{40})\/CHANGELOG\.md$/.test(
        url
      )
        ? url
        : ''
    }
  },
  mounted () {
    this.load()
  },
  methods: {
    load () {
      this.loading = true
      this.error = false
      return axios
        .get('/release-notes.json', { baseURL: '/', timeout: 5000 })
        .then(({ data }) => {
          if (!data || !Array.isArray(data.update)) throw new Error('Formato inválido')
          this.notes = data
        })
        .catch(() => {
          this.error = true
        })
        .then(() => {
          this.loading = false
        })
    }
  }
}
</script>
