<template>
  <div>
    <el-input
      v-model="keyword"
      :placeholder="$t('m.Keywords')"
      prefix-icon="el-icon-search">
    </el-input>
    <el-table :data="problems" v-loading="loading">
      <el-table-column
        :label="$t('m.ID')"
        width="100"
        prop="id">
      </el-table-column>
      <el-table-column
        :label="$t('m.Display_ID')"
        width="200"
        prop="_id">
      </el-table-column>
      <el-table-column
        :label="$t('m.Title')"
        prop="title">
      </el-table-column>
      <el-table-column
        :label="$t('m.Author')"
        width="140"
        align="center">
        <template slot-scope="{row}">
          <span>{{ row.created_by && row.created_by.username }}</span>
          <el-tag size="mini" :type="isOwner(row) ? 'success' : 'info'" style="margin-left: 6px;">
            {{ isOwner(row) ? $t('m.Own_Problem') : $t('m.Shared_Problem') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('m.Option')"
        align="center"
        width="100"
        fixed="right">
        <template slot-scope="{row}">
          <div class="botones-gestion">
            <icon-btn icon="plus" :name="$t('m.Add_The_Problem')"
                      @click.native="handleAddProblem(row.id)"></icon-btn>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      class="page"
      layout="prev, pager, next"
      @current-change="getPublicProblem"
      :page-size="limit"
      :total="total">
    </el-pagination>
  </div>
</template>
<script>
  import { mapGetters } from 'vuex'
  import api from '@admin/api'

  export default {
    name: 'add-problem-from-public',
    props: ['contestID'],
    computed: {
      ...mapGetters(['user'])
    },
    data () {
      return {
        page: 1,
        limit: 10,
        total: 0,
        loading: false,
        problems: [],
        contest: {},
        keyword: ''
      }
    },
    mounted () {
      api.getContest(this.contestID).then(res => {
        this.contest = res.data.data
        this.getPublicProblem()
      }).catch(() => {
      })
    },
    methods: {
      getPublicProblem (page) {
        this.loading = true
        let params = {
          keyword: this.keyword,
          offset: (page - 1) * this.limit,
          limit: this.limit,
          rule_type: this.contest.rule_type,
          // own + problems shared by other teachers (admins still see everything)
          scope: 'all'
        }
        api.getProblemList(params).then(res => {
          this.loading = false
          this.total = res.data.data.total
          this.problems = res.data.data.results
        }).catch(() => {
        })
      },
      isOwner (row) {
        return row.created_by && this.user && row.created_by.id === this.user.id
      },
      handleAddProblem (problemID) {
        this.$prompt(this.$i18n.t('m.Input_Display_ID_For_Problem'), this.$i18n.t('m.Confirm')).then(({value}) => {
          let data = {
            problem_id: problemID,
            contest_id: this.contestID,
            display_id: value
          }
          api.addProblemFromPublic(data).then(() => {
            this.$emit('on-change')
          }, () => {
          })
        }, () => {
        })
      }
    },
    watch: {
      'keyword' () {
        this.getPublicProblem(this.page)
      }
    }
  }
</script>
<style scoped>
  .page {
    margin-top: 20px;
    text-align: right
  }

</style>
