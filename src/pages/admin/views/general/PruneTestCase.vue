<template>
  <div>

    <panel>

      <span slot="title" class="panel-title">
        Limpiar Casos de Prueba

        <el-popover placement="right" trigger="hover">

          <p>
            Estos casos de prueba no pertenecen a ningún problema.
            Puedes eliminarlos de forma segura.
          </p>

          <i
            slot="reference"
            class="el-icon-fa-question-circle import-user-icon">
          </i>

        </el-popover>
      </span>

      <el-table
        :data="data"
        border>

        <el-table-column label="Última modificación">

          <template slot-scope="{row}">
            {{ row.create_time | timestampFormat }}
          </template>

        </el-table-column>

        <el-table-column
          prop="id"
          label="ID del Caso de Prueba">
        </el-table-column>

        <el-table-column
          fixed="right"
          label="Opciones"
          width="220">

          <template slot-scope="{row}">

            <el-button
              class="btn-delete-single"
              size="mini"
              icon="el-icon-delete"
              @click="confirmDelete(row.id)">

              Eliminar

            </el-button>

          </template>

        </el-table-column>

      </el-table>

      <div
        class="panel-options"
        v-show="data.length > 0">

        <el-button
          class="btn-delete-all"
          size="small"
          :loading="loading"
          icon="el-icon-delete"
          @click="confirmDelete()">

          Eliminar Todos

        </el-button>

      </div>

    </panel>

  </div>
</template>

<script>

import api from '@admin/api'
import moment from 'moment'

export default {

  name: 'prune-test-case',

  data () {

    return {

      data: [],

      loading: false
    }
  },

  mounted () {

    this.init()

  },

  methods: {

    init () {

      api.getInvalidTestCaseList().then(resp => {

        this.data = resp.data.data

      }, () => {

      })

    },

    confirmDelete (id) {

      const isAll = !id

      this.$confirm(

        isAll
          ? 'Si elimina todos los casos de prueba inválidos, esta acción no se podrá deshacer.'
          : 'Si elimina este caso de prueba, no podrá recuperarlo nuevamente.',

        'Advertencia',

        {
          confirmButtonText: 'Eliminar',
          cancelButtonText: 'Cancelar',
          type: 'warning',
          center: true,
          customClass: 'upv-delete-modal'
        }

      ).then(() => {

        this.deleteTestCase(id)

      }).catch(() => {

        this.$message({
          type: 'info',
          message: 'Eliminación cancelada'
        })

      })
    },

    deleteTestCase (id) {

      if (!id) {
        this.loading = true
      }

      api.pruneTestCase(id).then(() => {

        this.loading = false

        this.$message({
          type: 'success',
          message: !id
            ? 'Todos los casos fueron eliminados correctamente'
            : 'Caso eliminado correctamente'
        })

        this.init()

      })

    }

  },

  filters: {

    timestampFormat (value) {

      return moment.unix(value).format('YYYY-M-D HH:mm:ss')

    }

  }

}

</script>

<style>

.panel {
  border: 2px solid rgba(17, 55, 49, 0.15) !important;
  border-radius: 18px;
  overflow: hidden;
}

.panel-title {
  color: #003B4A;
  font-weight: bold;
  font-size: 22px;
  letter-spacing: 0.3px;
}

.el-table {
  border-radius: 14px;
  overflow: hidden;
}

.el-table th {
  background-color: #BDF2D4 !important;
  color: #003B4A !important;
  font-weight: bold;
}

.el-table td {
  color: #664D59;
  font-weight: 500;
}

.btn-delete-single {
  background-color: #003B4A !important;
  border: 1px solid #003B4A !important;
  color: white !important;
  font-weight: bold;
  border-radius: 10px !important;
  transition: 0.3s;
  box-shadow: 0 3px 8px rgba(0, 59, 74, 0.25);
}

.btn-delete-single:hover {
  background-color: #A60550 !important;
  border-color: #7B1E3A !important;
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(166, 5, 80, 0.30);
}

.btn-delete-all {
  margin-top: 18px;
  background-color: #003B4A !important;
  border: 1px solid #003B4A !important;
  color: white !important;
  font-weight: bold;
  border-radius: 12px !important;
  padding: 10px 20px !important;
  transition: 0.3s;
  box-shadow: 0 5px 12px rgba(0, 59, 74, 0.25);
}

.btn-delete-all:hover {
  background-color: #A60550 !important;
  border-color: #7B1E3A !important;
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(166, 5, 80, 0.35);
}

.import-user-icon {
  color: #003B4A;
  margin-left: 6px;
  font-size: 16px;
  cursor: pointer;
}

.upv-delete-modal {
  border-radius: 20px !important;
  overflow: hidden;
  border: 3px solid #987284;
  box-shadow: 0 12px 30px rgba(123, 30, 58, 0.25);
  animation: modalFade 0.25s ease;
}

.upv-delete-modal .el-message-box__header {
  background: linear-gradient(
    135deg,
    #A60550,
    #7B1E3A
  );

  padding: 22px;
  text-align: center;
}

.upv-delete-modal .el-message-box__title {
  color: white !important;
  font-size: 20px;
  font-weight: bold;
  letter-spacing: 0.4px;
}

.upv-delete-modal .el-message-box__status {
  color: white !important;
  font-size: 30px !important;
}

.upv-delete-modal .el-message-box__content {
  background-color: #ffffff;
  color: #664D59;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.6;
  padding: 32px 28px;
}

.upv-delete-modal .el-message-box__btns {
  background-color: #ffffff;
  padding: 18px 22px;
}

.upv-delete-modal .el-button--primary {
  background-color: #A60550 !important;
  border: 1px solid #7B1E3A !important;
  color: white !important;
  border-radius: 12px !important;
  font-weight: bold;
  transition: 0.3s;
}

.upv-delete-modal .el-button--primary:hover {
  background-color: #7B1E3A !important;
  border-color: #664D59 !important;
  transform: translateY(-1px);
}

.upv-delete-modal .el-button:not(.el-button--primary) {
  background-color: #BDF2D4 !important;
  border: 1px solid #987284 !important;
  color: #003B4A !important;
  border-radius: 12px !important;
  font-weight: bold;
}

.upv-delete-modal .el-button:not(.el-button--primary):hover {
  background-color: #987284 !important;
  color: white !important;
}

@keyframes modalFade {

  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.96);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

}

</style>