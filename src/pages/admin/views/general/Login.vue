<template>
  <div class="v2-login">
    <aside class="v2-login__intro"><BrandMark></BrandMark><div><h1>{{$t('m.V2_Admin_Intro')}}</h1><p>{{$t('m.V2_Admin_Intro_Description')}}</p></div><span class="v2-eyebrow">Universidad Privada del Valle</span></aside>
  <el-form :model="ruleForm2" :rules="rules2" ref="ruleForm2" label-position="top"
           class="demo-ruleForm login-container">
    <span class="v2-eyebrow">{{$t('m.V2_Admin_Access')}}</span>
    <h3 class="title">{{$t('m.Welcome_to_Login')}}</h3>
    <el-form-item prop="account" :label="$t('m.username')">
      <el-input type="text" v-model="ruleForm2.account" auto-complete="off" :placeholder="$t('m.username')" @keyup.enter.native="handleLogin"></el-input>
    </el-form-item>
    <el-form-item prop="password" :label="$t('m.password')">
      <PasswordInput admin v-model="ruleForm2.password" :placeholder="$t('m.password')" @keyup.enter.native="handleLogin"/>
    </el-form-item>
    <el-form-item style="width:100%;">
      <el-button type="primary" style="width:100%;" @click.native.prevent="handleLogin" :loading="logining">{{$t('m.V2_Admin_Login')}}
      </el-button>
    </el-form-item>
    <a href="/" class="v2-login__back">{{$t('m.V2_Back_Portal')}}</a>
  </el-form>
  </div>
</template>

<script>
  import BrandMark from '@/components/BrandMark.vue'
  import api from '../../api'
  import PasswordInput from '@/components/PasswordInput.vue'

  export default {
    components: {PasswordInput, BrandMark},
    data () {
      return {
        logining: false,
        ruleForm2: {
          account: '',
          password: ''
        },
        rules2: {
          account: [
            {required: true, message: 'Por favor ingresa tu usuario', trigger: 'blur'},
            {min: 1, max: 32, message: 'El usuario debe tener entre 1 y 32 caracteres', trigger: 'blur'}
          ],
          password: [
            {required: true, message: 'Por favor ingresa tu contraseña', trigger: 'blur'},
            {min: 1, message: 'La contraseña no puede estar vacía', trigger: 'blur'}
          ]
        },
        checked: true
      }
    },
    methods: {
      handleLogin (ev) {
        this.$refs.ruleForm2.validate((valid) => {
          if (valid) {
            this.logining = true
            api.login(this.ruleForm2.account, this.ruleForm2.password).then(data => {
              this.logining = false
              this.$router.push({name: 'dashboard'})
            }, () => {
              this.logining = false
            })
          } else {
            this.$error(this.$t('m.Fix_Form_Errors'))
          }
        })
      }
    }
  }
</script>

<style lang="less" scoped>
  .login-container {
    /*box-shadow: 0 0px 8px 0 rgba(0, 0, 0, 0.06), 0 1px 0px 0 rgba(0, 0, 0, 0.02);*/
    -webkit-border-radius: 5px;
    border-radius: 5px;
    -moz-border-radius: 5px;
    background-clip: padding-box;
    margin: 180px auto;
    width: 350px;
    max-width: calc(100% - 24px);
    box-sizing: border-box;
    padding: 35px 35px 15px 35px;
    background: #fff;
    border: 1px solid #eaeaea;
    box-shadow: 0 0 25px #cac6c6;
    .title {
      margin: 0px auto 40px auto;
      text-align: center;
      color: #505458;
    }
    .remember {
      margin: 0px 0px 35px 0px;
    }
    .login-brand {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 24px;

      .login-logo {
        width: 96px;
        height: 96px;
        border-radius: 50%;
        object-fit: cover;
        background: #fff;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        border: 3px solid #fff;
      }

      h2 {
        margin: 14px 0 0 0;
        font-size: 18px;
        font-weight: 700;
        color: #003B4A;
        text-align: center;
      }
    }
  }

  @media (max-width: 600px) {
    .login-container { margin: 32px auto; padding: 24px 20px; }
  }
</style>
