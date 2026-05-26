<template>
  <div class="panel" :class="{'small': small}">
    <header>
      <div class="title">
        <template v-if="$slots.title">
          <slot name="title"></slot>
        </template>
        <template v-else>
          {{title}}
        </template>
      </div>

      <div class="header_right">
        <slot name="header"></slot>
      </div>
    </header>

    <div class="body">
      <slot></slot>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Panel',
    props: {
      title: {
        type: String,
        required: false
      },
      small: {
        type: Boolean,
        default: false
      }
    }
  }
</script>
<style scoped lang="less">
  .panel {
    margin-bottom: 20px;
    background-color: #fff;
    border: 1px solid #f0f2f5;
    border-radius: 16px;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.05);
    overflow: hidden;
    transition: box-shadow 0.2s ease;

    &:hover {
      box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
    }

    &.small {
      max-width: 830px;
      min-width: 0;
      margin-left: 20px;
      margin-top: 10px;
    }
    header {
      position: relative;
      z-index: 10;
      > .title {
        margin: 0;
        color: #2c3e50;
        font-size: 16px;
        font-weight: 600;
        letter-spacing: 0.02em;
        height: 56px;
        line-height: 36px;
        padding: 10px 20px;
        border-bottom: 1px solid #f0f2f5;
      }
      > .header_right {
        position: absolute;
        top: 50%;
        right: 20px;
        transform: translate(0, -50%);
      }
    }
    .body {
      padding: 20px;
    }
  }
</style>
<style lang="less">
  .panel-options {
    background-color: transparent;
    position: relative;
    height: 50px;
    button {
      margin-top: 18px;
      margin-right: 10px;
    }
    > .page {
      position: absolute;
      right:20px;
      top: 20px;
    }
  }

  @media (max-width: 768px) {
    .panel-options {
      height: auto;
      padding-bottom: 12px;
    }
    .panel-options > .page {
      position: static;
      margin-top: 12px;
    }
  }
</style>
