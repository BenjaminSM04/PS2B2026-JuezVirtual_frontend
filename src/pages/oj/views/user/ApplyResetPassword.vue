<template>
  <Panel :padding="30" class="reset-card">
    <div slot="title" class="reset-title">{{$t('m.Reset_Password')}}</div>
    <template v-if="!successApply">
      <div class="auth-form">
        <Form :rules="ruleResetPassword" :model="formResetPassword" ref="formResetPassword">
          <Form-item prop="email">
            <Input v-model="formResetPassword.email" :placeholder="$t('m.ApplyEmail')" size="large" @on-enter="sendEmail">
            <Icon type="ios-email-outline" slot="prepend"></Icon>
            </Input>
          </Form-item>
          <Form-item prop="captcha">
            <div class="auth-captcha">
              <div class="auth-captcha__code">
                <Input v-model="formResetPassword.captcha" :placeholder="$t('m.RCaptcha')" size="large" @on-enter="sendEmail">
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
                @click="sendEmail"
                class="auth-submit-btn" long
                :loading="btnLoading">{{$t('m.Send_Password_Reset_Email')}}
        </Button>
        <div class="auth-links">
          <a class="auth-link" @click="goLogin">{{$t('m.Back_to_Login')}}</a>
        </div>
      </div>
    </template>
    <template v-else>
      <Alert type="success" show-icon>
        {{$t('m.Password_reset_mail_sent')}}
      </Alert>
      <div class="auth-links">
        <a class="auth-link" @click="goLogin">{{$t('m.Back_to_Login')}}</a>
      </div>
    </template>
  </Panel>
</template>
<script>
  import { mapActions } from 'vuex'
  import api from '@oj/api'
  import {FormMixin} from '@oj/components/mixins'

  export default {
    mixins: [FormMixin],
    data () {
      const CheckEmailExist = (rule, value, callback) => {
        if (value !== '') {
          api.checkUsernameOrEmail(undefined, value).then(res => {
            if (res.data.data.email === false) {
              callback(new Error(this.$i18n.t('m.The_email_doesnt_exist')))
            } else {
              callback()
            }
          }, _ => callback())
        } else {
          callback()
        }
      }
      return {
        captchaSrc: '',
        successApply: false,
        btnLoading: false,
        formResetPassword: {
          email: '',
          captcha: ''
        },
        ruleResetPassword: {
          email: [
            {required: true, type: 'email', trigger: 'blur'},
            {validator: CheckEmailExist, trigger: 'blur'}
          ],
          captcha: [
            {required: true, trigger: 'blur', min: 1, max: 10}
          ]
        }
      }
    },
    mounted () {
      this.getCaptchaSrc()
    },
    methods: {
      ...mapActions(['changeModalStatus']),
      goLogin () {
        this.$router.push({name: 'home'})
        this.changeModalStatus({mode: 'login', visible: true})
      },
      sendEmail () {
        this.validateForm('formResetPassword').then(() => {
          this.btnLoading = true
          api.applyResetPassword(this.formResetPassword).then(res => {
            this.btnLoading = false
            this.successApply = true
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

<style scoped lang="less">
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
