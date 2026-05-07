<template>
  <div class="view">
    <!-- para que los paneles se vean separados y flotando -->
    <Panel style="margin-bottom: 25px;">
      <span slot="title" style="color: #82a69a; font-weight: bold;">
        {{ $t('m.User_User') }}
      </span>
      <div slot="header">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-button v-show="selectedUsers.length"
            style="background-color: red; font-weight: bold; color: white; border-radius: 10px"
                       icon="el-icon-fa-trash"
                       @click="deleteUsers(selectedUserIDs)">{{ $t('m.Delete') }}
            </el-button>
          </el-col>
          <el-col :span="selectedUsers.length ? 16: 24">
            <el-input v-model="keyword" prefix-icon="el-icon-search" :placeholder="$t('m.Keyword')"></el-input>
          </el-col>
        </el-row>
      </div>
      <el-table
        v-loading="loadingTable"
        element-loading-text="loading"
        @selection-change="handleSelectionChange"
        ref="table"
        :data="userList"
        style="width: 100%"
        :header-cell-style="{color: '#000000', fontWeight: 'bold'}">
        <el-table-column type="selection" width="55" align="center" header-align="center"></el-table-column>

        <el-table-column prop="id" :label="$t('m.ID')" width="60" align="center"></el-table-column>

        <el-table-column prop="username" :label="$t('m.User_Username')" width="150" align="center"></el-table-column>

        <el-table-column prop="create_time" :label="$t('m.Create_Time')" width="150" align="center">
          <template slot-scope="scope">
            {{scope.row.create_time | localtime }}
          </template>
        </el-table-column>

        <el-table-column prop="last_login" :label="$t('m.Last_Login')" width="150" align="center">
          <template slot-scope="scope">
            {{scope.row.last_login | localtime }}
          </template>
        </el-table-column>

        <el-table-column prop="real_name" :label="$t('m.User_Real_Name')" width="150" align="center"></el-table-column>

        <el-table-column prop="email" :label="$t('m.User_Email')" width="180" align="center"></el-table-column>

        <el-table-column prop="admin_type" :label="$t('m.User_Type')" width="130" align="center">
          <template slot-scope="scope">
            {{ scope.row.admin_type }}
          </template>
        </el-table-column>

        <el-table-column  :label="$t('m.Option')" width="130" align="center">
          <template slot-scope="{row}">
            <icon-btn name="Edit" icon="edit" style="color: #409EFF;" @click.native="openUserDialog(row.id)"></icon-btn>
            <icon-btn name="Delete" icon="trash" style="color: #F56C6C; background-color: red; border-radius: 10px;" @click.native="deleteUsers([row.id])"></icon-btn>
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
      <span slot="title" style="color: #82a69a; font-weight: bold;">{{$t('m.Import_User')}}
        <el-popover placement="right" trigger="hover">
          <p>Solo se admiten archivos CSV sin encabezados; consulta el <a
            href="http://docs.onlinejudge.me/#/onlinejudge/guide/import_users">link</a> para obtener más detalles.</p>
          <i slot="reference" class="el-icon-fa-question-circle import-user-icon"></i>
        </el-popover>
      </span>
      <el-upload v-if="!uploadUsers.length"
                 action=""
                 :show-file-list="false"
                 accept=".csv"
                 :before-upload="handleUsersCSV">
        <el-button icon="el-icon-fa-upload" type="primary">Elegir Archivo</el-button>
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
                     @click="handleUsersUpload">Importar Usuarios
          </el-button>
          <el-button 
                     icon="el-icon-fa-undo"
                     @click="handleResetData" style="border-radius: 10px !important;
    height: 40px !important; 
    padding: 0 20px !important;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background-color: #A60550 !important;
    font-weight: 600;
    color: white;
    font-size: 14px;">Reiniciar
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
      <span slot="title" style="color: #82a69a; font-weight: bold;">
        {{ $t('m.Generate_User') }}
      </span>
      <el-form :model="formGenerateUser" :rules="generateRules" ref="formGenerateUser">
        <el-row type="flex" justify="space-between">
          <el-col :span="4">
            <el-form-item :label="$t('m.Prefix')" prop="prefix" style="font-weight: bold;">
              <el-input v-model="formGenerateUser.prefix" :placeholder="$t('m.Prefix')"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item :label="$t('m.Suffix')" prop="suffix" style="font-weight: bold;">
              <el-input v-model="formGenerateUser.suffix" :placeholder="$t('m.Suffix')"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item :label="$t('m.Start_Number')" prop="number_from" required style="font-weight: bold;">
              <el-input-number v-model="formGenerateUser.number_from" :min="0" style="width: 100%"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item :label="$t('m.End_Number')" prop="number_to" required style="font-weight: bold;">
              <el-input-number v-model="formGenerateUser.number_to" :min="0" style="width: 100%"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item :label="$t('m.Password_Length')" prop="password_length" required style="font-weight: bold;">
              <el-input v-model.number="formGenerateUser.password_length"
                        placeholder="Password Length"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item>
          <el-button type="primary" @click="generateUser" icon="el-icon-fa-users" :loading="loadingGenerate">{{ $t('m.Generate_and_Export') }}
          </el-button>
          <span class="userPreview" v-if="formGenerateUser.number_from && formGenerateUser.number_to &&
                                          formGenerateUser.number_from <= formGenerateUser.number_to">
            Los nombres de usuario serán {{formGenerateUser.prefix + formGenerateUser.number_from + formGenerateUser.suffix}},
            <span v-if="formGenerateUser.number_from + 1 < formGenerateUser.number_to">
              {{formGenerateUser.prefix + (formGenerateUser.number_from + 1) + formGenerateUser.suffix + '...'}}
            </span>
            <span v-if="formGenerateUser.number_from + 1 <= formGenerateUser.number_to">
              {{formGenerateUser.prefix + formGenerateUser.number_to + formGenerateUser.suffix}}
            </span>
          </span>
        </el-form-item>
      </el-form>
    </Panel>
    <!--Cuadro de dialogo-->
    <el-dialog :title="$t('m.User_Info')" 
    :visible.sync="showUserDialog" 
    :close-on-click-modal="false" 
    width="900px"
  custom-class="user-edit-dialog">
      <el-form :model="user" :rules="userRules" ref="userForm" label-width="150px" label-position="left">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('m.User_Username')" prop="username" required>
              <el-input v-model="user.username"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('m.User_Real_Name')" prop="real_name" required>
              <el-input v-model="user.real_name"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('m.User_Email')" prop="email" required>
              <el-input v-model="user.email"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('m.User_New_Password')" prop="password">
              <el-input v-model="user.password"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('m.User_Type')" >
              <el-select v-model="user.admin_type">
                <el-option :label="$t('m.Regular_User')" value="Regular User"></el-option>
                <el-option label="Admin" value="Admin"></el-option>
                <el-option label="Super Admin" value="Super Admin"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('m.Problem_Permission')" width="250px">
              <el-select v-model="user.problem_permission" :disabled="user.admin_type!=='Admin'">
                <el-option label="None" value="None"></el-option>
                <el-option label="Own" value="Own"></el-option>
                <el-option label="All" value="All"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="$t('m.Two_Factor_Auth')">
              <el-switch
                v-model="user.two_factor_auth"
                :disabled="!user.real_tfa"
                active-color="#BDF2D4"
                inactive-color="#A60550">
              </el-switch>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Open Api">
              <el-switch
                v-model="user.open_api"
                active-color="#BDF2D4"
                inactive-color="#A60550">
              </el-switch>
            </el-form-item>
          </el-col>
          <el-col :span="8">
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
        <cancel @click.native="showUserDialog = false" style="color: white; background-color: #A60550;">Cancel</cancel>
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
          callback(new Error('El correo es obligatorio'))
        } else if (!emailRegex.test(value)) {
          callback(new Error('Formato de correo inválido'))
        } else {
          callback()
        }
      }
      const validateOptionalPassword = (rule, value, callback) => {
        if (value && value.length < 6) {
          callback(new Error('La contraseña debe tener al menos 6 caracteres'))
        } else {
          callback()
        }
      }
      const validateNumberTo = (rule, value, callback) => {
        if (value === null || value === undefined || value === '') {
          callback(new Error('Número final es obligatorio'))
        } else if (!Number.isInteger(value)) {
          callback(new Error('Debe ser un entero'))
        } else if (value < this.formGenerateUser.number_from) {
          callback(new Error('El número final debe ser mayor o igual al inicial'))
        } else {
          callback()
        }
      }
      const validatePasswordLength = (rule, value, callback) => {
        const num = Number(value)
        if (!Number.isInteger(num) || num < 6 || num > 16) {
          callback(new Error('La longitud debe ser un entero entre 6 y 16'))
        } else {
          callback()
        }
      }
      return {
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
            {required: true, message: 'El usuario es obligatorio', trigger: 'blur'},
            {min: 1, max: 32, message: 'El usuario debe tener entre 1 y 32 caracteres', trigger: 'blur'}
          ],
          real_name: [
            {required: true, message: 'El nombre real es obligatorio', trigger: 'blur'},
            {max: 32, message: 'Máximo 32 caracteres', trigger: 'blur'}
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
            {max: 16, message: 'Máximo 16 caracteres', trigger: 'blur'}
          ],
          suffix: [
            {max: 16, message: 'Máximo 16 caracteres', trigger: 'blur'}
          ],
          number_from: [
            {required: true, message: 'Número inicial es obligatorio', type: 'number', trigger: 'blur'}
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
    },
    methods: {
      // 切换页码回调
      currentChange (page) {
        this.currentPage = page
        this.getUserList(page)
      },
      // 提交修改用户的信息
      saveUser () {
        this.$refs.userForm.validate((valid) => {
          if (!valid) {
            this.$error('Por favor, corrige los campos con errores')
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
        this.$confirm('¿Estás seguro de eliminar al usuario? Los recursos asociados creados por este usuario también se eliminarán, como problemas, concursos, anuncios, etc.', 'Confirmación', {
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
            this.$error('Por favor, valide los campos con errores')
            return
          }
          this.loadingGenerate = true
          let data = Object.assign({}, this.formGenerateUser)
          api.generateUser(data).then(res => {
            this.loadingGenerate = false
            let url = '/admin/generate_user?file_id=' + res.data.data.file_id
            utils.downloadFile(url).then(() => {
              this.$alert('Todos los usuarios se crearon con éxito; las hojas de datos de los usuarios se han descargado en su disco.', 'Notificación', {
                confirmButtonText: 'OK',
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
              this.$warning(delta + ' usuarios han sido filtrados debido a valores vacíos')
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
    color: #82a69a;
    margin-left: 4px;
  }

  .userPreview {
    padding-left: 10px;
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
    
    font-weight: 600;
    font-size: 14px;

    &:hover {
      background-color: #245965 !important;
    }

    i {
      margin-right: 8px;
      font-size: 16px;
    }
  }

</style>

