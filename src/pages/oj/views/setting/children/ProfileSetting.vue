<template>
  <div class="setting-main">

    <div class="profile-card">
      <div class="section-title">
        Configuración de Avatar
      </div>

      <template v-if="!avatarOption.imgSrc">
        <Upload
          type="drag"
          class="mini-container upload-area"
          accept=".jpg,.jpeg,.png,.bmp,.gif"
          action=""
          :before-upload="handleSelectFile"
        >
          <div style="padding: 30px 0">
            <Icon
              type="ios-cloud-upload"
              size="52"
              style="color: #003B4A"
            ></Icon>

            <p class="upload-text">
              Arrastra una imagen aquí o haz clic para seleccionar
            </p>
          </div>
        </Upload>
      </template>

      <template v-else>
        <div class="flex-container">

          <div class="cropper-main inline">
            <vueCropper
              ref="cropper"
              autoCrop
              fixed
              :autoCropWidth="200"
              :autoCropHeight="200"
              :img="avatarOption.imgSrc"
              :outputSize="avatarOption.size"
              :outputType="avatarOption.outputType"
              :info="true"
              @realTime="realTime"
            >
            </vueCropper>
          </div>

          <ButtonGroup vertical class="cropper-btn">
            <Button @click="rotate('left')">
              <Icon type="arrow-return-left" size="20"></Icon>
            </Button>

            <Button @click="rotate('right')">
              <Icon type="arrow-return-right" size="20"></Icon>
            </Button>

            <Button @click="reselect">
              <Icon type="refresh" size="20"></Icon>
            </Button>

            <Button @click="finishCrop">
              <Icon type="checkmark-round" size="20"></Icon>
            </Button>
          </ButtonGroup>

          <div class="cropper-preview" :style="previewStyle">
            <div :style="preview.div">
              <img :src="avatarOption.imgSrc" :style="preview.img">
            </div>
          </div>

        </div>
      </template>
    </div>

    <Modal
      v-model="uploadModalVisible"
      title="Subir avatar"
    >
      <div class="upload-modal">
        <p class="notice">
          Tu avatar se actualizará a:
        </p>

        <img :src="uploadImgSrc"/>
      </div>

      <div slot="footer">
        <Button
          class="save-btn"
          @click="uploadAvatar"
          :loading="loadingUploadBtn"
        >
          Subir imagen
        </Button>
      </div>
    </Modal>

    <div class="profile-card">

      <div class="section-title">
        Configuración del Perfil
      </div>

      <Form
        ref="formProfile"
        :model="formProfile"
        :rules="rules"
      >

        <Row type="flex" :gutter="30" justify="space-around">

          <Col :span="11">

            <FormItem
              label="Nombre real"
              prop="real_name"
            >
              <Input
                class="custom-input"
                v-model="formProfile.real_name"
              />
            </FormItem>

            <FormItem
              label="Universidad"
              prop="school"
            >
              <Input
                class="custom-input"
                v-model="formProfile.school"
              />
            </FormItem>

            <FormItem
              label="Carrera"
              prop="major"
            >
              <Input
                class="custom-input"
                v-model="formProfile.major"
              />
            </FormItem>

            <FormItem
              label="Idioma"
              prop="language"
            >
              <Select v-model="formProfile.language">
                <Option
                  v-for="lang in languages"
                  :key="lang.value"
                  :value="lang.value"
                >
                  {{lang.label}}
                </Option>
              </Select>
            </FormItem>

            <FormItem>
              <Button
                class="save-btn"
                type="primary"
                @click="updateProfile"
                :loading="loadingSaveBtn"
              >
                Guardar cambios
              </Button>
            </FormItem>

          </Col>

          <!-- DERECHA -->
          <Col :span="11">

            <FormItem
              label="Estado"
              prop="mood"
            >
              <Input
                class="custom-input"
                v-model="formProfile.mood"
              />
            </FormItem>

            <FormItem
              label="Blog"
              prop="blog"
            >
              <Input
                class="custom-input"
                v-model="formProfile.blog"
              />
            </FormItem>

            <FormItem
              label="Github"
              prop="github"
            >
              <Input
                class="custom-input"
                v-model="formProfile.github"
              />
            </FormItem>

          </Col>

        </Row>
      </Form>

    </div>
  </div>
</template>

<script>
import api from '@oj/api'
import utils from '@/utils/utils'
import {VueCropper} from 'vue-cropper'
import {types} from '@/store'
import {languages} from '@/i18n'

export default {
  components: {
    VueCropper
  },

  data () {
    return {
      loadingSaveBtn: false,
      loadingUploadBtn: false,
      uploadModalVisible: false,

      preview: {},
      uploadImgSrc: '',

      avatarOption: {
        imgSrc: '',
        size: 0.8,
        outputType: 'png'
      },

      languages: languages,

      formProfile: {
        real_name: '',
        mood: '',
        major: '',
        blog: '',
        school: '',
        github: '',
        language: ''
      },

      rules: {
        real_name: [
          {
            required: true,
            message: 'El nombre es obligatorio',
            trigger: 'blur'
          }
        ],

        school: [
          {
            required: true,
            message: 'La universidad es obligatoria',
            trigger: 'blur'
          }
        ],

        major: [
          {
            required: true,
            message: 'La carrera es obligatoria',
            trigger: 'blur'
          }
        ],

        github: [
          {
            type: 'url',
            message: 'Ingrese una URL válida',
            trigger: 'blur'
          }
        ],

        blog: [
          {
            type: 'url',
            message: 'Ingrese una URL válida',
            trigger: 'blur'
          }
        ]
      }
    }
  },

  mounted () {
    let profile = this.$store.state.user.profile

    Object.keys(this.formProfile).forEach(element => {
      if (profile[element] !== undefined) {
        this.formProfile[element] = profile[element]
      }
    })
  },

  methods: {

    checkFileType (file) {
      if (!/\.(gif|jpg|jpeg|png|bmp|GIF|JPG|PNG)$/.test(file.name)) {

        this.$Notice.warning({
          title: 'Formato no válido',
          desc: 'El archivo ' + file.name + ' no es una imagen válida.'
        })

        return false
      }

      return true
    },

    checkFileSize (file) {

      if (file.size > 2 * 1024 * 1024) {

        this.$Notice.warning({
          title: 'Archivo demasiado grande',
          desc: 'La imagen no puede superar los 2MB.'
        })

        return false
      }

      return true
    },

    handleSelectFile (file) {

      let isOk =
        this.checkFileType(file) &&
        this.checkFileSize(file)

      if (!isOk) {
        return false
      }

      let reader = new window.FileReader()

      reader.onload = (e) => {
        this.avatarOption.imgSrc = e.target.result
      }

      reader.readAsDataURL(file)

      return false
    },

    realTime (data) {
      this.preview = data
    },

    rotate (direction) {

      if (direction === 'left') {
        this.$refs.cropper.rotateLeft()
      } else {
        this.$refs.cropper.rotateRight()
      }
    },

    reselect () {

      this.$Modal.confirm({
        title: 'Confirmación',
        content: '¿Desea descartar los cambios realizados?',
        onOk: () => {
          this.avatarOption.imgSrc = ''
        }
      })
    },

    finishCrop () {

      this.$refs.cropper.getCropData(data => {
        this.uploadImgSrc = data
        this.uploadModalVisible = true
      })
    },

    uploadAvatar () {

      this.$refs.cropper.getCropBlob(blob => {

        let form = new window.FormData()

        let file = new window.File(
          [blob],
          'avatar.' + this.avatarOption.outputType
        )

        form.append('image', file)

        this.loadingUploadBtn = true

        this.$http({
          method: 'post',
          url: 'upload_avatar',
          data: form,
          headers: {
            'content-type': 'multipart/form-data'
          }
        }).then(res => {

          this.loadingUploadBtn = false

          this.$success('Avatar actualizado correctamente')

          this.uploadModalVisible = false

          this.avatarOption.imgSrc = ''

          this.$store.dispatch('getProfile')

        }, () => {

          this.loadingUploadBtn = false

          this.$error('Ocurrió un error al subir la imagen')
        })
      })
    },

    updateProfile () {

      this.$refs.formProfile.validate((valid) => {

        if (!valid) {
          this.$error('Complete correctamente los campos')
          return
        }

        this.loadingSaveBtn = true

        let updateData =
          utils.filterEmptyValue(
            Object.assign({}, this.formProfile)
          )

        api.updateProfile(updateData).then(res => {

          this.$success('Perfil actualizado correctamente')

          this.$store.commit(
            types.CHANGE_PROFILE,
            {
              profile: res.data.data
            }
          )

          this.loadingSaveBtn = false

        }, _ => {

          this.loadingSaveBtn = false

          this.$error('Ocurrió un error al guardar los cambios')
        })
      })
    }
  },

  computed: {

    previewStyle () {
      return {
        width: this.preview.w + 'px',
        height: this.preview.h + 'px',
        overflow: 'hidden'
      }
    }
  }
}
</script>

<style lang="less" scoped>

.setting-main {
  padding: 25px;
  background: #f4f7f8;
}

.section-title {
  font-size: 22px;
  font-weight: bold;
  color: #003B4A;
  margin-bottom: 25px;
  border-left: 5px solid #A60550;
  padding-left: 12px;
}

.profile-card {
  background: white;
  border-radius: 16px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 4px 14px rgba(0,0,0,0.08);
}

.upload-area {
  border-radius: 14px;
  background: #BDF2D4;
}

.upload-text {
  color: #664D59;
  font-size: 15px;
  margin-top: 10px;
}

.inline {
  display: inline-block;
}

.copper-img {
  width: 400px;
  height: 300px;
}

.flex-container {
  flex-wrap: wrap;
  justify-content: flex-start;
  margin-bottom: 10px;

  .cropper-main {
    flex: none;
    .copper-img;
  }

  .cropper-btn {
    flex: none;
    vertical-align: top;
    margin-left: 10px;
  }

  .cropper-preview {
    flex: none;
    margin-left: 20px;
    box-shadow: 0 0 8px rgba(0,0,0,0.1);
    border-radius: 12px;
    overflow: hidden;
    .copper-img;
  }
}

.custom-input /deep/ input {
  border-radius: 10px;
  border: 1px solid #987284;
  transition: all 0.3s;
}

.custom-input /deep/ input:focus {
  border-color: #003B4A;
  box-shadow: 0 0 6px rgba(0,59,74,0.3);
}

.save-btn {
  background: #003B4A !important;
  border-color: #003B4A !important;
  border-radius: 10px;
  padding: 10px 25px;
  font-weight: bold;
}

.save-btn:hover {
  background: #A60550 !important;
  border-color: #A60550 !important;
}

.upload-modal {
  text-align: center;

  .notice {
    font-size: 16px;
    color: #664D59;
    margin-bottom: 15px;
  }

  img {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    border: 4px solid #BDF2D4;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  }
}

</style>