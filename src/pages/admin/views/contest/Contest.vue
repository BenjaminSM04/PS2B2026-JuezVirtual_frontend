<template>
  <div class="view">
    <Panel :title="title">
      <el-form label-position="top">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item :label="$t('m.ContestTitle')" required>
              <el-input v-model="contest.title" :placeholder="$t('m.ContestTitle')"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item :label="$t('m.ContestDescription')" required>
              <Simditor v-model="contest.description"></Simditor>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="$t('m.Contest_Start_Time')" required>
              <el-date-picker
                v-model="contest.start_time"
                type="datetime"
                :placeholder="$t('m.Contest_Start_Time')">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="$t('m.Contest_End_Time')" required>
              <el-date-picker
                v-model="contest.end_time"
                type="datetime"
                :placeholder="$t('m.Contest_End_Time')">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="$t('m.Contest_Password')">
              <el-input v-model="contest.password" :placeholder="$t('m.Contest_Password')"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="$t('m.Contest_Rule_Type')">
              <el-radio class="radio" v-model="contest.rule_type" label="ACM" :disabled="disableRuleType">ACM</el-radio>
              <el-radio class="radio" v-model="contest.rule_type" label="OI" :disabled="disableRuleType">OI</el-radio>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="$t('m.Real_Time_Rank')">
              <el-switch
                v-model="contest.real_time_rank"
                active-color="#A60550"
                inactive-color="#987284">
              </el-switch>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="$t('m.Contest_Status')">
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
            <el-form-item :label="$t('m.Allowed_IP_Ranges')">
              <div v-for="(range, index) in contest.allowed_ip_ranges" :key="index">
                <el-row :gutter="20" style="margin-bottom: 15px">
                  <el-col :span="8">
                    <el-input v-model="range.value" :placeholder="$t('m.CIDR_Network')"></el-input>
                  </el-col>
                  <el-col :span="10">
                    <el-button plain icon="el-icon-fa-plus" @click="addIPRange"></el-button>
                    <el-button plain icon="el-icon-fa-trash" @click="removeIPRange(range)"></el-button>
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
      return {
        title: 'Crear Concurso',
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
          allowed_ip_ranges: [{
            value: ''
          }]
        }
      }
    },
    methods: {
      saveContest () {
        let funcName = this.$route.name === 'edit-contest' ? 'editContest' : 'createContest'
        let data = Object.assign({}, this.contest)
        let ranges = []
        for (let v of data.allowed_ip_ranges) {
          if (v.value !== '') {
            ranges.push(v.value)
          }
        }
        data.allowed_ip_ranges = ranges
        api[funcName](data).then(res => {
          this.$router.push({name: 'contest-list', query: {refresh: 'true'}})
        }).catch(() => {
        })
      },
      addIPRange () {
        this.contest.allowed_ip_ranges.push({value: ''})
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
        this.title = 'Editar Concurso'
        this.disableRuleType = true
        api.getContest(this.$route.params.contestId).then(res => {
          let data = res.data.data
          let ranges = []
          for (let v of data.allowed_ip_ranges) {
            ranges.push({value: v})
          }
          if (ranges.length === 0) {
            ranges.push({value: ''})
          }
          data.allowed_ip_ranges = ranges
          this.contest = data
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

.view .el-form-item__label:before {
  display: none !important;
}

.view .title{
  color:#090808 !important;
  font-size: 25px !important;
  font-weight: bold !important;
}

.view .el-form-item__label {
  display: block;
  text-align: left;
  padding: 0;
  font-size: 20px;
  color: black;
  font-weight:400 ;
}

.view .el-input__inner {
  border: 2px solid #987284;   
  border-radius: 10px;        
  height: 40px;               
  font-size: 15px;            
  padding: 0 12px 0 35px;             
  max-width: 500px;
}

.view .el-input__inner::placeholder {
  color: #ADADAD;
  font-weight: bold;
  font-family: 'Funnel Display', sans-serif;
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
.view .el-textarea__inner {
  border: 2px solid #987284;
  border-radius: 10px;
  color: #000000;
}
.view .el-button:hover {
  background-color: #245965;
  border-color: #245965;
  /*transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);*/
}

.view .el-radio__inner {
  border-color: #987284;
}

.view .el-radio__input.is-checked .el-radio__inner {
  background-color: #A60550;
  border-color: #A60550;
}

.view .el-radio__input.is-checked + .el-radio__label {
  color: #A60550;
  font-family: 'Funnel Display', sans-serif;
  font-size: 20px;
}

</style>
