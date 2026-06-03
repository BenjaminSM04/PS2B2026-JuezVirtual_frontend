<template>
  <div class="empty-state">
    <Icon :type="icon" :size="size" class="empty-state__icon"></Icon>
    <p class="empty-state__message">{{ message }}</p>
    <div class="empty-state__action" v-if="$slots.default">
      <slot></slot>
    </div>
  </div>
</template>

<script>
  // Estado vacío reusable: ícono + mensaje atenuado + CTA opcional (slot).
  // Entra con un fade sutil. Usa iView Icon (registrado globalmente).
  export default {
    name: 'EmptyState',
    props: {
      icon: {
        type: String,
        default: 'information-circled'
      },
      message: {
        type: String,
        default: ''
      },
      size: {
        type: Number,
        default: 48
      }
    }
  }
</script>

<style lang="less" scoped>
  @import (reference) '../styles/theme-oj.less';
  .empty-state {
    text-align: center;
    padding: 40px 20px;
    color: fade(@oj-text, 55%);
    animation: empty-fade .4s ease-out;
    &__icon {
      color: fade(@oj-secondary, 70%);
    }
    &__message {
      margin: 12px 0 0;
      font-size: 15px;
    }
    &__action {
      margin-top: 16px;
    }
  }
  @keyframes empty-fade {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: none; }
  }
</style>
