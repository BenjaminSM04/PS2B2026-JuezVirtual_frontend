<template>
  <textarea ref="editor"></textarea>
</template>

<script>
  import Simditor from 'tar-simditor'

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
      
      // Keep the stored value as the raw `$...$` source. Math is rendered on
      // display (via the v-katex directive) and previewed through KatexEditor;
      // rendering it inside the editable body here would bake KaTeX HTML into
      // getValue() and collapse spaces around text once re-rendered.
      this.editor.on('valuechanged', (e, src) => {
        this.currentValue = this.editor.getValue()
      })
      this.editor.on('decorate', (e, src) => {
        this.currentValue = this.editor.getValue()
      })

      this.editor.setValue(this.value)
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
