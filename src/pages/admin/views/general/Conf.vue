<template>
  <div class="view">
    <Panel :title="$t('m.SMTP_Config')">
      <el-form label-position="left" label-width="70px" :model="smtp">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('m.Server')" required>
              <el-input v-model="smtp.server" placeholder="smtp.ejemplo.com"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('m.Port')" required>
              <el-input type="number" v-model="smtp.port" placeholder="Puerto del Servidor SMTP"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('m.Email')" required>
              <el-input v-model="smtp.email" placeholder="email@ejemplo.com"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('m.Password')" label-width="90px" required>
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
      <el-button type="primary" @click="saveSMTPConfig">Guardar</el-button>
      <el-button type="warning" @click="testSMTPConfig"
                 v-if="saved" :loading="loadingBtnTest">Enviar Correo de Prueba</el-button>
    </Panel>

    <Panel :title="$t('m.Website_Config')">
      <el-form label-position="left" label-width="100px" ref="form" :model="websiteConfig">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item :label="$t('m.Base_Url')" required>
              <el-input v-model="websiteConfig.website_base_url" placeholder="smtp.ejemplo.com"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="$t('m.Name')" required>
              <el-input v-model="websiteConfig.website_name" placeholder="Juez Virtual"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="$t('m.Shortcut')" required>
              <el-input v-model="websiteConfig.website_name_shortcut" placeholder="oj"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item :label="$t('m.Footer')" required>
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
        websiteConfig: {}
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
        api.editWebsiteConfig(this.websiteConfig).then(() => {
        }).catch(() => {
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
