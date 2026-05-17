<template>
  <el-form class="katex-editor">
    <el-form-item :label="$t('m.Input')">
      <el-input
        type="textarea"
        :rows="4"
        v-model="input">
      </el-input>
    </el-form-item>

    <el-form-item :label="$t('m.Output')">
      <div class="katex-editor__preview">
        <div :key="input" v-katex>$$ {{ input || ' ' }} $$</div>
      </div>
    </el-form-item>
  </el-form>
</template>

<script>
  export default {
    name: 'KatexEditor',
    data () {
      return {
        input: 'c = \\pm\\sqrt{a^2 + b^2}'
      }
    }
  }
</script>

<style scoped lang="less">
  .katex-editor {
    &__preview {
      min-height: 96px;
      padding: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow-x: auto;
      border: 1px solid #ebeef5;
      border-radius: 8px;
      background: #fbfcfd;
      color: #1f2d3d;
    }
  }
</style>
