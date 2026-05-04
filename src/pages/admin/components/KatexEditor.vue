<template>
  <el-form class="katex-editor">
    <el-form-item :label="$t('m.Input')">
      <el-input
        type="textarea"
        :rows="4"
        v-model="input"
        @input="changeInput">
      </el-input>
    </el-form-item>

    <el-form-item :label="$t('m.Output')">
      <div class="katex-editor__preview" :class="{'is-error': error}">
        <div v-if="error" class="katex-editor__error">{{error}}</div>
        <div v-else v-html="text"></div>
      </div>
    </el-form-item>
  </el-form>
</template>

<script>
  import 'katex/dist/katex.min.css'
  import katex from 'katex'

  export default {
    name: 'KatexEditor',
    data () {
      return {
        input: 'c = \\pm\\sqrt{a^2 + b^2}',
        text: '',
        error: ''
      }
    },
    mounted () {
      this.changeInput()
    },
    methods: {
      renderTex (data) {
        return katex.renderToString(data, {
          displayMode: true,
          throwOnError: false,
          strict: false
        })
      },
      changeInput () {
        if (!this.input) {
          this.text = ''
          this.error = ''
          return
        }
        try {
          this.text = this.renderTex(this.input)
          this.error = ''
        } catch (e) {
          this.text = ''
          this.error = e.message || 'Error Input'
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
