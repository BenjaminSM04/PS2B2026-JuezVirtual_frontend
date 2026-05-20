<template>
  <div class="announcement view">
    <Panel style="margin-bottom: 25px;">
      <span slot="title" style="color: #82a69a; font-weight: bold;">
        {{ $t('m.General_Announcement') }}
      </span>
      <div class="list">
        <el-table
          v-loading="loading"
          element-loading-text="loading"
          ref="table"
          :data="announcementList"
          style="width: 100%"
          :header-cell-style="{color: '#000000', fontWeight: 'bold'}">
          
          <el-table-column
            width="100"
            prop="id"
            label="ID"
            align="center">
          </el-table-column>
          <el-table-column
            prop="title"
            :label="$t('m.Title')"
            align="center">
          </el-table-column>
          <el-table-column
            prop="create_time"
            :label="$t('m.Create_Time')"
            align="center">
            <template slot-scope="scope">
              {{ scope.row.create_time | localtime }}
            </template>
          </el-table-column>
          <el-table-column
            prop="last_update_time"
            :label="$t('m.Last_Update_Time')"
            align="center">
            <template slot-scope="scope">
              {{scope.row.last_update_time | localtime }}
            </template>
          </el-table-column>
          <el-table-column
            prop="created_by.username"
            :label="$t('m.Author')"
            align="center">
          </el-table-column>
          <el-table-column
            width="100"
            prop="visible"
            :label="$t('m.Announcement_visible')"
            align="center">
            <template slot-scope="scope">
              <el-switch v-model="scope.row.visible"
                         active-text=""
                         inactive-text=""
                         active-color="#BDF2D4"
                inactive-color="#6A1B29"
                         @change="handleVisibleSwitch(scope.row)">
              </el-switch>
            </template>
          </el-table-column>
          <el-table-column
            fixed="right"
            :label="$t('m.Option')"
            align="center"
            aria-label=""
            width="200">
            <div slot-scope="scope">
              <icon-btn name="Edit" icon="edit" @click.native="openAnnouncementDialog(scope.row.id)"></icon-btn>
              <icon-btn name="Delete" icon="trash" @click.native="deleteAnnouncement(scope.row.id)"></icon-btn>
            </div>
          </el-table-column>
        </el-table>
        <div class="panel-options">
          <el-button type="primary" size="small" @click="openAnnouncementDialog(null)" icon="el-icon-plus">{{$t('m.Create')}}</el-button>
          <el-pagination
            v-if="!contestID"
            class="page"
            layout="prev, pager, next"
            @current-change="currentChange"
            :page-size="pageSize"
            :total="total">
          </el-pagination>
        </div>
      </div>
    </Panel>
    <!--对话框-->
    <el-dialog :title="announcementDialogTitle" :visible.sync="showEditAnnouncementDialog"
               @open="onOpenEditDialog" :close-on-click-modal="false">
      <el-form :model="announcement" :rules="rules" ref="announcementForm" label-position="top">
        <el-form-item :label="$t('m.Announcement_Title')" prop="title" required>
          <el-input
            v-model="announcement.title"
            :placeholder="$t('m.Announcement_Title')" class="title-input">
          </el-input>
        </el-form-item>
        <el-form-item :label="$t('m.Announcement_Content')" prop="content" required>
          <Simditor v-model="announcement.content"></Simditor>
        </el-form-item>
        <div class="visible-box">
          <span>{{$t('m.Announcement_visible')}}</span>
          <el-switch
            v-model="announcement.visible"
            active-text=""
            inactive-text=""
            active-color="#BDF2D4"
            inactive-color="#A60550">
          </el-switch>
        </div>
      </el-form>
      <span slot="footer" class="dialog-footer">
          <cancel @click.native="showEditAnnouncementDialog = false" style="color: white; background-color: #A60550;"></cancel>
          <save type="primary" @click.native="submitAnnouncement"></save>
        </span>
    </el-dialog>
  </div>
</template>

<script>
  import Simditor from '../../components/Simditor.vue'
  import api from '../../api.js'

  export default {
    name: 'Announcement',
    components: {
      Simditor
    },
    data () {
      const validateContent = (rule, value, callback) => {
        const stripped = (value || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, '').trim()
        if (!stripped) {
          callback(new Error('El contenido no puede estar vacío'))
        } else {
          callback()
        }
      }
      return {
        contestID: '',
        showEditAnnouncementDialog: false,
        announcementList: [],
        pageSize: 15,
        total: 0,
        currentAnnouncementId: null,
        mode: 'create',
        announcement: {
          title: '',
          visible: true,
          content: ''
        },
        rules: {
          title: [
            {required: true, message: 'El título es obligatorio', trigger: 'blur'},
            {min: 1, max: 128, message: 'El título debe tener entre 1 y 128 caracteres', trigger: 'blur'}
          ],
          content: [
            {required: true, validator: validateContent, trigger: 'blur'}
          ]
        },
        announcementDialogTitle: 'Edit Announcement',
        loading: true,
        currentPage: 0
      }
    },
    mounted () {
      this.init()
    },
    methods: {
      init () {
        this.contestID = this.$route.params.contestId
        if (this.contestID) {
          this.getContestAnnouncementList()
        } else {
          this.getAnnouncementList(1)
        }
      },
      // 切换页码回调
      currentChange (page) {
        this.currentPage = page
        this.getAnnouncementList(page)
      },
      getAnnouncementList (page) {
        this.loading = true
        api.getAnnouncementList((page - 1) * this.pageSize, this.pageSize).then(res => {
          this.loading = false
          this.total = res.data.data.total
          this.announcementList = res.data.data.results
        }, res => {
          this.loading = false
        })
      },
      getContestAnnouncementList () {
        this.loading = true
        api.getContestAnnouncementList(this.contestID).then(res => {
          this.loading = false
          this.announcementList = res.data.data
        }).catch(() => {
          this.loading = false
        })
      },
      // 打开编辑对话框的回调
      onOpenEditDialog () {
        // todo 优化
        // 暂时解决 文本编辑器显示异常bug
        setTimeout(() => {
          if (document.createEvent) {
            let event = document.createEvent('HTMLEvents')
            event.initEvent('resize', true, true)
            window.dispatchEvent(event)
          } else if (document.createEventObject) {
            window.fireEvent('onresize')
          }
        }, 0)
      },
      // 提交编辑
      // 默认传入MouseEvent
      submitAnnouncement (data = undefined) {
        let funcName = ''
        if (!data.title) {
          data = {
            id: this.currentAnnouncementId,
            title: this.announcement.title,
            content: this.announcement.content,
            visible: this.announcement.visible
          }
        }
        if (this.contestID) {
          data.contest_id = this.contestID
          funcName = this.mode === 'edit' ? 'updateContestAnnouncement' : 'createContestAnnouncement'
        } else {
          funcName = this.mode === 'edit' ? 'updateAnnouncement' : 'createAnnouncement'
        }
        api[funcName](data).then(res => {
          this.showEditAnnouncementDialog = false
          this.init()
        }).catch()
      },
      // 删除公告
      deleteAnnouncement (announcementId) {
        this.$confirm('¿Estás seguro de que deseas eliminar este anuncio?', 'Alerta', {
          confirmButtonText: 'Eliminar',
          cancelButtonText: 'Cancelar',
          type: 'warning'
        }).then(() => {
          // then 为确定
          this.loading = true
          let funcName = this.contestID ? 'deleteContestAnnouncement' : 'deleteAnnouncement'
          api[funcName](announcementId).then(res => {
            this.loading = true
            this.init()
          })
        }).catch(() => {
          // catch 为取消
          this.loading = false
        })
      },
      openAnnouncementDialog (id) {
        this.showEditAnnouncementDialog = true
        if (id !== null) {
          this.currentAnnouncementId = id
          this.announcementDialogTitle = this.$t("m.Edit_Announcement")
          this.announcementList.find(item => {
            if (item.id === this.currentAnnouncementId) {
              this.announcement.title = item.title
              this.announcement.visible = item.visible
              this.announcement.content = item.content
              this.mode = 'edit'
            }
          })
        } else {
          this.announcementDialogTitle = this.$t("m.Create_Announcement")
          this.announcement.title = ''
          this.announcement.visible = true
          this.announcement.content = ''
          this.mode = 'create'
        }
      },
      handleVisibleSwitch (row) {
      this.mode = 'edit'
      this.submitAnnouncement({
        id: row.id,
        title: row.title,
        content: row.content,
        visible: row.visible
      })
    },

    submitAnnouncement (data = undefined) {
      const fromDialog = !data || !data.title
      const proceed = () => {
        let funcName = ''
        let payload = data
        if (fromDialog) {
          payload = {
            id: this.currentAnnouncementId,
            title: this.announcement.title,
            content: this.announcement.content,
            visible: this.announcement.visible
          }
        }

        if (this.contestID) {
          payload.contest_id = this.contestID
          funcName = this.mode === 'edit' ? 'updateContestAnnouncement' : 'createContestAnnouncement'
        } else {
          funcName = this.mode === 'edit' ? 'updateAnnouncement' : 'createAnnouncement'
        }

        api[funcName](payload).then(res => {
          this.$success(this.$t('m.Succeeded'))
          this.showEditAnnouncementDialog = false
          this.init()
        }).catch(() => {
          this.init()
        })
      }

      if (fromDialog && this.$refs.announcementForm) {
        this.$refs.announcementForm.validate((valid) => {
          if (!valid) {
            this.$error('Por favor, corrige los campos con errores')
            return
          }
          proceed()
        })
      } else {
        proceed()
      }
    },
  },
    watch: {
      $route () {
        this.init()
      }
    }
  }
</script>

<style lang="less" scoped>
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
</style>
