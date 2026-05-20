<template>
  <textarea ref="editor"></textarea>
</template>

<script>
  import Simditor from 'tar-simditor'
  import renderMathInElement from 'katex/dist/contrib/auto-render.js'

  const KATEX_OPTIONS = {
    throwOnError: false,
    errorCallback: () => {},
    delimiters: [
      {left: '$$', right: '$$', display: true},
      {left: '\\[', right: '\\]', display: true},
      {left: '\\(', right: '\\)', display: false},
      {left: '$', right: '$', display: false}
    ]
  }

  // Toolbar labels for the Simditor editor, selected by the app language.
  Simditor.i18n['es-LA'] = {
    'title': 'Título',
    'normalText': 'Texto normal',
    'bold': 'Negrita',
    'italic': 'Cursiva',
    'underline': 'Subrayado',
    'strikethrough': 'Tachado',
    'fontScale': 'Tamaño de fuente',
    'color': 'Color de texto',
    'ol': 'Lista numerada',
    'ul': 'Lista de viñetas',
    'blockquote': 'Cita',
    'code': 'Código',
    'table': 'Tabla',
    'image': 'Imagen',
    'link': 'Enlace',
    'hr': 'Línea horizontal',
    'indent': 'Aumentar sangría',
    'outdent': 'Disminuir sangría',
    'alignment': 'Alineación',
    'markdown': 'Markdown'
  }

  Simditor.i18n['en-US'] = {
    'title': 'Title',
    'normalText': 'Normal text',
    'bold': 'Bold',
    'italic': 'Italic',
    'underline': 'Underline',
    'strikethrough': 'Strikethrough',
    'fontScale': 'Font size',
    'color': 'Text color',
    'ol': 'Numbered list',
    'ul': 'Bullet list',
    'blockquote': 'Quote',
    'code': 'Code',
    'table': 'Table',
    'image': 'Image',
    'link': 'Link',
    'hr': 'Horizontal line',
    'indent': 'Increase indent',
    'outdent': 'Decrease indent',
    'alignment': 'Alignment',
    'markdown': 'Markdown'
  }

  import 'tar-simditor/styles/simditor.css'
  import 'tar-simditor-markdown'
  import 'tar-simditor-markdown/styles/simditor-markdown.css'
  import './simditor-file-upload'

  export default {
    name: 'Simditor',
    props: {
      toolbar: {
        type: Array,
        //default: () => ['title', 'bold', 'italic', 'underline', 'fontScale', 'color', 'ol', 'ul', '|', 'blockquote', 'code', 'link', 'table', 'image', 'uploadfile', 'hr', '|', 'indent', 'outdent', 'alignment', '|', 'markdown']
        default: () => ['title', 'bold', 'italic', 'underline', 'color', 'ol', 'ul', '|', 'blockquote', 'code', 'link', 'table', 'uploadfile', 'hr', '|', 'indent', 'outdent', 'alignment', '|', 'markdown']
      },
      value: {
        type: String,
        default: ''
      }
    },
    data () {
      return {
        editor: null,
        currentValue: this.value
      }
    },
    mounted () {
      const editorLocale = Simditor.i18n[this.$i18n.locale] ? this.$i18n.locale : 'en-US'

      this.editor = new Simditor({
        textarea: this.$refs.editor,
        toolbar: this.toolbar,
        locale: editorLocale,
        pasteImage: true,
        markdown: false,
        // Esta es la configuración completa para que el menú aparezca
        fontScale: [1, 1.25, 1.5, 2], // Usamos números en lugar de strings
        upload: {
          url: '/api/admin/upload_image/',
          params: null,
          fileKey: 'image',
          connectionCount: 3,
          leaveConfirm: this.$i18n.t('m.Uploading_is_in_progress')
        },
        allowedStyles: {
          span: ['color', 'font-size'] // Agregamos font-size aquí también
        },
        defaultImage: '/static/images/image.png'
      })
      
      this.editor.on('valuechanged', (e, src) => {
        this.currentValue = this.editor.getValue()
        this.$nextTick(() => this.renderMath())
      })
      this.editor.on('decorate', (e, src) => {
        this.currentValue = this.editor.getValue()
        this.$nextTick(() => this.renderMath())
      })

      this.editor.setValue(this.value)
      this.$nextTick(() => this.renderMath())
    },
    methods: {
      renderMath () {
        if (!this.editor || !this.editor.body) return
        const el = this.editor.body[0] || this.editor.body
        if (el) renderMathInElement(el, KATEX_OPTIONS)
      }
    },
    watch: {
      'value' (val) {
        if (this.currentValue !== val) {
          this.currentValue = val
          this.editor.setValue(val)
        }
      },
      'currentValue' (newVal, oldVal) {
        if (newVal !== oldVal) {
          this.$emit('change', newVal)
          this.$emit('input', newVal)
        }
      }
    }
  }
</script>


<style lang="less" scoped>

</style>
