<template>
  <div class="problem-catalog">
    <div class="v2-page-heading">
      <span class="v2-eyebrow">LizardJudge &middot; {{ $t('m.NavProblems') }}</span>
      <h1>{{ $t('m.Problem_List') }}</h1>
      <p>{{ $t('m.V2_Problems_Description') }}</p>
    </div>
    <Row type="flex" :gutter="22">
      <Col :xs="24" :sm="24" :md="18">
        <Panel shadow>
          <div class="problem-toolbar">
            <Dropdown @on-click="filterByDifficulty">
              <span
                >{{ query.difficulty === '' ? this.$i18n.t('m.Difficulty') : this.$i18n.t('m.' + query.difficulty) }}
                <Icon type="arrow-down-b"></Icon>
              </span>
              <Dropdown-menu slot="list">
                <Dropdown-item name="">{{ $t('m.All') }}</Dropdown-item>
                <Dropdown-item name="Low">{{ $t('m.Low') }}</Dropdown-item>
                <Dropdown-item name="Mid">{{ $t('m.Mid') }}</Dropdown-item>
                <Dropdown-item name="High">{{ $t('m.High') }}</Dropdown-item>
              </Dropdown-menu>
            </Dropdown>

            <Checkbox @on-change="handleTagsVisible">{{ $t('m.Tags') }}</Checkbox>

            <Input
              v-model="query.keyword"
              @on-enter="filterByKeyword"
              @on-click="filterByKeyword"
              :placeholder="$t('m.Search_Word')"
              icon="ios-search-strong"
            />

            <Button type="info" @click="onReset">
              <Icon type="refresh"></Icon>
              {{ $t('m.Reset') }}
            </Button>
          </div>
          <Table
            class="problem-table"
            style="width: 100%; font-size: 16px"
            :columns="problemTableColumns"
            :data="problemList"
            :loading="loadings.table"
            disabled-hover
          ></Table>
          <div class="problem-cards" :aria-busy="loadings.table">
            <div v-if="loadings.table" class="v2-skeleton">{{ $t('m.V2_Loading') }}</div>
            <p v-else-if="!problemList.length" class="v2-empty">{{ $t('m.V2_Empty_Problems') }}</p>
            <router-link
              v-for="problem in problemList"
              :key="problem.id"
              :to="{ name: 'problem-details', params: { problemID: problem._id } }"
              class="problem-card"
            >
              <div class="problem-card__top">
                <span class="problem-card__id">{{ problem._id }}</span
                ><span class="v2-chip" :class="{ 'v2-chip--mint': problem.difficulty === 'Low' }">{{
                  $t('m.' + problem.difficulty)
                }}</span>
              </div>
              <h3>{{ problem.title }}</h3>
              <div class="problem-card__meta">
                <span>{{ $t('m.V2_Submissions') }}: {{ problem.submission_number }}</span
                ><span>{{ $t('m.AC_Rate') }}: {{ getACRate(problem.accepted_number, problem.submission_number) }}</span>
              </div>
            </router-link>
          </div>
        </Panel>
        <Pagination
          :total="total"
          :page-size.sync="query.limit"
          @on-change="pushRouter"
          @on-page-size-change="pushRouter"
          :current.sync="query.page"
          :show-sizer="true"
        ></Pagination>
      </Col>

      <Col :xs="24" :sm="24" :md="6" class="problem-catalog__tags">
        <Panel :padding="10">
          <div slot="title" class="taglist-title">{{ $t('m.Tags') }}</div>
          <p v-if="!tagList.length" class="settings-hint">{{ $t('m.V2_No_Tags') }}</p>
          <Button
            v-for="tag in tagList"
            :key="tag.name"
            @click="filterByTag(tag.name)"
            type="ghost"
            :disabled="query.tag === tag.name"
            shape="circle"
            class="tag-btn"
            >{{ tag.name }}
          </Button>

          <Button long id="pick-one" @click="pickone">
            <Icon type="shuffle"></Icon>
            {{ $t('m.Pick_One') }}
          </Button>
        </Panel>
        <Spin v-if="loadings.tag" fix size="large"></Spin>
      </Col>
    </Row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import api from '@oj/api'
import utils from '@/utils/utils'
import { ProblemMixin } from '@oj/components/mixins'
import Pagination from '@oj/components/Pagination'

export default {
  name: 'ProblemList',
  mixins: [ProblemMixin],
  components: {
    Pagination
  },
  data () {
    return {
      tagList: [],
      problemTableColumns: [
        {
          title: '#',
          key: '_id',
          width: 140,
          render: (h, params) => {
            return h(
              'Button',
              {
                props: {
                  type: 'text',
                  size: 'large'
                },
                on: {
                  click: () => {
                    this.$router.push({ name: 'problem-details', params: { problemID: params.row._id } })
                  }
                },
                style: {
                  padding: '2px 0'
                }
              },
              params.row._id
            )
          }
        },
        {
          title: this.$i18n.t('m.Title'),
          minWidth: 250,
          render: (h, params) => {
            return h(
              'Button',
              {
                props: {
                  type: 'text',
                  size: 'large'
                },
                on: {
                  click: () => {
                    this.$router.push({ name: 'problem-details', params: { problemID: params.row._id } })
                  }
                },
                style: {
                  padding: '2px 0',
                  overflowX: 'auto',
                  textAlign: 'left',
                  width: '100%'
                }
              },
              params.row.title
            )
          }
        },
        {
          title: this.$i18n.t('m.Author'),
          align: 'center',
          render: (h, params) => {
            return h('span', params.row.created_by ? params.row.created_by.username : '-')
          }
        },
        {
          title: this.$i18n.t('m.Level'),
          render: (h, params) => {
            let t = params.row.difficulty
            let color = '#eef0f7'
            if (t === 'Low') color = '#e5f3eb'
            else if (t === 'High') color = '#f5e8ee'
            return h(
              'Tag',
              {
                class: 'v2-level-' + t,
                props: {
                  color: color
                }
              },
              this.$i18n.t('m.' + params.row.difficulty)
            )
          }
        },
        {
          title: this.$i18n.t('m.Total'),
          key: 'submission_number'
        },
        {
          title: this.$i18n.t('m.AC_Rate'),
          render: (h, params) => {
            return h('span', this.getACRate(params.row.accepted_number, params.row.submission_number))
          }
        }
      ],
      problemList: [],
      limit: 20,
      total: 0,
      loadings: {
        table: true,
        tag: true
      },
      routeName: '',
      query: {
        keyword: '',
        difficulty: '',
        tag: '',
        page: 1,
        limit: 10
      }
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init (simulate = false) {
      this.routeName = this.$route.name
      let query = this.$route.query
      this.query.difficulty = query.difficulty || ''
      this.query.keyword = query.keyword || ''
      this.query.tag = query.tag || ''
      this.query.page = parseInt(query.page) || 1
      if (this.query.page < 1) {
        this.query.page = 1
      }
      this.query.limit = parseInt(query.limit) || 10
      if (!simulate) {
        this.getTagList()
      }
      this.getProblemList()
    },
    pushRouter () {
      this.$router.push({
        name: 'problem-list',
        query: utils.filterEmptyValue(this.query)
      })
    },
    getProblemList () {
      let offset = (this.query.page - 1) * this.query.limit
      this.loadings.table = true
      api.getProblemList(offset, this.query.limit, this.query).then(
        (res) => {
          this.loadings.table = false
          this.total = res.data.data.total
          this.problemList = res.data.data.results
          if (this.isAuthenticated) {
            this.addStatusColumn(this.problemTableColumns, res.data.data.results)
          }
        },
        (res) => {
          this.loadings.table = false
        }
      )
    },
    getTagList () {
      api.getProblemTagList().then(
        (res) => {
          this.tagList = res.data.data
          this.loadings.tag = false
        },
        (res) => {
          this.loadings.tag = false
        }
      )
    },
    filterByTag (tagName) {
      this.query.tag = tagName
      this.query.page = 1
      this.pushRouter()
    },
    filterByDifficulty (difficulty) {
      this.query.difficulty = difficulty
      this.query.page = 1
      this.pushRouter()
    },
    filterByKeyword () {
      this.query.page = 1
      this.pushRouter()
    },
    handleTagsVisible (value) {
      if (value) {
        this.problemTableColumns.push({
          title: this.$i18n.t('m.Tags'),
          align: 'center',
          render: (h, params) => {
            let tags = []
            params.row.tags.forEach((tag) => {
              tags.push(h('Tag', {}, tag))
            })
            return h(
              'div',
              {
                style: {
                  margin: '8px 0'
                }
              },
              tags
            )
          }
        })
      } else {
        this.problemTableColumns.splice(this.problemTableColumns.length - 1, 1)
      }
    },
    onReset () {
      this.$router.push({ name: 'problem-list' })
    },
    pickone () {
      api.pickone().then((res) => {
        this.$success('Good Luck')
        this.$router.push({ name: 'problem-details', params: { problemID: res.data.data } })
      })
    }
  },
  computed: {
    ...mapGetters(['isAuthenticated'])
  },
  watch: {
    $route (newVal, oldVal) {
      if (newVal !== oldVal) {
        this.init(true)
      }
    },
    isAuthenticated (newVal) {
      if (newVal === true) {
        this.init()
      }
    }
  }
}
</script>

<style scoped lang="less">
@import (reference) '../../../../styles/theme-oj.less';

.filter li {
  margin-right: 15px;
}

.filter .ivu-dropdown {
  color: @oj-guindo;
  font-weight: bold;
}

.filter .ivu-input {
  border-radius: 8px;
}

.filter .ivu-btn-info {
  background: @oj-guindo;
  border-color: @oj-guindo;
}

.taglist-title {
  margin-left: -10px;
  margin-bottom: -10px;
  color: #7b1e3a;
}

.tag-btn {
  margin-right: 5px;
  margin-bottom: 10px;
}

#pick-one {
  margin-top: 10px;
}

/* Modificación 05/12/2026 */
.problem-panel-title {
  color: #7b1e3a;
  font-weight: bold;
  font-size: 22px;
  letter-spacing: 0.5px;
}

/*.problem-table .ivu-table-header {
    border-top: 2px solid #7B1E3A !important;
    border-bottom: 2px solid #7B1E3A !important;
  }*/
.problem-table .ivu-table-header th {
  background-color: #7b1e3a !important;
  color: white !important;
  font-weight: bold;
}

.filter .ivu-btn-info:hover {
  background: #987284 !important;
  border-color: #987284 !important;
}

.ivu-switch-checked {
  border-color: #b2f2d4 !important;
  background-color: #b2f2d4 !important;
}
</style>
