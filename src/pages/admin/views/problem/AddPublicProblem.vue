<template>
  <div class="add-public-problem">
    <el-input
      v-model="keyword"
      :placeholder="$t('m.Keywords')"
      prefix-icon="el-icon-search">
    </el-input>
    <el-table :data="problems" v-loading="loading" :element-loading-text="$t('m.Loading')">
      <el-table-column
        v-if="!isMobile"
        :label="$t('m.ID')"
        width="80"
        prop="id">
      </el-table-column>
      <el-table-column
        :label="$t('m.Display_ID')"
        :width="isMobile ? 104 : 160"
        prop="_id">
      </el-table-column>
      <el-table-column
        :label="$t('m.Title')"
        :min-width="isMobile ? 100 : 220"
        prop="title">
      </el-table-column>
      <el-table-column
        v-if="!isMobile"
        :label="$t('m.Author')"
        width="230"
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
        :width="isMobile ? 70 : 100"
        :fixed="isMobile ? 'right' : false">
        <template slot-scope="{row}">
          <div class="botones-gestion">
            <icon-btn icon="plus" :name="$t('m.Add_The_Problem')"
                      @click.native="handleAddProblem(row)"></icon-btn>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      class="page"
      layout="prev, pager, next"
      @current-change="getPublicProblem"
      :current-page="page"
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
      ...mapGetters(['user']),
      isMobile () {
        return this.windowWidth < 768
      }
    },
    data () {
      return {
        windowWidth: window.innerWidth,
        page: 1,
        limit: 10,
        total: 0,
        loading: false,
        problems: [],
        contest: {},
        keyword: '',
        // Descartan respuestas que llegan después de una consulta más reciente.
        contestSeq: 0,
        listSeq: 0
      }
    },
    mounted () {
      window.addEventListener('resize', this.handleResize)
      this.loadContest()
    },
    beforeDestroy () {
      window.removeEventListener('resize', this.handleResize)
      this.contestSeq++
      this.listSeq++
    },
    methods: {
      handleResize () {
        this.windowWidth = window.innerWidth
      },
      // El diálogo se conserva montado al cambiar de concurso: la regla (ACM/OI) debe ser la del actual.
      loadContest () {
        const seq = ++this.contestSeq
        this.loading = true
        this.contest = {}
        this.problems = []
        this.total = 0
        api.getContest(this.contestID).then(res => {
          if (seq !== this.contestSeq) return
          this.contest = res.data.data
          this.getPublicProblem(1)
        }).catch(() => {
          if (seq === this.contestSeq) this.loading = false
        })
      },
      getPublicProblem (page = 1) {
        const seq = ++this.listSeq
        this.page = page
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
          if (seq !== this.listSeq) return
          this.loading = false
          this.total = res.data.data.total
          this.problems = res.data.data.results
        }).catch(() => {
          // Sin esto el indicador de carga quedaba activo y tapaba la tabla.
          if (seq === this.listSeq) this.loading = false
        })
      },
      isOwner (row) {
        return row.created_by && this.user && row.created_by.id === this.user.id
      },
      handleAddProblem (problem) {
        const message = this.$i18n.t('m.Input_Display_ID_For_Problem') + ' (' + problem.title + ')'
        this.$prompt(message, this.$i18n.t('m.Add_The_Problem'), {
          inputValidator: value => Boolean(value && String(value).trim()),
          inputErrorMessage: this.$i18n.t('m.Display_ID_Required')
        }).then(({value}) => {
          let data = {
            problem_id: problem.id,
            contest_id: this.contestID,
            display_id: String(value).trim()
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
        // Hasta conocer el concurso no se sabe qué regla (ACM/OI) filtrar.
        if (this.contest.rule_type) this.getPublicProblem(1)
      },
      'contestID' () {
        this.loadContest()
      }
    }
  }
</script>
<style scoped lang="less">
  .page {
    margin-top: 20px;
    text-align: right
  }

  /* Filas compactas: con diez resultados la paginación quedaba fuera de la pantalla. */
  .add-public-problem /deep/ .el-table td {
    padding: 4px 0;
  }

  .add-public-problem /deep/ .el-table .cell {
    padding-top: 6px;
    padding-bottom: 6px;
  }

</style>
