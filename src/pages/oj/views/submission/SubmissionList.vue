<template>
  <div class="flex-container">
    <div id="main">
      <Panel shadow>
        <div slot="title" style="font-weight: bold; color: #7B1E3A;">{{title}}</div>
        <div slot="extra">
          <ul class="filter">
            <li>
              <Dropdown @on-click="handleResultChange">
                <span style="color: #7B1E3A; font-weight: bold">{{status}}
                  <Icon type="arrow-down-b"></Icon>
                </span>
                <Dropdown-menu slot="list">
                  <Dropdown-item name="">{{$t('m.All')}}</Dropdown-item>
                  <Dropdown-item v-for="status in Object.keys(JUDGE_STATUS)" :key="status" :name="status">
                    {{$t('m.' + JUDGE_STATUS[status].name.replace(/ /g, "_"))}}
                  </Dropdown-item>
                </Dropdown-menu>
              </Dropdown>
            </li>


            <li>
              <i-switch size="large" v-model="formFilter.myself" @on-change="handleQueryChange" >
                <span slot="open">{{$t('m.Mine')}}</span>
                <span slot="close">{{$t('m.All')}}</span>
              </i-switch>
            </li>
            <li>
              <Input v-model="formFilter.username" icon="ios-search" :placeholder="$t('m.Search_Author')" @on-enter="handleQueryChange" class="search-input-left"/>
            </li>

            <li>
              <Button type="info" icon="refresh" @click="getSubmissions" 
              @mouseover.native="isHover = true" 
              @mouseleave.native="isHover = false"
              :style="{backgroundColor: isHover ? '#987284' : '#7B1E3A', 
                      borderColor: isHover ? '#987284' : '#7B1E3A',
                      fontWeight: 'bold'}">{{$t('m.Refresh')}}</Button>
            </li>
          </ul>
        </div>
        <Table stripe :disabled-hover="true" :columns="columns" :data="submissions" :loading="loadingTable"></Table>
        <Pagination :total="total" :page-size="limit" @on-change="changeRoute" :current.sync="page"></Pagination>
      </Panel>
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import api from '@oj/api'
  import { JUDGE_STATUS, USER_TYPE } from '@/utils/constants'
  import utils from '@/utils/utils'
  import time from '@/utils/time'
  import Pagination from '@/pages/oj/components/Pagination'

  export default {
    name: 'submissionList',
    components: {
      Pagination
    },
    data () {
      return {
        isHover: false,
        formFilter: {
          myself: false,
          result: '',
          username: ''
        },
        columns: [
          {
            title: this.$i18n.t('m.WhenDate'),
            align: 'center',
            render: (h, params) => {
              return h('span', time.utcToLocal(params.row.create_time))
            }
          },
          {
            title: this.$i18n.t('m.ID'),
            align: 'center',
            render: (h, params) => {
              if (params.row.show_link) {
                return h('span', {
                  class: 'id-link',
                  style: {
                    color: '#7b1e3a',
                    cursor: 'pointer'
                  },
                  on: {
                    click: () => {
                      this.$router.push('/status/' + params.row.id)
                    }
                  }
                }, params.row.id.slice(0, 12))
              } else {
                return h('span', params.row.id.slice(0, 12))
              }
            }
          },
          {
            title: this.$i18n.t('m.Status'),
            align: 'center',
            render: (h, params) => {
              return h('Tag', {
                props: {
                  color: JUDGE_STATUS[params.row.result].color
                }
              }, this.$i18n.t('m.' + JUDGE_STATUS[params.row.result].name.replace(/ /g, '_')))
            }
          },
          {
            title: this.$i18n.t('m.Problem'),
            align: 'center',
            render: (h, params) => {
              return h('span',
                {
                  style: {
                    color: '#7b1e3a',
                    cursor: 'pointer'
                  },
                  on: {
                    click: () => {
                      if (this.contestID) {
                        this.$router.push(
                          {
                            name: 'contest-problem-details',
                            params: {problemID: params.row.problem, contestID: this.contestID}
                          })
                      } else {
                        this.$router.push({name: 'problem-details', params: {problemID: params.row.problem}})
                      }
                    }
                  }
                },
                params.row.problem)
            }
          },
          {
            title: this.$i18n.t('m.TimeList'),
            align: 'center',
            render: (h, params) => {
              return h('span', utils.submissionTimeFormat(params.row.statistic_info.time_cost))
            }
          },
          {
            title: this.$i18n.t('m.Memory'),
            align: 'center',
            render: (h, params) => {
              return h('span', utils.submissionMemoryFormat(params.row.statistic_info.memory_cost))
            }
          },
          {
            title: this.$i18n.t('m.Language'),
            align: 'center',
            key: 'language'
          },
          {
            title: this.$i18n.t('m.Author'),
            align: 'center',
            render: (h, params) => {
              return h('a', {
                style: {
                  'display': 'inline-block',
                  'max-width': '150px'
                },
                on: {
                  click: () => {
                    this.$router.push(
                      {
                        name: 'user-home',
                        query: {username: params.row.username}
                      })
                  }
                }
              }, params.row.username)
            }
          }
        ],
        loadingTable: false,
        submissions: [],
        total: 30,
        limit: 12,
        page: 1,
        contestID: '',
        problemID: '',
        routeName: '',
        JUDGE_STATUS: '',
        rejudge_column: false
      }
    },
    mounted () {
      this.init()
      this.JUDGE_STATUS = Object.assign({}, JUDGE_STATUS)
      // 去除submitting的状态 和 两个
      delete this.JUDGE_STATUS['9']
      delete this.JUDGE_STATUS['2']
    },
    methods: {
      init () {
        this.contestID = this.$route.params.contestID
        let query = this.$route.query
        this.problemID = query.problemID
        this.formFilter.myself = query.myself === '1'
        this.formFilter.result = query.result || ''
        this.formFilter.username = query.username || ''
        this.page = parseInt(query.page) || 1
        if (this.page < 1) {
          this.page = 1
        }
        this.routeName = this.$route.name
        this.getSubmissions()
      },
      buildQuery () {
        return {
          myself: this.formFilter.myself === true ? '1' : '0',
          result: this.formFilter.result,
          username: this.formFilter.username,
          page: this.page
        }
      },
      getSubmissions () {
        let params = this.buildQuery()
        params.contest_id = this.contestID
        params.problem_id = this.problemID
        let offset = (this.page - 1) * this.limit
        let func = this.contestID ? 'getContestSubmissionList' : 'getSubmissionList'
        this.loadingTable = true
        api[func](offset, this.limit, params).then(res => {
          let data = res.data.data
          for (let v of data.results) {
            v.loading = false
          }
          this.adjustRejudgeColumn()
          this.loadingTable = false
          this.submissions = data.results
          this.total = data.total
        }).catch(() => {
          this.loadingTable = false
        })
      },
      // 改变route， 通过监听route变化请求数据，这样可以产生route history， 用户返回时就会保存之前的状态
      changeRoute () {
        let query = utils.filterEmptyValue(this.buildQuery())
        query.contestID = this.contestID
        query.problemID = this.problemID
        let routeName = query.contestID ? 'contest-submission-list' : 'submission-list'
        this.$router.push({
          name: routeName,
          query: utils.filterEmptyValue(query)
        })
      },
      goRoute (route) {
        this.$router.push(route)
      },
      adjustRejudgeColumn () {
        if (!this.rejudgeColumnVisible || this.rejudge_column) {
          return
        }
        const judgeColumn = {
          title: this.$i18n.t('m.Option'),
          align: 'center',
          fixed: 'right',
          width: 130,
          render: (h, params) => {
            return h('Button', {
              class: 'btnrejudge',
              props: {
                type: 'primary',
                size: 'small',
                loading: params.row.loading
              },
              style: {
                backgroundColor: '#82a69a',
                border: '1px solid #82a69a',
                fontWeight: 'bold',
                borderRadius: '8px'
              },
              on: {
                click: () => {
                  this.handleRejudge(params.row.id, params.index)
                }
              }
            }, this.$i18n.t('m.Rejudge'))
          }
        }
        this.columns.push(judgeColumn)
        this.rejudge_column = true
      },
      handleResultChange (status) {
        this.page = 1
        this.formFilter.result = status
        this.changeRoute()
      },
      handleQueryChange () {
        this.page = 1
        this.changeRoute()
      },
      handleRejudge (id, index) {
        this.submissions[index].loading = true
        api.submissionRejudge(id).then(res => {
          this.submissions[index].loading = false
          this.$success(this.$t('m.Succeeded'))
          this.getSubmissions()
        }, () => {
          this.submissions[index].loading = false
        })
      }
    },
    computed: {
      ...mapGetters(['isAuthenticated', 'user']),
      title () {
        if (!this.contestID) {
          return this.$i18n.t('m.Status')
        } else if (this.problemID) {
          return this.$i18n.t('m.Problem_Submissions')
        } else {
          return this.$i18n.t('m.Submissions')
        }
      },
      status () {
        return this.formFilter.result === '' ? this.$i18n.t('m.Status') : this.$i18n.t('m.' + JUDGE_STATUS[this.formFilter.result].name.replace(/ /g, '_'))
      },
      rejudgeColumnVisible () {
        return !this.contestID && this.user.admin_type === USER_TYPE.SUPER_ADMIN
      }
    },
    watch: {
      '$route' (newVal, oldVal) {
        if (newVal !== oldVal) {
          this.init()
        }
      },
      'rejudgeColumnVisible' () {
        this.adjustRejudgeColumn()
      },
      'isAuthenticated' () {
        this.init()
      }
    }
  }
</script>

<style scoped lang="less">
  .flex-container {
    #main {
      flex: auto;
      margin-right: 18px;
      .filter {
        margin-right: -10px;
      }
    }
    #contest-menu {
      flex: none;
      width: 210px;
    }
  }

/deep/ .ivu-switch-large {
    width: 80px; /* Ajusta este valor para hacerlo tan largo como se quiera */
  }

  /*Ajustar la posición del círculo cuando está ACTIVADO */
  /deep/ .ivu-switch-large.ivu-switch-checked:after {
    left: 58px; /* Debe ser proporcional al ancho de arriba */
  }
  
  /deep/ .ivu-switch{
    border-color: #7B1E3A !important; 
    background-color: #7B1E3A !important; 
  }
  /deep/ .ivu-switch-checked {
    border-color: #BDF2D4 !important;
    background-color: #BDF2D4 !important;
  }
  /* Texto cuando está en Verde (Activado) */
  /deep/ .ivu-switch-checked .ivu-switch-inner {
    color: black !important;
  }

  /* Cambia el color de fondo y texto del encabezado "Opción" */
  /deep/ .ivu-table-fixed-right thead th {
    background-color: #7B1E3A !important;
    color: #ffffff !important; /* Texto blanco para que resalte */
    border:none !important;
  }

  /* texto "Opción" esté en negritas */
  /deep/ .ivu-table-fixed-right thead th span {
    font-weight: bold;
  }

  /deep/ .ivu-table-header th {
    border-top:2px solid #7B1E3A !important;
    background-color: #7B1E3A !important; /* Color ciruela */
    color: white !important;
  }



  /* Efecto al pasar el mouse sobre el nombre */
  /deep/ .ivu-table-cell a {
    color: #7B1E3A !important; /* Cambia a guindo al pasar el mouse */
    text-decoration: none;
    font-weight: bold;
  }

  /deep/ .ivu-table-cell a:hover {
    color: #82a69a !important; 
    text-decoration: none;
    font-weight: bold;
  }

/* Efecto para el ID cuando el mouse está encima */
  /deep/.id-link:hover {
    color: #82a69a !important; 
  }

  /* Efecto para el btn rejuzgar cuando el mouse está encima */
  /deep/ .btnrejudge:hover {
    background-color: #B2FFD9 !important; 
    border: 1px solid #B2FFD9 !important;
    color: black !important;
  }
</style>

