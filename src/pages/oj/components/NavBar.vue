<template>
  <div id="header" @keydown.esc="mobileMenuOpen = false">
    <div class="mobile-header">
      <router-link to="/" class="mobile-logo" aria-label="LizardJudge"><BrandMark compact></BrandMark></router-link>
      <button
        class="hamburger"
        type="button"
        :aria-label="$t(mobileMenuOpen ? 'm.V2_Close_Menu' : 'm.V2_Open_Menu')"
        :aria-expanded="String(mobileMenuOpen)"
        aria-controls="portal-navigation"
        @click="mobileMenuOpen = !mobileMenuOpen"
      >
        <Icon :type="mobileMenuOpen ? 'close-round' : 'navicon-round'"></Icon>
      </button>
    </div>
    <button
      v-if="isMobile && mobileMenuOpen"
      class="portal-backdrop"
      type="button"
      :aria-label="$t('m.V2_Close_Menu')"
      @click="mobileMenuOpen = false"
    ></button>
    <Menu
      id="portal-navigation"
      v-show="!isMobile || mobileMenuOpen"
      theme="light"
      :mode="isMobile ? 'vertical' : 'horizontal'"
      @on-select="handleRoute"
      :active-name="activeMenu"
      class="oj-menu"
      :class="{ 'mobile-menu-open': mobileMenuOpen }"
    >
      <router-link to="/" class="logo" aria-label="LizardJudge"><BrandMark></BrandMark></router-link>
      <Menu-item name="/">
        <Icon type="home"></Icon>
        {{ $t('m.Home') }}
      </Menu-item>
      <Submenu name="problems">
        <template slot="title">
          <Icon type="ios-keypad"></Icon>
          {{ $t('m.NavProblems') }}
        </template>
        <Menu-item name="/problem">
          <Icon type="ios-list"></Icon>
          {{ $t('m.Problem_List') }}
        </Menu-item>
        <Menu-item name="/status">
          <Icon type="ios-pulse-strong"></Icon>
          {{ $t('m.Submission_Status') }}
        </Menu-item>
      </Submenu>
      <Menu-item name="/contest">
        <Icon type="trophy"></Icon>
        {{ $t('m.Contests') }}
      </Menu-item>
      <Submenu name="rank">
        <template slot="title">
          <Icon type="podium"></Icon>
          {{ $t('m.Rank') }}
        </template>
        <Menu-item name="/acm-rank">
          {{ $t('m.ACM_Rank') }}
        </Menu-item>
        <Menu-item name="/oi-rank">
          {{ $t('m.OI_Rank') }}
        </Menu-item>
      </Submenu>
      <Submenu name="about">
        <template slot="title">
          <Icon type="information-circled"></Icon>
          {{ $t('m.About') }}
        </template>
        <Menu-item name="/about">
          {{ $t('m.Judger') }}
        </Menu-item>
        <Menu-item name="/faq">
          {{ $t('m.FAQ') }}
        </Menu-item>
        <Menu-item name="/changelog">{{ $t('m.Release_Notes') }}</Menu-item>
      </Submenu>
      <div class="right-menu">
        <ThemeToggle :floating="false"></ThemeToggle>
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
            <Button type="primary" ref="loginBtn" class="nav-btn" @click="handleBtnClick('login')"
              >{{ $t('m.Login') }}
            </Button>
            <Button v-if="website.allow_register" type="primary" class="nav-btn" @click="handleBtnClick('register')"
              >{{ $t('m.Register') }}
            </Button>
          </div>
        </template>
        <template v-else>
          <Dropdown class="drop-menu" @on-click="handleRoute" placement="bottom" trigger="click">
            <Button type="text" class="drop-menu-title"
              >{{ user.username }}
              <Icon type="arrow-down-b"></Icon>
            </Button>
            <Dropdown-menu slot="list">
              <Dropdown-item name="/user-home">{{ $t('m.MyHome') }}</Dropdown-item>
              <Dropdown-item name="/status?myself=1">{{ $t('m.MySubmissions') }}</Dropdown-item>
              <Dropdown-item name="/setting/profile">{{ $t('m.Settings') }}</Dropdown-item>
              <Dropdown-item v-if="isTeacherRole" name="/admin">{{ $t('m.Management') }}</Dropdown-item>
              <Dropdown-item divided name="/logout">{{ $t('m.Logout') }}</Dropdown-item>
            </Dropdown-menu>
          </Dropdown>
        </template>
      </div>
    </Menu>
    <Modal v-model="modalVisible" :width="560" class-name="auth-modal">
      <div slot="header" class="auth-modal-header">
        <img src="../../../assets/logo-v2.png" alt="LizardJudge Univalle" class="auth-modal-logo" />
        <div class="auth-modal-title">{{ $t('m.Welcome_to') }} LizardJudge Univalle</div>
        <div class="auth-modal-subtitle">{{ $t('m.University_Subtitle') }}</div>
      </div>
      <component :is="modalStatus.mode" v-if="modalVisible"></component>
      <div slot="footer" style="display: none"></div>
    </Modal>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import BrandMark from '@/components/BrandMark.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import login from '@oj/views/user/Login'
import register from '@oj/views/user/Register'
import { setLanguage } from '@/i18n'

export default {
  components: {
    BrandMark,
    ThemeToggle,
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
      this.mobileMenuOpen = false
      this.changeModalStatus({
        visible: true,
        mode: mode
      })
    },
    handleLanguageChange (lang) {
      setLanguage(lang)
    },
    checkScreen () {
      this.isMobile = window.innerWidth <= 1120

      if (!this.isMobile) {
        this.mobileMenuOpen = false
      }
    }
  },
  computed: {
    ...mapGetters(['website', 'modalStatus', 'user', 'isAuthenticated', 'isAdminRole', 'isTeacherRole']),
    // 跟随路由变化
    activeMenu () {
      return '/' + this.$route.path.split('/')[1]
    },
    currentLanguage () {
      return this.$i18n.locale === 'es-LA'
        ? 'Español'
        : this.$i18n.locale === 'en-US'
        ? 'English'
        : this.$i18n.locale === 'zh-CN'
        ? '中文'
        : '繁體'
    },
    modalVisible: {
      get () {
        return this.modalStatus.visible
      },
      set (value) {
        this.changeModalStatus({ visible: value })
      }
    }
  }
}
</script>

<style lang="less">
.oj-app #header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 900;
  background: var(--lj-surface);
  border-bottom: 1px solid var(--lj-border);
  box-shadow: 0 4px 24px rgba(25, 64, 50, 0.035);
}
.oj-app #header .oj-menu {
  display: flex;
  align-items: center;
  max-width: 1440px;
  margin: auto;
  padding: 0 30px;
  height: 78px;
  line-height: 78px;
  background: var(--lj-surface);
  border: 0;
}
.oj-app #header .oj-menu:after {
  display: none;
}
.oj-app #header .logo {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  margin-right: 32px;
}
.oj-app #header .ivu-menu-horizontal > .ivu-menu-item,
.oj-app #header .ivu-menu-horizontal > .ivu-menu-submenu {
  float: none;
  height: 78px;
  line-height: 78px;
  padding: 0 15px;
  font-size: 13px;
  color: var(--lj-muted);
  font-weight: 600;
  white-space: nowrap;
  border-bottom: 2px solid transparent;
}
.oj-app #header .ivu-menu-horizontal .ivu-menu-item-active,
.oj-app #header .ivu-menu-horizontal .ivu-menu-submenu-active {
  color: var(--lj-primary);
  border-color: var(--lj-primary);
}
.oj-app #header .ivu-menu-submenu-title:hover,
.oj-app #header .ivu-menu-item:hover {
  color: var(--lj-primary);
}
.oj-app #header .right-menu {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 12px;
  line-height: 1.4;
}
.oj-app #header .drop-menu-title {
  color: var(--lj-text);
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  font-weight: 600;
}
.oj-app #header .btn-menu {
  display: flex;
  gap: 8px;
}
.oj-app #header .nav-btn {
  padding: 9px 13px;
  min-height: 36px;
  font-size: 12px;
}
.oj-app #header .theme-toggle {
  position: static;
  padding: 8px;
  font-size: 11px;
  border-color: var(--lj-border);
  color: var(--lj-muted);
  border-radius: 8px;
}
.oj-app #header .ivu-select-dropdown {
  line-height: 1.5;
  border: 1px solid var(--lj-border);
  border-radius: 12px;
  background: var(--lj-surface);
  box-shadow: var(--lj-shadow);
}
.oj-app #header .ivu-select-dropdown .ivu-menu-item {
  height: auto;
  line-height: 1.5;
  padding: 11px 18px;
  color: var(--lj-text);
  font-size: 13px;
}
.oj-app #header .ivu-select-dropdown .ivu-menu-item:hover {
  background: var(--lj-mint);
}
.mobile-header,
.portal-backdrop {
  display: none;
}
.auth-modal-header {
  text-align: center;
  padding: 10px 10px 12px;
}
.auth-modal-logo {
  width: 64px;
  height: 64px;
  object-fit: contain;
  margin-bottom: 12px;
}
.auth-modal-title {
  color: var(--lj-text);
  font-size: 23px;
  font-weight: 750;
  letter-spacing: -0.7px;
}
.auth-modal-subtitle {
  color: var(--lj-muted);
  font-size: 12px;
  margin-top: 5px;
}
@media (max-width: 1120px) {
  .oj-app #header .mobile-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 70px;
    padding: 0 20px;
  }
  .oj-app #header .mobile-logo {
    display: inline-flex;
    align-items: center;
    min-width: 0;
  }
  .oj-app #header .hamburger {
    border: 1px solid var(--lj-border);
    background: var(--lj-surface);
    color: var(--lj-green);
    border-radius: 9px;
    width: 38px;
    height: 38px;
    font-size: 20px;
  }
  .oj-app #header .portal-backdrop {
    display: block;
    position: fixed;
    inset: 70px 0 0;
    background: rgba(15, 35, 27, 0.3);
    border: 0;
    backdrop-filter: blur(3px);
  }
  .oj-app #header .oj-menu {
    position: fixed;
    top: 80px;
    left: 12px;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    width: 340px;
    max-width: calc(100vw - 24px);
    height: auto;
    max-height: calc(100dvh - 95px);
    overflow-y: auto;
    border: 1px solid var(--lj-border);
    border-radius: 16px;
    padding: 12px;
    line-height: 1.5;
    box-shadow: var(--lj-shadow);
  }
  .oj-app #header .logo {
    display: none;
  }
  .oj-app #header .oj-menu > .ivu-menu-item,
  .oj-app #header .oj-menu > .ivu-menu-submenu {
    height: auto;
    line-height: 1.5;
    width: 100%;
    padding: 0;
    border: 0;
  }
  .oj-app #header .oj-menu > .ivu-menu-item,
  .oj-app #header .ivu-menu-submenu-title {
    padding: 13px 14px;
    font-size: 13px;
    color: var(--lj-text);
    border-radius: 9px;
  }
  .oj-app #header .ivu-menu-item {
    white-space: normal;
  }
  .oj-app #header .ivu-menu-vertical .ivu-menu-submenu .ivu-menu-item {
    padding: 11px 25px;
    line-height: 1.5;
  }
  .oj-app #header .ivu-menu-submenu .ivu-menu {
    background: var(--lj-soft);
    border-radius: 9px;
  }
  .oj-app #header .right-menu {
    margin: 12px 0 0;
    border-top: 1px solid var(--lj-border);
    padding: 16px 6px 6px;
    flex-wrap: wrap;
    gap: 14px;
  }
  .oj-app #header .ivu-menu-item-active:not(.ivu-menu-submenu) {
    background: var(--lj-mint);
    color: var(--lj-green);
    border: 0;
  }
  .oj-app #header .ivu-menu-vertical .ivu-menu-item-active:after {
    display: none;
  }
}
</style>
