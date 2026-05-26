<template>
  <div class="view">
    <!-- para que los paneles se vean separados y flotando -->
    <Panel style="margin-bottom: 25px;">
      <span slot="title" class="panel-title-accent">
        {{ $t('m.User_User') }}
      </span>
      <div class="table-toolbar">
        <el-button v-show="selectedUsers.length"
                   type="danger"
                   icon="el-icon-fa-trash"
                   @click="deleteUsers(selectedUserIDs)">{{ $t('m.Delete') }}
        </el-button>
        <el-input class="table-toolbar__search"
                  v-model="keyword"
                  prefix-icon="el-icon-search"
                  :placeholder="$t('m.Keyword')"></el-input>
      </div>
      <el-table
        v-loading="loadingTable"
        :element-loading-text="$t('m.Loading')"
        @selection-change="handleSelectionChange"
        ref="table"
        :data="userList"
        style="width: 100%"
        :header-cell-style="{color: '#000000', fontWeight: 'bold'}">
        <el-table-column type="selection" width="55" align="center" header-align="center"></el-table-column>

        <el-table-column prop="id" :label="$t('m.ID')" width="70" align="center"></el-table-column>

        <el-table-column prop="username" :label="$t('m.User_Username')" min-width="140" align="center"></el-table-column>

        <el-table-column v-if="!isMobile" prop="create_time" :label="$t('m.Create_Time')" width="160" align="center">
          <template slot-scope="scope">
            {{scope.row.create_time | localtime }}
          </template>
        </el-table-column>

        <el-table-column v-if="!isMobile" prop="last_login" :label="$t('m.Last_Login')" width="160" align="center">
          <template slot-scope="scope">
            {{scope.row.last_login | localtime }}
          </template>
        </el-table-column>

        <el-table-column v-if="!isMobile" prop="real_name" :label="$t('m.User_Real_Name')" min-width="140" align="center"></el-table-column>

        <el-table-column prop="email" :label="$t('m.User_Email')" min-width="200" align="center"></el-table-column>

        <el-table-column prop="admin_type" :label="$t('m.User_Type')" width="120" align="center">
          <template slot-scope="scope">
            {{ scope.row.admin_type }}
          </template>
        </el-table-column>

        <el-table-column :label="$t('m.Option')" width="120" align="center">
          <template slot-scope="{row}">
            <div class="botones-gestion">
              <icon-btn :name="$t('m.Edit')" icon="edit" @click.native="openUserDialog(row.id)"></icon-btn>
              <icon-btn :name="$t('m.Delete')" icon="trash" @click.native="deleteUsers([row.id])"></icon-btn>
            </div>
          </template>
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

    <Panel>
      <span slot="title" class="panel-title-accent">{{$t('m.Import_User')}}
        <el-popover placement="right" trigger="hover">
          <p>{{$t('m.Import_User_CSV_Hint')}} <a
            href="http://docs.onlinejudge.me/#/onlinejudge/guide/import_users">link</a> {{$t('m.For_More_Details')}}</p>
          <i slot="reference" class="el-icon-fa-question-circle import-user-icon"></i>
        </el-popover>
      </span>
      <el-upload v-if="!uploadUsers.length"
                 action=""
                 :show-file-list="false"
                 accept=".csv"
                 :before-upload="handleUsersCSV">
        <el-button icon="el-icon-fa-upload" type="primary">{{$t('m.Choose_File')}}</el-button>
      </el-upload>
      <template v-else>
        <el-table :data="uploadUsersPage">
          <el-table-column :label="$t('m.User_Username')">
            <template slot-scope="{row}">
              {{row[0]}}
            </template>
          </el-table-column>
          <el-table-column :label="$t('m.User_New_Password')">
            <template slot-scope="{row}">
              {{row[1]}}
            </template>
          </el-table-column>
          <el-table-column :label="$t('m.User_Email')">
            <template slot-scope="{row}">
              {{row[2]}}
            </template>
          </el-table-column>
          <el-table-column :label="$t('m.User_Real_Name')">
            <template slot-scope="{row}">
              {{row[3]}}
            </template>
          </el-table-column>
        </el-table>
        <div class="panel-options">
          <el-button type="primary"
                     icon="el-icon-fa-upload"
                     @click="handleUsersUpload">{{$t('m.Import_Users')}}
          </el-button>
          <el-button type="danger"
                     icon="el-icon-fa-undo"
                     @click="handleResetData">{{$t('m.Reset')}}
          </el-button>
          <el-pagination
            class="page"
            layout="prev, pager, next"
            :page-size="uploadUsersPageSize"
            :current-page.sync="uploadUsersCurrentPage"
            :total="uploadUsers.length">
          </el-pagination>
        </div>
      </template>
    </Panel>

    <Panel style="margin-bottom: 25px;">
      <span slot="title" class="panel-title-accent">
        {{ $t('m.Generate_User') }}
      </span>
      <el-form :model="formGenerateUser" :rules="generateRules" ref="formGenerateUser" label-position="top">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12">
            <el-form-item :label="$t('m.Prefix')" prop="prefix">
              <el-input v-model="formGenerateUser.prefix" :placeholder="$t('m.Prefix')"></el-input>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item :label="$t('m.Suffix')" prop="suffix">
              <el-input v-model="formGenerateUser.suffix" :placeholder="$t('m.Suffix')"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12">
            <el-form-item :label="$t('m.Start_Number')" prop="number_from" required>
              <el-input-number v-model="formGenerateUser.number_from" :min="0" style="width: 100%"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item :label="$t('m.End_Number')" prop="number_to" required>
              <el-input-number v-model="formGenerateUser.number_to" :min="0" style="width: 100%"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12">
            <el-form-item :label="$t('m.Password_Length')" prop="password_length" required>
              <el-input v-model.number="formGenerateUser.password_length"
                        :placeholder="$t('m.Password_Length')"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item>
          <el-button type="primary" @click="generateUser" icon="el-icon-fa-users" :loading="loadingGenerate">
            {{ $t('m.Generate_and_Export') }}
          </el-button>
        </el-form-item>
      </el-form>
      <div class="generate-preview"
           v-if="formGenerateUser.number_from !== '' && formGenerateUser.number_to !== '' && formGenerateUser.number_from <= formGenerateUser.number_to">
        <div class="generate-preview__label">{{ $t('m.Usernames_Will_Be') }}</div>
        <div class="generate-preview__list">
          <code>{{ formGenerateUser.prefix + formGenerateUser.number_from + formGenerateUser.suffix }}</code>
          <template v-if="formGenerateUser.number_from + 1 < formGenerateUser.number_to">
            <span>,</span>
            <code>{{ formGenerateUser.prefix + (formGenerateUser.number_from + 1) + formGenerateUser.suffix }}</code>
            <span>…</span>
          </template>
          <template v-if="formGenerateUser.number_from < formGenerateUser.number_to">
            <span>,</span>
            <code>{{ formGenerateUser.prefix + formGenerateUser.number_to + formGenerateUser.suffix }}</code>
          </template>
        </div>
      </div>
    </Panel>
    <!--Cuadro de dialogo-->
    <el-dialog :title="$t('m.User_Info')"
    :visible.sync="showUserDialog"
    :close-on-click-modal="false"
    width="720px"
  custom-class="user-edit-dialog">
      <el-form :model="user" :rules="userRules" ref="userForm" label-width="130px" label-position="left">
        <el-row :gutter="24">
          <el-col :xs="24" :sm="12">
            <el-form-item :label="$t('m.User_Username')" prop="username" required>
              <el-input v-model="user.username"></el-input>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item :label="$t('m.User_Real_Name')" prop="real_name" required>
              <el-input v-model="user.real_name"></el-input>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item :label="$t('m.User_Email')" prop="email" required>
              <el-input v-model="user.email"></el-input>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item :label="$t('m.User_New_Password')" prop="password">
              <el-input v-model="user.password"></el-input>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item :label="$t('m.User_Type')" >
              <el-select v-model="user.admin_type">
                <el-option :label="$t('m.Regular_User')" value="Regular User"></el-option>
                <el-option :label="$t('m.User_Type_Admin')" value="Admin"></el-option>
                <el-option :label="$t('m.User_Type_Super_Admin')" value="Super Admin"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item :label="$t('m.Problem_Permission')" width="250px">
              <el-select v-model="user.problem_permission" :disabled="user.admin_type!=='Admin'">
                <el-option :label="$t('m.Permission_None')" value="None"></el-option>
                <el-option :label="$t('m.Permission_Own')" value="Own"></el-option>
                <el-option :label="$t('m.Permission_All')" value="All"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="8">
            <el-form-item :label="$t('m.Two_Factor_Auth')">
              <el-switch
                v-model="user.two_factor_auth"
                :disabled="!user.real_tfa"
                active-color="#BDF2D4"
                inactive-color="#A60550">
              </el-switch>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="8">
            <el-form-item :label="$t('m.Open_API')">
              <el-switch
                v-model="user.open_api"
                active-color="#BDF2D4"
                inactive-color="#A60550">
              </el-switch>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="8">
            <el-form-item :label="$t('m.Is_Disabled')">
              <el-switch
                v-model="user.is_disabled"
                active-color="#BDF2D4"
                inactive-color="#A60550">
              </el-switch>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <cancel @click.native="showUserDialog = false"></cancel>
        <save @click.native="saveUser()"></save>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import papa from 'papaparse'
  import api from '../../api.js'
  import utils from '@/utils/utils'

  export default {
    name: 'User',
    data () {
      const emailRegex = /^[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?$/
      const validateEmail = (rule, value, callback) => {
        if (!value) {
          callback(new Error(this.$i18n.t('m.Email_Required')))
        } else if (!emailRegex.test(value)) {
          callback(new Error(this.$i18n.t('m.Email_Invalid')))
        } else {
          callback()
        }
      }
      const validateOptionalPassword = (rule, value, callback) => {
        if (value && value.length < 6) {
          callback(new Error(this.$i18n.t('m.Password_Min_6')))
        } else {
          callback()
        }
      }
      const validateNumberTo = (rule, value, callback) => {
        if (value === null || value === undefined || value === '') {
          callback(new Error(this.$i18n.t('m.End_Number_Required')))
        } else if (!Number.isInteger(value)) {
          callback(new Error(this.$i18n.t('m.Must_Be_Integer')))
        } else if (value < this.formGenerateUser.number_from) {
          callback(new Error(this.$i18n.t('m.End_Number_GTE_Start')))
        } else {
          callback()
        }
      }
      const validatePasswordLength = (rule, value, callback) => {
        const num = Number(value)
        if (!Number.isInteger(num) || num < 6 || num > 16) {
          callback(new Error(this.$i18n.t('m.Password_Length_Range')))
        } else {
          callback()
        }
      }
      return {
        windowWidth: window.innerWidth,
        pageSize: 10,
        total: 0,
        userList: [],
        uploadUsers: [],
        uploadUsersPage: [],
        uploadUsersCurrentPage: 1,
        uploadUsersPageSize: 15,
        keyword: '',
        showUserDialog: false,
        user: {},
        loadingTable: false,
        loadingGenerate: false,
        currentPage: 0,
        selectedUsers: [],
        formGenerateUser: {
          prefix: '',
          suffix: '',
          number_from: 0,
          number_to: 0,
          password_length: 8
        },
        userRules: {
          username: [
            {required: true, message: this.$i18n.t('m.Username_Required'), trigger: 'blur'},
            {min: 1, max: 32, message: this.$i18n.t('m.Username_Length'), trigger: 'blur'}
          ],
          real_name: [
            {required: true, message: this.$i18n.t('m.Real_Name_Required'), trigger: 'blur'},
            {max: 32, message: this.$i18n.t('m.Max_32_Chars'), trigger: 'blur'}
          ],
          email: [
            {required: true, validator: validateEmail, trigger: 'blur'}
          ],
          password: [
            {validator: validateOptionalPassword, trigger: 'blur'}
          ]
        },
        generateRules: {
          prefix: [
            {max: 16, message: this.$i18n.t('m.Max_16_Chars'), trigger: 'blur'}
          ],
          suffix: [
            {max: 16, message: this.$i18n.t('m.Max_16_Chars'), trigger: 'blur'}
          ],
          number_from: [
            {required: true, message: this.$i18n.t('m.Start_Number_Required'), type: 'number', trigger: 'blur'}
          ],
          number_to: [
            {required: true, validator: validateNumberTo, trigger: 'blur'}
          ],
          password_length: [
            {required: true, validator: validatePasswordLength, trigger: 'blur'}
          ]
        }
      }
    },
    mounted () {
      this.getUserList(1)
      window.addEventListener('resize', this.handleResize)
    },
    beforeDestroy () {
      window.removeEventListener('resize', this.handleResize)
    },
    methods: {
      handleResize () {
        this.windowWidth = window.innerWidth
      },
      // 切换页码回调
      currentChange (page) {
        this.currentPage = page
        this.getUserList(page)
      },
      // 提交修改用户的信息
      saveUser () {
        this.$refs.userForm.validate((valid) => {
          if (!valid) {
            this.$error(this.$i18n.t('m.Fix_Form_Errors'))
            return
          }
          api.editUser(this.user).then(res => {
            this.getUserList(this.currentPage)
          }).then(() => {
            this.showUserDialog = false
          }).catch(() => {
          })
        })
      },
      // 打开用户对话框
      openUserDialog (id) {
        this.showUserDialog = true
        api.getUser(id).then(res => {
          this.user = res.data.data
          this.user.password = ''
          this.user.real_tfa = this.user.two_factor_auth
        })
      },
      // 获取用户列表
      getUserList (page) {
        this.loadingTable = true
        api.getUserList((page - 1) * this.pageSize, this.pageSize, this.keyword).then(res => {
          this.loadingTable = false
          this.total = res.data.data.total
          this.userList = res.data.data.results
        }, res => {
          this.loadingTable = false
        })
      },
      deleteUsers (ids) {
        this.$confirm(this.$i18n.t('m.Delete_User_Confirm'), this.$i18n.t('m.Confirmation'), {
          type: 'warning'
        }).then(() => {
          api.deleteUsers(ids.join(',')).then(res => {
      this.$success(this.$t('m.Succeeded'))
      this.getUserList(this.currentPage)
    }).catch(() => {
      this.getUserList(this.currentPage)
          })
        }, () => {
        })
      },
      handleSelectionChange (val) {
        this.selectedUsers = val
      },
      generateUser () {
        this.$refs['formGenerateUser'].validate((valid) => {
          if (!valid) {
            this.$error(this.$i18n.t('m.Fix_Form_Errors'))
            return
          }
          this.loadingGenerate = true
          let data = Object.assign({}, this.formGenerateUser)
          api.generateUser(data).then(res => {
            this.loadingGenerate = false
            let url = '/admin/generate_user?file_id=' + res.data.data.file_id
            utils.downloadFile(url).then(() => {
              this.$alert(this.$i18n.t('m.Generate_User_Success'), this.$i18n.t('m.Notification'), {
                confirmButtonText: 'OK'
              })
            })
            this.getUserList(1)
          }).catch(() => {
            this.loadingGenerate = false
          })
        })
      },
      handleUsersCSV (file) {
        papa.parse(file, {
          complete: (results) => {
            let data = results.data.filter(user => {
              return user[0] && user[1] && user[2] && user[3]
            })
            let delta = results.data.length - data.length
            if (delta > 0) {
              this.$warning(this.$i18n.t('m.Users_Filtered', {count: delta}))
            }
            this.uploadUsersCurrentPage = 1
            this.uploadUsers = data
            this.uploadUsersPage = data.slice(0, this.uploadUsersPageSize)
          },
          error: (error) => {
            this.$error(error)
          }
        })
      },
      handleUsersUpload () {
        api.importUsers(this.uploadUsers).then(res => {
          this.getUserList(1)
          this.handleResetData()
        }).catch(() => {
        })
      },
      handleResetData () {
        this.uploadUsers = []
      }
    },
    computed: {
      isMobile () {
        return this.windowWidth < 768
      },
      selectedUserIDs () {
        let ids = []
        for (let user of this.selectedUsers) {
          ids.push(user.id)
        }
        return ids
      }
    },
    watch: {
      'keyword' () {
        this.currentChange(1)
      },
      'user.admin_type' () {
        if (this.user.admin_type === 'Super Admin') {
          this.user.problem_permission = 'All'
        } else if (this.user.admin_type === 'Regular User') {
          this.user.problem_permission = 'None'
        }
      },
      'uploadUsersCurrentPage' (page) {
        this.uploadUsersPage = this.uploadUsers.slice((page - 1) * this.uploadUsersPageSize, page * this.uploadUsersPageSize)
      }
    }
  }
</script>

<style scoped lang="less">
  .import-user-icon {
    color: #003B4A;
    margin-left: 4px;
  }

  .panel-title-accent {
    color: #003B4A;
    font-weight: 600;
  }

  .generate-preview {
    margin-top: 16px;
    padding: 14px 16px;
    background: #f5f7fa;
    border-left: 3px solid #003B4A;
    border-radius: 0 12px 12px 0;
  }

  .generate-preview__label {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #6b7280;
    margin-bottom: 8px;
    font-weight: 600;
  }

  .generate-preview__list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
    color: #2e3a4b;
    font-size: 13px;

    code {
      background: #fff;
      padding: 2px 8px;
      border-radius: 6px;
      font-family: monospace;
      font-size: 13px;
      color: #003B4A;
      border: 1px solid #e5e7eb;
    }
  }

  .notification {
    p {
      margin: 0;
      text-align: left;
    }
  }

  //otras modificaciones
  .panel {
    background: #ffffff !important;
    border-radius: 20px !important;
    border: none !important;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04) !important;
    overflow: hidden;
    padding: 0 10px !important;
    margin-bottom: 24px !important;
    font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
  }

  .table-toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    margin-bottom: 16px;
    background: #fafbfc;
    border-radius: 12px;
  }

  .table-toolbar__search {
    flex: 1;
    min-width: 220px;
  }

  @media (max-width: 768px) {
    .panel {
      padding: 0 4px !important;
    }

    .table-toolbar {
      flex-direction: column;
      align-items: stretch;
    }

    .table-toolbar__search {
      min-width: 0;
    }
  }
</style>

<style lang="less">
  @media (max-width: 768px) {
    .user-edit-dialog {
      width: 95% !important;
    }
  }
</style>

