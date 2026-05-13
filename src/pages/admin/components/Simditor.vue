<template>
  <textarea ref="editor"></textarea>
</template>

<script>
  import Simditor from 'tar-simditor'
  Simditor.i18n['es'] = {
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

Simditor.locale = 'es'

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
      Simditor.i18n['zh-CN'] = {
      'title': 'Título',
      'bold': 'Negrita',
      'italic': 'Cursiva',
      'underline': 'Subrayado',
      'strikethrough': 'Tachado',
      'fontScale': 'Tamaño',
      'color': 'Color',
      'ol': 'Lista Numerada',
      'ul': 'Lista de Viñetas',
      'blockquote': 'Cita',
      'code': 'Código',
      'table': 'Tabla',
      'link': 'Enlace',
      'image': 'Imagen',
      'hr': 'Línea Horizontal',
      'indent': 'Aumentar Sangría',
      'outdent': 'Disminuir Sangría',
      'alignment': 'Alineación',
      'upload file': 'Subir archivo',
    'uploadFile': 'Subir archivo',
    'upload': 'Subir archivo',  
      'markdown': 'Modo Markdown',   
      'normalText': 'Texto Normal',
      'title1': 'Título 1',
      'title2': 'Título 2',
      'title3': 'Título 3'
      }

      this.editor = new Simditor({
        textarea: this.$refs.editor,
        toolbar: this.toolbar,
        locale: 'es',
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
