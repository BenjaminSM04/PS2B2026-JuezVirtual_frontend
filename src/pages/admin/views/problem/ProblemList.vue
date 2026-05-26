<template>
  <div class="view">
    <Panel style="margin-bottom: 25px;">
      <span slot="title" style="color: #82a69a; font-weight: bold;">
        {{ contestId ? $i18n.t('m.Contest_Problem_List') : $i18n.t('m.Problem_List') }}
      </span>
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
        :data="problemList"
        @row-dblclick="handleDblclick"
        style="width: 100%"
        :header-cell-style="{color: '#000000', fontWeight: 'bold'}">
        <el-table-column
          width="100"
          prop="id"
          label="ID"
          align="center">
        </el-table-column>
        <el-table-column
          width="150"
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
          min-width="180"
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
          width="100"
          prop="visible"
          :label="$t('m.Visible')"
          align="center">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.visible"
                       active-text=""
                       inactive-text=""
                       active-color="#BDF2D4"
                inactive-color="#6A1B29"
                       @change="updateProblem(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('m.Option')"
          width="170"
          align="center">
          <div slot-scope="scope" class="botones-gestion">
            <icon-btn :name="$t('m.Edit')" icon="edit" @click.native="goEdit(scope.row.id)"></icon-btn>
            <icon-btn v-if="contestId" :name="$t('m.Make_Public')" icon="clone"
                      @click.native="makeContestProblemPublic(scope.row.id)"></icon-btn>
            <icon-btn icon="download" :name="$t('m.Download_TestCase')"
                      @click.native="downloadTestCase(scope.row.id)"></icon-btn>
            <icon-btn icon="trash" :name="$t('m.Delete_Problem')"
                      @click.native="deleteProblem(scope.row.id)"></icon-btn>
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
          :page-size="pageSize"
          :total="total"
          >
        </el-pagination>
      </div>
    </Panel>
    <el-dialog :title="$t('m.Sure_to_update_the_problem')" 
               width="20%"
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
  import api from '../../api.js'
  import utils from '@/utils/utils'
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
      isMobile () {
        return this.windowWidth < 768
      }
    },
    methods: {
      handleResize () {
        this.windowWidth = window.innerWidth
      },
      handleDblclick (row) {
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
          api[funcName](id).then(() => [
            this.getProblemList(this.currentPage - 1)
          ]).catch(() => {
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
        this.currentChange()
      }
    }
  }
</script>

<style scoped lang="less">
.title-input {
    margin-bottom: 20px;
  }

  .visible-box {
    margin-top: 10px;
    width: 205px;
    float: left;
  }

  .panel {
    background: #ffffff !important;
    border-radius: 20px !important; 
    border: none !important; 
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04) !important;
    overflow: hidden; 
    padding: 0 10px !important;
    font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
  }
  /* Personalización de los botones existentes en el sistema */
  .el-button--primary {
    background-color: #003B4A !important;
    border-color: #003B4A !important;
    border-radius: 10px !important;
    height: 40px !important; 
    padding: 0 20px !important;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px !important;
    font-weight: 600;
    font-size: 14px;
    &:hover {
      background-color: #245965 !important;
    }
  }
  /*Cambiar el color del número de página ACTIVO (El que está seleccionado) */
/deep/ .el-pagination .el-pager li.active {
  color: #003B4A !important; /* Tu tono guindo */
  font-weight: bold;
}

/*Cambiar el color de los números INACTIVOS cuando pasas el mouse por encima (Hover) */
/deep/ .el-pagination .el-pager li:hover {
  color: #82a69a !important; /* Un guindo un poco más claro para el efecto visual */
}

/*Cambiar el color de las flechas de navegación (< y >) cuando pasas el mouse por encima */
/deep/ .el-pagination button:hover {
  color: #003B4A !important;
}

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

@media (max-width: 768px) {
  .panel {
    padding: 0 4px !important;
  }

  .table-toolbar__search {
    min-width: 0;
  }
}
</style>
