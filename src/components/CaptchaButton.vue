<template>
  <button type="button" class="captcha-refresh"
          :aria-label="$t('m.Click_to_refresh_captcha')"
          :title="$t('m.Click_to_refresh_captcha')"
          @click="$emit('refresh')">
    <img :src="src" :alt="$t('m.Captcha')"/>
  </button>
</template>

<script>
  export default {
    name: 'CaptchaButton',
    props: {src: {type: String, default: ''}}
  }
</script>

<style scoped>
  .captcha-refresh {
    display: inline-flex;
    padding: 0;
    border: 0;
    border-radius: 10px;
    background: transparent;
    cursor: pointer;
    max-width: 100%;
  }
  .captcha-refresh:focus-visible {
    outline: 3px solid #A60550;
    outline-offset: 2px;
  }
  img { display: block; max-width: 100%; }
</style>
