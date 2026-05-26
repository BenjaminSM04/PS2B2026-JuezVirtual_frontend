<template>
  <div class="flex-container">
    <div id="contest-main">
      <!--children-->
      <transition name="fadeInUp">
        <router-view></router-view>
      </transition>
      <!--children end-->
      <div class="flex-container" v-if="route_name === 'contest-details'">
          <div id="contest-desc">

            <div class="contest-timer" :class="timerClass">
              <div class="timer-label">
                {{ contestStatus === '1'
                  ? $t('m.Starts_In')
                  : contestStatus === '0'
                    ? $t('m.Ends_In')
                    : $t('m.Contest_Finished') }}
              </div>
              <div class="timer-value">
                {{ countdown }}
              </div>
            </div>

            <!-- Tarjetas de estadísticas -->
            <Row :gutter="14" class="overview-stats list-stagger">
              <Col :xs="12" :sm="6">
                <div class="stat-card stat-card--primary">
                  <Icon type="ios-keypad" class="stat-icon"/>
                  <div class="stat-value">{{ stats.problems }}</div>
                  <div class="stat-label">{{ $t('m.Total_Problems') }}</div>
                </div>
              </Col>
              <Col :xs="12" :sm="6">
                <div class="stat-card stat-card--info">
                  <Icon type="person-stalker" class="stat-icon"/>
                  <div class="stat-value">{{ stats.participants }}</div>
                  <div class="stat-label">{{ $t('m.Total_Participants') }}</div>
                </div>
              </Col>
              <Col :xs="12" :sm="6">
                <div class="stat-card stat-card--warning">
                  <Icon type="paper-airplane" class="stat-icon"/>
                  <div class="stat-value">{{ stats.submissions }}</div>
                  <div class="stat-label">{{ $t('m.Total_Submissions') }}</div>
                </div>
              </Col>
              <Col :xs="12" :sm="6">
                <div class="stat-card stat-card--success">
                  <Icon type="checkmark-circled" class="stat-icon"/>
                  <div class="stat-value">{{ stats.accepted }}</div>
                  <div class="stat-label">{{ $t('m.Total_AC') }}</div>
                </div>
              </Col>
            </Row>

            <Panel :padding="20" shadow>
              <div slot="title">
                {{contest.title}}
              </div>
              <div slot="extra" v-if="isContestAdmin">
                <Button type="primary" icon="compose" @click="openCreateAnnouncement">
                  {{ $t('m.Create_Contest_Announcement') }}
                </Button>
              </div>
              <div v-katex v-html="contest.description" class="markdown-body"></div>
              <div v-if="passwordFormVisible" class="contest-password">
                <Input v-model="contestPassword" type="password"
                       :placeholder="$t('m.Contest_Password_Placeholder')" class="contest-password-input"
                       @on-enter="checkPassword"/>
                <Button type="info" @click="checkPassword">{{ $t('m.Enter') }}</Button>
              </div>
            </Panel>

            <!-- Mini ranking + anuncios recientes -->
            <Row :gutter="20" class="overview-secondary" v-if="topRanking.length || recentAnnouncements.length">
              <Col :xs="24" :md="12" v-if="topRanking.length">
                <Panel :padding="0" shadow class="side-panel">
                  <div slot="title">
                    <Icon type="trophy"/> {{ $t('m.Top_Ranking') }}
                  </div>
                  <div slot="extra">
                    <a @click="goToRanking">{{ $t('m.View_Full_Ranking') }}</a>
                  </div>
                  <ul class="top-ranking-list list-stagger">
                    <li v-for="(row, index) in topRanking" :key="row.id || index">
                      <span class="rank-pos" :class="'rank-pos-' + (index + 1)">{{ index + 1 }}</span>
                      <span class="rank-name">{{ row.user.username }}</span>
                      <span class="rank-score">
                        <template v-if="contestRuleType === 'ACM'">
                          {{ row.accepted_number }} AC
                        </template>
                        <template v-else>
                          {{ row.total_score }}
                        </template>
                      </span>
                    </li>
                  </ul>
                </Panel>
              </Col>
              <Col :xs="24" :md="topRanking.length ? 12 : 24" v-if="recentAnnouncements.length">
                <Panel :padding="0" shadow class="side-panel">
                  <div slot="title">
                    <Icon type="chatbubble-working"/> {{ $t('m.Recent_Announcements') }}
                  </div>
                  <div slot="extra">
                    <a @click="goToAnnouncements">{{ $t('m.View_All_Announcements') }}</a>
                  </div>
                  <ul class="recent-announcements list-stagger">
                    <li v-for="ann in recentAnnouncements" :key="ann.id" @click="goToAnnouncements">
                      <div class="ann-title">{{ ann.title }}</div>
                      <div class="ann-date">{{ ann.create_time | localtime('YYYY-M-D HH:mm') }}</div>
                    </li>
                  </ul>
                </Panel>
              </Col>
            </Row>

            <Table :columns="columns" :data="contest_table" disabled-hover style="margin-bottom: 40px;"></Table>
          </div>
      </div>

      <!-- Modal para crear anuncio (admin) -->
      <Modal v-model="createAnnouncementVisible"
             :title="$t('m.Create_Contest_Announcement')"
             :mask-closable="false"
             :width="640">
        <Form ref="announcementForm" :model="newAnnouncement" :rules="announcementRules">
          <FormItem :label="$t('m.Announcement_Title')" prop="title">
            <Input v-model="newAnnouncement.title" :placeholder="$t('m.Announcement_Title')"/>
          </FormItem>
          <FormItem :label="$t('m.Announcement_Content')" prop="content">
            <Input v-model="newAnnouncement.content" type="textarea" :rows="8"
                   :placeholder="$t('m.Announcement_Content')"/>
          </FormItem>
        </Form>
        <div slot="footer">
          <Button @click="createAnnouncementVisible = false">{{ $t('m.Cancel') }}</Button>
          <Button type="primary" :loading="creatingAnnouncement" @click="submitAnnouncement">
            {{ $t('m.Save') }}
          </Button>
        </div>
      </Modal>
    </div>
    <div v-show="showMenu" id="contest-menu">
      <VerticalMenu @on-click="handleRoute">
        <VerticalMenu-item :route="{name: 'contest-details', params: {contestID: contestID}}">
          <Icon type="home"></Icon>
          {{$t('m.Overview')}}
        </VerticalMenu-item>

        <VerticalMenu-item :disabled="contestMenuDisabled"
                           :route="{name: 'contest-announcement-list', params: {contestID: contestID}}">
          <Icon type="chatbubble-working"></Icon>
          {{$t('m.Announcements')}}
        </VerticalMenu-item>

        <VerticalMenu-item :disabled="contestMenuDisabled"
                           :route="{name: 'contest-problem-list', params: {contestID: contestID}}">
          <Icon type="ios-photos"></Icon>
          {{$t('m.Problems')}}
        </VerticalMenu-item>

        <VerticalMenu-item v-if="OIContestRealTimePermission"
                           :disabled="contestMenuDisabled"
                           :route="{name: 'contest-submission-list'}">
          <Icon type="navicon-round"></Icon>
          {{$t('m.Submissions')}}
        </VerticalMenu-item>

        <VerticalMenu-item v-if="OIContestRealTimePermission"
                           :disabled="contestMenuDisabled"
                           :route="{name: 'contest-rank', params: {contestID: contestID}}">
          <Icon type="stats-bars"></Icon>
          {{$t('m.Rankings')}}
        </VerticalMenu-item>

        <VerticalMenu-item v-if="showAdminHelper"
                           :route="{name: 'acm-helper', params: {contestID: contestID}}">
          <Icon type="ios-paw"></Icon>
          {{$t('m.Admin_Helper')}}
        </VerticalMenu-item>
      </VerticalMenu>
    </div>
  </div>
</template>

<script>
  import moment from 'moment'
  import api from '@oj/api'
  import { mapState, mapGetters, mapActions } from 'vuex'
  import { types } from '@/store'
  import { CONTEST_STATUS_REVERSE, CONTEST_STATUS } from '@/utils/constants'
  import time from '@/utils/time'

  export default {
    name: 'ContestDetail',
    components: {},
    data () {
      return {
        CONTEST_STATUS: CONTEST_STATUS,
        route_name: '',
        btnLoading: false,
        contestID: '',
        contestPassword: '',
        stats: {
          problems: 0,
          participants: 0,
          submissions: 0,
          accepted: 0
        },
        topRanking: [],
        recentAnnouncements: [],
        createAnnouncementVisible: false,
        creatingAnnouncement: false,
        newAnnouncement: {
          title: '',
          content: ''
        },
        announcementRules: {
          title: [
            { required: true, message: this.$i18n.t('m.Announcement_Title_Required'), trigger: 'blur' },
            { min: 1, max: 128, message: this.$i18n.t('m.Announcement_Title_Length'), trigger: 'blur' }
          ],
          content: [
            { required: true, message: this.$i18n.t('m.Content_Required'), trigger: 'blur' }
          ]
        },
        columns: [
          {
            title: this.$i18n.t('m.StartAt'),
            render: (h, params) => {
              return h('span', time.utcToLocal(params.row.start_time))
            }
          },
          {
            title: this.$i18n.t('m.EndAt'),
            render: (h, params) => {
              return h('span', time.utcToLocal(params.row.end_time))
            }
          },
          {
            title: this.$i18n.t('m.ContestType'),
            render: (h, params) => {
              return h('span', this.$i18n.t('m.' + (params.row.contest_type ? params.row.contest_type.replace(' ', '_') : '')))
            }
          },
          {
            title: this.$i18n.t('m.Rule'),
            render: (h, params) => {
              return h('span', params.row.rule_type ? this.$i18n.t('m.' + params.row.rule_type) : '')
            }
          },
          {
            title: this.$i18n.t('m.Creator'),
            render: (h, data) => {
              return h('span', data.row.created_by.username)
            }
          }
        ]
      }
    },
    mounted () {
      this.contestID = this.$route.params.contestID
      this.route_name = this.$route.name
      this.$store.dispatch('getContest').then(res => {
        this.changeDomTitle({title: res.data.data.title})
        let data = res.data.data
        let endTime = moment(data.end_time)
        if (endTime.isAfter(moment(data.now))) {
          this.timer = setInterval(() => {
            this.$store.commit(types.NOW_ADD_1S)
          }, 1000)
        }
        this.loadOverviewData()
      })
    },
    methods: {
      ...mapActions(['changeDomTitle']),
      handleRoute (route) {
        this.$router.push(route)
      },
      checkPassword () {
        if (this.contestPassword === '') {
          this.$error('Password can\'t be empty')
          return
        }
        this.btnLoading = true
        api.checkContestPassword(this.contestID, this.contestPassword).then((res) => {
          this.$success(this.$t('m.Succeeded'))
          this.$store.commit(types.CONTEST_ACCESS, {access: true})
          this.btnLoading = false
        }, (res) => {
          this.btnLoading = false
        })
      },
      loadOverviewData () {
        // Estadísticas a partir de los problemas del concurso
        api.getContestProblemList(this.contestID).then(res => {
          const problems = res.data.data || []
          const submissions = problems.reduce((acc, p) => acc + (p.submission_number || 0), 0)
          const accepted = problems.reduce((acc, p) => acc + (p.accepted_number || 0), 0)
          this.stats.problems = problems.length
          this.stats.submissions = submissions
          this.stats.accepted = accepted
        }).catch(() => {})

        // Top 5 del ranking + total de participantes
        api.getContestRank({
          contest_id: this.contestID,
          offset: 0,
          limit: 5
        }).then(res => {
          this.stats.participants = res.data.data.total || 0
          this.topRanking = (res.data.data.results || []).filter(r => r && r.user)
        }).catch(() => {})

        // Últimos 3 anuncios
        api.getContestAnnouncementList(this.contestID).then(res => {
          const list = res.data.data || []
          this.recentAnnouncements = list.slice(0, 3)
        }).catch(() => {})
      },
      openCreateAnnouncement () {
        this.newAnnouncement.title = ''
        this.newAnnouncement.content = ''
        this.createAnnouncementVisible = true
        this.$nextTick(() => {
          if (this.$refs.announcementForm) {
            this.$refs.announcementForm.resetFields()
          }
        })
      },
      submitAnnouncement () {
        this.$refs.announcementForm.validate(valid => {
          if (!valid) return
          this.creatingAnnouncement = true
          api.createContestAnnouncement({
            contest_id: parseInt(this.contestID),
            title: this.newAnnouncement.title,
            content: this.newAnnouncement.content,
            visible: true
          }).then(() => {
            this.creatingAnnouncement = false
            this.createAnnouncementVisible = false
            this.$success(this.$i18n.t('m.Announcement_Created'))
            // refrescar anuncios recientes en el overview
            api.getContestAnnouncementList(this.contestID).then(res => {
              this.recentAnnouncements = (res.data.data || []).slice(0, 3)
            }).catch(() => {})
          }).catch(() => {
            this.creatingAnnouncement = false
          })
        })
      },
      goToRanking () {
        this.$router.push({ name: 'contest-rank', params: { contestID: this.contestID } })
      },
      goToAnnouncements () {
        this.$router.push({ name: 'contest-announcement-list', params: { contestID: this.contestID } })
      }
    },
    computed: {
      ...mapState({
        showMenu: state => state.contest.itemVisible.menu,
        contest: state => state.contest.contest,
        contest_table: state => [state.contest.contest],
        now: state => state.contest.now
      }),
      ...mapGetters(
        ['contestMenuDisabled', 'contestRuleType', 'contestStatus', 'countdown', 'isContestAdmin',
          'OIContestRealTimePermission', 'passwordFormVisible']
      ),
      countdownColor () {
        if (this.contestStatus) {
          return CONTEST_STATUS_REVERSE[this.contestStatus].color
        }
      },
      showAdminHelper () {
        return this.isContestAdmin && this.contestRuleType === 'ACM'
      },
      timerClass () {
        const status = this.contestStatus

        if (status === CONTEST_STATUS.ENDED) {
          return 'timer-ended'
        }

        const parts = (this.countdown || '').split(':')
        if (parts.length < 3) return 'timer-safe'

        const seconds =
          (+parts[0]) * 3600 +
          (+parts[1]) * 60 +
          (+parts[2])

        if (seconds <= 300) {
          return 'timer-danger'
        }

        if (seconds <= 1800) {
          return 'timer-warning'
        }
        return 'timer-safe'
      }
    },
    watch: {
      '$route' (newVal) {
        this.route_name = newVal.name
        this.contestID = newVal.params.contestID
        this.changeDomTitle({title: this.contest.title})
      }
    },
    beforeDestroy () {
      clearInterval(this.timer)
      this.$store.commit(types.CLEAR_CONTEST)
    }
  }
</script>

<style scoped lang="less">
  @import (reference) '../../../../styles/theme-oj.less';
  pre {
    display: inline-block;
  }

  /*#countdown {
    font-size: 16px;
  }*/

  .flex-container {
    #contest-main {
      flex: 1 1;
      width: 0;
      #contest-desc {
        flex: auto;
      }
    }
    #contest-menu {
      flex: none;
      width: 210px;
      margin-left: 20px;
    }
    .contest-password {
      margin-top: 20px;
      margin-bottom: -10px;
      &-input {
        width: 200px;
        margin-right: 10px;
      }
    }
  }

  #contest-menu .ivu-icon {
    color: @oj-guindo;
  }

  #contest-menu .ivu-menu-item-active .ivu-icon {
    color: #6D6E71;
  }

  .contest-timer {
  background: linear-gradient(135deg, @oj-guindo, #6D6E71);
    color: white;
    padding: 18px 20px;
    border-radius: 16px;
    text-align: center;
    margin-bottom: 16px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
    position: relative;
    overflow: hidden;
    z-index: 1;
  }

  .contest-timer > * {
    position: relative;
    z-index: 2;
  }

  .contest-timer::before {
    content: '';
    position: absolute;
    width: 300%;
    height: 300%;
    top: -100%;
    left: -100%;
    transform: rotate(20deg);
    background: linear-gradient(135deg, @oj-guindo, #6D6E71);
    opacity: 0.2;
  }

  .timer-label {
    font-size: 13px;
    letter-spacing: 1px;
    opacity: 0.9;
  }

  .timer-value {
    font-size: 36px;
    font-weight: 700;
    letter-spacing: 2px;
    margin-top: 4px;
  }

  .timer-safe {
  background: linear-gradient(135deg, #1f8b4c, #2ecc71);
}

.timer-warning {
  background: linear-gradient(135deg, #f39c12, #f1c40f);
}

.timer-danger {
  background: linear-gradient(135deg, #c0392b, #e74c3c);
  animation: pulse 1.2s infinite;
}

.timer-ended {
  background: linear-gradient(135deg, #2c3e50, #34495e);
}
@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
  }
  50% {
    transform: scale(1.02);
    box-shadow: 0 15px 35px rgba(0,0,0,0.25);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
  }
}

/* ============ Overview enriquecido ============ */

.overview-stats {
  margin-bottom: 16px;
  margin-left: 0 !important;
  margin-right: 0 !important;

  .ivu-col {
    margin-bottom: 12px;
  }
}

.stat-card {
  background: #ffffff;
  border-radius: 14px;
  padding: 18px 16px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  border-top: 4px solid @oj-guindo;
  transition: transform 0.2s, box-shadow 0.2s;
  min-height: 120px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 18px rgba(0, 0, 0, 0.10);
  }

  .stat-icon {
    font-size: 28px;
    color: @oj-guindo;
    margin-bottom: 6px;
  }

  .stat-value {
    font-size: 28px;
    font-weight: 700;
    color: #2c3e50;
    line-height: 1.1;
  }

  .stat-label {
    font-size: 13px;
    color: #6D6E71;
    margin-top: 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  &--info {
    border-top-color: #3498db;
    .stat-icon { color: #3498db; }
  }

  &--warning {
    border-top-color: #f39c12;
    .stat-icon { color: #f39c12; }
  }

  &--success {
    border-top-color: #19be6b;
    .stat-icon { color: #19be6b; }
  }
}

.overview-secondary {
  margin-top: 18px;
  margin-bottom: 24px;

  .ivu-col {
    margin-bottom: 18px;
  }

  .side-panel {
    height: 100%;
  }
}

.top-ranking-list {
  list-style: none;
  margin: 0;
  padding: 0;

  li {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 20px;
    border-bottom: 1px solid #f0f2f5;

    &:last-child {
      border-bottom: none;
    }

    .rank-pos {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #e6e9ed;
      color: #2c3e50;
      font-weight: 700;
      font-size: 13px;
      flex-shrink: 0;
    }

    .rank-pos-1 { background: #f1c40f; color: #fff; }
    .rank-pos-2 { background: #bdc3c7; color: #fff; }
    .rank-pos-3 { background: #cd7f32; color: #fff; }

    .rank-name {
      flex: 1;
      font-weight: 600;
      color: #2c3e50;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .rank-score {
      color: @oj-guindo;
      font-weight: 700;
      font-size: 14px;
    }
  }
}

.recent-announcements {
  list-style: none;
  margin: 0;
  padding: 0;

  li {
    padding: 12px 20px;
    border-bottom: 1px solid #f0f2f5;
    cursor: pointer;
    transition: background-color 0.15s;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background-color: #fafbfc;
    }

    .ann-title {
      font-weight: 600;
      color: #2c3e50;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .ann-date {
      font-size: 12px;
      color: #95a5a6;
      margin-top: 4px;
    }
  }
}
</style>