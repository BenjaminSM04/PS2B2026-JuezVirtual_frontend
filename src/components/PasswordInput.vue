<template>
  <component :is="admin ? 'el-input' : 'Input'"
             class="password-input"
             v-bind="$attrs"
             :value="value"
             :type="revealed ? 'text' : 'password'"
             :autocomplete="autocomplete"
             :label="$attrs.label || $attrs.placeholder || $t('m.Password')"
             :disabled="disabled"
             v-on="$listeners">
    <slot v-if="$slots.prepend" name="prepend" slot="prepend"></slot>
    <button :slot="admin ? 'suffix' : 'append'"
            type="button"
            class="password-toggle"
            :disabled="disabled"
            :aria-label="toggleLabel"
            :title="toggleLabel"
            :aria-pressed="String(revealed)"
            @mousedown.prevent
            @keydown.enter.stop
            @keyup.enter.stop
            @click.stop="revealed = !revealed">
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/>
        <circle cx="12" cy="12" r="3"/>
        <path v-if="!revealed" d="M3 3l18 18"/>
      </svg>
    </button>
  </component>
</template>

<script>
  export default {
    name: 'PasswordInput',
    inheritAttrs: false,
    props: {
      value: {type: String, default: ''},
      admin: Boolean,
      disabled: Boolean,
      autocomplete: {type: String, default: 'current-password'}
    },
    data () {
      return {revealed: false}
    },
    computed: {
      toggleLabel () {
        return this.$t(this.revealed ? 'm.Hide_Password' : 'm.Show_Password')
      }
    },
    watch: {
      value (value) {
        if (!value) this.revealed = false
      }
    }
  }
</script>

<style scoped lang="less">
  .password-input {
    /deep/ .ivu-input-group-append {
      padding: 0;
    }

    /deep/ .el-input__inner {
      padding-right: 46px;
    }
  }

  .password-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 36px;
    min-height: 32px;
    height: 100%;
    padding: 0 8px;
    border: 0;
    border-radius: 4px;
    background: transparent;
    color: inherit;
    cursor: pointer;

    &:focus-visible {
      outline: 2px solid currentColor;
      outline-offset: -3px;
    }

    &:hover { background: rgba(128, 128, 128, 0.15); }
    &:disabled { cursor: not-allowed; }

    svg {
      fill: none;
      stroke: currentColor;
      stroke-width: 1.8;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  }

  .el-input .password-toggle { color: #606266; }
</style>
