<template>
  <div class="error404">

    <div class="error404-body-con">
      <Card>

        <div class="error-img">
          <img :src="require('@/assets/Error.png')" alt="Error UPV" />
        </div>

        <p class="error404-body-con-message">
          La página no existe
        </p>

        <p class="error404-body-con-message">
          Algo salió mal o la URL es incorrecta
        </p>

        <!-- BOTONES (REQUERIDO) -->
        <div class="error404-btn-con">
          <Button
            @click="goHome"
            size="large"
            style="width: 200px;"
            type="ghost"
          >
            {{$t('m.Go_Home')}}
          </Button>

          <Button
            @click="backPage"
            size="large"
            style="width: 200px;margin-left: 40px;"
            type="primary"
          >
            {{$t('m.Back')}}
          </Button>
        </div>

      </Card>
    </div>

  </div>
</template>

<script>
export default {
  name: 'Error404',
  methods: {
    backPage() {
      this.$router.go(-1);
    },
    goHome() {
      this.$router.push({ name: 'home' });
    }
  }
}
</script>

<style lang="less" scoped>
@import (reference) '../../../../styles/theme-oj.less';

.error404 {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80vh;

  &-body-con {
    width: 700px;
  }

  &-body-con-message {
    display: block;
    text-align: center;
    font-size: 26px;
    font-weight: 500;
    color: #dddde2;
    margin-top: 10px;
  }

  &-btn-con {
    text-align: center;
    padding: 20px 0;
  }
}

.error-img {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.error-img img {
  width: 160px;
  height: 160px;
  border-radius: 50%;  
  object-fit: cover;

  animation: spinClock 6s linear infinite;
}

@keyframes spinClock {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>