<template>
  <el-button
    :type="type"
    :size="size"
    :icon="icon"
    :loading="loading"
    :disabled="disabled"
    @click="$emit('click', $event)">
    <slot>{{ label }}</slot>
  </el-button>
</template>

<script>
  export default {
    name: 'ActionBtn',
    props: {
      icon: { type: String, required: true },
      label: { type: String, default: '' },
      type: { type: String, default: 'primary' },
      size: { type: String, default: 'small' },
      loading: { type: Boolean, default: false },
      disabled: { type: Boolean, default: false }
    }
  }
</script>
