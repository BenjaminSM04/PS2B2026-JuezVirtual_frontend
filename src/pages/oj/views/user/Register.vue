<template>
<div class="auth-form">
    <Form ref="formRegister" :model="formRegister" :rules="ruleRegister">
      <FormItem prop="username">
        <Input type="text" v-model.trim="formRegister.username" :placeholder="$t('m.RegisterUsername')" size="large" @on-enter="handleRegister">
        <Icon type="ios-person-outline" slot="prepend"></Icon>
        </Input>
      </FormItem>
      <FormItem prop="email">
        <Input v-model.trim="formRegister.email" :placeholder="$t('m.Email_Address')" size="large" @on-enter="handleRegister">
        <Icon type="ios-email-outline" slot="prepend"></Icon>
        </Input>
      </FormItem>
      <FormItem prop="password">
        <Input :type="showPassword ? 'text' : 'password'" v-model="formRegister.password" :placeholder="$t('m.Password')" size="large" @on-enter="handleRegister">
          <Icon type="ios-locked-outline" slot="prepend"></Icon>
          <span slot="append" class="password-eye-wrap" @click="showPassword = !showPassword">
            <Icon :type="showPassword ? 'ios-eye' : 'ios-eye-outline'" class="password-eye"></Icon>
          </span>
        </Input>
        <div class="password-strength" v-if="formRegister.password"> <!-- Nuevo -->
          <div
            class="strength-bar"
            :class="passwordStrength.class">
          </div>
          <span>{{ passwordStrength.text }}</span>
        </div> <!-- Hasta acá -->
      </FormItem>
      <FormItem prop="passwordAgain">
        <Input :type="showPasswordAgain ? 'text' : 'password'" v-model="formRegister.passwordAgain" :placeholder="$t('m.Password_Again')" size="large" @on-enter="handleRegister">
          <Icon type="ios-locked-outline" slot="prepend"></Icon>
          <span slot="append" class="password-eye-wrap" @click="showPasswordAgain = !showPasswordAgain">
            <Icon :type="showPasswordAgain ? 'ios-eye' : 'ios-eye-outline'" class="password-eye"></Icon>
          </span>
        </Input>
      </FormItem>
      <FormItem prop="captcha">
        <div class="oj-captcha" >
          <div class="oj-captcha-code" >
            <Input v-model.trim="formRegister.captcha" :placeholder="$t('m.Captcha')" size="large" @on-enter="handleRegister">
            <Icon type="ios-lightbulb-outline" slot="prepend"></Icon>
            </Input>
          </div>
          <div class="oj-captcha-img">
            <Tooltip :content="$t('m.Click_to_refresh_captcha')" placement="top">
              <img :src="captchaSrc" @click="getCaptchaSrc"/>
            </Tooltip>
          </div>
        </div>
      </FormItem>
    </Form>
    <div class="footer">
      <Button
        type="primary"
        @click="handleRegister"
        class="btn auth-submit-btn" long
        :loading="btnRegisterLoading">
        {{$t('m.UserRegister')}}
      </Button>
      <Button
        type="ghost"
        @click="switchMode('login')"
        class="btn auth-switch-btn" long>
        {{$t('m.Already_Registed')}}
      </Button>
    </div>
  </div>
</template>

<script>
  import { mapGetters, mapActions } from 'vuex'
  import api from '@oj/api'
  import { FormMixin } from '@oj/components/mixins'

  export default {
    mixins: [FormMixin],
    mounted () {
      this.getCaptchaSrc()
    },
    data () {
      const CheckUsernameNotExist = (rule, value, callback) => {
        api.checkUsernameOrEmail(value, undefined).then(res => {
          if (res.data.data.username === true) {
            callback(new Error(this.$i18n.t('m.The_username_already_exists')))
          } else {
            callback()
          }
        }, _ => callback())
      }
      const CheckEmailNotExist = (rule, value, callback) => {
        api.checkUsernameOrEmail(undefined, value).then(res => {
          if (res.data.data.email === true) {
            callback(new Error(this.$i18n.t('m.The_email_already_exists')))
          } else {
            callback()
          }
        }, _ => callback())
      }
      const CheckUsernameFormat = (rule, value, callback) => {
        // Solo permite letras (sin tildes), números, guiones y guiones bajos.
        // Longitud de 4 a 16 caracteres. No permite espacios.
        if (!/^[a-zA-Z0-9_-]{4,16}$/.test(value)) {
          callback(new Error(this.$t('m.Username_format_error')))
        } else {
          callback()
        }
      }
      const CheckEmailFormat = (rule, value, callback) => {
        // Valida: usuario @ dominio . extensión(mínimo 2 letras)
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        if (!emailRegex.test(value)) {
          callback(new Error(this.$i18n.t('m.Email_format_error')))
        } else {
          callback()
        }
      }
      // Contraseña Robusta (Mín 6 caracteres, Mayúscula, Minúscula, Número y Especial)
      // Set ampliado de caracteres especiales: !@#$%^&*()_+-=[]{};':",.<>/?\|`~
      const SPECIAL_CHARS = `!@#$%^&*()_+\\-=\\[\\]{};':",.<>/?\\\\|\`~`
      const CheckPassword = (rule, value, callback) => {
        const passwordRegex = new RegExp(
          `^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[${SPECIAL_CHARS}])[A-Za-z\\d${SPECIAL_CHARS}]{6,}$`
        )

        if (value === '') {
          callback(new Error(this.$t('m.Password_is_required')))
        } else if (!passwordRegex.test(value)) {
          callback(new Error(this.$t('m.Password_complexity_error')))
        } else {
          // Si la contraseña es válida, disparamos la validación del segundo campo para limpiar errores previos
          if (this.formRegister.passwordAgain !== '') {
            this.$refs.formRegister.validateField('passwordAgain')
          }
          callback()
        }
      }

      const CheckAgainPassword = (rule, value, callback) => {
        if (value === '') {
          callback(new Error(this.$t('m.Please_enter_the_password_again')))
        } else if (value !== this.formRegister.password) {
          callback(new Error(this.$t('m.Password_does_not_match')))
        } else {
          callback()
        }
      }

      return {
        btnRegisterLoading: false,
        showPassword: false,
        showPasswordAgain: false,
        formRegister: {
          username: '',
          password: '',
          passwordAgain: '',
          email: '',
          captcha: ''
        },
        ruleRegister: {
          username: [
            {
              required: true, 
              message: this.$i18n.t('m.Username_is_required'), 
              trigger: ['blur', 'change']
            },
            {validator: CheckUsernameFormat, trigger: ['blur', 'change']},
            {validator: CheckUsernameNotExist, trigger: ['blur', 'change']}
          ],
          email: [
            {required: true, message: this.$i18n.t('m.Email_is_required'), trigger: ['blur', 'change']},
            {validator: CheckEmailFormat, trigger: ['blur', 'change']},
            {validator: CheckEmailNotExist, trigger: ['blur', 'change']}
          ],
          password: [
            {required: true, message: this.$i18n.t('m.Password_is_required'), trigger: ['blur', 'change']},
            {validator: CheckPassword, trigger: ['blur', 'change']}
          ],
          passwordAgain: [
            { required: true, message: this.$t('m.Please_enter_the_password_again'), trigger: ['blur', 'change'] },
    { validator: CheckAgainPassword, trigger: 'change' }
          ],
          captcha: [
            {required: true, message: this.$i18n.t('m.Captcha_is_required'), trigger: ['blur', 'change'], min: 1, max: 10}
          ]
        }
      }
    },
    methods: {
      ...mapActions(['changeModalStatus', 'getProfile']),
      switchMode (mode) {
        this.changeModalStatus({
          mode,
          visible: true
        })
      },
      handleRegister () {
        this.validateForm('formRegister').then(valid => {
          let formData = Object.assign({}, this.formRegister)
          delete formData['passwordAgain']
          this.btnRegisterLoading = true
          api.register(formData).then(res => {
            this.$success(this.$i18n.t('m.Thanks_for_registering'))
            this.switchMode('login')
            this.btnRegisterLoading = false
          }, _ => {
            this.getCaptchaSrc()
            this.formRegister.captcha = ''
            this.btnRegisterLoading = false
          })
        })
      }
    },
    computed: {
      ...mapGetters(['website', 'modalStatus']),
        passwordStrength () {
        const pwd = this.formRegister.password

        let score = 0

        if (pwd.length >= 6) score++
        if (/[A-Z]/.test(pwd)) score++
        if (/[0-9]/.test(pwd)) score++
        if (/[!@#$%^&*()_+\-=[\]{};':",.<>/?\\|`~]/.test(pwd)) score++

        if (score <= 1) {
          return { text: 'Débil', class: 'weak' }
        }
        if (score <= 3) {
          return { text: 'Media', class: 'medium' }
        }
        return { text: 'Fuerte', class: 'strong' }
      }
    }
  }
</script>

<style scoped lang="less">
  @import (reference) '../../../../styles/theme-oj.less';

  .auth-form {

    /deep/ .modal-title {
    font-size: 22px !important;    /* Tamaño reducido (suele venir en 28px o más) */
    font-weight: 700;
    text-align: center;
    display: block;                /* Asegura que ocupe todo el ancho para el margen */
    
    /* Espaciado solicitado */
    margin-top: 20px !important;    /* Espacio respecto al tope del modal */
    margin-bottom: 35px !important; /* Espacio respecto al campo 'Nombre de Usuario' */
    
    color: #1c1c1c;                 /* Color sólido para mejor legibilidad */
  }
    /deep/ .ivu-form-item {
    margin-bottom: 15px !important;
    position: relative; /* Para posicionar el mensaje de error relativo a este contenedor */ 
  }

  /deep/ .ivu-form-item-error {
    margin-bottom: 30px !important;
    padding-top: 4px; 
    top: 100%; 
    line-height: 1;
  }

    /deep/ .ivu-input-group-prepend {
      background: @oj-guindo !important;
      border: 2px solid @oj-guindo !important;
      border-right: none;
      color: white;
      border-radius: 12px 0 0 12px;
      min-width: 46px;
    }

    /deep/ .ivu-input-group-prepend i {
      font-size: 18px;
      font-weight: 600;
    }

    /deep/ .ivu-input-group-prepend + .ivu-input {
      border: 2px solid @oj-guindo !important;
      border-left: none;
      border-radius: 0 12px 12px 0;
      height: 46px;
      font-size: 16px;
      padding-left: 12px;
      color: @oj-text;
    }

    /deep/ .ivu-input {
    border: 2px solid @oj-secondary !important;
    border-left: none !important;
    border-right: none !important;
    height: 46px;
    padding: 0 12px;
  }
    /deep/ .ivu-input-group-with-prepend:not(.ivu-input-group-with-append) .ivu-input {
    border-right: 2px solid @oj-guindo !important;
    border-radius: 0 12px 12px 0;
  }
  /deep/ .ivu-input:hover,
/deep/ .ivu-input:focus {
  border-color: @oj-guindo !important;
  outline: none;
  box-shadow: none !important;
}

/* Evitar que el borde derecho desaparezca en hover si no hay icono append */
/deep/ .ivu-input-group-with-prepend:not(.ivu-input-group-with-append) .ivu-input:hover {
  border-right: 2px solid @oj-guindo !important;
}

    /deep/ .ivu-input::placeholder {
      color: fade(@oj-secondary, 50%);
    }

    /deep/ .ivu-input-group-with-append .ivu-input-group-prepend + .ivu-input {
      border-right: none;
      border-radius: 0;
    }

    /deep/ .ivu-input-group-append {
      background: @oj-guindo !important;
      border: 2px solid @oj-guindo !important;
      border-left: none;
      border-radius: 0 12px 12px 0;
      padding: 0 !important;
      cursor: pointer;

      .password-eye-wrap {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        min-width: 46px;
        padding: 0 14px;
        cursor: pointer;
        transition: background-color 0.2s;

        &:hover {
          background-color: rgba(255, 255, 255, 0.12);
        }
      }

      .password-eye {
        font-size: 18px;
        color: #ffffff !important;
      }
    }

    .oj-captcha-img {
      border: 2px solid @oj-secondary;
      border-radius: 10px;
      background: #fff;
      overflow: hidden;
      height: 46px;
    }
    /* Ajuste específico para el bloque del captcha */
    .oj-captcha {
      display: flex;
      align-items: flex-start;
      margin-bottom: 10px !important; /* Espacio extra para el mensaje */
      height: auto !important; /* Permitir que el contenedor crezca con el mensaje de error */
      .oj-captcha-code {
        flex: 1;
        position: relative;
        margin-right: 10px;

        /* Forzamos que el error aparezca debajo del input del captcha */
        /deep/ .ivu-form-item-error-tip {
          position: absolute !important;
    /* En lugar de top 100%, usamos un valor fijo para despegarlo del borde */
    top: 46px !important; 
    left: 0 !important;
    padding-top: 8px !important; /* Añadimos padding para forzar la bajada visual */
    display: block !important;
    line-height: 1.5 !important;
    color: #ed4014 !important;
        }
      }
    }
  
  }

  
  .footer {
    overflow: auto;
    margin-top: 50px;
    text-align: left;


    .btn {
      margin: 0 0 12px 0;
      &:last-child {
        margin: 0;
      }
    }
  }

  .auth-submit-btn {
    height: 52px;
    border-radius: 12px;
    font-size: 18px;
    font-weight: 700;
    background-color: @oj-guindo;
    border-color: @oj-guindo;
  }

  .auth-submit-btn:hover {
    background-color: @oj-guindo-dark;
    border-color: @oj-guindo-dark;
  }

  .auth-switch-btn {
    height: 46px;
    border-radius: 12px;
    font-weight: 600;
    color: @oj-guindo;
    border-color: @oj-guindo;
  }

  .auth-switch-btn:hover {
    color: @oj-guindo-dark;
    border-color: @oj-guindo-dark;
  }

  .password-strength {
  margin-top: 8px;

  span {
    font-size: 13px;
    font-weight: 600;
  }
}

.strength-bar {
  height: 6px;
  border-radius: 8px;
  margin-bottom: 5px;
  transition: 0.3s;
}

.weak {
  width: 33%;
  background: #ed4014;
}

.medium {
  width: 66%;
  background: #ff9900;
}

.strong {
  width: 100%;
  background: #19be6b;
}
</style>
