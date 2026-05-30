<template>
  <Panel shadow>
    <div slot="title">{{ contest.title }}</div>
    <div slot="extra">
      <screen-full :height="18" :width="18" class="screen-full"></screen-full>
      <Poptip trigger="hover" placement="left-start">
        <Icon type="android-settings" size="20"></Icon>
        <div slot="content" id="switches">
          <p>
            <span>{{$t('m.Menu')}}</span>
            <i-switch v-model="showMenu"></i-switch>
            <span>{{$t('m.Chart')}}</span>
            <i-switch v-model="showChart"></i-switch>
          </p>
          <p>
            <span>{{$t('m.Auto_Refresh')}}</span>
            <i-switch :disabled="refreshDisabled" v-model="autoRefresh" @on-change="handleAutoRefresh"></i-switch>
          </p>
          <p>
            <span>{{$t('m.Refresh_Interval')}}</span>
            <Select v-model="refreshInterval" @on-change="restartAutoRefresh" size="small" style="width: 80px">
              <Option :value="5000">5s</Option>
              <Option :value="10000">10s</Option>
              <Option :value="30000">30s</Option>
              <Option :value="60000">60s</Option>
            </Select>
          </p>
          <p>
            <Button type="primary" size="small" @click="togglePresentation">
              {{ presentationMode ? $t('m.Exit_Presentation') : $t('m.Presentation_Mode') }}
            </Button>
          </p>
          <template v-if="isContestAdmin">
            <p>
              <span>{{$t('m.RealName')}}</span>
              <i-switch v-model="showRealName"></i-switch>
            </p>
            <p>
              <span>{{$t('m.Force_Update')}}</span>
              <i-switch :disabled="refreshDisabled" v-model="forceUpdate"></i-switch>
            </p>
          </template>
          <template>
            <Button type="primary" size="small" @click="downloadRankCSV">{{$t('m.download_csv')}}</Button>
          </template>
        </div>
      </Poptip>
    </div>
    <div v-show="showChart" class="echarts" :class="{'echarts--presentation': presentationMode}">
      <ECharts :options="options" ref="chart" auto-resize></ECharts>
    </div>
    <Table v-show="!presentationMode" ref="tableRank" :columns="columns" :data="dataRank" disabled-hover height="600"></Table>
    <Pagination v-show="!presentationMode"
                :total="total"
                :page-size.sync="limit"
                :current.sync="page"
                @on-change="getContestRankData"
                @on-page-size-change="getContestRankData(1)"
                show-sizer></Pagination>
    <Button v-if="presentationMode" class="exit-presentation" type="error" @click="togglePresentation">
      {{$t('m.Exit_Presentation')}}
    </Button>
  </Panel>
</template>
<script>
  import moment from 'moment'
  import { mapActions } from 'vuex'

  import Pagination from '@oj/components/Pagination'
  import ContestRankMixin from './contestRankMixin'
  import time from '@/utils/time'
  import utils from '@/utils/utils'

  export default {
    name: 'acm-contest-rank',
    components: {
      Pagination
    },
    mixins: [ContestRankMixin],
    data () {
      return {
        total: 0,
        page: 1,
        contestID: '',
        columns: [
          {
            align: 'center',
            width: 50,
            fixed: 'left',
            render: (h, params) => {
              return h('span', {}, params.index + (this.page - 1) * this.limit + 1)
            }
          },
          {
            title: this.$i18n.t('m.User_User'),
            align: 'center',
            fixed: 'left',
            width: 150,
            render: (h, params) => {
              return h('a', {
                style: {
                  display: 'inline-block',
                  'max-width': '150px'
                },
                on: {
                  click: () => {
                    this.$router.push(
                      {
                        name: 'user-home',
                        query: {username: params.row.user.username}
                      })
                  }
                }
              }, params.row.user.username)
            }
          },
          {
            title: 'AC / ' + this.$i18n.t('m.Total'),
            align: 'center',
            width: 100,
            render: (h, params) => {
              return h('span', {}, [
                h('span', {}, params.row.accepted_number + ' / '),
                h('a', {
                  on: {
                    click: () => {
                      this.$router.push({
                        name: 'contest-submission-list',
                        query: {username: params.row.user.username}
                      })
                    }
                  }
                }, params.row.submission_number)
              ])
            }
          },
          {
            title: this.$i18n.t('m.TotalTime'),
            align: 'center',
            width: 100,
            render: (h, params) => {
              return h('span', this.parseTotalTime(params.row.total_time))
            }
          }
        ],
        dataRank: [],
        chartSeriesCount: 0,
        options: {
          title: {
            text: this.$i18n.t('m.Top_10_Teams'),
            left: 'center'
          },
          animationDurationUpdate: 600,
          animationEasingUpdate: 'cubicInOut',
          dataZoom: [
            {
              type: 'inside',
              filterMode: 'none',
              xAxisIndex: [0],
              start: 0,
              end: 100
            }
          ],
          toolbox: {
            show: true,
            feature: {
              saveAsImage: {show: true, title: this.$i18n.t('m.save_as_image')}
            },
            right: '5%'
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
              axis: 'x'
            }
          },
          legend: {
            orient: 'vertical',
            y: 'center',
            right: 0,
            data: [],
            formatter: (value) => {
              return utils.breakLongWords(value, 16)
            },
            textStyle: {
              fontSize: 12
            }
          },
          grid: {
            x: 80,
            x2: 200
          },
          xAxis: [{
            type: 'time',
            splitLine: false,
            axisPointer: {
              show: true,
              snap: true
            }
          }],
          yAxis: [
            {
              type: 'category',
              boundaryGap: false,
              data: [0]
            }],
          series: []
        }
      }
    },
    mounted () {
      this.contestID = this.$route.params.contestID
      this.getContestRankData(1)
      if (this.contestProblems.length === 0) {
        this.getContestProblems().then((res) => {
          this.addTableColumns(res.data.data)
          this.addChartCategory(res.data.data)
        })
      } else {
        this.addTableColumns(this.contestProblems)
        this.addChartCategory(this.contestProblems)
      }
    },
    methods: {
      ...mapActions(['getContestProblems']),
      addChartCategory (contestProblems) {
        let category = []
        for (let i = 0; i <= contestProblems.length; ++i) {
          category.push(i)
        }
        if (this.$refs.chart) {
          this.$refs.chart.mergeOptions({yAxis: [{data: category}]})
        }
      },
      applyToChart (rankData) {
        let [users, seriesData] = [[], []]
        rankData.forEach(rank => {
          users.push(rank.user.username)
          let info = rank.submission_info
          // 提取出已AC题目的时间
          let timeData = []
          Object.keys(info).forEach(problemID => {
            if (info[problemID].is_ac) {
              timeData.push(info[problemID].ac_time)
            }
          })
          timeData.sort((a, b) => {
            return a - b
          })

          let data = []
          data.push([this.contest.start_time, 0])
          // index here can be regarded as stacked accepted number count.
          for (let [index, value] of timeData.entries()) {
            let realTime = moment(this.contest.start_time).add(value, 'seconds').format()
            data.push([realTime, index + 1])
          }
          seriesData.push({
            name: rank.user.username,
            type: 'line',
            data
          })
        })
        // Clear leftover lines if this refresh has fewer teams than the previous one.
        for (let i = seriesData.length; i < this.chartSeriesCount; ++i) {
          seriesData.push({name: '', type: 'line', data: []})
        }
        this.chartSeriesCount = users.length
        if (this.$refs.chart) {
          this.$refs.chart.mergeOptions({legend: {data: users}, series: seriesData})
        }
      },
      applyToTable (data) {
        // deepcopy
        let dataRank = JSON.parse(JSON.stringify(data))
        // 从submission_info中取出相应的problem_id 放入到父object中,这么做主要是为了适应iview table的data格式
        // 见https://www.iviewui.com/components/table
        dataRank.forEach((rank, i) => {
          let info = rank.submission_info
          let cellClass = {}
          Object.keys(info).forEach(problemID => {
            dataRank[i][problemID] = info[problemID]
            dataRank[i][problemID].ac_time = time.secondFormat(dataRank[i][problemID].ac_time)
            let status = info[problemID]
            if (status.is_first_ac) {
              cellClass[problemID] = 'first-ac'
            } else if (status.is_ac) {
              cellClass[problemID] = 'ac'
            } else {
              cellClass[problemID] = 'wa'
            }
          })
          dataRank[i].cellClassName = cellClass
        })
        this.dataRank = dataRank
      },
      addTableColumns (problems) {
        // 根据题目添加table column
        problems.forEach(problem => {
          this.columns.push({
            align: 'center',
            key: problem.id,
            width: problems.length > 15 ? 80 : null,
            renderHeader: (h, params) => {
              return h('Tooltip', {
                props: {
                  content: this.$i18n.t('m.Author') + ': ' + (problem.created_by ? problem.created_by.username : '-'),
                  placement: 'top',
                  transfer: true
                }
              }, [
                h('a', {
                  'class': {
                    'emphasis': true
                  },
                  on: {
                    click: () => {
                      this.$router.push({
                        name: 'contest-problem-details',
                        params: {
                          contestID: this.contestID,
                          problemID: problem._id
                        }
                      })
                    }
                  }
                }, [
                  h('div', {style: {fontWeight: 'bold'}}, problem._id),
                  h('div', {style: {fontSize: '12px', fontWeight: 'normal', lineHeight: '1.2', marginTop: '2px'}}, problem.title)
                ])
              ])
            },
            render: (h, params) => {
              if (params.row[problem.id]) {
                let status = params.row[problem.id]
                let acTime, errorNumber
                if (status.is_ac) {
                  acTime = h('span', status.ac_time)
                }
                if (status.error_number !== 0) {
                  errorNumber = h('p', '(-' + status.error_number + ')')
                }
                return h('div', [acTime, errorNumber])
              }
            }
          })
        })
      },
      parseTotalTime (totalTime) {
        let m = moment.duration(totalTime, 's')
        return [Math.floor(m.asHours()), m.minutes(), m.seconds()].join(':')
      },
      downloadRankCSV () {
        utils.downloadFile(`contest_rank?download_csv=1&contest_id=${this.$route.params.contestID}&force_refrash=${this.forceUpdate ? '1' : '0'}`)
      }
    }
  }
</script>
<style scoped lang="less">
  .echarts {
    margin: 20px auto;
    height: 400px;
    width: 98%;
  }

  .echarts--presentation {
    height: 78vh;
  }

  .exit-presentation {
    position: fixed;
    top: 14px;
    right: 16px;
    z-index: 1000;
  }

  .screen-full {
    margin-right: 8px;
  }

  #switches {
    p {
      margin-top: 5px;
      &:first-child {
        margin-top: 0;
      }
      span {
        margin-left: 8px;
      }
    }
  }
</style>
