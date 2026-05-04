<template>
  <div class="dashboard-page">
    <div v-if="isSuperAdmin" class="dashboard-page__stats">
      <article
        v-for="card in statCards"
        :key="card.key"
        class="dashboard-stat"
        :style="{ '--accent': card.color, '--accent-soft': card.softColor }">
        <div class="dashboard-stat__icon">
          <i :class="card.icon"></i>
        </div>
        <div class="dashboard-stat__body">
          <p class="dashboard-stat__value">{{card.value}}</p>
          <p class="dashboard-stat__label">{{card.label}}</p>
        </div>
      </article>
    </div>

    <div class="dashboard-page__grid">
      <div class="dashboard-page__left-col">
        <section class="dashboard-card dashboard-card--profile">
          <div class="dashboard-card__header">
            <span class="dashboard-card__eyebrow">{{$t('m.Admin_Profile')}}</span>
          </div>

          <div class="profile-card">
            <div class="profile-card__avatar">
              <img
                v-if="showAvatar"
                class="profile-card__avatar-image"
                :src="profile.avatar"
                :alt="user.username"
                @error="handleAvatarError">
              <div v-else class="profile-card__avatar-fallback">
                <i class="el-icon-fa-user"></i>
              </div>
            </div>

            <div class="profile-card__identity">
              <h2 class="profile-card__name">{{user.username}}</h2>
              <p class="profile-card__role">{{user.admin_type || '--'}}</p>
            </div>
          </div>

          <div class="session-card">
            <div class="session-card__header">
              <h3>{{$t('m.Last_Login')}}</h3>
              <span class="session-card__pill">{{$t('m.Session_Info')}}</span>
            </div>

            <div class="session-card__items">
              <div class="session-card__item">
                <span class="session-card__label">{{$t('m.Time')}}</span>
                <span class="session-card__value">{{sessionTime}}</span>
              </div>
              <div class="session-card__item">
                <span class="session-card__label">{{$t('m.IP')}}</span>
                <span class="session-card__value">{{session.ip || '--'}}</span>
              </div>
              <div class="session-card__item">
                <span class="session-card__label">{{$t('m.Operating_System')}}</span>
                <span class="session-card__value">{{os}}</span>
              </div>
              <div class="session-card__item">
                <span class="session-card__label">{{$t('m.Browser')}}</span>
                <span class="session-card__value">{{browser}}</span>
              </div>
            </div>
          </div>
        </section>

        <section v-if="isSuperAdmin" class="dashboard-card dashboard-card--overview">
          <div class="dashboard-card__header">
            <div>
              <span class="dashboard-card__eyebrow">{{$t('m.System_Status')}}</span>
              <h2 class="dashboard-card__title">{{$t('m.System_Overview')}}</h2>
            </div>
          </div>

          <div class="overview-grid">
            <div v-for="item in systemItems" :key="item.key" class="overview-item">
              <span class="overview-item__label">{{item.label}}</span>
              <div class="overview-item__value">
                <template v-if="item.tagType">
                  <el-tag :type="item.tagType" size="small">{{item.value}}</el-tag>
                </template>
                <template v-else>
                  <span>{{item.value}}</span>
                </template>
              </div>
            </div>
          </div>
        </section>

        <section v-if="!isSuperAdmin" class="dashboard-card dashboard-card--welcome">
          <div class="dashboard-card__header">
            <div>
              <span class="dashboard-card__eyebrow">{{$t('m.Admin_Workspace')}}</span>
              <h2 class="dashboard-card__title">{{$t('m.Welcome_Back')}}</h2>
            </div>
          </div>

          <div class="welcome-card">
            <p>{{welcomeMessage}}</p>
            <div class="welcome-card__hint">
              <i class="el-icon-fa-compass"></i>
              <span>{{$t('m.Admin_Limited_View')}}</span>
            </div>
          </div>
        </section>
      </div>

      <section v-if="isSuperAdmin" class="dashboard-card dashboard-card--notes">
        <div class="dashboard-card__header">
          <div>
            <span class="dashboard-card__eyebrow">{{$t('m.System_Updates')}}</span>
            <h2 class="dashboard-card__title">{{$t('m.Release_Notes')}}</h2>
          </div>
          <el-popover placement="left" trigger="hover">
            <i slot="reference" class="el-icon-fa-question-circle dashboard-card__help"></i>
            <p>{{$t('m.Upgrade_Message')}}</p>
            <p>
              Reference:
              <a href="http://docs.onlinejudge.me/#/onlinejudge/guide/upgrade" target="_blank">
                http://docs.onlinejudge.me/#/onlinejudge/guide/upgrade
              </a>
            </p>
          </el-popover>
        </div>

        <div class="notes-card" v-loading="loadingReleases">
          <div v-if="releases.length" class="notes-card__list">
            <article v-for="(release, index) in releases" :key="'release-' + index" class="release-note">
              <div class="release-note__header">
                <div>
                  <h3>{{release.title}}</h3>
                  <p>{{$t('m.Release_Level')}}: {{release.level}}</p>
                </div>
                <el-tag v-if="release.new_version" size="mini" type="success">
                  {{$t('m.New_Version')}}
                </el-tag>
              </div>

              <ul class="release-note__details">
                <li v-for="detail in release.details" :key="detail" v-html="detail"></li>
              </ul>
            </article>
          </div>

          <div v-else class="notes-card__empty">
            <i class="el-icon-fa-sticky-note-o"></i>
            <p>{{$t('m.No_Release_Notes')}}</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import browserDetector from 'browser-detect'
  import api from '@admin/api'

  export default {
    name: 'dashboard',
    data () {
      return {
        infoData: {
          user_count: 0,
          recent_contest_count: 0,
          today_submission_count: 0,
          judge_server_count: 0,
          env: {}
        },
        session: {},
        loadingReleases: true,
        releases: [],
        avatarLoadError: false
      }
    },
    mounted () {
      api.getDashboardInfo().then(resp => {
        this.infoData = resp.data.data
      }, () => {
      })
      api.getSessions().then(resp => {
        this.parseSession(resp.data.data || [])
      }, () => {
      })
      api.getReleaseNotes().then(resp => {
        this.loadingReleases = false
        let data = resp.data.data
        if (!data) {
          return
        }
        let currentVersion = data.local_version
        let updates = data.update || []
        updates.forEach(release => {
          if (release.version > currentVersion) {
            release.new_version = true
          }
        })
        this.releases = updates
      }, () => {
        this.loadingReleases = false
      })
    },
    methods: {
      parseSession (sessions) {
        if (!sessions.length) {
          this.session = {}
          return
        }

        let nonCurrentSessions = sessions.filter(s => !s.current_session)
        if (nonCurrentSessions.length) {
          this.session = nonCurrentSessions.sort((a, b) => {
            return new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime()
          })[0]
        } else {
          this.session = sessions[0]
        }
      },
      handleAvatarError () {
        this.avatarLoadError = true
      }
    },
    computed: {
      ...mapGetters(['profile', 'user', 'isSuperAdmin']),
      statCards () {
        return [
          {
            key: 'users',
            label: this.$t('m.Total_Users'),
            value: this.infoData.user_count,
            icon: 'el-icon-fa-users',
            color: '#0f4f5d',
            softColor: '#d7edf2'
          },
          {
            key: 'submissions',
            label: this.$t('m.Today_Submissions'),
            value: this.infoData.today_submission_count,
            icon: 'el-icon-fa-paper-plane',
            color: '#9ae0bf',
            softColor: '#e3f8ee'
          },
          {
            key: 'contests',
            label: this.$t('m.Recent_Contests'),
            value: this.infoData.recent_contest_count,
            icon: 'el-icon-fa-trophy',
            color: '#b50b62',
            softColor: '#f6d8e7'
          }
        ]
      },
      systemItems () {
        return [
          {
            key: 'judge',
            label: this.$t('m.DashBoardJudge_Server'),
            value: this.infoData.judge_server_count
          },
          {
            key: 'https',
            label: this.$t('m.HTTPS_Status'),
            value: this.https ? this.$t('m.Enabled') : this.$t('m.Disabled'),
            tagType: this.https ? 'success' : 'danger'
          },
          {
            key: 'forceHttps',
            label: this.$t('m.Force_HTTPS'),
            value: this.forceHttps ? this.$t('m.Enabled') : this.$t('m.Disabled'),
            tagType: this.forceHttps ? 'success' : 'danger'
          },
          {
            key: 'cdn',
            label: this.$t('m.CDN_HOST'),
            value: this.cdn || this.$t('m.Not_Used'),
            tagType: this.cdn ? 'success' : 'warning'
          }
        ]
      },
      showAvatar () {
        return !!this.profile.avatar && !this.avatarLoadError
      },
      cdn () {
        return this.infoData.env.STATIC_CDN_HOST
      },
      https () {
        return document.URL.slice(0, 5) === 'https'
      },
      forceHttps () {
        return this.infoData.env.FORCE_HTTPS
      },
      browser () {
        let b = browserDetector(this.session.user_agent || '')
        if (b.name && b.version) {
          return b.name + ' ' + b.version
        } else if (b.name) {
          return b.name
        } else {
          return '--'
        }
      },
      os () {
        let b = browserDetector(this.session.user_agent || '')
        return b.os ? b.os : '--'
      },
      sessionTime () {
        if (!this.session.last_activity) {
          return '--'
        }
        const localtime = this.$options.filters && this.$options.filters.localtime
        return localtime ? localtime(this.session.last_activity) : this.session.last_activity
      },
      welcomeMessage () {
        return this.$t('m.Admin_Welcome_Message', { username: this.user.username || 'Admin' })
      }
    },
    watch: {
      'profile.avatar' () {
        this.avatarLoadError = false
      }
    }
  }
</script>

<style lang="less">
  .dashboard-page {
    display: flex;
    flex-direction: column;
    gap: 20px;

    &__stats {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 18px;
    }

    &__grid {
      display: grid;
      grid-template-columns: minmax(300px, 420px) minmax(0, 1fr);
      gap: 20px;
      align-items: start;
    }

    &__left-col {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
  }

  .dashboard-stat,
  .dashboard-card {
    border-radius: 30px;
    background: rgba(255, 255, 255, 0.92);
    border: 1px solid rgba(17, 55, 49, 0.08);
    box-shadow: 0 18px 38px rgba(39, 55, 53, 0.08);
  }

  .dashboard-stat {
    min-height: 122px;
    padding: 14px;
    display: grid;
    grid-template-columns: 138px minmax(0, 1fr);
    align-items: stretch;
    gap: 16px;

    &__icon {
      border-radius: 18px;
      background: var(--accent);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 34px;
      box-shadow: inset 0 -10px 18px rgba(0, 0, 0, 0.08);
    }

    &__body {
      display: flex;
      flex-direction: column;
      justify-content: center;
      min-width: 0;
      padding-right: 14px;
    }

    &__value {
      margin: 0 0 8px;
      font-size: 42px;
      line-height: 1;
      font-weight: 800;
      color: #122e2a;
    }

    &__label {
      margin: 0;
      font-size: 18px;
      font-weight: 700;
      color: #18322f;
    }
  }

  .dashboard-card {
    padding: 24px;

    &--profile {
      display: flex;
      flex-direction: column;
      gap: 22px;
    }

    &--notes {
      min-height: 540px;
    }

    &__header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 14px;
      margin-bottom: 18px;
    }

    &__eyebrow {
      display: inline-block;
      margin-bottom: 6px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #88aaa2;
    }

    &__title {
      margin: 0;
      font-size: 20px;
      font-weight: 800;
      color: #133530;
    }

    &__help {
      font-size: 18px;
      color: #8ba4a0;
      cursor: pointer;
    }
  }

  .profile-card {
    display: grid;
    grid-template-columns: 156px minmax(0, 1fr);
    gap: 18px;
    align-items: center;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(17, 55, 49, 0.08);

    &__avatar {
      width: 156px;
      height: 156px;
      border-radius: 50%;
      overflow: hidden;
      background: linear-gradient(180deg, #ebf7f2 0%, #d7eee6 100%);
      box-shadow: inset 0 0 0 1px rgba(67, 114, 104, 0.08);
    }

    &__avatar-image,
    &__avatar-fallback {
      width: 100%;
      height: 100%;
    }

    &__avatar-image {
      object-fit: cover;
      display: block;
    }

    &__avatar-fallback {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 74px;
      color: #39635b;
    }

    &__name {
      margin: 0 0 8px;
      font-size: 36px;
      line-height: 1.05;
      font-weight: 800;
      color: #123933;
      word-break: break-word;
    }

    &__role {
      margin: 0;
      font-size: 20px;
      line-height: 1.3;
      font-weight: 700;
      color: #4e6662;
      word-break: break-word;
    }
  }

  .session-card {
    &__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 18px;

      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 800;
        color: #1e3b37;
      }
    }

    &__pill {
      display: inline-flex;
      align-items: center;
      padding: 6px 10px;
      border-radius: 999px;
      background: #edf6f1;
      color: #4a7a71;
      font-size: 12px;
      font-weight: 700;
    }

    &__items {
      display: grid;
      gap: 12px;
    }

    &__item {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 14px 16px;
      border-radius: 18px;
      background: #f8fbfa;
      border: 1px solid rgba(17, 55, 49, 0.06);
    }

    &__label {
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #7a9791;
    }

    &__value {
      font-size: 16px;
      font-weight: 600;
      color: #173934;
      word-break: break-word;
    }
  }

  .notes-card {
    min-height: 420px;

    &__list {
      display: grid;
      gap: 16px;
    }

    &__empty {
      min-height: 360px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      color: #7e9691;
      text-align: center;

      i {
        font-size: 34px;
      }

      p {
        margin: 0;
        font-weight: 600;
      }
    }
  }

  .release-note {
    padding: 18px 20px;
    border-radius: 22px;
    background: linear-gradient(180deg, #ffffff 0%, #f8fbf9 100%);
    border: 1px solid rgba(17, 55, 49, 0.08);

    &__header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 12px;

      h3 {
        margin: 0 0 5px;
        font-size: 18px;
        font-weight: 800;
        color: #163530;
      }

      p {
        margin: 0;
        color: #66807a;
        font-weight: 600;
      }
    }

    &__details {
      margin: 0;
      padding-left: 18px;
      color: #324946;
      line-height: 1.7;
    }
  }

  .overview-grid {
    display: grid;
    gap: 12px;
  }

  .overview-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 16px 18px;
    border-radius: 18px;
    background: #f8fbfa;
    border: 1px solid rgba(17, 55, 49, 0.06);

    &__label {
      font-size: 15px;
      font-weight: 700;
      color: #31524c;
    }

    &__value {
      color: #173934;
      font-weight: 700;
      text-align: right;
    }
  }

  .welcome-card {
    min-height: 220px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 18px;

    p {
      margin: 0;
      font-size: 18px;
      line-height: 1.7;
      color: #36514c;
    }

    &__hint {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      border-radius: 18px;
      background: #edf6f1;
      color: #2f5f56;
      font-weight: 700;
      width: fit-content;
    }
  }

  @media (max-width: 1320px) {
    .dashboard-page {
      &__stats {
        grid-template-columns: 1fr;
      }

      &__grid {
        grid-template-columns: 1fr;
      }
    }
  }

  @media (max-width: 960px) {
    .dashboard-stat {
      grid-template-columns: 112px minmax(0, 1fr);

      &__value {
        font-size: 32px;
      }

      &__label {
        font-size: 16px;
      }
    }

    .profile-card {
      grid-template-columns: 1fr;

      &__avatar {
        width: 136px;
        height: 136px;
      }
    }

    .dashboard-card {
      padding: 20px;
      border-radius: 24px;
    }

    .overview-item {
      align-items: flex-start;
      flex-direction: column;
    }
  }

  @media (max-width: 640px) {
    .dashboard-stat {
      grid-template-columns: 1fr;

      &__icon {
        min-height: 86px;
      }

      &__body {
        padding-right: 0;
      }
    }

    .session-card {
      &__header {
        align-items: flex-start;
        flex-direction: column;
      }
    }

    .release-note {
      &__header {
        flex-direction: column;
      }
    }
  }
</style>
