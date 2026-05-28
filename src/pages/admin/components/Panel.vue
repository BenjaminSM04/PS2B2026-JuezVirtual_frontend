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
      width: 100%;
      min-width: 0;
      margin: 10px auto 20px;
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
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    padding: 14px 0 2px;
    > button {
      margin: 0;
    }
    /* La paginación siempre se alinea a la derecha; los botones quedan a la izquierda. */
    > .page {
      margin-left: auto;
    }
  }

  @media (max-width: 768px) {
    .panel-options > .page {
      margin-left: 0;
      width: 100%;
    }
  }
</style>
