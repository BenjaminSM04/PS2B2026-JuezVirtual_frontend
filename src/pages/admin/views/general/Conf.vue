<template>
  <div class="view conf-view">
    <Panel :title="$t('m.Email_Diagnostics')">
      <div class="email-health">
        <div class="email-health__row">
          <span class="email-health__label">{{$t('m.SMTP_Configured')}}</span>
          <el-tag :type="health.smtp_configured ? 'success' : 'danger'" size="small">
            {{ health.smtp_configured ? $t('m.OK') : $t('m.Missing') }}
          </el-tag>
          <span v-if="!health.smtp_configured && health.smtp_missing_keys && health.smtp_missing_keys.length"
                class="email-health__detail">
            ({{ health.smtp_missing_keys.join(', ') }})
          </span>
        </div>
        <div class="email-health__row">
          <span class="email-health__label">{{$t('m.Website_Base_Url')}}</span>
          <el-tag :type="health.website_base_url_ok ? 'success' : 'warning'" size="small">
            {{ health.website_base_url_ok ? $t('m.OK') : $t('m.Default_Localhost') }}
          </el-tag>
          <span class="email-health__detail">{{ health.website_base_url }}</span>
        </div>
        <div class="email-health__row">
          <span class="email-health__label">{{$t('m.Redis_Reachable')}}</span>
          <el-tag :type="health.redis_reachable ? 'success' : 'danger'" size="small">
            {{ health.redis_reachable ? $t('m.OK') : $t('m.Down') }}
          </el-tag>
        </div>
        <div class="email-health__row">
          <span class="email-health__label">{{$t('m.Dramatiq_Worker')}}</span>
          <el-tag :type="health.dramatiq_worker_alive ? 'success' : 'warning'" size="small">
            {{ health.dramatiq_worker_alive ? $t('m.Alive') : $t('m.No_Worker') }}
          </el-tag>
        </div>
        <el-button size="small" icon="el-icon-refresh" @click="refreshHealth" :loading="healthLoading">
          {{$t('m.Refresh')}}
        </el-button>
      </div>
    </Panel>

    <Panel :title="$t('m.SMTP_Config')">
      <el-form label-position="left" label-width="70px" :model="smtp" :rules="smtpRules" ref="smtpForm">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12">
            <el-form-item :label="$t('m.Server')" prop="server" required>
              <el-input v-model="smtp.server" placeholder="smtp.example.com"></el-input>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item :label="$t('m.Port')" prop="port" required>
              <el-input type="number" v-model.number="smtp.port" :placeholder="$t('m.SMTP_Port_Placeholder')"></el-input>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item :label="$t('m.Email')" prop="email" required>
              <el-input v-model="smtp.email" placeholder="email@example.com"></el-input>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item :label="$t('m.Password')" prop="password" label-width="90px" required>
              <el-input v-model="smtp.password" type="password" :placeholder="$t('m.SMTP_Password_Placeholder')"></el-input>
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
          <el-col :xs="24" :sm="8">
            <el-form-item :label="$t('m.Base_Url')" prop="website_base_url" required>
              <el-input v-model="websiteConfig.website_base_url" placeholder="https://example.com"></el-input>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="8">
            <el-form-item :label="$t('m.Name')" prop="website_name" required>
              <el-input v-model="websiteConfig.website_name" placeholder="Juez Virtual"></el-input>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="8">
            <el-form-item :label="$t('m.Shortcut')" prop="website_name_shortcut" required>
              <el-input v-model="websiteConfig.website_name_shortcut" placeholder="oj"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item :label="$t('m.Footer')" prop="website_footer">
              <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 4}" v-model="websiteConfig.website_footer"
                        :placeholder="$t('m.Website_Footer_Placeholder')"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-col :xs="24" :sm="12">
              <el-form-item :label="$t('m.Allow_Register')" label-width="200px">
                <el-switch
                  v-model="websiteConfig.allow_register"
                  active-color="#A60550"
                  inactive-color="#987284">
                </el-switch>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12">
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
          callback(new Error(this.$i18n.t('m.Email_Required')))
        } else if (!emailRegex.test(value)) {
          callback(new Error(this.$i18n.t('m.Email_Invalid')))
        } else {
          callback()
        }
      }
      const validatePort = (rule, value, callback) => {
        const num = Number(value)
        if (value === '' || value === null || value === undefined) {
          callback(new Error(this.$i18n.t('m.Port_Required')))
        } else if (!Number.isInteger(num) || num < 1 || num > 65535) {
          callback(new Error(this.$i18n.t('m.Port_Invalid')))
        } else {
          callback()
        }
      }
      const validateUrl = (rule, value, callback) => {
        if (!value) {
          callback(new Error(this.$i18n.t('m.Base_Url_Required')))
        } else if (!/^https?:\/\/.+/.test(value)) {
          callback(new Error(this.$i18n.t('m.Url_Invalid')))
        } else {
          callback()
        }
      }
      return {
        init: false,
        saved: false,
        loadingBtnTest: false,
        healthLoading: false,
        health: {
          smtp_configured: false,
          smtp_missing_keys: [],
          website_base_url: '',
          website_base_url_ok: false,
          redis_reachable: false,
          dramatiq_worker_alive: false
        },
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
            {required: true, message: this.$i18n.t('m.SMTP_Server_Required'), trigger: 'blur'}
          ],
          port: [
            {required: true, validator: validatePort, trigger: 'blur'}
          ],
          email: [
            {required: true, validator: validateEmail, trigger: 'blur'}
          ],
          password: [
            {required: true, message: this.$i18n.t('m.Password_Required'), trigger: 'blur'}
          ]
        },
        websiteRules: {
          website_base_url: [
            {required: true, validator: validateUrl, trigger: 'blur'}
          ],
          website_name: [
            {required: true, message: this.$i18n.t('m.Website_Name_Required'), trigger: 'blur'},
            {max: 128, message: this.$i18n.t('m.Max_128_Chars'), trigger: 'blur'}
          ],
          website_name_shortcut: [
            {required: true, message: this.$i18n.t('m.Shortcut_Required'), trigger: 'blur'},
            {max: 32, message: this.$i18n.t('m.Max_32_Chars'), trigger: 'blur'}
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
          this.$warning(this.$i18n.t('m.Configure_SMTP_First'))
        }
      })
      api.getWebsiteConfig().then(res => {
        this.websiteConfig = res.data.data
      }).catch(() => {
      })
      this.refreshHealth()
    },
    methods: {
      saveSMTPConfig () {
        this.$refs.smtpForm.validate((valid) => {
          if (!valid) {
            this.$error(this.$i18n.t('m.Fix_Form_Errors'))
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
        this.$prompt(this.$i18n.t('m.Input_Email'), this.$i18n.t('m.SMTP_Test'), {
          inputPattern: /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/,
          inputErrorMessage: this.$i18n.t('m.Email_Invalid')
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
            this.$error(this.$i18n.t('m.Fix_Form_Errors'))
            return
          }
          api.editWebsiteConfig(this.websiteConfig).then(() => {
          }).catch(() => {
          })
        })
      },
      refreshHealth () {
        this.healthLoading = true
        api.getEmailHealth().then(res => {
          this.health = res.data.data
          this.healthLoading = false
        }, () => {
          this.healthLoading = false
        })
      }
    }
  }
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Funnel+Display:wght@300;400;500;600;700&display=swap");

/* Estilos namespaced bajo .conf-view para que NO se filtren a otras pestañas
 * del admin (antes eran globales vía .view/.panel y colisionaban entre vistas). */
.conf-view {
  font-family: 'Funnel Display', sans-serif;
}

.conf-view .panel {
  background: #ffffff !important;
  border-radius: 20px !important;
  border: none !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04) !important;
  overflow: hidden;
  padding: 0 10px !important;
  font-family: 'Funnel Display', sans-serif;
}

.email-health__row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  padding: 6px 0;
}

.email-health__label {
  min-width: 180px;
  font-weight: 600;
  color: #18322f;
}

.email-health__detail {
  color: #65807b;
  font-size: 12px;
}

.conf-view .title {
  color: #090808 !important;
  font-size: 25px !important;
  font-weight: bold !important;
}

.conf-view .el-form-item__label {
  font-size: 18px;
  color: black;
  font-weight: 400;
}

.conf-view .el-form-item__label:before {
  display: none !important;
}

.conf-view .el-input__inner {
  border: 2px solid #987284;
  border-radius: 10px;
  height: 40px;
  font-size: 15px;
  padding: 0 12px;
  max-width: 500px;
}

.conf-view .el-input__inner::placeholder {
  color: #ADADAD;
  font-weight: bold;
  font-family: 'Funnel Display', sans-serif;
}

.conf-view .el-form-item__content {
  margin-left: 120px;
}

.conf-view .el-button {
  background-color: #003B4A;
  color: #ffffff;
  font-size: 16px;
  font-family: 'Funnel Display', sans-serif;
  font-weight: bold;
  border-color: #003B4A;
  border-radius: 10px;
  min-width: 140px;
  height: 37.98px;
  padding: 0 16px;
  line-height: 37.98px;
}

.conf-view .el-button:hover {
  background-color: #245965;
  border-color: #245965;
}

.conf-view .el-textarea__inner {
  border: 2px solid #987284;
  border-radius: 10px;
  color: #303133;
}

/* En móvil: etiquetas apiladas sobre el campo y sin indentación forzada. */
@media (max-width: 768px) {
  .conf-view .el-form-item__label {
    font-size: 16px;
  }
  .conf-view .el-form-item__content {
    margin-left: 0;
  }
  .conf-view .el-input__inner {
    max-width: none;
  }
  .email-health__label {
    min-width: 0;
  }
}
</style>
