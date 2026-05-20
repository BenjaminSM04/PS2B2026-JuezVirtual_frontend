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
                  ? 'Empieza en'
                  : contestStatus === '0'
                    ? 'Termina en'
                    : 'Finalizado' }}
              </div>
              <div class="timer-value">
                {{ countdown }}
              </div>
            </div>


            <Panel :padding="20" shadow>
              <div slot="title">
                {{contest.title}}
              </div>
              <!-- <div slot="extra">
                <Tag type="dot" :color="countdownColor">
                  <span id="countdown">{{countdown}}</span>
                </Tag>
              </div> -->
              <div v-katex v-html="contest.description" class="markdown-body"></div>
              <div v-if="passwordFormVisible" class="contest-password">
                <Input v-model="contestPassword" type="password"
                       placeholder="contest password" class="contest-password-input"
                       @on-enter="checkPassword"/>
                <Button type="info" @click="checkPassword">Enter</Button>
              </div>
            </Panel>
            <Table :columns="columns" :data="contest_table" disabled-hover style="margin-bottom: 40px;"></Table>
          </div>
      </div>

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
              //return h('span', this.$i18n.t('m.' + params.row.rule_type))
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
</style>