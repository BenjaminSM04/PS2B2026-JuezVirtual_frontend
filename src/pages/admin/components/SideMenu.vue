<template>
  <div class="admin-sidemenu">
    <div class="admin-sidemenu__brand">
      <div class="admin-sidemenu__logo">
        <img src="../../../assets/Logo2.png" alt="LizardJudge"/>
      </div>
    </div>

    <el-menu
      class="admin-sidemenu__menu"
      :router="true"
      :default-active="currentPath"
      :default-openeds="defaultOpeneds">
      <el-menu-item index="/">
        <i class="el-icon-fa-dashboard"></i>
        <span>{{$t('m.Dashboard')}}</span>
      </el-menu-item>

      <el-submenu v-if="isSuperAdmin" index="general">
        <template slot="title">
          <i class="el-icon-menu"></i>
          <span>{{$t('m.General')}}</span>
        </template>
        <el-menu-item index="/user">{{$t('m.User')}}</el-menu-item>
        <el-menu-item index="/conf">{{$t('m.System_Config')}}</el-menu-item>
        <el-menu-item index="/judge-server">{{$t('m.Judge_Server')}}</el-menu-item>
        <el-menu-item index="/prune-test-case">{{$t('m.Prune_Test_Case')}}</el-menu-item>
      </el-submenu>

      <el-menu-item v-if="isTeacherRole" index="/announcement">
        <i class="el-icon-fa-bullhorn"></i>
        <span>{{$t('m.Announcement')}}</span>
      </el-menu-item>

      <el-submenu index="problem" v-if="hasProblemPermission">
        <template slot="title">
          <i class="el-icon-fa-bars"></i>
          <span>{{$t('m.Problem')}}</span>
        </template>
        <el-menu-item index="/problems">{{$t('m.Problem_List')}}</el-menu-item>
        <el-menu-item index="/problem/create">{{$t('m.Create_Problem')}}</el-menu-item>
        <el-menu-item index="/problem/batch_ops">{{$t('m.Export_Import_Problem')}}</el-menu-item>
      </el-submenu>

      <el-submenu v-if="isTeacherRole" index="contest">
        <template slot="title">
          <i class="el-icon-fa-trophy"></i>
          <span>{{$t('m.Contest')}}</span>
        </template>
        <el-menu-item index="/contest">{{$t('m.Contest_List')}}</el-menu-item>
        <el-menu-item index="/contest/create">{{$t('m.Create_Contest')}}</el-menu-item>
      </el-submenu>
    </el-menu>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'

  export default {
    name: 'SideMenu',
    computed: {
      ...mapGetters(['user', 'isSuperAdmin', 'isTeacherRole', 'hasProblemPermission']),
      currentPath () {
        return this.$route.path
      },
      defaultOpeneds () {
        const path = this.$route.path
        const openeds = []

        if (path.indexOf('/user') === 0 ||
          path.indexOf('/conf') === 0 ||
          path.indexOf('/judge-server') === 0 ||
          path.indexOf('/prune-test-case') === 0) {
          openeds.push('general')
        }

        if (path.indexOf('/problem') === 0 || path.indexOf('/problems') === 0) {
          openeds.push('problem')
        }

        if (path.indexOf('/contest') === 0) {
          openeds.push('contest')
        }

        return openeds
      }
    }
  }
</script>

<style scoped lang="less">
  .admin-sidemenu {
    width: 270px;
    min-height: 100vh;
    padding: 22px 16px 18px;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.92) 0%, rgba(248, 250, 249, 0.98) 100%);
    border-right: 1px solid rgba(17, 55, 49, 0.08);
    box-shadow: 10px 0 30px rgba(35, 54, 51, 0.05);

    &__brand {
      padding: 8px 0 18px;
      display: flex;
      justify-content: center;
    }

    &__logo {
      width: 92px;
      height: 92px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: #fff;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(39, 60, 55, 0.08);

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 50%;
      }
    }

    &__menu {
      border-right: none;
      background: transparent;
    }
  }

  /deep/ .admin-sidemenu__menu .el-menu-item,
  /deep/ .admin-sidemenu__menu .el-submenu__title {
    height: 48px;
    line-height: 48px;
    margin-bottom: 6px;
    border-radius: 14px;
    color: #1a3e39;
    font-size: 14px;
    font-weight: 700;
    transition: all 0.2s ease;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /deep/ .admin-sidemenu__menu .el-menu-item i,
  /deep/ .admin-sidemenu__menu .el-submenu__title i {
    width: 20px;
    margin-right: 9px;
    font-size: 15px;
    color: #4b6c67;
    text-align: center;
  }

  /deep/ .admin-sidemenu__menu .el-menu-item:hover,
  /deep/ .admin-sidemenu__menu .el-submenu__title:hover {
    background: #edf6f1;
    color: #2e6e63;
  }

  /deep/ .admin-sidemenu__menu .el-menu-item:hover i,
  /deep/ .admin-sidemenu__menu .el-submenu__title:hover i {
    color: #2e6e63;
  }

  /deep/ .admin-sidemenu__menu .el-menu-item.is-active {
    background: #e6f5ee;
    color: #4f8f84;
    box-shadow: inset 0 0 0 1px rgba(111, 185, 160, 0.18);
  }

  /deep/ .admin-sidemenu__menu .el-menu-item.is-active i {
    color: #4f8f84;
  }

  /deep/ .admin-sidemenu__menu .el-submenu .el-menu {
    background: transparent;
    padding: 2px 0 8px 8px;
    transition: all 0.25s ease;
  }

  /deep/ .admin-sidemenu__menu .el-submenu__icon-arrow {
    transition: transform 0.25s ease;
  }

  /deep/ .admin-sidemenu__menu .el-submenu .el-menu-item {
    height: 38px;
    line-height: 38px;
    margin-bottom: 4px;
    padding-left: 24px !important;
    padding-right: 14px;
    font-size: 13px;
    font-weight: 600;
    border-radius: 12px;
    color: #54726d;
  }

  /deep/ .admin-sidemenu__menu .el-submenu .el-menu-item.is-active {
    color: #1f6d5f;
    background: #f2fbf7;
  }

  /deep/ .admin-sidemenu__menu .el-submenu__icon-arrow {
    margin-top: -5px;
    right: 12px;
    color: #7f9792;
  }

  @media (max-width: 1200px) {
    .admin-sidemenu {
      width: 250px;
      padding-left: 12px;
      padding-right: 12px;
    }
  }

  @media (max-width: 960px) {
    .admin-sidemenu {
      width: 100%;
      min-height: auto;
      padding-bottom: 8px;
      border-right: none;
      border-bottom: 1px solid rgba(17, 55, 49, 0.08);
    }
  }
</style>
