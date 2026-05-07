<template>
<div class="auth-form">
    <Form ref="formRegister" :model="formRegister" :rules="ruleRegister">
      <FormItem prop="username">
        <Input type="text" v-model="formRegister.username" :placeholder="$t('m.RegisterUsername')" size="large" @on-enter="handleRegister">
        <Icon type="ios-person-outline" slot="prepend"></Icon>
        </Input>
      </FormItem>
      <FormItem prop="email">
        <Input v-model="formRegister.email" :placeholder="$t('m.Email_Address')" size="large" @on-enter="handleRegister">
        <Icon type="ios-email-outline" slot="prepend"></Icon>
        </Input>
      </FormItem>
      <FormItem prop="password">
        <Input :type="showPassword ? 'text' : 'password'" v-model="formRegister.password" :placeholder="$t('m.RegisterPassword')" size="large" @on-enter="handleRegister">
        <Icon type="ios-locked-outline" slot="prepend"></Icon>
        <Icon :type="showPassword ? 'ios-eye-off-outline' : 'ios-eye-outline'" slot="append" class="password-eye" @click="showPassword = !showPassword"></Icon>
        </Input>
      </FormItem>
      <FormItem prop="passwordAgain">
        <Input :type="showPasswordAgain ? 'text' : 'password'" v-model="formRegister.passwordAgain" :placeholder="$t('m.Password_Again')" size="large" @on-enter="handleRegister">
        <Icon type="ios-locked-outline" slot="prepend"></Icon>
        <Icon :type="showPasswordAgain ? 'ios-eye-off-outline' : 'ios-eye-outline'" slot="append" class="password-eye" @click="showPasswordAgain = !showPasswordAgain"></Icon>
        </Input>
      </FormItem>
      <FormItem prop="captcha" style="margin-bottom:10px">
        <div class="oj-captcha">
          <div class="oj-captcha-code">
            <Input v-model="formRegister.captcha" :placeholder="$t('m.Captcha')" size="large" @on-enter="handleRegister">
            <Icon type="ios-lightbulb-outline" slot="prepend"></Icon>
            </Input>
          </div>
          <div class="oj-captcha-img">
            <Tooltip content="Click to refresh" placement="top">
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
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ_-]([a-zA-ZáéíóúÁÉÍÓÚñÑüÜ _-]*[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ_-])?$/.test(value)) {
          callback(new Error(this.$i18n.t('m.Username_only_letters')))
        } else {
          callback()
        }
      }
      const CheckEmailFormat = (rule, value, callback) => {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          callback(new Error(this.$i18n.t('m.Invalid_email_format')))
        } else {
          callback()
        }
      }
      const CheckPassword = (rule, value, callback) => {
        if (this.formRegister.password !== '') {
          // 对第二个密码框再次验证
          this.$refs.formRegister.validateField('passwordAgain')
        }
        callback()
      }

      const CheckAgainPassword = (rule, value, callback) => {
        if (value !== this.formRegister.password) {
          callback(new Error(this.$i18n.t('m.password_does_not_match')))
        }
        callback()
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
            {required: true, trigger: 'blur'},
            {validator: CheckUsernameFormat, trigger: 'blur'},
            {validator: CheckUsernameNotExist, trigger: 'blur'}
          ],
          email: [
            {required: true, type: 'email', trigger: 'blur'},
            {validator: CheckEmailFormat, trigger: 'blur'},
            {validator: CheckEmailNotExist, trigger: 'blur'}
          ],
          password: [
            {required: true, trigger: 'blur', min: 6, max: 20},
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
      ...mapGetters(['website', 'modalStatus'])

    }
  }
</script>

<style scoped lang="less">
  @import (reference) '../../../../styles/theme-oj.less';

  .auth-form {
    /deep/ .ivu-form-item {
      margin-bottom: 14px;
    }

    /deep/ .ivu-input-group-prepend {
      background: #fff;
      border: 2px solid @oj-secondary;
      border-right: none;
      color: @oj-secondary;
      border-radius: 12px 0 0 12px;
      min-width: 46px;
    }

    /deep/ .ivu-input-group-prepend i {
      font-size: 18px;
      font-weight: 600;
    }

    /deep/ .ivu-input-group-prepend + .ivu-input {
      border: 2px solid @oj-secondary;
      border-left: none;
      border-radius: 0 12px 12px 0;
      height: 46px;
      font-size: 16px;
      padding-left: 12px;
      color: @oj-text;
    }

    /deep/ .ivu-input::placeholder {
      color: fade(@oj-secondary, 50%);
    }

    /deep/ .ivu-input-group-with-append .ivu-input-group-prepend + .ivu-input {
      border-right: none;
      border-radius: 0;
    }

    /deep/ .ivu-input-group-append {
      background: #fff;
      border: 2px solid @oj-secondary;
      border-left: none;
      border-radius: 0 12px 12px 0;
      padding: 0 12px;
      cursor: pointer;
      .password-eye {
        font-size: 18px;
        color: fade(@oj-secondary, 60%);
        &:hover { color: @oj-secondary; }
      }
    }

    .oj-captcha-img {
      border: 2px solid fade(@oj-secondary, 55%);
      border-radius: 10px;
      background: #fff;
      overflow: hidden;
    }
  }

  .footer {
    overflow: auto;
    margin-top: 8px;
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
    border-radius: 8px;
    font-size: 18px;
    font-weight: 700;
    background-color: @oj-secondary;
    border-color: @oj-secondary;
  }

  .auth-submit-btn:hover {
    background-color: @oj-primary;
    border-color: @oj-primary;
  }

  .auth-switch-btn {
    height: 46px;
    border-radius: 8px;
    font-weight: 600;
    color: @oj-primary;
    border-color: fade(@oj-secondary, 72%);
  }

  .auth-switch-btn:hover {
    color: @oj-dark;
    border-color: @oj-primary;
  }
</style>
