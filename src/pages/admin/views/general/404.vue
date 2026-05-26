<template>
  <div class="admin-404">
    <div class="admin-404-card">
      <div class="admin-404-img">
        <img :src="require('@/assets/Error.png')" alt="404"/>
      </div>

      <div class="admin-404-code">404</div>

      <p class="admin-404-title">
        {{ $t('m.Page_Not_Found_Title') }}
      </p>

      <p class="admin-404-hint">
        {{ $t('m.Page_Not_Found_Hint') }}
      </p>

      <div class="admin-404-actions">
        <el-button type="primary" icon="el-icon-fa-tachometer" @click="goDashboard">
          {{ $t('m.Back_To_Dashboard') }}
        </el-button>
        <el-button icon="el-icon-fa-external-link" @click="goOj">
          {{ $t('m.Go_To_OJ') }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'AdminNotFound',
    methods: {
      goDashboard () {
        this.$router.push({ name: 'dashboard' })
      },
      goOj () {
        window.location.href = '/'
      }
    }
  }
</script>

<style scoped lang="less">
  .admin-404 {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    padding: 40px 20px;
  }

  .admin-404-card {
    background: #ffffff;
    border-radius: 16px;
    padding: 40px 60px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
    text-align: center;
    max-width: 560px;
    width: 100%;
  }

  .admin-404-img {
    display: flex;
    justify-content: center;
    margin-bottom: 16px;

    img {
      width: 140px;
      height: 140px;
      border-radius: 50%;
      object-fit: cover;
      animation: admin404Spin 8s linear infinite;
      box-shadow: 0 6px 18px rgba(0, 59, 74, 0.18);
    }
  }

  .admin-404-code {
    font-size: 48px;
    font-weight: 700;
    color: #003B4A;
    letter-spacing: 4px;
    line-height: 1;
    margin-bottom: 8px;
  }

  .admin-404-title {
    font-size: 22px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 8px;
  }

  .admin-404-hint {
    font-size: 14px;
    color: #6D6E71;
    margin: 0 0 26px;
  }

  .admin-404-actions {
    display: flex;
    justify-content: center;
    gap: 14px;
    flex-wrap: wrap;
  }

  @keyframes admin404Spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style>
