<template>
  <div class="view">
    <Panel style="margin-bottom: 25px;">
      <span slot="title" style="color: #82a69a; font-weight: bold;">
        {{ $t('m.Judge_Server_Token') }}
      </span>
      <code>{{ token }}</code>
    </Panel>
    <Panel style="margin-bottom: 25px;">
      <span slot="title" style="color: #82a69a; font-weight: bold;">
        {{ $t('m.Judge_Server_Info') }}
      </span>
      <el-table
        :data="servers"
        :default-expand-all="true"
        :row-class-name="tableRowClassName"
        :header-cell-style="{color: '#000000', fontWeight: 'bold'}"
        >

        <el-table-column type="expand">
          <template slot-scope="props">
            <p style="font-weight: bold; color: black;">
              {{$t('m.IP')}}:
              <el-tag class="tag-green bold">
                {{ props.row.ip }}
              </el-tag>

              &nbsp;&nbsp;

              {{$t('m.Judger_Version')}}:
              <el-tag class="tag-green bold">
                {{ props.row.judger_version }}
              </el-tag>
            </p>
            <p><strong>{{ $t('m.Service_URL') }}:</strong> <code>{{ props.row.service_url }}</code></p>
            <p><strong>{{ $t('m.Last_Heartbeat') }}:</strong> {{ props.row.last_heartbeat | localtime }}</p>
            <p><strong>{{ $t('m.Create_Time') }}:</strong> {{ props.row.create_time | localtime }}</p>
          </template>
        </el-table-column>
        <el-table-column prop="status" :label="$t('m.Status')" align="center">
          <template slot-scope="scope">
            <el-tag
              :class="scope.row.status === 'normal' ? 'tag-green bold' : 'tag-red bold'">
              
              {{ scope.row.status === 'normal' ? $t('m.Online') : $t('m.Offline') }}
              
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="hostname" :label="$t('m.Hostname')" align="center"></el-table-column>
        <el-table-column prop="task_number" :label="$t('m.Task_Number')" align="center"></el-table-column>
        <el-table-column prop="cpu_core" :label="$t('m.CPU_Core')" align="center"></el-table-column>
        <el-table-column prop="cpu_usage" :label="$t('m.CPU_Usage')" align="center">
          <template slot-scope="scope">{{ scope.row.cpu_usage }}%</template>
        </el-table-column>
        <el-table-column prop="memory_usage" :label="$t('m.Memory_Usage')" align="center">
          <template slot-scope="scope">{{ scope.row.memory_usage }}%</template>
        </el-table-column>
        <el-table-column :label="$t('m.Disabled')" align="center">
          <template slot-scope="{row}">
            <el-switch v-model="row.is_disabled"
              @change="handleDisabledSwitch(row.id, row.is_disabled)" active-color="#BDF2D4"
                inactive-color="#6A1B29">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column fixed="right" :label="$t('m.Option')" align="center">
          <template slot-scope="scope">
            <icon-btn :name="$t('m.Delete')" icon="trash"
              @click.native="deleteJudgeServer(scope.row.hostname)">
            </icon-btn>
          </template>
        </el-table-column>
      </el-table>
    </Panel>
  </div>
</template>

<script>
  import api from '../../api.js'

  export default {
    name: 'JudgeServer',
    data () {
      return {
        servers: [],
        token: '',
        intervalId: -1
      }
    },
    mounted () {
      this.refreshJudgeServerList()
      this.intervalId = setInterval(() => {
        this.refreshJudgeServerList()
      }, 5000)
    },
    methods: {
      // Determina el color de fondo de toda la fila según su estado real operativo
      tableRowClassName ({row}) {
        // 1. Si está deshabilitado por el switch, se va a GRIS (Plomo)
        if (row.is_disabled) {
          return 'fila-deshabilitada'
        }
        // 2. Si está habilitado y su status es 'normal' (o '0'), se va a VERDE (Activo)
        if (row.status === 'normal' || row.status === '0') {
          return 'fila-online'
        }
        // 3. Si está habilitado pero el status falló, se va a ROJO (Caído)
        return 'fila-offline'
      },
      refreshJudgeServerList () {
        api.getJudgeServer().then(res => {
          this.servers = res.data.data.servers
          this.token = res.data.data.token
        })
      },
      deleteJudgeServer (hostname) {
        this.$confirm('Si eliminas este servidor de evaluación, no se podrá utilizar hasta el próximo latido (heartbeat).', 'Advertencia', {
          confirmButtonText: 'Eliminar',
          cancelButtonText: 'Cancelar',
          type: 'warning'
        }).then(() => {
          api.deleteJudgeServer(hostname).then(res =>
            this.refreshJudgeServerList()
          )
        }).catch(() => {
        })
      },
      handleDisabledSwitch (id, value) {
        let data = {
          id,
          is_disabled: value
        }
        api.updateJudgeServer(data).catch(() => {})
      }
    },
    beforeRouteLeave (to, from, next) {
      clearInterval(this.intervalId)
      next()
    }
  }
</script>

<style lang="less" scoped>
  .tag-green {
    background-color: #BDF2D4 !important;
    color: #1f5c48 !important;
    border: 1px solid #8edbb8 !important;
  }

  .tag-red {
    background-color: #A60550 !important;
    color: #ffffff !important;
    border: 1px solid #7a043b !important;
  }

  .bold {
    font-weight: bold;
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
  /* Cambiar el botón de eliminar a Guindo */
/deep/ .el-table .el-button {
  background-color: #003B4A !important;
  border-color: #003B4A !important;
  color: white !important;
  width: 42px !important;
}

/deep/ .el-table .el-button:hover {
  background-color: #245965 !important;
  border-color: #245965 !important;
  color: #ffffff !important;
}

/* Colores de las filas (Estados operativos) */
/deep/ .el-table .fila-online {
  background-color: #e8f5e9 !important;
}

/deep/ .el-table .fila-offline {
  background-color: #ffebee !important;
}

/deep/ .el-table .fila-deshabilitada {
  background-color: #f4f4f5 !important;
  opacity: 0.65;
}

/* Asegurar que las celdas no tapen el fondo de la fila */
/deep/ .el-table .fila-online td,
/deep/ .el-table .fila-offline td,
/deep/ .el-table .fila-deshabilitada td {
  background-color: transparent !important;
}
</style>