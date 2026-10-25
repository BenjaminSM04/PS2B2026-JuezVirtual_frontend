<template><button class="theme-toggle" type="button" :aria-pressed="dark" @click="toggle">{{ $t(dark ? 'm.Theme_light' : 'm.Theme_dark') }}</button></template>
<script>
export default {
  name: 'ThemeToggle',
  data () { return {dark: false} },
  mounted () {
    this.dark = localStorage.getItem('lizard-theme') === 'dark' || (!localStorage.getItem('lizard-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    this.apply()
  },
  methods: {
    apply () { document.documentElement.setAttribute('data-lizard-theme', this.dark ? 'dark' : 'light') },
    toggle () { this.dark = !this.dark; localStorage.setItem('lizard-theme', this.dark ? 'dark' : 'light'); this.apply() }
  }
}
</script>
<style scoped>.theme-toggle { position: fixed; right: 16px; bottom: 18px; z-index: 100; background: var(--lj-surface, white); color: var(--lj-text, #63213a); border: 1px solid #8b2346; padding: 10px 14px; border-radius: 20px; cursor: pointer; }</style>
