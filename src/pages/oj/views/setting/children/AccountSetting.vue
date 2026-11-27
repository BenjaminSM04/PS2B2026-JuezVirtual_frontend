<template>
  <div class="setting-main">
    <div class="flex-container">
      <div class="left profile-card">

        <p class="section-title">
          Cambiar Contraseña
        </p>

        <Form
          class="setting-content"
          ref="formPassword"
          :model="formPassword"
          :rules="rulePassword"
        >

          <FormItem
            label="Contraseña actual"
            prop="old_password"
          >
            <PasswordInput
              class="custom-input"
              v-model="formPassword.old_password"
            />
          </FormItem>

          <FormItem
            label="Nueva contraseña"
            prop="new_password"
          >
            <PasswordInput
              class="custom-input"
              v-model="formPassword.new_password"
              autocomplete="new-password"
            />
          </FormItem>

          <FormItem
            label="Confirmar contraseña"
            prop="again_password"
          >
            <PasswordInput
              class="custom-input"
              v-model="formPassword.again_password"
              autocomplete="new-password"
            />
          </FormItem>

          <FormItem
            v-if="visible.tfaRequired"
            label="Código de autenticación"
            prop="tfa_code"
          >
            <Input
              class="custom-input"
              v-model="formPassword.tfa_code"
            />
          </FormItem>

          <FormItem v-if="visible.passwordAlert">

            <Alert type="success">
              La contraseña fue actualizada correctamente.
              Deberá iniciar sesión nuevamente en 5 segundos.
            </Alert>

          </FormItem>

          <Button
            class="save-btn"
            type="primary"
            :loading="loading.btnPassword"
            @click="changePassword"
          >
            Actualizar contraseña
          </Button>

        </Form>
      </div>

      <div class="middle separator"></div>

      <div class="right profile-card">

        <p class="section-title">
          Cambiar Correo Electrónico
        </p>

        <Form
          class="setting-content"
          ref="formEmail"
          :model="formEmail"
          :rules="ruleEmail"
        >

          <FormItem
            label="Contraseña actual"
            prop="password"
          >
            <PasswordInput
              class="custom-input"
              v-model="formEmail.password"
            />
          </FormItem>

          <FormItem
            label="Correo actual"
          >
            <Input
              class="custom-input"
              :value="$store.getters.user.email || ''"
              disabled
            />
          </FormItem>

          <FormItem
            label="Nuevo correo"
            prop="new_email"
          >
            <Input
              class="custom-input"
              v-model="formEmail.new_email"
            />
          </FormItem>

          <FormItem
            v-if="visible.tfaRequired"
            label="Código de autenticación"
            prop="tfa_code"
          >
            <Input
              class="custom-input"
              v-model="formEmail.tfa_code"
            />
          </FormItem>

          <Button
            class="save-btn"
            type="primary"
            :loading="loading.btnEmail"
            @click="changeEmail"
          >
            Actualizar correo
          </Button>

        </Form>

      </div>

    </div>
  </div>
</template>

<script>
import api from '@oj/api'
import PasswordInput from '@/components/PasswordInput.vue'
import { FormMixin } from '@oj/components/mixins'

export default {
  components: {PasswordInput},
  mixins: [FormMixin],

  data () {
    const oldPasswordCheck = [
      {
        required: true,
        message: 'La contraseña es obligatoria',
        trigger: 'blur'
      }
    ]

    const tfaCheck = [
      {
        required: true,
        message: 'Ingrese el código de autenticación',
        trigger: 'change'
      }
    ]

    const CheckAgainPassword = (rule, value, callback) => {
      if (value !== this.formPassword.new_password) {
        return callback(
          new Error('Las contraseñas no coinciden')
        )
      }

      callback()
    }

    const CheckNewPassword = (rule, value, callback) => {
      // Política de contraseña fuerte (mismo set que registro/reset)
      const SPECIAL_CHARS = `!@#$%^&*()_+\\-=\\[\\]{};':",.<>/?\\\\|\`~`
      const passwordRegex = new RegExp(
        `^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[${SPECIAL_CHARS}])[A-Za-z\\d${SPECIAL_CHARS}]{8,}$`
      )

      if (value && !passwordRegex.test(value)) {
        callback(new Error(this.$i18n.t('m.Password_complexity_error')))
        return
      }

      if (this.formPassword.old_password !== '') {
        if (
          this.formPassword.old_password ===
          this.formPassword.new_password
        ) {
          return callback(
            new Error('La nueva contraseña no puede ser igual a la anterior')
          )
        } else {
          this.$refs.formPassword.validateField('again_password')
        }
      }

      callback()
    }

    return {

      loading: {
        btnPassword: false,
        btnEmail: false
      },

      visible: {
        passwordAlert: false,
        emailAlert: false,
        tfaRequired: false
      },

      formPassword: {
        tfa_code: '',
        old_password: '',
        new_password: '',
        again_password: ''
      },

      formEmail: {
        tfa_code: '',
        password: '',
        new_email: ''
      },

      rulePassword: {

        old_password: oldPasswordCheck,

        new_password: [
          {
            required: true,
            message: 'Ingrese una nueva contraseña',
            trigger: 'blur'
          },
          {
            validator: CheckNewPassword,
            trigger: 'blur'
          }
        ],

        again_password: [
          {
            required: true,
            message: 'Confirme la contraseña',
            trigger: 'change'
          },
          {
            validator: CheckAgainPassword,
            trigger: 'change'
          }
        ],

        tfa_code: tfaCheck
      },

      ruleEmail: {

        password: oldPasswordCheck,

        new_email: [
          {
            required: true,
            message: 'Ingrese un correo electrónico',
            trigger: 'change'
          },
          {
            type: 'email',
            message: 'Ingrese un correo válido',
            trigger: 'change'
          }
        ],

        tfa_code: tfaCheck
      }
    }
  },

  methods: {

    changePassword () {
      this.validateForm('formPassword').then(valid => {
        this.loading.btnPassword = true

        let data =
          Object.assign({}, this.formPassword)

        delete data.again_password

        if (!this.visible.tfaRequired) {
          delete data.tfa_code
        }

        api.changePassword(data).then(res => {
          this.loading.btnPassword = false
          this.$refs.formPassword.resetFields()

          this.visible.passwordAlert = true

          this.$success(
            'Contraseña actualizada correctamente'
          )

          setTimeout(() => {
            this.visible.passwordAlert = false

            this.$router.push({
              name: 'logout'
            })
          }, 5000)
        }, res => {
          if (res.data.data === 'tfa_required') {
            this.visible.tfaRequired = true
          }

          this.loading.btnPassword = false

          this.$error(
            'Ocurrió un error al actualizar la contraseña'
          )
        })
      })
    },

    changeEmail () {
      this.validateForm('formEmail').then(valid => {
        this.loading.btnEmail = true

        let data =
          Object.assign({}, this.formEmail)

        if (!this.visible.tfaRequired) {
          delete data.tfa_code
        }

        api.changeEmail(data).then(res => {
          this.loading.btnEmail = false

          this.visible.emailAlert = true

          this.$success(
            'Correo actualizado correctamente'
          )

          this.$refs.formEmail.resetFields()
          this.$store.dispatch('getProfile')
        }, res => {
          if (res.data.data === 'tfa_required') {
            this.visible.tfaRequired = true
          }

          this.loading.btnEmail = false

          this.$error(
            'Ocurrió un error al actualizar el correo'
          )
        })
      })
    }
  }
}
</script>

<style lang="less" scoped>

.setting-main {
  padding: 25px;
  background: transparent;
}

.flex-container {
  display: flex;
  flex-wrap: wrap;
  gap: 25px;
  justify-content: space-between;
}

.left,
.right {
  flex: 1;
  min-width: 320px;
}

.profile-card {
  background: var(--lj-surface);
  border: 1px solid var(--lj-border);
  border-radius: 16px;
  padding: 25px;
  box-shadow: var(--lj-shadow);
}

.section-title {
  font-size: 22px;
  font-weight: bold;
  color: var(--lj-text);
  margin-bottom: 25px;
  border-left: 5px solid var(--lj-primary);
  padding-left: 12px;
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
  color: #fff !important;
  border-radius: 10px;
  padding: 10px 25px;
  font-weight: bold;
}

.save-btn:hover {
  background: #852344 !important;
  border-color: #852344 !important;
}

.separator {
  width: 2px;
  background: #BDF2D4;
  border-radius: 10px;
}

.ivu-alert-success {
  border-radius: 10px;
}

.ivu-form-item-error-tip {
  color: #A60550;
  font-weight: 500;
}

@media (max-width: 600px) {
  .setting-main { padding: 12px; }
  .profile-card { min-width: 0; flex-basis: 100%; padding: 16px; }
  .separator { display: none; }
}
</style>
