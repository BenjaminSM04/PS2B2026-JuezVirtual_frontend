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
        <div v-else ref="preview" class="katex-editor__math"></div>
      </div>
    </el-form-item>
  </el-form>
</template>

<script>
  import 'katex/dist/katex.min.css'
  import { getRenderer } from '@/plugins/katex'

  const KATEX_OPTIONS = {
    throwOnError: true,
    strict: false,
    delimiters: [
      {left: '$$', right: '$$', display: true},
      {left: '\\[', right: '\\]', display: true},
      {left: '\\(', right: '\\)', display: false},
      {left: '$', right: '$', display: false}
    ]
  }

  export default {
    name: 'KatexEditor',
    data () {
      return {
        input: 'c = \\pm\\sqrt{a^2 + b^2}',
        error: ''
      }
    },
    mounted () {
      this.renderLatex()
    },
    watch: {
      input () {
        this.$nextTick(() => this.renderLatex())
      },
      error () {
        if (!this.error) {
          this.$nextTick(() => this.renderLatex())
        }
      }
    },
    methods: {
      renderLatex () {
        const el = this.$refs.preview
        if (!el) return
        if (!this.input) {
          el.textContent = ''
          this.error = ''
          return
        }
        el.textContent = `$$${this.input}$$`
        const renderMathInElement = getRenderer()
        if (typeof renderMathInElement !== 'function') {
          this.error = ''
          return
        }
        try {
          renderMathInElement(el, KATEX_OPTIONS)
          this.error = ''
        } catch (e) {
          el.textContent = ''
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

    &__math {
      max-width: 100%;
      overflow-x: auto;
      text-align: center;
    }

    &__error {
      color: #f56c6c;
      font-weight: 600;
      word-break: break-word;
    }
  }
</style>
