<template>
  <span class="brand-mark" :class="{ 'brand-mark--compact': compact }">
    <img src="@/assets/logo-v2.png" alt="" class="brand-mark__icon" width="48" height="48" />
    <span class="brand-mark__copy">
      <span class="brand-mark__name"
        >Lizard<span>Judge</span><small v-if="version">v{{ shortVersion }}</small></span
      >
      <span class="brand-mark__caption">UNIVALLE · LA PAZ</span>
    </span>
  </span>
</template>
<script>
export default {
  props: { compact: Boolean, version: { type: Boolean, default: true } },
  computed: {
    shortVersion () {
      return process.env.APP_VERSION.split('.').slice(0, 2).join('.')
    }
  }
}
</script>
