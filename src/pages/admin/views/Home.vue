<template>
  <div class="admin-shell" @keydown.esc="mobileMenuOpen = false">
    <div class="admin-mobile-bar">
      <BrandMark compact></BrandMark
      ><button
        ref="mobileToggle"
        type="button"
        :aria-label="$t('m.V2_Open_Menu')"
        :aria-expanded="String(mobileMenuOpen)"
        aria-controls="admin-navigation"
        @click="mobileMenuOpen = !mobileMenuOpen"
      >
        <i class="el-icon-menu" aria-hidden="true"></i>
      </button>
    </div>
    <button
      v-if="mobileMenuOpen"
      class="admin-drawer-backdrop"
      type="button"
      :aria-label="$t('m.V2_Close_Menu')"
      @click="mobileMenuOpen = false"
    ></button>
    <aside id="admin-navigation" class="admin-shell__sidebar" :class="{ 'is-open': mobileMenuOpen }">
      <SideMenu></SideMenu>
    </aside>

    <div class="admin-shell__main">
      <header class="admin-shell__header">
        <div class="admin-shell__header-copy">
          <p class="admin-shell__eyebrow">{{ $t('m.V2_Admin_Section') }}</p>
          <h1 class="admin-shell__title">{{ pageTitle }}</h1>
        </div>

        <div class="admin-shell__actions">
          <el-tooltip effect="dark" :content="$t('m.Back_To_OJ')" placement="bottom">
            <button class="admin-shell__icon-button" type="button" :aria-label="$t('m.Back_To_OJ')" @click="goOj">
              <i class="el-icon-fa-home"></i>
            </button>
          </el-tooltip>
          <el-tooltip effect="dark" :content="$t('m.Open_Latex_Editor')" placement="bottom">
            <button class="admin-shell__icon-button" type="button" :aria-label="$t('m.Open_Latex_Editor')" @click="katexVisible = true">
              <i class="el-icon-fa-font"></i>
            </button>
          </el-tooltip>
          <el-tooltip effect="dark" :content="$t('m.Toggle_Fullscreen')" placement="bottom">
            <button class="admin-shell__icon-button admin-shell__icon-button--screen" type="button" :aria-label="$t('m.Toggle_Fullscreen')" @click="$refs.fullscreen.click()">
              <screen-full ref="fullscreen" :width="13" :height="13" class="screen-full" aria-hidden="true" @click.native.stop></screen-full>
            </button>
          </el-tooltip>
          <el-dropdown @command="handleLanguageChange" trigger="click">
            <button class="admin-shell__icon-button" type="button">
              <i class="el-icon-fa-globe"></i>
            </button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-for="lang in languages" :key="lang.value" :command="lang.value">{{
                lang.label
              }}</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <ThemeToggle :floating="false"></ThemeToggle>
          <el-dropdown @command="handleCommand" trigger="click">
            <button class="admin-shell__profile-trigger" type="button">
              <span class="admin-shell__profile-name" :title="user.username">{{ user.username }}</span>
              <i class="el-icon-caret-bottom el-icon--right"></i>
            </button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="logout">{{ $t('m.Logout') }}</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </header>

      <main class="admin-shell__content">
        <transition name="fadeInUp" mode="out-in">
          <router-view></router-view>
        </transition>
      </main>

      <footer class="admin-shell__footer">
        <p>&copy; 2026 <b>LizardJudge Univalle</b> | Universidad Privada del Valle - La Paz</p>
      </footer>
    </div>

    <el-dialog :title="$t('m.Latex_Editor')" :visible.sync="katexVisible">
      <KatexEditor></KatexEditor>
    </el-dialog>
  </div>
</template>

<script>
import { types } from '@/store'
import { mapGetters } from 'vuex'
import BrandMark from '@/components/BrandMark.vue'
import SideMenu from '../components/SideMenu.vue'
import ScreenFull from '@admin/components/ScreenFull.vue'
import KatexEditor from '@admin/components/KatexEditor.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import api from '../api'
import { languages, setLanguage } from '@/i18n'

export default {
  name: 'app',
  data () {
    return {
      mobileMenuOpen: false,
      version: process.env.VERSION,
      katexVisible: false,
      languages: languages
    }
  },
  components: {
    SideMenu,
    BrandMark,
    KatexEditor,
    ThemeToggle,
    ScreenFull
  },
  beforeRouteEnter (to, from, next) {
    api.getProfile().then((res) => {
      if (!res.data.data) {
        // not login
        next({ name: 'login' })
      } else {
        next((vm) => {
          vm.$store.commit(types.CHANGE_PROFILE, { profile: res.data.data })
        })
      }
    })
  },
  methods: {
    goOj () {
      window.location.href = '/'
    },
    handleCommand (command) {
      if (command === 'logout') {
        api.logout().then(() => {
          this.$router.push({ name: 'login' })
        })
      }
    },
    handleLanguageChange (lang) {
      setLanguage(lang)
    }
  },
  watch: {
    '$route.path' () {
      this.mobileMenuOpen = false
    }
  },
  computed: {
    pageTitle () {
      const names = {
        dashboard: 'Dashboard',
        conf: 'System_Config',
        user: 'User',
        announcement: 'Announcement',
        'judge-server': 'Judge_Server',
        'prune-test-case': 'Prune_Test_Case',
        'problem-list': 'Problem_List',
        'create-problem': 'Create_Problem',
        'edit-problem': 'Problem',
        'contest-list': 'Contest_List',
        'create-contest': 'Create_Contest',
        'edit-contest': 'Contest',
        problem_batch_ops: 'Export_Import_Problem'
      }
      return this.$t('m.' + (names[this.$route.name] || 'Admin_Workspace'))
    },
    ...mapGetters(['user'])
  }
}
</script>

<style lang="less">
a {
  background-color: transparent;
}

a:active,
a:hover {
  outline-width: 0;
}

img {
  border-style: none;
}

* {
  box-sizing: border-box;
}

.admin-shell {
  min-height: 100%;
  display: flex;
  background: radial-gradient(circle at top left, rgba(181, 235, 216, 0.55), transparent 34%),
    linear-gradient(180deg, #f8f6f2 0%, #f1efeb 100%);
  color: #18322f;

  &__sidebar {
    width: 270px;
    flex: 0 0 270px;
    position: relative;
    z-index: 4;
  }

  &__main {
    flex: 1;
    min-width: 0;
    min-height: 100vh;
    padding: 22px 22px 18px;
    display: flex;
    flex-direction: column;
  }

  &__header {
    min-height: 76px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    padding: 16px 22px;
    border-radius: 22px;
    background: rgba(255, 255, 255, 0.86);
    border: 1px solid rgba(24, 50, 47, 0.08);
    box-shadow: 0 18px 40px rgba(41, 53, 52, 0.08);
    backdrop-filter: blur(14px);
  }

  &__header-copy {
    min-width: 0;
  }

  &__eyebrow {
    margin: 0 0 6px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #78a69c;
  }

  &__title {
    margin: 0;
    font-size: 24px;
    line-height: 1.1;
    font-weight: 700;
    color: #113731;
  }

  &__actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 10px;
  }

  &__icon-button {
    width: 38px;
    height: 38px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(17, 55, 49, 0.1);
    border-radius: 12px;
    background: #f7fbf9;
    color: #335f58;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      transform: translateY(-1px);
      border-color: rgba(17, 55, 49, 0.2);
      background: #ecf7f3;
    }

    i {
      font-size: 15px;
    }

    &--screen {
      padding: 0;
    }
  }

  &__profile-trigger {
    min-width: 140px;
    height: 38px;
    padding: 0 14px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    background: #113731;
    color: #fff;
    font-weight: 600;
    box-shadow: 0 14px 24px rgba(17, 55, 49, 0.18);
    cursor: pointer;
  }

  &__profile-name {
    max-width: 150px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &__content {
    flex: 1;
    padding-top: 22px;
    min-width: 0;
  }

  &__footer {
    padding: 18px 6px 0;
    text-align: center;
    color: #65807b;
    font-size: 12px;
  }
}

.screen-full {
  display: inline-flex;
  width: 15px;
  height: 15px;
  fill: currentColor;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translate(0, 30px);
  }

  to {
    opacity: 1;
    transform: none;
  }
}

.fadeInUp-enter-active {
  animation: fadeInUp 0.32s ease-out;
}

@media (max-width: 1200px) {
  .admin-shell {
    &__sidebar {
      width: 250px;
      flex-basis: 250px;
    }
  }
}

@media (max-width: 960px) {
  .admin-shell {
    flex-direction: column;

    &__sidebar {
      width: 100%;
      flex-basis: auto;
    }

    &__main {
      padding: 14px;
    }

    &__header {
      border-radius: 22px;
      padding: 16px 18px;
      align-items: flex-start;
      flex-direction: column;
    }

    &__actions {
      width: 100%;
      justify-content: flex-start;
    }

    &__title {
      font-size: 24px;
    }
  }
}
</style>
