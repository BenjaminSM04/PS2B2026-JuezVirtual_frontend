<template>
  <div class="view contest-view">
    <Panel :title="title">
      <el-form
        :model="contest"
        :rules="rules"
        ref="contestForm"
        label-position="top">

        <el-row :gutter="20">

          <el-col :span="24">
            <el-form-item prop="title">
              <template slot="label">
                <span>
                  {{ $t('m.ContestTitle') }}

                  <el-tooltip
                    :content="$t('m.Contest_Title_Tip')"
                    placement="top">
                    <i class="el-icon-info tooltip-icon"></i>
                  </el-tooltip>
                </span>
              </template>

              <el-input
                v-model="contest.title"
                :placeholder="$t('m.ContestTitle')">
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item prop="description">

              <template slot="label">
                <span>
                  {{ $t('m.ContestDescription') }}

                  <el-tooltip
                    :content="$t('m.Contest_Description_Tip')"
                    placement="top">
                    <i class="el-icon-info tooltip-icon"></i>
                  </el-tooltip>
                </span>
              </template>

              <Simditor v-model="contest.description"></Simditor>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item prop="start_time">

              <template slot="label">
                <span>
                  {{ $t('m.Contest_Start_Time') }}

                  <el-tooltip
                    :content="$t('m.Contest_Start_Time_Tip')"
                    placement="top">
                    <i class="el-icon-info tooltip-icon"></i>
                  </el-tooltip>
                </span>
              </template>
              <el-date-picker
                v-model="contest.start_time"
                type="datetime"
                format="dd/MM/yyyy HH:mm"
                :placeholder="$t('m.Contest_Start_Time')">
              </el-date-picker>

            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item prop="end_time">

              <template slot="label">
                <span>
                  {{ $t('m.Contest_End_Time') }}

                  <el-tooltip
                    :content="$t('m.Contest_End_Time_Tip')"
                    placement="top">
                    <i class="el-icon-info tooltip-icon"></i>
                  </el-tooltip>
                </span>
              </template>

              <el-date-picker
                v-model="contest.end_time"
                type="datetime"
                format="dd/MM/yyyy HH:mm"
                :placeholder="$t('m.Contest_End_Time')">
              </el-date-picker>

            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item prop="password">

              <template slot="label">
                <span>
                  {{ $t('m.Contest_Password') }}

                  <el-tooltip
                    :content="$t('m.Contest_Password_Tip')"
                    placement="top">
                    <i class="el-icon-info tooltip-icon"></i>
                  </el-tooltip>
                </span>
              </template>

              <el-input
                v-model="contest.password"
                :placeholder="$t('m.Contest_Password')">
              </el-input>

            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item>

              <template slot="label">
                <span>
                  {{ $t('m.Contest_Rule_Type') }}

                  <el-tooltip
                    :content="$t('m.Contest_Rule_Type_Tip')"
                    placement="top">
                    <i class="el-icon-info tooltip-icon"></i>
                  </el-tooltip>
                </span>
              </template>

              <el-radio
                class="radio"
                v-model="contest.rule_type"
                label="ACM"
                :disabled="disableRuleType">
                ACM
              </el-radio>

              <el-radio
                class="radio"
                v-model="contest.rule_type"
                label="OI"
                :disabled="disableRuleType">
                OI
              </el-radio>

            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item>

              <template slot="label">
                <span>
                  {{ $t('m.Real_Time_Rank') }}

                  <el-tooltip
                    :content="$t('m.Real_Time_Rank_Tip')"
                    placement="top">
                    <i class="el-icon-info tooltip-icon"></i>
                  </el-tooltip>
                </span>
              </template>

              <el-switch
                v-model="contest.real_time_rank"
                active-color="#A60550"
                inactive-color="#987284">
              </el-switch>

            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item>

              <template slot="label">
                <span>
                  {{ $t('m.Contest_Status') }}

                  <el-tooltip
                    :content="$t('m.Contest_Status_Tip')"
                    placement="top">
                    <i class="el-icon-info tooltip-icon"></i>
                  </el-tooltip>
                </span>
              </template>

              <el-switch
                v-model="contest.visible"
                active-text=""
                inactive-text=""
                active-color="#A60550"
                inactive-color="#987284">
              </el-switch>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item>

              <template slot="label">
                <span>
                  {{ $t('m.Allowed_IP_Ranges') }}

                  <el-tooltip
                    :content="$t('m.Allowed_IP_Ranges_Tip')"
                    placement="top">
                    <i class="el-icon-info tooltip-icon"></i>
                  </el-tooltip>
                </span>
              </template>
              <div
                v-for="(range, index) in contest.allowed_ip_ranges"
                :key="index">

                <el-row :gutter="20" style="margin-bottom: 15px">
                  <el-col :span="8">
                    <el-input
                      v-model="range.value"
                      :placeholder="$t('m.CIDR_Network')">
                    </el-input>
                  </el-col>
                  <el-col :span="10">
                    <el-button
                      plain
                      icon="el-icon-fa-plus"
                      @click="addIPRange">
                      {{$t('m.Add')}}
                    </el-button>

                    <el-button
                      plain
                      icon="el-icon-fa-trash"
                      @click="removeIPRange(range)">
                      {{$t('m.Delete')}}
                    </el-button>
                  </el-col>
                </el-row>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <save @click.native="saveContest"></save>

    </Panel>
  </div>
</template>

<script>
import api from '../../api.js'
import Simditor from '../../components/Simditor.vue'

export default {
  name: 'CreateContest',

  components: {
    Simditor
  },

  data () {
    const validateDescription = (rule, value, callback) => {
      const descriptionContainer = document.createElement('div')
      descriptionContainer.innerHTML = value || ''
      const stripped = (descriptionContainer.textContent || descriptionContainer.innerText || '')
        .replace(/\u00a0/g, '')
        .trim()

      if (!stripped) {
        callback(new Error(this.$i18n.t('m.Description_Required')))
      } else {
        callback()
      }
    }

    const validateEndTime = (rule, value, callback) => {
      if (!value) {
        callback(new Error(this.$i18n.t('m.End_Time_Required')))
        return
      }

      if (
        this.contest.start_time &&
        new Date(value) <= new Date(this.contest.start_time)
      ) {
        callback(new Error(this.$i18n.t('m.End_Time_After_Start')))
      } else {
        callback()
      }
    }

    const validateIPRanges = (rule, value, callback) => {
      const cidrRegex =
        /^((25[0-5]|2[0-4]\d|[01]?\d?\d)\.){3}(25[0-5]|2[0-4]\d|[01]?\d?\d)\/([0-9]|[12]\d|3[0-2])$/

      for (let r of value) {
        if (r.value && !cidrRegex.test(r.value.trim())) {
          callback(new Error(this.$i18n.t('m.CIDR_Invalid', {value: r.value})))
          return
        }
      }

      callback()
    }

    return {
      title: this.$i18n.t('m.Create_Contest'),

      disableRuleType: false,

      contest: {
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        rule_type: 'ACM',
        password: '',
        real_time_rank: true,
        visible: true,

        allowed_ip_ranges: [
          {
            value: ''
          }
        ]
      },

      rules: {
        title: [
          {
            required: true,
            message: this.$i18n.t('m.Title_Required'),
            trigger: 'blur'
          },
          {
            min: 3,
            max: 128,
            message: this.$i18n.t('m.Title_Length_3_128'),
            trigger: 'blur'
          }
        ],

        description: [
          {
            required: true,
            validator: validateDescription,
            trigger: 'blur'
          }
        ],

        start_time: [
          {
            required: true,
            message: this.$i18n.t('m.Start_Time_Required'),
            trigger: 'change'
          }
        ],

        end_time: [
          {
            required: true,
            validator: validateEndTime,
            trigger: 'change'
          }
        ],

        password: [
          {
            min: 4,
            message: this.$i18n.t('m.Password_Min_4'),
            trigger: 'blur'
          }
        ],

        allowed_ip_ranges: [
          {
            validator: validateIPRanges,
            trigger: 'blur'
          }
        ]
      }
    }
  },

  methods: {
    saveContest () {
      this.$refs.contestForm.validate((valid) => {

        if (!valid) {
          this.$error(this.$i18n.t('m.Fix_Form_Errors'))
          return
        }

        let funcName =
          this.$route.name === 'edit-contest'
            ? 'editContest'
            : 'createContest'

        let data = Object.assign({}, this.contest)

        let ranges = []

        for (let v of data.allowed_ip_ranges) {
          if (v.value !== '') {
            ranges.push(v.value)
          }
        }

        data.allowed_ip_ranges = ranges

        api[funcName](data)
          .then(res => {
            this.$router.push({
              name: 'contest-list',
              query: { refresh: 'true' }
            })
          })
          .catch(() => {})
      })
    },

    addIPRange () {
      this.contest.allowed_ip_ranges.push({
        value: ''
      })
    },

    removeIPRange (range) {
      let index = this.contest.allowed_ip_ranges.indexOf(range)

      if (index !== -1) {
        this.contest.allowed_ip_ranges.splice(index, 1)
      }
    }
  },

  mounted () {
    if (this.$route.name === 'edit-contest') {

      this.title = this.$i18n.t('m.Edit_Contest')
      this.disableRuleType = true

      api.getContest(this.$route.params.contestId)
        .then(res => {

          let data = res.data.data

          let ranges = []

          for (let v of data.allowed_ip_ranges) {
            ranges.push({
              value: v
            })
          }

          if (ranges.length === 0) {
            ranges.push({
              value: ''
            })
          }

          data.allowed_ip_ranges = ranges

          this.contest = data

        }).catch(() => {})
    }
  }
}
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Funnel+Display:wght@300;400;500;600;700&display=swap");

.admin-shell__eyebrow,
.admin-shell__title {
  font-family: 'Funnel Display', sans-serif;
}

/* Namespaced bajo .contest-view para evitar fugas a otras pestañas del admin. */
.contest-view .panel {
  background: #ffffff !important;
  border-radius: 20px !important;
  border: none !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04) !important;
  overflow: hidden;
  padding: 0 10px !important;
  font-family: 'Funnel Display', sans-serif;
}

.contest-view .title {
  color: #003B4A !important;
  font-size: 28px !important;
  font-weight: bold !important;
}

.contest-view .el-form-item {
  margin-bottom: 28px;
}

.contest-view .el-form-item__label:before {
  display: none !important;
}

.contest-view .el-form-item__label {
  display: block;
  text-align: left;
  padding: 0;
  font-size: 18px;
  color: #003B4A;
  font-weight: 600;
  font-family: 'Funnel Display', sans-serif;
}

.contest-view .el-input__inner {
  border: 2px solid #987284;
  border-radius: 12px;
  height: 42px;
  font-size: 15px;
  padding: 0 12px;
  transition: all 0.25s ease;
  font-family: 'Funnel Display', sans-serif;
}

.contest-view .el-input__inner:focus {
  border-color: #003B4A !important;
  box-shadow: 0 0 8px rgba(0, 59, 74, 0.20);
}

.contest-view .el-input__inner::placeholder {
  color: #987284;
  font-weight: 500;
  font-family: 'Funnel Display', sans-serif;
}

.contest-view .el-textarea__inner {
  border: 2px solid #987284;
  border-radius: 12px;
  color: #000000;
  font-family: 'Funnel Display', sans-serif;
}

.contest-view .el-textarea__inner:focus {
  border-color: #003B4A !important;
  box-shadow: 0 0 8px rgba(0, 59, 74, 0.20);
}

.contest-view .el-date-editor.el-input {
  width: 100%;
}

.contest-view .el-button {
  background-color: #003B4A;
  color: #ffffff;
  font-size: 16px;
  font-family: 'Funnel Display', sans-serif;
  font-weight: bold;
  border-color: #003B4A;
  border-radius: 12px;
  min-width: 140px;
  height: 40px;
  padding: 0 16px;
  transition: all 0.25s ease;
}

.contest-view .el-button:hover {
  background-color: #245965;
  border-color: #245965;
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(0, 59, 74, 0.18);
}

.contest-view .el-radio__inner {
  border-color: #987284;
}

.contest-view .el-radio__label {
  font-family: 'Funnel Display', sans-serif;
  font-size: 16px;
}

.contest-view .el-radio__input.is-checked .el-radio__inner {
  background-color: #A60550;
  border-color: #A60550;
}

.contest-view .el-radio__input.is-checked + .el-radio__label {
  color: #A60550;
  font-weight: 600;
}

.contest-view .tooltip-icon {
  color: #A60550;
  margin-left: 6px;
  cursor: pointer;
  font-size: 15px;
  transition: 0.2s;
}

.contest-view .tooltip-icon:hover {
  color: #003B4A;
}
</style>
