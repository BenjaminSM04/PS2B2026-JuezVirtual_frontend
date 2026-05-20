<template>
<div class="home-container">
  <div class="welcome-section">
      <Icon type="university" size="42" />
      <h1>{{$t('m.Welcome_To')}} LizardJudge Univalle</h1>
      <p>{{$t('m.Home_Tagline')}}</p>
    </div>

  <Row type="flex" justify="space-around">
    <Col :span="22">
    <panel shadow v-if="contests.length" class="contest">
      
      <!-- <div slot="title">
        <Button type="text"  class="contest-title" @click="goContest">{{contests[index].title}}</Button>
      </div> -->

      <div slot="title">
        <Icon type="trophy"/>
        <Button type="text"  class="contest-title" @click="goContest">{{contests[index].title}}</Button>
      </div>

      <Carousel v-model="index" trigger="hover" autoplay :autoplay-speed="6000" class="contest">
        <CarouselItem v-for="(contest, index) of contests" :key="index">
          <div class="contest-content">
            <div class="contest-content-tags">
              <Button type="info" shape="circle" size="small" icon="calendar">
                {{contest.start_time | localtime('YYYY-M-D HH:mm') }}
              </Button>
              <Button type="success" shape="circle" size="small" icon="android-time">
                {{getDuration(contest.start_time, contest.end_time)}}
              </Button>
              <Button type="warning" shape="circle" size="small" icon="trophy">
                {{contest.rule_type}}
              </Button>
            </div>
            <div class="contest-content-description">
              <blockquote v-html="contest.description"></blockquote>
            </div>
          </div>
        </CarouselItem>
      </Carousel>
    </panel>
    <Announcements class="announcement"></Announcements>
    </Col>
  </Row>
</div>
  
</template>

<script>
  import Announcements from './Announcements.vue'
  import api from '@oj/api'
  import time from '@/utils/time'
  import { CONTEST_STATUS } from '@/utils/constants'

  export default {
    name: 'home',
    components: {
      Announcements
    },
    data () {
      return {
        contests: [],
        index: 0
      }
    },
    mounted () {
      let params = {status: CONTEST_STATUS.NOT_START}
      api.getContestList(0, 5, params).then(res => {
        this.contests = res.data.data.results
      })
    },
    methods: {
      getDuration (startTime, endTime) {
        return time.duration(startTime, endTime)
      },
      goContest () {
        this.$router.push({
          name: 'contest-details',
          params: {contestID: this.contests[this.index].id}
        })
      }
    }
  }
</script>

<style lang="less" scoped>
  @import (reference) '../../../../styles/theme-oj.less';

  .contest {
    &-title {
      color: @oj-guindo !important;
      font-style: normal;
      font-size: 22px;
      font-weight: bold;
    }
    &-content {
      padding: 0 70px 40px 70px;
      &-description {
        margin-top: 25px;
      }
    }
  }

  .welcome-section {
  text-align: center;
  background: linear-gradient(135deg, @oj-guindo, #6D6E71);
  color: white;
  padding: 35px;
  border-radius: 18px;
  margin-bottom: 30px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);

    h1 {
      margin-top: 10px;
      font-size: 34px;
      font-weight: bold;
    }

    p {
      margin-top: 8px;
      font-size: 18px;
      opacity: 0.95;
    }
  }

  .announcement {
    margin-top: 25px;
    border-left: 6px solid @oj-guindo;
    border-radius: 14px;
    background: white;
    padding: 10px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }

/*   .home-container {
  background: #f8f9fb;
  min-height: 100vh;
  padding: 20px;
} */
</style>
