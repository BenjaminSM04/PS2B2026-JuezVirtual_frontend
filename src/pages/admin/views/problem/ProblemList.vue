<template>
  <div class="view">
    <Panel :title="contestId ? $i18n.t('m.Contest_Problem_List') : $i18n.t('m.Problem_List')">
      <div class="table-toolbar">
        <el-input
          class="table-toolbar__search"
          v-model="keyword"
          prefix-icon="el-icon-search"
          :placeholder="$t('m.Keywords')">
        </el-input>
        <el-radio-group
          v-if="routeName === 'problem-list' && !canManageAll"
          class="table-toolbar__scope"
          v-model="scope"
          size="small"
          @change="scopeChanged">
          <el-radio-button label="mine">{{$t('m.Mine')}}</el-radio-button>
          <el-radio-button label="shared">{{$t('m.Shared')}}</el-radio-button>
          <el-radio-button label="all">{{$t('m.All')}}</el-radio-button>
        </el-radio-group>
      </div>
      <el-table
        v-loading="loading"
        :element-loading-text="$t('m.Loading')"
        ref="table"
        :data="problemList"
        @row-dblclick="handleDblclick"
        style="width: 100%"
        :header-cell-style="{color: '#000000', fontWeight: 'bold'}">
        <el-table-column v-if="isMobile" type="expand" width="36">
          <template slot-scope="{row}">
            <p>ID: {{row.id}}</p>
            <div v-if="canModify(row)" class="botones-gestion">
              <icon-btn :name="$t('m.Edit')" icon="edit" @click.native="goEdit(row.id)"></icon-btn>
              <icon-btn v-if="contestId" :name="$t('m.Make_Public')" icon="clone"
                        @click.native="makeContestProblemPublic(row.id)"></icon-btn>
              <icon-btn icon="download" :name="$t('m.Download_TestCase')"
                        @click.native="downloadTestCase(row.id)"></icon-btn>
              <icon-btn icon="trash" :name="$t('m.Delete_Problem')"
                        @click.native="deleteProblem(row.id)"></icon-btn>
            </div>
            <span v-else class="readonly-hint">{{$t('m.No_Permission_Edit')}}</span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="!isMobile"
          width="100"
          prop="id"
          label="ID"
          align="center">
        </el-table-column>
        <el-table-column
          :width="isMobile ? 104 : 150"
          :label="$t('m.Display_ID')"
          align="center">
          <template slot-scope="{row}">
            <span v-show="!row.isEditing">{{row._id}}</span>
            <el-input v-show="row.isEditing" v-model="row._id"
                      @keyup.enter.native="handleInlineEdit(row)">

            </el-input>
          </template>
        </el-table-column>
        <el-table-column
          prop="title"
          :label="$t('m.Title')"
          :min-width="isMobile ? 100 : 180"
          align="center">
          <template slot-scope="{row}">
            <span v-show="!row.isEditing">{{row.title}}</span>
            <el-input v-show="row.isEditing" v-model="row.title"
                      @keyup.enter.native="handleInlineEdit(row)">
            </el-input>
          </template>
        </el-table-column>
        <el-table-column
          v-if="!isMobile"
          prop="created_by.username"
          :label="$t('m.Author')"
          min-width="120"
          align="center">
        </el-table-column>
        <el-table-column
          v-if="routeName === 'problem-list' && !isMobile"
          :label="$t('m.Owner')"
          width="130"
          align="center">
          <template slot-scope="{row}">
            <el-tag size="small" :type="isOwner(row) ? 'success' : 'info'">
              {{ isOwner(row) ? $t('m.Own_Problem') : $t('m.Shared_Problem') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          v-if="!isMobile"
          width="200"
          prop="create_time"
          :label="$t('m.Create_Time')"
          align="center">
          <template slot-scope="scope">
            {{scope.row.create_time | localtime }}
          </template>
        </el-table-column>
        <el-table-column
          :width="isMobile ? 70 : 100"
          prop="visible"
          :label="$t('m.Visible')"
          align="center">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.visible"
                       active-text=""
                       inactive-text=""
                       active-color="#BDF2D4"
                inactive-color="#6A1B29"
                       :disabled="!canModify(scope.row)"
                       @change="updateProblem(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column
          v-if="!isMobile"
          :label="$t('m.Option')"
          width="190"
          align="center">
          <div slot-scope="scope" class="botones-gestion">
            <template v-if="canModify(scope.row)">
              <icon-btn :name="$t('m.Edit')" icon="edit" @click.native="goEdit(scope.row.id)"></icon-btn>
              <icon-btn v-if="contestId" :name="$t('m.Make_Public')" icon="clone"
                        @click.native="makeContestProblemPublic(scope.row.id)"></icon-btn>
              <icon-btn icon="download" :name="$t('m.Download_TestCase')"
                        @click.native="downloadTestCase(scope.row.id)"></icon-btn>
              <icon-btn icon="trash" :name="$t('m.Delete_Problem')"
                        @click.native="deleteProblem(scope.row.id)"></icon-btn>
            </template>
            <span v-else class="readonly-hint">{{$t('m.No_Permission_Edit')}}</span>
          </div>
        </el-table-column>
      </el-table>
      <div class="panel-options">
        <el-button type="primary" size="small"
                   @click="goCreateProblem" icon="el-icon-plus">{{$t('m.Create')}}
        </el-button>
        <el-button v-if="contestId" type="primary"
                   size="small" icon="el-icon-plus"
                   @click="addProblemDialogVisible = true">{{$t('m.Add_From_Public_Problem')}}
        </el-button>
        <el-pagination
          class="page"
          layout="prev, pager, next"
          @current-change="currentChange"
          :current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          >
        </el-pagination>
      </div>
    </Panel>
    <el-dialog :title="$t('m.Sure_to_update_the_problem')"
               width="440px"
               :visible.sync="InlineEditDialogVisible"
               @close-on-click-modal="false">
      <div>
        <p>{{$t('m.Display_ID')}}: {{currentRow._id}}</p>
        <p>{{$t('m.Title')}}: {{currentRow.title}}</p>
      </div>
      <span slot="footer">
        <cancel @click.native="InlineEditDialogVisible = false; getProblemList(currentPage)"></cancel>
        <save @click.native="updateProblem(currentRow)"></save>
      </span>
    </el-dialog>
    <el-dialog :title="$t('m.Add_Contest_Problem')"
               v-if="contestId"
               width="80%"
               :visible.sync="addProblemDialogVisible"
               @close-on-click-modal="false">
      <add-problem-component :contestID="contestId" @on-change="getProblemList"></add-problem-component>
    </el-dialog>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import api from '../../api.js'
  import utils from '@/utils/utils'
  import { PROBLEM_PERMISSION } from '@/utils/constants'
  import AddProblemComponent from './AddPublicProblem.vue'

  export default {
    name: 'ProblemList',
    components: {
      AddProblemComponent
    },
    data () {
      return {
        windowWidth: window.innerWidth,
        pageSize: 10,
        total: 0,
        problemList: [],
        keyword: '',
        loading: false,
        currentPage: 1,
        routeName: '',
        contestId: '',
        scope: 'mine',
        // for make public use
        currentProblemID: '',
        currentRow: {},
        InlineEditDialogVisible: false,
        makePublicDialogVisible: false,
        addProblemDialogVisible: false
      }
    },
    mounted () {
      this.routeName = this.$route.name
      this.contestId = this.$route.params.contestId
      this.getProblemList(this.currentPage)
      window.addEventListener('resize', this.handleResize)
    },
    beforeDestroy () {
      window.removeEventListener('resize', this.handleResize)
    },
    computed: {
      ...mapGetters(['user', 'isSuperAdmin']),
      isMobile () {
        return this.windowWidth < 768
      },
      canManageAll () {
        return this.isSuperAdmin || this.user.problem_permission === PROBLEM_PERMISSION.ALL
      }
    },
    methods: {
      isOwner (row) {
        return row.created_by && this.user && row.created_by.id === this.user.id
      },
      canModify (row) {
        // contest problems are gated by contest ownership on the server; the list only
        // returns problems from contests the user owns, so keep buttons enabled there.
        if (this.contestId) return true
        return this.canManageAll || this.isOwner(row)
      },
      scopeChanged () {
        this.currentPage = 1
        this.getProblemList(1)
      },
      handleResize () {
        this.windowWidth = window.innerWidth
      },
      handleDblclick (row) {
        if (!this.canModify(row)) return
        row.isEditing = true
      },
      goEdit (problemId) {
        if (this.routeName === 'problem-list') {
          this.$router.push({name: 'edit-problem', params: {problemId}})
        } else if (this.routeName === 'contest-problem-list') {
          this.$router.push({name: 'edit-contest-problem', params: {problemId: problemId, contestId: this.contestId}})
        }
      },
      goCreateProblem () {
        if (this.routeName === 'problem-list') {
          this.$router.push({name: 'create-problem'})
        } else if (this.routeName === 'contest-problem-list') {
          this.$router.push({name: 'create-contest-problem', params: {contestId: this.contestId}})
        }
      },
      // 切换页码回调
      currentChange (page) {
        this.currentPage = page
        this.getProblemList(page)
      },
      getProblemList (page = 1) {
        this.loading = true
        let funcName = this.routeName === 'problem-list' ? 'getProblemList' : 'getContestProblemList'
        let params = {
          limit: this.pageSize,
          offset: (page - 1) * this.pageSize,
          keyword: this.keyword,
          contest_id: this.contestId
        }
        if (this.routeName === 'problem-list') {
          params.scope = this.scope
        }
        api[funcName](params).then(res => {
          this.loading = false
          this.total = res.data.data.total
          for (let problem of res.data.data.results) {
            problem.isEditing = false
          }
          this.problemList = res.data.data.results
        }, res => {
          this.loading = false
        })
      },
      deleteProblem (id) {
        this.$confirm('¿Seguro que deseas eliminar este problema? Los envíos asociados también serán eliminados.', 'Eliminar Problema', {
          type: 'warning'
        }).then(() => {
          let funcName = this.routeName === 'problem-list' ? 'deleteProblem' : 'deleteContestProblem'
          api[funcName](id).then(() => {
            // Si era el último de una página posterior, se vuelve a la anterior.
            if (this.problemList.length === 1 && this.currentPage > 1) this.currentPage--
            this.getProblemList(this.currentPage)
          }).catch(() => {
          })
        }, () => {
        })
      },
      makeContestProblemPublic (problemID) {
        this.$prompt('Por favor, ingresa el ID de visualización para el problema público', 'Confirmar').then(({value}) => {
          api.makeContestProblemPublic({id: problemID, display_id: value}).catch()
        }, () => {
        })
      },
      updateProblem (row) {
        if (!row._id || !String(row._id).trim()) {
          this.$error('El Display ID no puede estar vacío')
          return
        }
        if (!row.title || !String(row.title).trim()) {
          this.$error('El título no puede estar vacío')
          return
        }
        let data = Object.assign({}, row)
        let funcName = ''
        if (this.contestId) {
          data.contest_id = this.contestId
          funcName = 'editContestProblem'
        } else {
          funcName = 'editProblem'
        }
        api[funcName](data).then(res => {
          this.InlineEditDialogVisible = false
          this.getProblemList(this.currentPage)
        }).catch(() => {
          this.InlineEditDialogVisible = false
        })
      },
      handleInlineEdit (row) {
        this.currentRow = row
        this.InlineEditDialogVisible = true
      },
      downloadTestCase (problemID) {
        let url = '/admin/test_case?problem_id=' + problemID
        utils.downloadFile(url)
      },
      getPublicProblem () {
        api.getProblemList()
      }
    },
    watch: {
      '$route' (newVal, oldVal) {
        this.contestId = newVal.params.contestId
        this.routeName = newVal.name
        this.getProblemList(this.currentPage)
      },
      'keyword' () {
        this.currentChange(1)
      }
    }
  }
</script>

<style scoped lang="less">
// Sin reglas globales de .panel, .el-button--primary ni paginación: se heredan del tema compartido
// (src/styles) para que los dos temas y el ancho móvil se comporten igual que el resto del panel.
.table-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.table-toolbar__search {
  flex: 1;
  min-width: 220px;
}

.table-toolbar__scope {
  flex-shrink: 0;
}

.readonly-hint {
  color: var(--lj-muted, #999);
  font-size: 12px;
}
</style>
