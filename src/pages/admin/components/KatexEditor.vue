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
      <div class="katex-editor__preview" :class="{'is-error': error}">
        <div v-if="error" class="katex-editor__error">{{ error }}</div>
        <div v-else v-html="rendered"></div>
      </div>
    </el-form-item>
  </el-form>
</template>

<script>
  import 'katex/dist/katex.min.css'
  const katex = require('katex')

  export default {
    name: 'KatexEditor',
    data () {
      return {
        input: 'c = \\pm\\sqrt{a^2 + b^2}',
        rendered: '',
        error: ''
      }
    },
    watch: {
      input: {
        immediate: true,
        handler () {
          this.renderLatex()
        }
      }
    },
    methods: {
      renderLatex () {
        if (!this.input) {
          this.rendered = ''
          this.error = ''
          return
        }
        try {
          this.rendered = katex.renderToString(this.input, {
            displayMode: true,
            throwOnError: false,
            strict: false
          })
          this.error = ''
        } catch (e) {
          this.rendered = ''
          this.error = e.message || 'Entrada inválida'
        }
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

    &__preview.is-error {
      justify-content: flex-start;
      border-color: #fbc4c4;
      background: #fef0f0;
    }

    &__error {
      color: #f56c6c;
      font-weight: 600;
      word-break: break-word;
    }
  }
</style>
