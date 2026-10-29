<template>
  <div class="view conf-view">
    <div class="v2-page-heading">
      <span class="v2-eyebrow"><i class="el-icon-lock" aria-hidden="true"></i> {{ $t('m.V2_Privacy') }}</span>
      <p>{{ $t('m.V2_Settings_Description') }}</p>
    </div>
    <el-tabs v-model="activeTab">
      <el-tab-pane :label="$t('m.V2_Email_Tab')" name="email">
        <div class="settings-layout">
          <Panel :title="$t('m.SMTP_Config')">
            <p class="v2-description">{{ $t('m.V2_Email_Description') }}</p>
            <div class="v2-actions">
              <el-button size="small" @click="useResend">{{ $t('m.SMTP_Use_Resend') }}</el-button
              ><span class="settings-save-state" aria-live="polite">{{
                $t(!saved ? 'm.V2_Needs_Config' : smtpDirty ? 'm.V2_Unsaved' : 'm.V2_Saved')
              }}</span>
            </div>
            <p v-if="smtp.server === 'smtp.resend.com'" class="settings-callout" style="margin-top: 18px">
              {{ $t('m.V2_Resend_Domain') }}
            </p>
            <el-form
              ref="smtpForm"
              :model="smtp"
              :rules="smtpRules"
              label-position="top"
              :disabled="!smtpLoaded"
              @submit.native.prevent
            >
              <el-row :gutter="20">
                <el-col :xs="24" :sm="16"
                  ><el-form-item :label="$t('m.Server')" prop="server" required
                    ><el-input
                      v-model="smtp.server"
                      placeholder="smtp.example.com"
                      autocomplete="off"
                    ></el-input></el-form-item
                ></el-col>
                <el-col :xs="24" :sm="8"
                  ><el-form-item :label="$t('m.Port')" prop="port" required
                    ><el-input
                      type="number"
                      v-model.number="smtp.port"
                      :placeholder="$t('m.SMTP_Port_Placeholder')"
                      :min="1"
                      :max="65535"
                    ></el-input></el-form-item
                ></el-col>
                <el-col :xs="24" :sm="12"
                  ><el-form-item :label="$t('m.SMTP_Username')"
                    ><el-input
                      v-model="smtp.username"
                      :placeholder="$t('m.SMTP_Username_Help')"
                      autocomplete="off"
                    ></el-input></el-form-item
                ></el-col>
                <el-col :xs="24" :sm="12"
                  ><el-form-item :label="$t('m.SMTP_Encryption')"
                    ><el-select v-model="smtpEncryption" style="width: 100%"
                      ><el-option label="SSL/TLS" value="ssl"></el-option
                      ><el-option label="STARTTLS" value="starttls"></el-option
                      ><el-option
                        :label="$t('m.SMTP_No_Encryption')"
                        value="none"
                      ></el-option></el-select></el-form-item
                ></el-col>
                <el-col :span="24"
                  ><el-form-item :label="$t('m.Password')" prop="password" :required="init"
                    ><PasswordInput
                      admin
                      v-model="smtp.password"
                      :placeholder="init ? $t('m.Password') : $t('m.SMTP_Keep_Password')"
                      autocomplete="new-password"
                  /></el-form-item>
                  <p class="settings-hint">{{ $t('m.V2_Credential_Help') }}</p></el-col
                >
                <el-col :xs="24" :sm="12"
                  ><el-form-item :label="$t('m.V2_Sender_Name')"
                    ><el-input
                      v-model="smtp.sender_name"
                      :placeholder="$t('m.V2_Sender_Name_Help')"
                      :maxlength="128"
                    ></el-input></el-form-item
                ></el-col>
                <el-col :xs="24" :sm="12"
                  ><el-form-item :label="$t('m.Email')" prop="email" required
                    ><el-input
                      v-model="smtp.email"
                      placeholder="email@example.com"
                      type="email"
                      autocomplete="off"
                    ></el-input></el-form-item
                ></el-col>
              </el-row>
            </el-form>
            <el-button
              v-if="smtpLoaded"
              type="primary"
              icon="el-icon-fa-save"
              :loading="smtpSaving"
              @click="saveSMTPConfig"
              >{{ $t('m.Save') }}</el-button
            >
            <el-button v-else icon="el-icon-refresh" @click="loadSMTP">{{ $t('m.V2_Retry') }}</el-button>
            <section class="settings-test">
              <h3>{{ $t('m.V2_Email_Test_Title') }}</h3>
              <p class="settings-hint">{{ $t('m.V2_Email_Test_Help') }}</p>
              <label for="smtp-test-recipient" class="v2-eyebrow">{{ $t('m.V2_Test_Recipient') }}</label>
              <div class="settings-test__actions">
                <el-input
                  id="smtp-test-recipient"
                  v-model="testRecipient"
                  type="email"
                  :disabled="loadingBtnTest"
                  :placeholder="$t('m.V2_Test_Recipient_Placeholder')"
                ></el-input
                ><el-button
                  type="primary"
                  icon="el-icon-fa-envelope"
                  :loading="loadingBtnTest"
                  :disabled="!saved || smtpDirty || smtpSaving || !smtpLoaded"
                  @click="testSMTPConfig"
                  >{{ $t('m.Send_Test_Email') }}</el-button
                >
              </div>
              <p v-if="!saved || smtpDirty" class="settings-hint">{{ $t('m.V2_Save_Before_Test') }}</p>
              <p v-if="testSuccess" class="settings-callout" role="status">{{ $t('m.V2_Test_Sent') }}</p>
            </section>
          </Panel>
          <aside>
            <Panel :title="$t('m.V2_Connection_Title')">
              <div class="settings-status">
                <div class="settings-status__item">
                  <span>{{ $t('m.SMTP_Configured') }}</span
                  ><span class="v2-chip" :class="{ 'v2-chip--mint': health.smtp_configured }">{{
                    $t(health.smtp_configured ? 'm.V2_Ready' : 'm.V2_Needs_Config')
                  }}</span>
                </div>
                <div class="settings-status__item">
                  <span>{{ $t('m.Redis_Reachable') }}</span
                  ><span>{{ $t(health.redis_reachable ? 'm.OK' : 'm.Down') }}</span>
                </div>
                <div class="settings-status__item">
                  <span>{{ $t('m.Dramatiq_Worker') }}</span
                  ><span>{{ $t(health.dramatiq_worker_alive ? 'm.Alive' : 'm.No_Worker') }}</span>
                </div>
              </div>
              <p class="settings-hint">{{ $t('m.V2_Connection_Help') }}</p>
              <el-button size="small" icon="el-icon-refresh" @click="refreshHealth" :loading="healthLoading">{{
                $t('m.Refresh')
              }}</el-button>
            </Panel>
            <div v-if="!health.website_base_url_ok" class="settings-callout settings-callout--rose">
              {{ $t('m.V2_Diagnostic_Warning') }}<br /><el-button type="text" @click="activeTab = 'website'"
                >{{ $t('m.V2_Website_Tab') }} &rarr;</el-button
              >
            </div>
          </aside>
        </div>
      </el-tab-pane>
      <el-tab-pane :label="$t('m.V2_Website_Tab')" name="website">
        <Panel :title="$t('m.Website_Config')">
          <p class="settings-hint">{{ $t('m.V2_Site_Description') }}</p>
          <el-form
            ref="websiteForm"
            :model="websiteConfig"
            :rules="websiteRules"
            label-position="top"
            @submit.native.prevent
          >
            <el-row :gutter="20">
              <el-col :span="24"
                ><el-form-item :label="$t('m.Base_Url')" prop="website_base_url" required
                  ><el-input
                    v-model="websiteConfig.website_base_url"
                    placeholder="https://lj.isilp.com"
                  ></el-input></el-form-item
              ></el-col>
              <el-col :xs="24" :sm="12"
                ><el-form-item :label="$t('m.Name')" prop="website_name" required
                  ><el-input v-model="websiteConfig.website_name"></el-input></el-form-item
              ></el-col>
              <el-col :xs="24" :sm="12"
                ><el-form-item :label="$t('m.Shortcut')" prop="website_name_shortcut" required
                  ><el-input v-model="websiteConfig.website_name_shortcut"></el-input></el-form-item
              ></el-col>
              <el-col :span="24"
                ><el-form-item :label="$t('m.Footer')" prop="website_footer"
                  ><el-input
                    type="textarea"
                    :autosize="{ minRows: 3, maxRows: 6 }"
                    v-model="websiteConfig.website_footer"
                  ></el-input></el-form-item
              ></el-col>
              <el-col :xs="24" :sm="12"
                ><el-form-item :label="$t('m.Allow_Register')"
                  ><el-switch v-model="websiteConfig.allow_register"></el-switch></el-form-item
              ></el-col>
              <el-col :xs="24" :sm="12"
                ><el-form-item :label="$t('m.Submission_List_Show_All')"
                  ><el-switch v-model="websiteConfig.submission_list_show_all"></el-switch></el-form-item
              ></el-col>
            </el-row>
          </el-form>
          <el-button type="primary" icon="el-icon-fa-save" :loading="websiteSaving" @click="saveWebsiteConfig">{{
            $t('m.Save')
          }}</el-button>
        </Panel>
      </el-tab-pane>
      <el-tab-pane :label="$t('m.V2_Diagnostics_Tab')" name="diagnostics">
        <Panel :title="$t('m.Email_Diagnostics')">
          <p class="settings-hint">{{ $t('m.V2_Diagnostic_Help') }}</p>
          <div class="settings-status">
            <div class="settings-status__item">
              <span>{{ $t('m.Website_Base_Url') }}</span
              ><span>{{ health.website_base_url }}</span>
            </div>
            <div class="settings-status__item">
              <span>{{ $t('m.SMTP_Configured') }}</span
              ><span>{{ $t(health.smtp_configured ? 'm.OK' : 'm.Missing') }}</span>
            </div>
            <div class="settings-status__item">
              <span>{{ $t('m.Redis_Reachable') }}</span
              ><span>{{ $t(health.redis_reachable ? 'm.OK' : 'm.Down') }}</span>
            </div>
            <div class="settings-status__item">
              <span>{{ $t('m.Dramatiq_Worker') }}</span
              ><span>{{ $t(health.dramatiq_worker_alive ? 'm.Alive' : 'm.No_Worker') }}</span>
            </div>
          </div>
          <el-button size="small" icon="el-icon-refresh" @click="refreshHealth" :loading="healthLoading">{{
            $t('m.Refresh')
          }}</el-button>
        </Panel>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import api from '../../api.js'
import PasswordInput from '@/components/PasswordInput.vue'

function signature (data) {
  return JSON.stringify([
    data.server,
    Number(data.port),
    data.username || '',
    data.email,
    data.sender_name || '',
    Boolean(data.ssl),
    Boolean(data.tls)
  ])
}

export default {
  name: 'Conf',
  components: { PasswordInput },
  data () {
    const emailRegex =
      /^[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?$/
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
      activeTab: 'email',
      smtpSaving: false,
      smtpLoaded: false,
      websiteSaving: false,
      testRecipient: '',
      testSuccess: false,
      savedSMTPSignature: '',
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
        username: '',
        sender_name: '',
        ssl: false,
        tls: true
      },
      websiteConfig: {},
      smtpRules: {
        server: [{ required: true, message: this.$i18n.t('m.SMTP_Server_Required'), trigger: 'blur' }],
        port: [{ required: true, validator: validatePort, trigger: 'blur' }],
        email: [{ required: true, validator: validateEmail, trigger: 'blur' }],
        password: [
          {
            validator: (rule, value, callback) =>
              callback(this.init && !value ? new Error(this.$t('m.Password_Required')) : undefined),
            trigger: 'blur'
          }
        ]
      },
      websiteRules: {
        website_base_url: [{ required: true, validator: validateUrl, trigger: 'blur' }],
        website_name: [
          { required: true, message: this.$i18n.t('m.Website_Name_Required'), trigger: 'blur' },
          { max: 128, message: this.$i18n.t('m.Max_128_Chars'), trigger: 'blur' }
        ],
        website_name_shortcut: [
          { required: true, message: this.$i18n.t('m.Shortcut_Required'), trigger: 'blur' },
          { max: 32, message: this.$i18n.t('m.Max_32_Chars'), trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    smtpDirty () {
      return signature(this.smtp) !== this.savedSMTPSignature || Boolean(this.smtp.password)
    },
    smtpEncryption: {
      get () {
        return this.smtp.ssl ? 'ssl' : this.smtp.tls ? 'starttls' : 'none'
      },
      set (value) {
        this.$set(this.smtp, 'ssl', value === 'ssl')
        this.$set(this.smtp, 'tls', value === 'starttls')
      }
    }
  },
  mounted () {
    this.loadSMTP()
    api
      .getWebsiteConfig()
      .then((res) => {
        this.websiteConfig = res.data.data
      })
      .catch(() => {})
    this.refreshHealth()
  },
  methods: {
    loadSMTP () {
      this.smtpLoaded = false
      return api
        .getSMTPConfig()
        .then((res) => {
          if (res.data.data) {
            this.smtp = Object.assign({}, this.smtp, res.data.data, { password: '' })
            this.saved = true
          } else {
            this.init = true
          }
          this.savedSMTPSignature = signature(this.smtp)
          this.smtpLoaded = true
        })
        .catch(() => {})
    },
    useResend () {
      this.smtp.server = 'smtp.resend.com'
      this.smtp.port = 465
      this.$set(this.smtp, 'username', 'resend')
      this.smtpEncryption = 'ssl'
    },
    saveSMTPConfig () {
      if (this.smtpSaving || !this.smtpLoaded) return
      this.$refs.smtpForm.validate((valid) => {
        if (!valid) {
          this.$error(this.$t('m.Fix_Form_Errors'))
          return
        }
        const data = Object.assign({}, this.smtp)
        if (!data.password) delete data.password
        this.smtpSaving = true
        const request = this.init ? api.createSMTPConfig(data) : api.editSMTPConfig(data)
        request
          .then(() => {
            this.saved = true
            this.init = false
            this.savedSMTPSignature = signature(data)
            if (this.smtp.password === (data.password || '')) this.smtp.password = ''
            this.$success(this.$t('m.V2_Saved'))
            this.refreshHealth()
          })
          .catch(() => {})
          .then(() => {
            this.smtpSaving = false
          })
      })
    },
    testSMTPConfig () {
      if (!this.saved || this.smtpDirty || this.smtpSaving || this.loadingBtnTest) return
      const recipient = this.testRecipient.trim()
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
        this.$error(this.$t('m.Email_Invalid'))
        return
      }
      this.loadingBtnTest = true
      this.testSuccess = false
      api
        .testSMTPConfig(recipient)
        .then(() => {
          this.testSuccess = true
          this.$success(this.$t('m.V2_Test_Sent'))
        })
        .catch(() => {})
        .then(() => {
          this.loadingBtnTest = false
        })
    },
    saveWebsiteConfig () {
      if (this.websiteSaving) return
      this.$refs.websiteForm.validate((valid) => {
        if (!valid) {
          this.$error(this.$t('m.Fix_Form_Errors'))
          return
        }
        this.websiteSaving = true
        api
          .editWebsiteConfig(Object.assign({}, this.websiteConfig))
          .then(() => {
            this.$success(this.$t('m.V2_Saved'))
            this.refreshHealth()
          })
          .catch(() => {})
          .then(() => {
            this.websiteSaving = false
          })
      })
    },
    refreshHealth () {
      this.healthLoading = true
      api.getEmailHealth().then(
        (res) => {
          this.health = res.data.data
          this.healthLoading = false
        },
        () => {
          this.healthLoading = false
        }
      )
    }
  }
}
</script>
