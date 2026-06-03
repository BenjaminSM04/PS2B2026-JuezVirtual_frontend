<template>
  <div class="flex-container">
    <div id="problem-main">
      <!--problem main-->
      <Panel :padding="40" shadow class="problem-panel">
        <div slot="title">{{problem.title}}</div>
        <div id="problem-content" class="markdown-body" v-katex>
          <p class="title">{{$t('m.Description')}}</p>
          <p class="content" v-html=problem.description></p>
          <!-- {{$t('m.music')}} -->
          <p class="title">{{$t('m.Input')}} <span v-if="problem.io_mode.io_mode=='File IO'">({{$t('m.FromFile')}}: {{ problem.io_mode.input }})</span></p>
          <p class="content" v-html=problem.input_description></p>

          <p class="title">{{$t('m.Output')}} <span v-if="problem.io_mode.io_mode=='File IO'">({{$t('m.ToFile')}}: {{ problem.io_mode.output }})</span></p>
          <p class="content" v-html=problem.output_description></p>

          <div v-for="(sample, index) of problem.samples" :key="index">
            <div class="flex-container sample">
              <div class="sample-input">
                <p class="title">{{$t('m.Sample_Input')}} {{index + 1}}
                  <a class="copy"
                     v-clipboard:copy="sample.input"
                     v-clipboard:success="onCopy"
                     v-clipboard:error="onCopyError">
                    <Icon type="clipboard"></Icon>
                  </a>
                </p>
                <pre><code>{{sample.input}}</code></pre>
              </div>
              <div class="sample-output">
                <p class="title">{{$t('m.Sample_Output')}} {{index + 1}}</p>
                <pre><code>{{sample.output}}</code></pre>
              </div>
            </div>
          </div>

          <div v-if="problem.hint">
            <p class="title">{{$t('m.Hint')}}</p>
            <Card dis-hover>
              <div class="content" v-html=problem.hint></div>
            </Card>
          </div>

          <div v-if="problem.source">
            <p class="title">{{$t('m.Source')}}</p>
            <p class="content">{{problem.source}}</p>
          </div>

        </div>
      </Panel>
      <!--problem main end-->
      <Card :padding="20" id="submit-code" dis-hover>
        <CodeMirror :value.sync="code"
                    :languages="problem.languages"
                    :language="language"
                    :theme="theme"
                    @resetCode="onResetToTemplate"
                    @changeTheme="onChangeTheme"
                    @changeLang="onChangeLang"></CodeMirror>
        <Row type="flex" justify="space-between">
          <Col :span="10">
            <div class="status" v-if="statusVisible">
              <template v-if="!this.contestID || (this.contestID && OIContestRealTimePermission)">
                <span>{{$t('m.Status')}}</span>
                <Tag type="dot" :color="submissionStatus.color" @click.native="handleRoute('/status/'+submissionId)">
                  {{$t('m.' + submissionStatus.text.replace(/ /g, "_"))}}
                </Tag>
              </template>
              <template v-else-if="this.contestID && !OIContestRealTimePermission">
                <Alert type="success" show-icon>{{$t('m.Submitted_successfully')}}</Alert>
              </template>
            </div>
            <div v-else-if="problem.my_status === 0">
              <Alert type="success" show-icon>{{$t('m.You_have_solved_the_problem')}}</Alert>
            </div>
            <div v-else-if="this.contestID && !OIContestRealTimePermission && submissionExists">
              <Alert type="success" show-icon>{{$t('m.You_have_submitted_a_solution')}}</Alert>
            </div>
            <div v-if="contestEnded">
              <Alert type="warning" show-icon>{{$t('m.Contest_has_ended')}}</Alert>
            </div>
          </Col>

          <Col :span="12">
            <template v-if="captchaRequired">
              <div class="captcha-container">
                <Tooltip v-if="captchaRequired" content="Click to refresh" placement="top">
                  <img :src="captchaSrc" @click="getCaptchaSrc"/>
                </Tooltip>
                <Input v-model="captchaCode" class="captcha-code"/>
              </div>
            </template>
            <Button type="warning" icon="edit" :loading="submitting" @click="submitCode"
                    :disabled="problemSubmitDisabled || submitted"
                    class="fl-right">
              <span v-if="submitting">{{$t('m.Submitting')}}</span>
              <span v-else>{{$t('m.Submit')}}</span>
            </Button>
          </Col>
        </Row>
      </Card>
    </div>

    <div id="right-column">
      <VerticalMenu @on-click="handleRoute">
        <template v-if="this.contestID">
          <VerticalMenu-item :route="{name: 'contest-problem-list', params: {contestID: contestID}}">
            <Icon type="ios-photos"></Icon>
            {{$t('m.Problems')}}
          </VerticalMenu-item>

          <VerticalMenu-item :route="{name: 'contest-announcement-list', params: {contestID: contestID}}">
            <Icon type="chatbubble-working"></Icon>
            {{$t('m.Announcements')}}
          </VerticalMenu-item>
        </template>

        <VerticalMenu-item v-if="!this.contestID || OIContestRealTimePermission" :route="submissionRoute">
          <Icon type="navicon-round"></Icon>
           {{$t('m.Submissions')}}
        </VerticalMenu-item>

        <template v-if="this.contestID">
          <VerticalMenu-item v-if="!this.contestID || OIContestRealTimePermission"
                             :route="{name: 'contest-rank', params: {contestID: contestID}}">
            <Icon type="stats-bars"></Icon>
            {{$t('m.Rankings')}}
          </VerticalMenu-item>
          <VerticalMenu-item :route="{name: 'contest-details', params: {contestID: contestID}}">
            <Icon type="home"></Icon>
            {{$t('m.View_Contest')}}
          </VerticalMenu-item>
        </template>
      </VerticalMenu>

      <Card id="info" class="hover-lift">
        <div slot="title" class="header">
          <Icon type="information-circled"></Icon>
          <span class="card-title">{{$t('m.Information')}}</span>
        </div>
        <ul>
          <li><p><Icon type="pound"></Icon>ID</p>
            <p>{{problem._id}}</p></li>
          <li>
            <p><Icon type="clock"></Icon>{{$t('m.Time_Limit')}}</p>
            <p>{{problem.time_limit}} MS</p>
          </li>
          <li>
            <p><Icon type="ios-speedometer"></Icon>{{$t('m.Memory_Limit')}}</p>
            <p>{{problem.memory_limit}} MB</p>
          </li>
          <li>
            <p><Icon type="ios-shuffle"></Icon>{{$t('m.IOMode')}}</p>
            <p>{{problem.io_mode.io_mode}}</p>
          </li>
          <li>
            <p><Icon type="person"></Icon>{{$t('m.Created')}}</p>
            <p>{{problem.created_by.username}}</p></li>
          <li v-if="problem.difficulty">
            <p><Icon type="stats-bars"></Icon>{{$t('m.Level')}}</p>
            <p>{{$t('m.' + problem.difficulty)}}</p></li>
          <li v-if="problem.total_score">
            <p><Icon type="trophy"></Icon>{{$t('m.Score')}}</p>
            <p>{{problem.total_score}}</p>
          </li>
          <li>
            <p><Icon type="pricetag"></Icon>{{$t('m.Tags')}}</p>
            <p>
              <Poptip trigger="hover" placement="left-end">
                <a>{{$t('m.Show')}}</a>
                <div slot="content">
                  <Tag v-for="tag in problem.tags" :key="tag">{{tag}}</Tag>
                </div>
              </Poptip>
            </p>
          </li>
        </ul>
      </Card>

      <Card id="pieChart" class="hover-lift" :padding="0" v-if="!this.contestID || OIContestRealTimePermission">
        <div slot="title">
          <Icon type="ios-analytics"></Icon>
          <span class="card-title">{{$t('m.Statistic')}}</span>
          <Button type="ghost" size="small" id="detail" @click="graphVisible = !graphVisible">{{$t('m.Details')}}</Button>
        </div>
        <div class="stat-summary">
          <div class="stat-summary__item">
            <span class="stat-summary__value"><animated-number :value="statSubmissions"></animated-number></span>
            <span class="stat-summary__label">{{$t('m.Submissions')}}</span>
          </div>
          <div class="stat-summary__item">
            <span class="stat-summary__value stat-summary__value--ac"><animated-number :value="statAccepted"></animated-number></span>
            <span class="stat-summary__label">{{$t('m.Accepted')}}</span>
          </div>
          <div class="stat-summary__item">
            <span class="stat-summary__value">{{statACRate}}</span>
            <span class="stat-summary__label">{{$t('m.AC_Rate')}}</span>
          </div>
        </div>
        <div class="echarts">
          <ECharts :options="pie"></ECharts>
        </div>
      </Card>
    </div>

    <Modal v-model="graphVisible" :width="720" class="detail-modal">
      <div slot="header" class="detail-modal__title">
        <Icon type="information-circled"></Icon>
        <span>{{$t('m.Problem_Details')}}</span>
      </div>
      <div class="detail-modal__body">
        <div class="detail-modal__col detail-modal__col--meta">
          <h3 class="detail-modal__problem-title">{{problem._id}} · {{problem.title}}</h3>
          <ul class="detail-meta">
            <li><span>{{$t('m.Time_Limit')}}</span><b>{{problem.time_limit}} MS</b></li>
            <li><span>{{$t('m.Memory_Limit')}}</span><b>{{problem.memory_limit}} MB</b></li>
            <li v-if="problem.io_mode"><span>{{$t('m.IOMode')}}</span><b>{{problem.io_mode.io_mode}}</b></li>
            <li v-if="problem.rule_type"><span>{{$t('m.Rule_Type')}}</span><b>{{problem.rule_type}}</b></li>
            <li v-if="problem.difficulty"><span>{{$t('m.Level')}}</span><b>{{$t('m.' + problem.difficulty)}}</b></li>
            <li v-if="problem.total_score"><span>{{$t('m.Score')}}</span><b>{{problem.total_score}}</b></li>
            <li><span>{{$t('m.Created')}}</span><b>{{problem.created_by.username}}</b></li>
            <li v-if="problem.create_time"><span>{{$t('m.Create_Time')}}</span><b>{{problem.create_time | localtime}}</b></li>
            <li v-if="problem.last_update_time"><span>{{$t('m.Last_Update')}}</span><b>{{problem.last_update_time | localtime}}</b></li>
          </ul>
          <div class="detail-tags" v-if="problem.tags && problem.tags.length">
            <span class="detail-tags__label">{{$t('m.Tags')}}</span>
            <Tag v-for="tag in problem.tags" :key="tag">{{tag}}</Tag>
          </div>
          <table class="detail-verdicts" v-if="verdictRows.length">
            <thead>
              <tr><th>{{$t('m.Verdict')}}</th><th>{{$t('m.Count')}}</th></tr>
            </thead>
            <tbody>
              <tr v-for="row in verdictRows" :key="row.short">
                <td><span class="detail-verdicts__dot" :style="{backgroundColor: row.color}"></span>{{row.name}}</td>
                <td>{{row.count}}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="detail-modal__col detail-modal__col--stats">
          <div class="stat-summary">
            <div class="stat-summary__item">
              <span class="stat-summary__value"><animated-number :value="statSubmissions"></animated-number></span>
              <span class="stat-summary__label">{{$t('m.Submissions')}}</span>
            </div>
            <div class="stat-summary__item">
              <span class="stat-summary__value stat-summary__value--ac"><animated-number :value="statAccepted"></animated-number></span>
              <span class="stat-summary__label">{{$t('m.Accepted')}}</span>
            </div>
            <div class="stat-summary__item">
              <span class="stat-summary__value">{{statACRate}}</span>
              <span class="stat-summary__label">{{$t('m.AC_Rate')}}</span>
            </div>
          </div>
          <div id="pieChart-detail">
            <ECharts :options="largePie" :initOptions="largePieInitOpts"></ECharts>
          </div>
        </div>
      </div>
      <div slot="footer">
        <Button type="ghost" @click="graphVisible=false">{{$t('m.Close')}}</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
  import {mapGetters, mapActions} from 'vuex'
  import {types} from '../../../../store'
  import CodeMirror from '@oj/components/CodeMirror.vue'
  import AnimatedNumber from '@/components/AnimatedNumber.vue'
  import storage from '@/utils/storage'
  import {FormMixin} from '@oj/components/mixins'
  import {JUDGE_STATUS, CONTEST_STATUS, buildProblemCodeKey} from '@/utils/constants'
  import api from '@oj/api'
  import {pie, largePie, getItemColor} from './chartData'
  import {getDefaultTemplate} from '@/utils/defaultTemplates'

  // 只显示这些状态的图形占用
  const filtedStatus = ['-1', '-2', '0', '1', '2', '3', '4', '8']

  export default {
    name: 'Problem',
    components: {
      CodeMirror,
      AnimatedNumber
    },
    mixins: [FormMixin],
    data () {
      return {
        statusVisible: false,
        captchaRequired: false,
        graphVisible: false,
        submissionExists: false,
        captchaCode: '',
        captchaSrc: '',
        contestID: '',
        problemID: '',
        submitting: false,
        code: '',
        language: 'C++',
        theme: 'solarized',
        submissionId: '',
        submitted: false,
        result: {
          result: 9
        },
        problem: {
          title: '',
          description: '',
          hint: '',
          my_status: '',
          template: {},
          languages: [],
          created_by: {
            username: ''
          },
          tags: [],
          io_mode: {'io_mode': 'Standard IO'}
        },
        pie: pie,
        largePie: largePie,
        // echarts 无法获取隐藏dom的大小，需手动指定
        largePieInitOpts: {
          width: '400',
          height: '380'
        }
      }
    },
    beforeRouteEnter (to, from, next) {
      let problemCode = storage.get(buildProblemCodeKey(to.params.problemID, to.params.contestID))
      if (problemCode) {
        next(vm => {
          vm.language = problemCode.language
          vm.code = problemCode.code
          vm.theme = problemCode.theme
        })
      } else {
        next()
      }
    },
    mounted () {
      this.$store.commit(types.CHANGE_CONTEST_ITEM_VISIBLE, {menu: false})
      this.init()
    },
    methods: {
      ...mapActions(['changeDomTitle']),
      init () {
        this.$Loading.start()
        this.contestID = this.$route.params.contestID
        this.problemID = this.$route.params.problemID
        let func = this.$route.name === 'problem-details' ? 'getProblem' : 'getContestProblem'
        api[func](this.problemID, this.contestID).then(res => {
          this.$Loading.finish()
          let problem = res.data.data
          this.changeDomTitle({title: problem.title})
          api.submissionExists(problem.id).then(res => {
            this.submissionExists = res.data.data
          })
          problem.languages = problem.languages.sort()
          this.problem = problem
          if (problem.statistic_info) {
            this.changePie(problem)
          }

          // 在beforeRouteEnter中修改了, 说明本地有code，无需加载template
          if (this.code !== '') {
            return
          }
          // try to load problem template, fall back to language default
          this.language = this.problem.languages[0]
          let template = this.problem.template
          if (template && template[this.language]) {
            this.code = template[this.language]
          } else {
            this.code = getDefaultTemplate(this.language)
          }
        }, () => {
          this.$Loading.error()
        })
      },
      changePie (problemData) {
        // 只显示特定的一些状态
        for (let k in problemData.statistic_info) {
          if (filtedStatus.indexOf(k) === -1) {
            delete problemData.statistic_info[k]
          }
        }
        let acNum = problemData.accepted_number
        // resumen simple AC/WA (fallback cuando no hay statistic_info)
        let acWa = [
          {name: 'WA', value: problemData.submission_number - acNum},
          {name: 'AC', value: acNum}
        ]

        // legend según los resultados realmente presentes
        let legend = Object.keys(problemData.statistic_info).map(ele => JUDGE_STATUS[ele].short)
        if (legend.length === 0) {
          legend = ['AC', 'WA']
        }

        // desglose por resultado (AC al final), reutilizado por la dona principal y el modal
        let info = Object.assign({}, problemData.statistic_info)
        let acCount = info['0']
        delete info['0']
        let breakdown = Object.keys(info).map(ele => ({name: JUDGE_STATUS[ele].short, value: info[ele]}))
        if (acCount !== undefined) {
          breakdown.push({name: 'AC', value: acCount})
        }
        if (breakdown.length === 0) {
          breakdown = acWa
        }

        // dona principal: desglose por resultado
        this.pie.legend.data = legend
        this.pie.series[0].data = breakdown

        // modal de detalle (largePie): mismo desglose + resumen interno AC seleccionado
        this.largePie.legend.data = legend
        this.largePie.series[0].data = breakdown
        let data2 = JSON.parse(JSON.stringify(acWa))
        data2[1].selected = true
        this.largePie.series[1].data = data2
      },
      handleRoute (route) {
        this.$router.push(route)
      },
      onChangeLang (newLang) {
        if (this.code.trim() === '') {
          if (this.problem.template && this.problem.template[newLang]) {
            this.code = this.problem.template[newLang]
          } else {
            this.code = getDefaultTemplate(newLang)
          }
        }
        this.language = newLang
      },
      onChangeTheme (newTheme) {
        this.theme = newTheme
      },
      onResetToTemplate () {
        this.$Modal.confirm({
          content: this.$i18n.t('m.Are_you_sure_you_want_to_reset_your_code'),
          onOk: () => {
            let template = this.problem.template
            if (template && template[this.language]) {
              this.code = template[this.language]
            } else {
              this.code = getDefaultTemplate(this.language)
            }
          }
        })
      },
      checkSubmissionStatus () {
        // 使用setTimeout避免一些问题
        if (this.refreshStatus) {
          // 如果之前的提交状态检查还没有停止,则停止,否则将会失去timeout的引用造成无限请求
          clearTimeout(this.refreshStatus)
        }
        const checkStatus = () => {
          let id = this.submissionId
          api.getSubmission(id).then(res => {
            this.result = res.data.data
            if (Object.keys(res.data.data.statistic_info).length !== 0) {
              this.submitting = false
              this.submitted = false
              clearTimeout(this.refreshStatus)
              this.init()
            } else {
              this.refreshStatus = setTimeout(checkStatus, 2000)
            }
          }, res => {
            this.submitting = false
            clearTimeout(this.refreshStatus)
          })
        }
        this.refreshStatus = setTimeout(checkStatus, 2000)
      },
      submitCode () {
        if (this.code.trim() === '') {
          this.$error(this.$i18n.t('m.Code_can_not_be_empty'))
          return
        }
        this.submissionId = ''
        this.result = {result: 9}
        this.submitting = true
        let data = {
          problem_id: this.problem.id,
          language: this.language,
          code: this.code,
          contest_id: this.contestID
        }
        if (this.captchaRequired) {
          data.captcha = this.captchaCode
        }
        const submitFunc = (data, detailsVisible) => {
          this.statusVisible = true
          api.submitCode(data).then(res => {
            this.submissionId = res.data.data && res.data.data.submission_id
            // 定时检查状态
            this.submitting = false
            this.submissionExists = true
            if (!detailsVisible) {
              this.$Modal.success({
                title: this.$i18n.t('m.Success'),
                content: this.$i18n.t('m.Submit_code_successfully')
              })
              return
            }
            this.submitted = true
            this.checkSubmissionStatus()
          }, res => {
            this.getCaptchaSrc()
            if (res.data.data.startsWith('Captcha is required')) {
              this.captchaRequired = true
            }
            this.submitting = false
            this.statusVisible = false
          })
        }

        if (this.contestRuleType === 'OI' && !this.OIContestRealTimePermission) {
          if (this.submissionExists) {
            this.$Modal.confirm({
              title: '',
              content: '<h3>' + this.$i18n.t('m.You_have_submission_in_this_problem_sure_to_cover_it') + '<h3>',
              onOk: () => {
                // 暂时解决对话框与后面提示对话框冲突的问题(否则一闪而过）
                setTimeout(() => {
                  submitFunc(data, false)
                }, 1000)
              },
              onCancel: () => {
                this.submitting = false
              }
            })
          } else {
            submitFunc(data, false)
          }
        } else {
          submitFunc(data, true)
        }
      },
      onCopy (event) {
        this.$success('Code copied')
      },
      onCopyError (e) {
        this.$error('Failed to copy code')
      }
    },
    computed: {
      ...mapGetters(['problemSubmitDisabled', 'contestRuleType', 'OIContestRealTimePermission', 'contestStatus']),
      contest () {
        return this.$store.state.contest.contest
      },
      contestEnded () {
        return this.contestStatus === CONTEST_STATUS.ENDED
      },
      submissionStatus () {
        return {
          text: JUDGE_STATUS[this.result.result]['name'],
          color: JUDGE_STATUS[this.result.result]['color']
        }
      },
      submissionRoute () {
        if (this.contestID) {
          return {name: 'contest-submission-list', query: {problemID: this.problemID}}
        } else {
          return {name: 'submission-list', query: {problemID: this.problemID}}
        }
      },
      statSubmissions () {
        return this.problem.submission_number || 0
      },
      statAccepted () {
        return this.problem.accepted_number || 0
      },
      statACRate () {
        const total = this.problem.submission_number || 0
        if (!total) {
          return '0.00%'
        }
        return (this.problem.accepted_number / total * 100).toFixed(2) + '%'
      },
      verdictRows () {
        // Desglose por veredicto para la tabla del modal de detalle.
        // statistic_info ya viene filtrado a los estados relevantes desde changePie().
        const info = this.problem.statistic_info || {}
        return Object.keys(info)
          .map(code => {
            const status = JUDGE_STATUS[code] || {}
            const short = status.short || code
            return {
              short,
              name: status.name || code,
              count: info[code],
              color: getItemColor({name: short})
            }
          })
          .sort((a, b) => b.count - a.count)
      }
    },
    beforeRouteLeave (to, from, next) {
      // 防止切换组件后仍然不断请求
      clearInterval(this.refreshStatus)

      this.$store.commit(types.CHANGE_CONTEST_ITEM_VISIBLE, {menu: true})
      storage.set(buildProblemCodeKey(this.problem._id, from.params.contestID), {
        code: this.code,
        language: this.language,
        theme: this.theme
      })
      next()
    },
    watch: {
      '$route' () {
        this.init()
      }
    }
  }
</script>

<style lang="less" scoped>
  .card-title {
    margin-left: 8px;
  }

  .flex-container {
    #problem-main {
      flex: auto;
      margin-right: 18px;
    }
    #right-column {
      flex: none;
      width: 240px;
    }
  }

  /* En móvil el layout de 3 columnas se apila: la barra derecha pasa debajo
     a ancho completo. */
  @media (max-width: 768px) {
    .flex-container {
      flex-direction: column;
      #problem-main {
        margin-right: 0;
      }
      #right-column {
        width: 100%;
        margin-top: 16px;
      }
    }
  }

  /* panel principal */
  .problem-panel {
    border-top: 5px solid #7B1E3A;
    border-radius: 16px;
  }

  #problem-content {
    margin-top: -50px;
    .title {
      font-size: 22px;
      font-weight: 600;
      margin: 30px 0 12px 0;
      color: #7B1E3A;
      .copy {
        padding-left: 8px;
        color: #987284
      }
    }
    p.content {
      margin-left: 25px;
      margin-right: 20px;
      font-size: 15px;
      /* Nuevo */
      line-height: 1.8;
      color: #333;
    }
    .sample {
      /* Nuevo */
      gap: 20px;
      align-items: stretch;
      &-input, &-output {
        width: 50%;
        flex: 1; //1 1 auto
        display: flex;
        flex-direction: column;
        //margin-right: 5%;
      }
      pre {
        flex: 1; //1 1 auto
        /* Nuevo */
        padding: 18px;
        background: #1e1e1e;
        color: white;
        border-radius: 12px;
        overflow-x: auto;
        border-left: 5px solid #7B1E3A;
        font-size: 14px;
        /*align-self: stretch;
        border-style: solid;
        background: transparent;*/
      }
    }
  }

  #submit-code {
    margin-top: 20px;
    margin-bottom: 20px;
    /* Nuevo */
    border-radius: 16px;
    /*  */
    .status {
      float: left;
      span {
        margin-right: 10px;
        margin-left: 10px;
      }
    }
    .captcha-container {
      display: inline-block;
      .captcha-code {
        width: auto;
        margin-top: -20px;
        margin-left: 20px;
      }
    }
  }

  #info {
    margin-bottom: 20px;
    margin-top: 20px;
    border-radius: 16px; //nuevo
    ul {
      list-style-type: none;
      li {
        /*border-bottom: 1px solid #eee;//dotted
        //margin-bottom: 10px;
        padding: 8px 0; //Nuevo*/

        border-bottom: 1px solid #eee;
        padding: 10px 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        p {
          display: inline-block;
        }
        p:first-child {
          width: 110px;//90
          color: #7B1E3A;
          font-weight: 600;
        }
        p:last-child {
          float: right;
          color: #444;//Nuevo
        }
      }
    }
  }

  .fl-right {
    float: right;
  }

  #pieChart {
    border-radius: 16px;
    .echarts {
      height: 250px;
      width: 210px;
    }
    #detail {
      position: absolute;
      right: 10px;
      top: 10px;
    }
  }

  .stat-summary {
    display: flex;
    justify-content: space-around;
    gap: 6px;
    padding: 12px 8px 4px;
    &__item {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
      min-width: 0;
    }
    &__value {
      font-size: 20px;
      font-weight: 700;
      line-height: 1.1;
      color: #17233d;
      &--ac {
        color: #19be6b;
      }
    }
    &__label {
      margin-top: 2px;
      font-size: 12px;
      color: #808695;
      text-align: center;
    }
  }

  #pieChart-detail {
    margin: 10px auto 0;
    width: 400px;
    height: 380px;
    max-width: 100%;
  }

  /* Modal de detalle del problema */
  .detail-modal__title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
    color: #7B1E3A;
  }
  .detail-modal__body {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
    overflow-x: auto;
  }
  .detail-modal__col {
    min-width: 0;
  }
  .detail-modal__col--meta {
    flex: 1 1 280px;
  }
  .detail-modal__col--stats {
    flex: 1 1 380px;
  }
  .detail-modal__problem-title {
    font-size: 16px;
    font-weight: 600;
    color: #7B1E3A;
    margin-bottom: 12px;
    word-break: break-word;
  }
  .detail-meta {
    list-style: none;
    margin: 0 0 14px;
    padding: 0;
    li {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      padding: 8px 0;
      border-bottom: 1px solid #eee;
      span {
        color: #7B1E3A;
        font-weight: 600;
      }
      b {
        color: #444;
        font-weight: 500;
        text-align: right;
        word-break: break-word;
      }
    }
  }
  .detail-tags {
    margin-bottom: 14px;
    &__label {
      display: block;
      color: #7B1E3A;
      font-weight: 600;
      margin-bottom: 6px;
    }
  }
  .detail-verdicts {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
    th, td {
      text-align: left;
      padding: 6px 8px;
      border-bottom: 1px solid #eee;
    }
    th {
      color: #7B1E3A;
      font-weight: 600;
    }
    td:last-child, th:last-child {
      text-align: right;
    }
    &__dot {
      display: inline-block;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      margin-right: 8px;
      vertical-align: middle;
    }
  }

    #info ul li p {
      margin: 0;
    }

    #info ul li p:first-child {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #7B1E3A;
      font-weight: 600;
    }

    #info ul li p:last-child {
      color: #444;
      text-align: right;
      white-space: nowrap;
    }

</style>

