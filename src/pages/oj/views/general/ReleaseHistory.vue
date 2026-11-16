<template>
  <div class="v2-release-page">
    <div class="v2-page-heading">
      <span class="v2-eyebrow">LizardJudge · UNIVALLE</span>
      <h1>{{ $t('m.Release_Notes') }}</h1>
    </div>
    <Panel :padding="24"><ReleaseNotes></ReleaseNotes></Panel>
  </div>
</template>
<script>
import ReleaseNotes from '@/components/ReleaseNotes.vue'
export default { components: { ReleaseNotes } }
</script>
