<template>
  <Row type="flex" justify="space-around">
    <Col :span="22">

      <Panel :padding="10">

        <div slot="title">
          {{$t('m.OI_Ranklist')}}
        </div>

        <div class="top-podium" v-if="dataRank.length >= 3">

          <div class="podium-card second">
            <div class="medal">🥈</div>

            <div class="username">
              {{ dataRank[1].user.username }}
            </div>

            <div class="score">
              {{ dataRank[1].total_score }}
            </div>
          </div>

          <div class="podium-card first">
            <div class="medal">🥇</div>

            <div class="username">
              {{ dataRank[0].user.username }}
            </div>

            <div class="score">
              {{ dataRank[0].total_score }}
            </div>
          </div>

          <div class="podium-card third">
            <div class="medal">🥉</div>

            <div class="username">
              {{ dataRank[2].user.username }}
            </div>

            <div class="score">
              {{ dataRank[2].total_score }}
            </div>
          </div>

        </div>

        <div class="echarts">
          <ECharts :options="options" ref="chart" auto-resize></ECharts>
        </div>

      </Panel>

      <Table
        :data="dataRank"
        :columns="columns"
        size="large">
      </Table>

      <!-- PAGINACION -->
      <Pagination
        :total="total"
        :page-size.sync="limit"
        :current.sync="page"
        @on-change="getRankData"
        show-sizer
        @on-page-size-change="getRankData(1)">
      </Pagination>

    </Col>
  </Row>
</template>

<script>
import api from '@oj/api'
import Pagination from '@oj/components/Pagination'
import utils from '@/utils/utils'
import { RULE_TYPE } from '@/utils/constants'

export default {
  name: 'oi-rank',

  components: {
    Pagination
  },

  data () {
    return {
      page: 1,
      limit: 30,
      total: 0,

      dataRank: [],
      columns: [
      {
        align: 'center',
        width: 80,

        render: (h, params) => {

          const rank = params.index + (this.page - 1) * this.limit + 1

          let medal = ''
          let color = '#664D59'

          if (rank === 1) {
            medal = '🥇'
            color = '#A60550'
          } else if (rank === 2) {
            medal = '🥈'
            color = '#987284'
          } else if (rank === 3) {
            medal = '🥉'
            color = '#664D59'
          }

      return h('div', {
        style: {
          fontWeight: 'bold',
          fontSize: '20px',
          color: color
        }
      }, medal || rank)
    }
  },

  {
    title: this.$i18n.t('m.User_User'),
    align: 'center',

    render: (h, params) => {

      return h('div', {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px'
        }
      }, [

        h('Avatar', {
          props: {
            icon: 'ios-person'
          },
          style: {
            backgroundColor: '#003B4A',
            color: '#fff'
          }
        }),

        h('a', {

          style: {
            display: 'inline-block',
            maxWidth: '200px',
            fontWeight: '600',
            color: '#003B4A'
          },

          on: {
            click: () => {

              this.$router.push({
                name: 'user-home',
                query: {
                  username: params.row.user.username
                }
              })
            }
          }

        }, params.row.user.username)

      ])
    }
  },

  {
    title: this.$i18n.t('m.mood'),
    align: 'center',
    key: 'mood'
  },

  {
    title: this.$i18n.t('m.Score'),
    align: 'center',
    key: 'total_score'
  },

  {
    title: this.$i18n.t('m.AC'),
    align: 'center',
    key: 'accepted_number'
  },

  {
    title: this.$i18n.t('m.Total'),
    align: 'center',
    key: 'submission_number'
  },

  {
    title: this.$i18n.t('m.Rating'),
    align: 'center',

    render: (h, params) => {

      return h(
        'span',
        utils.getACRate(
          params.row.accepted_number,
          params.row.submission_number
        )
      )
    }
  }
],

      options: {

        tooltip: {
          trigger: 'axis'
        },

        legend: {
          data: [
            this.$i18n.t('m.Score')
          ],

          textStyle: {
            color: '#000'
          }
        },

        grid: {
          x: '3%',
          x2: '3%'
        },

        toolbox: {
          show: true,

          feature: {

            dataView: {
              show: true,
              readOnly: true,

              title: this.$i18n.t('m.toolbox_data_view'),

              lang: [
                this.$i18n.t('m.toolbox_data_view'),
                this.$i18n.t('m.toolbox_data_view_close'),
                this.$i18n.t('m.toolbox_data_view_refresh')
              ]
            },

            magicType: {
              show: true,
              type: ['line', 'bar'],

              title: {
                line: this.$i18n.t('m.toolbox_switch_line'),
                bar: this.$i18n.t('m.toolbox_switch_bar')
              }
            },

            saveAsImage: {
              show: true,
              title: this.$i18n.t('m.save_as_image')
            }
          },

          right: '10%'
        },

        calculable: true,

        xAxis: [
          {
            type: 'category',

            data: [],

            boundaryGap: true,

            axisLabel: {
              interval: 0,
              showMinLabel: true,
              showMaxLabel: true,
              align: 'center',

              formatter: (value, index) => {
                return utils.breakLongWords(value, 14)
              }
            },

            axisTick: {
              alignWithLabel: true
            }
          }
        ],

        yAxis: [
          {
            type: 'value'
          }
        ],

        series: [
          {
            name: this.$i18n.t('m.Score'),
            type: 'bar',

            data: [],

            itemStyle: {
              color: '#A60550'
            },

            barMaxWidth: '80',

            markPoint: {
              data: [
                {type: 'max', name: 'max'}
              ]
            }
          }
        ]
      }
    }
  },

  mounted () {

    this.getRankData(1)
  },

  methods: {

    getRankData (page) {

      let offset = (page - 1) * this.limit

      let bar = this.$refs.chart

      bar.showLoading({
        maskColor: 'rgba(250, 250, 250, 0.8)'
      })

      api.getUserRank(offset, this.limit, RULE_TYPE.OI)

        .then(res => {

          if (page === 1) {

            this.changeCharts(
              res.data.data.results.slice(0, 10)
            )
          }

          this.total = res.data.data.total

          this.dataRank = res.data.data.results

          bar.hideLoading()
        })
    },

    changeCharts (rankData) {

      let [usernames, scores] = [[], []]

      rankData.forEach(ele => {

        usernames.push(ele.user.username)

        scores.push(ele.total_score)
      })

      this.options.xAxis[0].data = usernames

      this.options.series[0].data = scores
    }
  }
}
</script>

<style scoped lang="less">

.echarts {
  margin: 0 auto;
  width: 95%;
  height: 400px;
}

.top-podium {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 20px;
  margin: 20px 0 30px 0;
}

.podium-card {
  width: 180px;
  text-align: center;
  border-radius: 15px;
  padding: 20px;
  color: white;
  font-weight: bold;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  transition: transform 0.3s;

  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.podium-card:hover {
  transform: translateY(-5px);
}

.first {
  background: linear-gradient(135deg, #003B4A, #A60550);
  height: 220px;
}

.second {
  background: linear-gradient(
    135deg,
    #BDF2D4 0%,
    #8BE0C3 50%,
    #5CC8A8 100%
  );

  height: 180px;
  color: #003B4A;
}

.third {
  background: linear-gradient(
    135deg,
    #987284 0%,
    #7B5D6A 50%,
    #664D59 100%
  );

  height: 170px;
}

.medal {
  font-size: 40px;
  margin-bottom: 10px;
}

.username {
  font-size: 18px;
  margin-bottom: 10px;
  word-break: break-word;
}

.score {
  font-size: 24px;
}

::v-deep .ivu-table th {
  background-color: #003B4A;
  color: white;
  font-size: 14px;
}

::v-deep .ivu-table-row-hover td {
  background-color: #BDF2D4 !important;
}

::v-deep .ivu-table td {
  transition: 0.2s;
}

</style>