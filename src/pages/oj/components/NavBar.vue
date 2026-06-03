<template>
  <div id="header">
    <div class="mobile-header">
      <div class="mobile-logo">
        <img src="../../../assets/Logo2.png" alt="LizardJudge" class="mobile-logo-img"/>
        <span>{{ website.website_name }}</span>
      </div>

      <div class="hamburger" @click="mobileMenuOpen = !mobileMenuOpen">
        <Icon type="navicon-round"></Icon>
      </div>
    </div>
    <Menu
      theme="light"
      :mode="isMobile ? 'vertical' : 'horizontal'"
      @on-select="handleRoute"
      :active-name="activeMenu"
      class="oj-menu"
      :class="{ 'mobile-menu-open': mobileMenuOpen }"
    >
      <div class="logo">
        <img src="../../../assets/Logo2.png" alt="LizardJudge" class="logo-img"/>
        <span>{{website.website_name}}</span>
      </div>
      <Menu-item name="/">
        <Icon type="home"></Icon>
        {{$t('m.Home')}}
      </Menu-item>
      <Submenu name="problems">
        <template slot="title">
          <Icon type="ios-keypad"></Icon>
          {{$t('m.NavProblems')}}
        </template>
        <Menu-item name="/problem">
          <Icon type="ios-list"></Icon>
          {{$t('m.Problem_List')}}
        </Menu-item>
        <Menu-item name="/status">
          <Icon type="ios-pulse-strong"></Icon>
          {{$t('m.Submission_Status')}}
        </Menu-item>
      </Submenu>
      <Menu-item name="/contest">
        <Icon type="trophy"></Icon>
        {{$t('m.Contests')}}
      </Menu-item>
      <Submenu name="rank">
        <template slot="title">
          <Icon type="podium"></Icon>
          {{$t('m.Rank')}}
        </template>
        <Menu-item name="/acm-rank">
          {{$t('m.ACM_Rank')}}
        </Menu-item>
        <Menu-item name="/oi-rank">
          {{$t('m.OI_Rank')}}
        </Menu-item>
      </Submenu>
      <Submenu name="about">
        <template slot="title">
          <Icon type="information-circled"></Icon>
          {{$t('m.About')}}
        </template>
        <Menu-item name="/about">
          {{$t('m.Judger')}}
        </Menu-item>
        <Menu-item name="/faq">
          {{$t('m.FAQ')}}
        </Menu-item>
      </Submenu>
      <div class="right-menu">
        <!-- Language Switcher -->
        <Dropdown class="drop-menu" @on-click="handleLanguageChange" placement="bottom" trigger="click">
          <Button type="text" class="drop-menu-title">
            <Icon type="earth"></Icon>
            <span>{{ currentLanguage }}</span>
            <Icon type="arrow-down-b"></Icon>
          </Button>
          <Dropdown-menu slot="list">
            <Dropdown-item name="es-LA">Español (LA)</Dropdown-item>
            <Dropdown-item name="en-US">English</Dropdown-item>
            <!-- Chino simplificado/tradicional deshabilitados (no se usan en Univalle). Descomentar para reactivar. -->
            <!-- <Dropdown-item name="zh-CN">简体中文</Dropdown-item> -->
            <!-- <Dropdown-item name="zh-TW">繁體中文</Dropdown-item> -->
          </Dropdown-menu>
        </Dropdown>

        <template v-if="!isAuthenticated">
          <div class="btn-menu">
            <Button type="primary"
                    ref="loginBtn"
                    class="nav-btn"
                    @click="handleBtnClick('login')">{{$t('m.Login')}}
            </Button>
            <Button v-if="website.allow_register"
                    type="primary"
                    class="nav-btn"
                    @click="handleBtnClick('register')">{{$t('m.Register')}}
            </Button>
          </div>
        </template>
        <template v-else>
          <Dropdown class="drop-menu" @on-click="handleRoute" placement="bottom" trigger="click">
            <Button type="text" class="drop-menu-title">{{ user.username }}
              <Icon type="arrow-down-b"></Icon>
            </Button>
            <Dropdown-menu slot="list">
              <Dropdown-item name="/user-home">{{$t('m.MyHome')}}</Dropdown-item>
              <Dropdown-item name="/status?myself=1">{{$t('m.MySubmissions')}}</Dropdown-item>
              <Dropdown-item name="/setting/profile">{{$t('m.Settings')}}</Dropdown-item>
              <Dropdown-item v-if="isTeacherRole" name="/admin">{{$t('m.Management')}}</Dropdown-item>
              <Dropdown-item divided name="/logout">{{$t('m.Logout')}}</Dropdown-item>
            </Dropdown-menu>
          </Dropdown>
        </template>
      </div>
    </Menu>
    <Modal v-model="modalVisible" :width="560" class-name="auth-modal">
      <div slot="header" class="auth-modal-header">
        <img src="../../../assets/Logo2.png" alt="LizardJudge Univalle" class="auth-modal-logo"/>
        <div class="auth-modal-title">{{$t('m.Welcome_to')}} LizardJudge Univalle</div>
        <div class="auth-modal-subtitle">{{$t('m.University_Subtitle')}}</div>
      </div>
      <component :is="modalStatus.mode" v-if="modalVisible"></component>
      <div slot="footer" style="display: none"></div>
    </Modal>
  </div>
</template>

<script>
  import { mapGetters, mapActions } from 'vuex'
  import login from '@oj/views/user/Login'
  import register from '@oj/views/user/Register'
  import { setLanguage } from '@/i18n'

  export default {
    components: {
      login,
      register
    },
    data () {
      return {
        mobileMenuOpen: false,
        isMobile: false
      }
    },
    mounted () {
      this.getProfile()
      this.checkScreen()
      window.addEventListener('resize', this.checkScreen)
    },
    beforeDestroy () {
      window.removeEventListener('resize', this.checkScreen)
    },
    methods: {
      ...mapActions(['getProfile', 'changeModalStatus']),
      handleRoute (route) {
        if (route && route.indexOf('admin') < 0) {
          this.$router.push(route)
        } else {
          window.open('/admin/')
        }

        // cerrar menú en móvil
        this.mobileMenuOpen = false
      },
      handleBtnClick (mode) {
        this.changeModalStatus({
          visible: true,
          mode: mode
        })
      },
      handleLanguageChange (lang) {
        setLanguage(lang)
      },
      checkScreen () {
        this.isMobile = window.innerWidth <= 768

        if (!this.isMobile) {
          this.mobileMenuOpen = false
        }
      },
    },
    computed: {
      ...mapGetters(['website', 'modalStatus', 'user', 'isAuthenticated', 'isAdminRole', 'isTeacherRole']),
      // 跟随路由变化
      activeMenu () {
        return '/' + this.$route.path.split('/')[1]
      },
      currentLanguage () {
        return this.$i18n.locale === 'es-LA' ? 'Español'
          : this.$i18n.locale === 'en-US' ? 'English'
          : this.$i18n.locale === 'zh-CN' ? '中文'
          : '繁體'
      },
      modalVisible: {
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

<style lang="less" scoped>
  @import (reference) '../../../styles/theme-oj.less';

  #header {
    min-width: 300px;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 1000;
    background-color: @oj-primary;
    box-shadow: 0 2px 10px 0 fade(#000, 22%);
    
    .oj-menu {
      background: @oj-primary;
      border-bottom: none;
      height: 70px;
      line-height: 70px;
    }
    
    /* Navbar theme */
    /deep/ .ivu-menu-light.ivu-menu-horizontal .ivu-menu-item, 
    /deep/ .ivu-menu-light.ivu-menu-horizontal .ivu-menu-submenu {
      color: #ffffff;
      font-weight: 600;
      font-size: 15px;
      height: 70px;
      line-height: 70px;
    }
    
    /deep/ .ivu-menu-light.ivu-menu-horizontal .ivu-menu-item-active, 
    /deep/ .ivu-menu-light.ivu-menu-horizontal .ivu-menu-item:hover, 
    /deep/ .ivu-menu-light.ivu-menu-horizontal .ivu-menu-submenu-active, 
    /deep/ .ivu-menu-light.ivu-menu-horizontal .ivu-menu-submenu:hover {
      color: @oj-success;
      border-bottom: 3px solid @oj-success;
    }

    /* Dropdown list under Rank/About/User/Language */
    /deep/ .ivu-select-dropdown .ivu-menu-item {
      color: @oj-text;
      font-weight: 500;
      border-bottom: none !important;
    }

    /deep/ .ivu-select-dropdown .ivu-menu-item:hover {
      background-color: fade(@oj-success, 70%);
      color: @oj-dark;
    }

    .logo {
      margin-left: 2%;
      margin-right: 2%;
      font-size: 20px;
      float: left;
      height: 70px;
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 700;

      .logo-img {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        object-fit: cover;
        background: #fff;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
        border: 2px solid rgba(255, 255, 255, 0.65);
      }
    }

    .right-menu {
      float: right;
      display: flex;
      align-items: center;
      height: 70px;
      margin-right: 24px;
    }
    
    .drop-menu {
      margin-right: 16px;
      &-title {
        font-size: 16px;
        color: #ffffff;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-weight: 600;
      }
    }

    /deep/ .drop-menu-title.ivu-btn-text:hover,
    /deep/ .drop-menu-title.ivu-btn-text:focus {
      color: @oj-success;
    }
    
    .btn-menu {
      display: flex;
      align-items: center;
      gap: 10px;
      
      .nav-btn {
        min-width: 126px;
        height: 38px;
        padding: 0 20px;
        background-color: @oj-secondary;
        border-color: @oj-secondary;
        color: #ffffff;
        font-weight: 700;
        font-size: 13px;
        border-radius: 6px;
        
        &:hover {
          background-color: @oj-primary;
          border-color: @oj-primary;
        }
      }
    }
  }

  .modal {
    &-title {
      font-size: 36px;
      line-height: 1.15;
      color: #111;
      font-weight: 600;
    }
  }

  .auth-modal-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin: 4px 0 12px;
  }

  .auth-modal-logo {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    object-fit: cover;
    background: #fff;
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.14);
    border: 2px solid fade(@oj-secondary, 30%);
    margin-bottom: 12px;
  }

  .auth-modal-title {
    font-size: 24px;
    font-weight: 700;
    color: @oj-dark;
    line-height: 1.2;
  }

  .auth-modal-subtitle {
    margin-top: 6px;
    font-size: 14px;
    font-weight: 500;
    color: @oj-secondary;
    letter-spacing: 0.2px;
  }

  /* ================= MOBILE RESPONSIVE ================= */

.mobile-header {
  display: none;
}

@media screen and (max-width: 768px) {

  .mobile-header {
    height: 60px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: @oj-primary;
  }

  .mobile-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    color: white;
    font-weight: 700;
    font-size: 16px;
  }

  .mobile-logo-img {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    object-fit: cover;
  }

  .hamburger {
    color: white;
    font-size: 28px;
    cursor: pointer;
    display: flex;
    align-items: center;
  }

  /* ocultar logo desktop */
  .logo {
    display: none !important;
  }

  /* menú lateral */
  .oj-menu {
    position: fixed;
    top: 60px;
    left: 0;
    width: 280px;
    height: calc(100vh - 60px) !important;
    background: @oj-primary;
    overflow-y: auto;

    transform: translateX(-100%);
    transition: transform 0.3s ease;

    z-index: 999;
    padding-top: 10px;
    line-height: normal !important;
  }

  /* abrir menú */
  .mobile-menu-open {
    transform: translateX(0);
  }

  /deep/ .ivu-menu {
    display: flex;
    flex-direction: column;
  }

  /deep/ .ivu-menu-item,
  /deep/ .ivu-menu-submenu-title {
    width: calc(100% - 20px);
    margin: 4px 10px;
    border-radius: 10px;

    height: 48px !important;
    line-height: 48px !important;

    color: white !important;
    border-bottom: none !important;
  }

  /deep/ .ivu-menu-item:hover,
  /deep/ .ivu-menu-submenu-title:hover {
    background: rgba(255,255,255,0.08) !important;
  }

  /deep/ .ivu-menu-item-active {
    background: rgba(255,255,255,0.12) !important;
    border-right: none !important;
  }

  /* arreglar submenus mobile */

 /deep/ .ivu-menu-submenu .ivu-menu {
   background: transparent !important;
 }

 /deep/ .ivu-menu-submenu .ivu-menu-item {
   margin-left: 0 !important;
   width: 100% !important;

   height: 48px !important;
   line-height: 48px !important;

   padding-left: 45px !important;

   display: flex;
   align-items: center;
 }

 /deep/ .ivu-menu-submenu-opened > .ivu-menu-submenu-title {
   background: rgba(255,255,255,0.08) !important;
 }

 /deep/ .ivu-menu-submenu .ivu-menu-item span {
   white-space: nowrap;
 }

 /deep/ .ivu-select-dropdown {
   z-index: 9999 !important;
 }
  

  .right-menu {
    float: none;
    display: flex;
    flex-direction: column;
    align-items: stretch;

    width: 100%;
    height: auto;

    margin: 10px 0 0;
    padding: 10px;
  }

  .btn-menu {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
  }

  .nav-btn {
    width: 100%;
  }

  .drop-menu {
    width: 100%;
    margin-bottom: 10px;
  }

  .drop-menu-title {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
