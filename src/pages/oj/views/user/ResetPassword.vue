<template>
  <Panel :padding="30" class="reset-card">
    <div slot="title" class="reset-title">{{$t('m.Reset_Password')}}</div>
    <template v-if="!resetSuccess">
      <div class="auth-form">
        <Form :model="formResetPassword" ref="formResetPassword" :rules="ruleResetPassword">
          <Form-item prop="password">
            <Input type="password" v-model="formResetPassword.password" :placeholder="$t('m.RPassword')" size="large">
            <Icon type="ios-locked-outline" slot="prepend"></Icon>
            </Input>
          </Form-item>
          <Form-item prop="passwordAgain">
            <Input type="password" v-model="formResetPassword.passwordAgain" :placeholder="$t('m.RPassword_Again')" size="large">
            <Icon type="ios-locked-outline" slot="prepend"></Icon>
            </Input>
          </Form-item>
          <Form-item prop="captcha">
            <div class="auth-captcha">
              <div class="auth-captcha__code">
                <Input v-model="formResetPassword.captcha" :placeholder="$t('m.RCaptcha')" size="large" @on-enter="resetPassword">
                <Icon type="ios-lightbulb-outline" slot="prepend"></Icon>
                </Input>
              </div>
              <div class="auth-captcha__img">
                <Tooltip content="Click to refresh" placement="top">
                  <img :src="captchaSrc" @click="getCaptchaSrc"/>
                </Tooltip>
              </div>
            </div>
          </Form-item>
        </Form>
        <Button type="primary"
                @click="resetPassword"
                class="auth-submit-btn" long
                :loading="btnLoading">{{$t('m.Reset_Password')}}
        </Button>
        <div class="auth-links">
          <a class="auth-link" @click="goLogin">{{$t('m.Back_to_Login')}}</a>
        </div>
      </div>
    </template>

    <template v-else>
      <Alert type="success" show-icon>{{$t('m.Your_password_has_been_reset')}}</Alert>
      <div class="auth-links">
        <a class="auth-link" @click="goLogin">{{$t('m.Back_to_Login')}}</a>
      </div>
    </template>
  </Panel>
</template>

<script>
  import { mapActions } from 'vuex'
  import {FormMixin} from '@oj/components/mixins'
  import api from '@oj/api'

  export default {
    name: 'reset-password',
    mixins: [FormMixin],
    data () {
      // Set ampliado de caracteres especiales (mismo policy que el registro)
      const SPECIAL_CHARS = `!@#$%^&*()_+\\-=\\[\\]{};':",.<>/?\\\\|\`~`
      const CheckPassword = (rule, value, callback) => {
        const passwordRegex = new RegExp(
          `^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[${SPECIAL_CHARS}])[A-Za-z\\d${SPECIAL_CHARS}]{8,}$`
        )
        if (value === '') {
          callback(new Error(this.$i18n.t('m.Password_is_required')))
        } else if (!passwordRegex.test(value)) {
          callback(new Error(this.$i18n.t('m.Password_complexity_error')))
        } else {
          if (this.formResetPassword.passwordAgain !== '') {
            this.$refs.formResetPassword.validateField('passwordAgain')
          }
          callback()
        }
      }

      const CheckAgainPassword = (rule, value, callback) => {
        if (value !== this.formResetPassword.password) {
          callback(new Error(this.$i18n.t('m.password_does_not_match')))
        }
        callback()
      }
      return {
        btnLoading: false,
        captchaSrc: '',
        resetSuccess: false,
        formResetPassword: {
          captcha: '',
          password: '',
          passwordAgain: '',
          token: ''
        },
        ruleResetPassword: {
          password: [
            {required: true, message: this.$i18n.t('m.Password_is_required'), trigger: 'blur'},
            {validator: CheckPassword, trigger: 'blur'}
          ],
          passwordAgain: [
            {required: true, validator: CheckAgainPassword, trigger: 'change'}
          ],
          captcha: [
            {required: true, trigger: 'blur', min: 1, max: 10}
          ]
        }
      }
    },
    mounted () {
      this.formResetPassword.token = this.$route.params.token
      this.getCaptchaSrc()
    },
    methods: {
      ...mapActions(['changeModalStatus']),
      goLogin () {
        this.$router.push({name: 'home'})
        this.changeModalStatus({mode: 'login', visible: true})
      },
      resetPassword () {
        this.validateForm('formResetPassword').then(valid => {
          this.btnLoading = true
          let data = Object.assign({}, this.formResetPassword)
          delete data.passwordAgain
          api.resetPassword(data).then(res => {
            this.btnLoading = false
            this.resetSuccess = true
          }, _ => {
            this.btnLoading = false
            this.formResetPassword.captcha = ''
            this.getCaptchaSrc()
          })
        })
      }
    }
  }
</script>
<style lang="less" scoped>
  @import '../../../../styles/auth-form.less';

  .reset-card {
    width: 100%;
    max-width: 460px;
    margin: 40px auto;
  }

  .reset-title {
    text-align: center;
    font-size: 22px;
    font-weight: 700;
    color: #1c1c1c;
  }

  @media (max-width: 600px) {
    .reset-card {
      margin: 20px auto;
    }
  }
</style>
