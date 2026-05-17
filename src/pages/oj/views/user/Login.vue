<template>
  <div class="auth-form">
    <Form ref="formLogin" :model="formLogin" :rules="ruleLogin">
      <FormItem prop="username">
        <Input type="text" v-model="formLogin.username" :placeholder="$t('m.LoginUsername')" size="large" @on-enter="handleLogin">
        <Icon type="ios-person-outline" slot="prepend"></Icon>
        </Input>
      </FormItem>
      <FormItem prop="password">
        <Input :type="showPassword ? 'text' : 'password'" v-model="formLogin.password" :placeholder="$t('m.LoginPassword')" size="large" @on-enter="handleLogin">
        <Icon type="ios-locked-outline" slot="prepend"></Icon>
        <Icon :type="showPassword ? 'ios-eye' : 'ios-eye-outline'" slot="append" class="password-eye" @click.native="showPassword = !showPassword"></Icon>
        </Input>
      </FormItem>
      <FormItem prop="tfa_code" v-if="tfaRequired">
        <Input v-model="formLogin.tfa_code" :placeholder="$t('m.TFA_Code')">
        <Icon type="ios-lightbulb-outline" slot="prepend"></Icon>
        </Input>
      </FormItem>
    </Form>
    <div class="footer">
      <Button
        type="primary"
        @click="handleLogin"
        class="btn auth-submit-btn" long
        :loading="btnLoginLoading">
        {{$t('m.UserLogin')}}
      </Button>
      <div class="auth-links">
        <a class="auth-link" v-if="website.allow_register" @click.stop="handleBtnClick('register')">{{$t('m.No_Account')}}</a>
        <a class="auth-link" @click.stop="goResetPassword">{{$t('m.Forget_Password')}}</a>
      </div>
      <div class="auth-footer-brand">{{$t('m.University_Footer')}}</div>
    </div>
  </div>
</template>

<script>
  import { mapGetters, mapActions } from 'vuex'
  import api from '@oj/api'
  import { FormMixin } from '@oj/components/mixins'

  export default {
    mixins: [FormMixin],
    data () {
      const CheckRequiredTFA = (rule, value, callback) => {
        if (value !== '') {
          api.tfaRequiredCheck(value).then(res => {
            this.tfaRequired = res.data.data.result
          })
        }
        callback()
      }

      return {
        tfaRequired: false,
        btnLoginLoading: false,
        showPassword: false,
        formLogin: {
          username: '',
          password: '',
          tfa_code: ''
        },
        ruleLogin: {
          username: [
            {required: true, trigger: 'blur'},
            {validator: CheckRequiredTFA, trigger: 'blur'}
          ],
          password: [
            {required: true, trigger: 'change', min: 6, max: 20}
          ]
        }
      }
    },
    methods: {
      ...mapActions(['changeModalStatus', 'getProfile']),
      handleBtnClick (mode) {
        this.changeModalStatus({
          mode,
          visible: true
        })
      },
      handleLogin () {
        this.validateForm('formLogin').then(valid => {
          this.btnLoginLoading = true
          let formData = Object.assign({}, this.formLogin)
          if (!this.tfaRequired) {
            delete formData['tfa_code']
          }
          api.login(formData).then(res => {
            this.btnLoginLoading = false
            this.changeModalStatus({visible: false})
            this.getProfile()
            this.$success(this.$i18n.t('m.Welcome_back'))
          }, _ => {
            this.btnLoginLoading = false
          })
        })
      },
      goResetPassword () {
        this.changeModalStatus({visible: false})
        this.$router.push({name: 'apply-reset-password'})
      }
    },
    computed: {
      ...mapGetters(['website', 'modalStatus']),
      visible: {
        get () {
          return this.modalStatus.visible
        },
        set (value) {
          this.changeModalStatus({visible: value})
        }
      }
    }
  }
</script>

<style scoped lang="less">
  @import (reference) '../../../../styles/theme-oj.less';

  .auth-form {

    /deep/ .modal-title {
    font-size: 22px !important;
    font-weight: 700;
    text-align: center;
    display: block;

    margin-top: 20px !important;
    margin-bottom: 35px !important;

    color: #1c1c1c;
  }
    /deep/ .ivu-form-item {
    margin-bottom: 15px !important;
    position: relative;
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
      padding: 0 12px;
      cursor: pointer;

      .password-eye {
        font-size: 18px;
        color: #ffffff !important;
        transition: opacity 0.2s;

        &:hover {
          opacity: 0.8;
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

  .auth-links {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;
  }

  .auth-link {
    color: #202020;
    font-size: 16px;
    line-height: 1.2;
    cursor: pointer;
  }

  .auth-link:hover {
    color: @oj-guindo;
  }

  .auth-footer-brand {
    margin-top: 18px;
    text-align: center;
    font-size: 12px;
    font-weight: 500;
    color: fade(@oj-secondary, 75%);
    letter-spacing: 0.3px;
  }
</style>
