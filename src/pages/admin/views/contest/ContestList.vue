<template>
  <div class="view">
    <Panel :title="$t('m.Contest_List')">
      <div class="table-toolbar">
        <el-input
          class="table-toolbar__search"
          v-model="keyword"
          prefix-icon="el-icon-search"
          :placeholder="$t('m.Keywords')">
        </el-input>
      </div>
      <el-table
        v-loading="loading"

        :element-loading-text="$t('m.Loading')"
        ref="table"
        :data="contestList"
        style="width: 100%">
        <el-table-column type="expand">
          <template slot-scope="props">
            <p>{{$t('m.Start_Time')}}: {{props.row.start_time | localtime }}</p>
            <p>{{$t('m.End_Time')}}: {{props.row.end_time | localtime }}</p>
            <p>{{$t('m.Create_Time')}}: {{props.row.create_time | localtime}}</p>
            <p>{{$t('m.Author')}}: {{props.row.created_by.username}}</p>
          </template>
        </el-table-column>
        <el-table-column
          prop="id"
          width="80"
          :label="$t('m.ID')">
        </el-table-column>
        <el-table-column
          prop="title"
          :label="$t('m.Title')"
          min-width="160">
        </el-table-column>
        <el-table-column
          v-if="!isMobile"
          :label="$t('m.Rule_Type')"
          width="130">
          <template slot-scope="scope">
            <el-tag type="gray">{{scope.row.rule_type}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          v-if="!isMobile"
          :label="$t('m.Contest_Type')"
          width="180">
          <template slot-scope="scope">
            <el-tag :type="scope.row.contest_type === 'Public' ? 'success' : 'primary'">
              {{ scope.row.contest_type}}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('m.Status')"
          width="130">
          <template slot-scope="scope">
            <el-tag
              :type="scope.row.status === '-1' ? 'danger' : scope.row.status === '0' ? 'success' : 'primary'">
              {{ scope.row.status | contestStatus}}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          width="100"
          :label="$t('m.Visible')">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.visible"
                       active-text=""
                       inactive-text=""
                       active-color="#A60550"
                        inactive-color="#987284"
                       @change="handleVisibleSwitch(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column
          fixed="right"
          width="170"
          :label="$t('m.Option')">
          <div slot-scope="scope" class="botones-gestion">
            <icon-btn :name="$t('m.Edit')" icon="edit" @click.native="goEdit(scope.row.id)"></icon-btn>
            <icon-btn :name="$t('m.Problem')" icon="list-ol" @click.native="goContestProblemList(scope.row.id)"></icon-btn>
            <icon-btn :name="$t('m.Announcement')" icon="info-circle"
                      @click.native="goContestAnnouncement(scope.row.id)"></icon-btn>
            <icon-btn icon="download" :name="$t('m.Download_Accepted_Submissions')"
                      @click.native="openDownloadOptions(scope.row.id)"></icon-btn>
          </div>
        </el-table-column>
      </el-table>
      <div class="panel-options">
        <el-pagination
          class="page"
          layout="prev, pager, next"
          @current-change="currentChange"
          :page-size="pageSize"
          :total="total">
        </el-pagination>
      </div>
    </Panel>
    <el-dialog :title="$t('m.Download_Contest_Submissions')"
               width="30%"
               :visible.sync="downloadDialogVisible">
      <el-switch v-model="excludeAdmin" :active-text="$t('m.Exclude_Admin_Submissions')"></el-switch>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" icon="el-icon-check" @click="downloadSubmissions">{{$t('m.Confirm')}}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import api from '../../api.js'
  import utils from '@/utils/utils'
  import {CONTEST_STATUS_REVERSE} from '@/utils/constants'

  export default {
    name: 'ContestList',
    data () {
      return {
        windowWidth: window.innerWidth,
        pageSize: 10,
        total: 0,
        contestList: [],
        keyword: '',
        loading: false,
        excludeAdmin: true,
        currentPage: 1,
        currentId: 1,
        downloadDialogVisible: false
      }
    },
    mounted () {
      this.getContestList(this.currentPage)
      window.addEventListener('resize', this.handleResize)
    },
    beforeDestroy () {
      window.removeEventListener('resize', this.handleResize)
    },
    computed: {
      isMobile () {
        return this.windowWidth < 768
      }
    },
    filters: {
      contestStatus (value) {
        return CONTEST_STATUS_REVERSE[value].name
      }
    },
    methods: {
      handleResize () {
        this.windowWidth = window.innerWidth
      },
      // 切换页码回调
      currentChange (page) {
        this.currentPage = page
        this.getContestList(page)
      },
      getContestList (page) {
        this.loading = true
        api.getContestList((page - 1) * this.pageSize, this.pageSize, this.keyword).then(res => {
          this.loading = false
          this.total = res.data.data.total
          this.contestList = res.data.data.results
        }, res => {
          this.loading = false
        })
      },
      openDownloadOptions (contestId) {
        this.downloadDialogVisible = true
        this.currentId = contestId
      },
      downloadSubmissions () {
        let excludeAdmin = this.excludeAdmin ? '1' : '0'
        let url = `/admin/download_submissions?contest_id=${this.currentId}&exclude_admin=${excludeAdmin}`
        utils.downloadFile(url)
      },
      goEdit (contestId) {
        this.$router.push({name: 'edit-contest', params: {contestId}})
      },
      goContestAnnouncement (contestId) {
        this.$router.push({name: 'contest-announcement', params: {contestId}})
      },
      goContestProblemList (contestId) {
        this.$router.push({name: 'contest-problem-list', params: {contestId}})
      },
      handleVisibleSwitch (row) {
        api.editContest(row)
      }
    },
    watch: {
      'keyword' () {
        this.currentChange(1)
      }
    }
  }
</script>
<style>
@import url("https://fonts.googleapis.com/css2?family=Funnel+Display:wght@300;400;500;600;700&display=swap");

.view .title{
  color:#090808 !important;
  font-size: 25px !important;
  font-weight: bold !important;
}
.view .cell{
  font-family: 'Funnel Display', sans-serif;
  font-size: 16px;
}

.view .table-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.view .table-toolbar__search {
  flex: 1;
  min-width: 220px;
}

@media (max-width: 768px) {
  .view .table-toolbar__search {
    min-width: 0;
  }
}
</style>
