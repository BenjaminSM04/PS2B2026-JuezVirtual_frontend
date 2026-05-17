<template>
  <div class="view">
    <Panel :title="$t('m.SMTP_Config')">
      <el-form label-position="left" label-width="70px" :model="smtp" :rules="smtpRules" ref="smtpForm">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('m.Server')" prop="server" required>
              <el-input v-model="smtp.server" placeholder="smtp.ejemplo.com"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('m.Port')" prop="port" required>
              <el-input type="number" v-model.number="smtp.port" placeholder="Puerto del Servidor SMTP"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('m.Email')" prop="email" required>
              <el-input v-model="smtp.email" placeholder="email@ejemplo.com"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('m.Password')" prop="password" label-width="90px" required>
              <el-input v-model="smtp.password" type="password" placeholder="Contraseña del Servidor SMTP"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="TLS">
              <el-switch
                v-model="smtp.tls"
                active-color="#A60550"
                  inactive-color="#987284">
              </el-switch>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <el-button type="primary" icon="el-icon-fa-save" @click="saveSMTPConfig">{{$t('m.Save')}}</el-button>
      <el-button type="warning" icon="el-icon-fa-envelope" @click="testSMTPConfig"
                 v-if="saved" :loading="loadingBtnTest">{{$t('m.Send_Test_Email')}}</el-button>
    </Panel>

    <Panel :title="$t('m.Website_Config')">
      <el-form label-position="left" label-width="100px" ref="websiteForm" :model="websiteConfig" :rules="websiteRules">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item :label="$t('m.Base_Url')" prop="website_base_url" required>
              <el-input v-model="websiteConfig.website_base_url" placeholder="https://example.com"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="$t('m.Name')" prop="website_name" required>
              <el-input v-model="websiteConfig.website_name" placeholder="Juez Virtual"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="$t('m.Shortcut')" prop="website_name_shortcut" required>
              <el-input v-model="websiteConfig.website_name_shortcut" placeholder="oj"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item :label="$t('m.Footer')" prop="website_footer">
              <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 4}" v-model="websiteConfig.website_footer"
                        placeholder="Pie de Página de la pagina HTML"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-col :span="12">
              <el-form-item :label="$t('m.Allow_Register')" label-width="200px">
                <el-switch
                  v-model="websiteConfig.allow_register"
                  active-color="#A60550"
                  inactive-color="#987284">
                </el-switch>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item 
                  :label="$t('m.Submission_List_Show_All')" 
                  label-width="260px">
                <el-switch
                  v-model="websiteConfig.submission_list_show_all"
                  active-color="#A60550"
                  inactive-color="#987284">
                </el-switch>
              </el-form-item>
            </el-col>
          </el-col>
        </el-row>
      </el-form>
      <save @click.native="saveWebsiteConfig"></save>
    </Panel>
  </div>
</template>

<script>
  import api from '../../api.js'

  export default {
    name: 'Conf',
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
      const validatePort = (rule, value, callback) => {
        const num = Number(value)
        if (value === '' || value === null || value === undefined) {
          callback(new Error('El puerto es obligatorio'))
        } else if (!Number.isInteger(num) || num < 1 || num > 65535) {
          callback(new Error('El puerto debe ser un entero entre 1 y 65535'))
        } else {
          callback()
        }
      }
      const validateUrl = (rule, value, callback) => {
        if (!value) {
          callback(new Error('La URL base es obligatoria'))
        } else if (!/^https?:\/\/.+/.test(value)) {
          callback(new Error('La URL debe comenzar con http:// o https://'))
        } else {
          callback()
        }
      }
      return {
        init: false,
        saved: false,
        loadingBtnTest: false,
        smtp: {
          server: '',
          port: '',
          password: '',
          email: '',
          tls: true
        },
        websiteConfig: {},
        smtpRules: {
          server: [
            {required: true, message: 'El servidor SMTP es obligatorio', trigger: 'blur'}
          ],
          port: [
            {required: true, validator: validatePort, trigger: 'blur'}
          ],
          email: [
            {required: true, validator: validateEmail, trigger: 'blur'}
          ],
          password: [
            {required: true, message: 'La contraseña es obligatoria', trigger: 'blur'}
          ]
        },
        websiteRules: {
          website_base_url: [
            {required: true, validator: validateUrl, trigger: 'blur'}
          ],
          website_name: [
            {required: true, message: 'El nombre del sitio es obligatorio', trigger: 'blur'},
            {max: 128, message: 'Máximo 128 caracteres', trigger: 'blur'}
          ],
          website_name_shortcut: [
            {required: true, message: 'El acrónimo es obligatorio', trigger: 'blur'},
            {max: 32, message: 'Máximo 32 caracteres', trigger: 'blur'}
          ]
        }
      }
    },
    mounted () {
      api.getSMTPConfig().then(res => {
        if (res.data.data) {
          this.smtp = res.data.data
        } else {
          this.init = true
          this.$warning('Por favor, configure el SMTP primero')
        }
      })
      api.getWebsiteConfig().then(res => {
        this.websiteConfig = res.data.data
      }).catch(() => {
      })
    },
    methods: {
      saveSMTPConfig () {
        this.$refs.smtpForm.validate((valid) => {
          if (!valid) {
            this.$error('Por favor, corrige los campos con errores')
            return
          }
          if (!this.init) {
            api.editSMTPConfig(this.smtp).then(() => {
              this.saved = true
            }, () => {
            })
          } else {
            api.createSMTPConfig(this.smtp).then(() => {
              this.saved = true
            }, () => {
            })
          }
        })
      },
      testSMTPConfig () {
        this.$prompt('Por favor, ingresa tu correo electrónico', 'Prueba de SMTP', {
          inputPattern: /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/,
          inputErrorMessage: 'Formato de correo inválido'
        }).then(({value}) => {
          this.loadingBtnTest = true
          api.testSMTPConfig(value).then(() => {
            this.loadingBtnTest = false
          }, () => {
            this.loadingBtnTest = false
          })
        }).catch(() => {
        })
      },
      saveWebsiteConfig () {
        this.$refs.websiteForm.validate((valid) => {
          if (!valid) {
            this.$error('Por favor, corrige los campos con errores')
            return
          }
          api.editWebsiteConfig(this.websiteConfig).then(() => {
          }).catch(() => {
          })
        })
      }
    }
  }
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Funnel+Display:wght@300;400;500;600;700&display=swap");

.admin-shell__eyebrow {
  font-family: 'Funnel Display', sans-serif;
}

.admin-shell__title {
  font-family: 'Funnel Display', sans-serif;
}

.panel {
    background: #ffffff !important;
    border-radius: 20px !important;
    border: none !important;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04) !important;
    overflow: hidden;
    padding: 0 10px !important;
    font-family: 'Funnel Display', sans-serif;
}

.view {
  font-family: 'Funnel Display', sans-serif;
}
.view .title{
  color:#090808 !important;
  font-size: 25px !important;
  font-weight: bold !important;
}
.view .el-form-item__label {
  font-size: 20px;
  color: black;
  font-weight:400 ;
}
.view .el-form-item__label:before {
  display: none !important;
}
.view .el-input__inner {
  border: 2px solid #987284;   
  border-radius: 10px;        
  height: 40px;             
  font-size: 15px;            
  padding: 0 12px;             
  max-width: 500px;
}
.view .el-input__inner::placeholder {
  color: #ADADAD;
  font-weight: bold;
  font-family: 'Funnel Display', sans-serif;
}
.view .el-form-item__content {
  margin-left: 120px !important; 
}
.view .el-button{
  background-color: #003B4A;
  color: #ffffff;
  font-size: 16px;
  font-family: 'Funnel Display', sans-serif;
  font-weight: bold;
  border-color: #003B4A;
  border-radius: 10px;
  width: 140px !important;
  height: 37.98px !important;
  padding: 0;
  line-height: 37.98px ;
  /*transition: all 0.3s ease;*/
}

.view .el-button:hover {
  background-color: #245965;
  border-color: #245965;
  /*transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);*/
}
  
.view .el-textarea__inner {
  border: 2px solid #987284;
  border-radius: 10px;
  color: #ADADAD;
}

.view .el-form-item__label{
  font-size: 18px;
}

</style>
