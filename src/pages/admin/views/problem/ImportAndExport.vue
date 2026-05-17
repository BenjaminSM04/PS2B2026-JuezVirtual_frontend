<template>
  <div class="view">
    <panel :title="$t('m.Export_Problems_Beta')">
      <div slot="header">
        <el-input
          v-model="keyword"
          prefix-icon="el-icon-search"
          :placeholder="$t('m.Keywords')">
        </el-input>
      </div>
      <el-table :data="problems"
                v-loading="loadingProblems"
                @selection-change="handleSelectionChange"
                :header-cell-style="{color: '#000000', fontWeight: 'bold'}">
        <el-table-column type="selection" width="60"></el-table-column>
        <el-table-column label="ID" width="100" prop="id"></el-table-column>
        <el-table-column :label="$t('m.Display_ID')" width="200" prop="_id"></el-table-column>
        <el-table-column :label="$t('m.Title')" prop="title"></el-table-column>
        <el-table-column prop="created_by.username" :label="$t('m.Author')"></el-table-column>
        <el-table-column prop="create_time" :label="$t('m.Create_Time')">
          <template slot-scope="scope">
            {{scope.row.create_time | localtime }}
          </template>
        </el-table-column>
      </el-table>

      <div class="panel-options">
        <el-button type="primary" size="small" v-show="selected_problems.length"
                   @click="exportProblems" icon="el-icon-fa-arrow-down">{{$t('m.Export')}}
        </el-button>
        <el-pagination
          class="page"
          layout="prev, pager, next"
          @current-change="getProblems"
          :page-size="limit"
          :total="total">
        </el-pagination>
      </div>
    </panel>

    <panel :title="$t('m.Import_QDUOJ_Problems_Beta')">
      <el-upload
        ref="QDU"
        class="upv-upload"
        drag
        action="/api/admin/import_problem"
        name="file"
        accept=".zip"
        :file-list="fileList1"
        :show-file-list="true"
        :with-credentials="true"
        :limit="3"
        :on-change="onFile1Change"
        :auto-upload="false"
        :on-success="uploadSucceeded"
        :on-error="uploadFailed"
        :before-upload="beforeUploadZip">
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">{{$t('m.Drag_File_Here')}} <em>{{$t('m.Or_Click')}}</em></div>
        <div class="el-upload__tip" slot="tip">{{$t('m.QDUOJ_Format_Hint')}}</div>
      </el-upload>
      <div class="upload-actions">
        <el-button type="primary" icon="el-icon-fa-cloud-upload"
                   :disabled="!fileList1.length"
                   @click="submitUpload('QDU')">{{$t('m.Upload')}}</el-button>
      </div>
    </panel>

    <panel :title="$t('m.Import_FPS_Problems_Beta')">
      <el-upload
        ref="FPS"
        class="upv-upload"
        drag
        action="/api/admin/import_fps"
        name="file"
        accept=".xml,.zip"
        :file-list="fileList2"
        :show-file-list="true"
        :with-credentials="true"
        :limit="3"
        :on-change="onFile2Change"
        :auto-upload="false"
        :on-success="uploadSucceeded"
        :on-error="uploadFailed"
        :before-upload="beforeUploadFps">
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">{{$t('m.Drag_File_Here')}} <em>{{$t('m.Or_Click')}}</em></div>
        <div class="el-upload__tip" slot="tip">{{$t('m.FPS_Format_Hint')}}</div>
      </el-upload>
      <div class="upload-actions">
        <el-button type="primary" icon="el-icon-fa-cloud-upload"
                   :disabled="!fileList2.length"
                   @click="submitUpload('FPS')">{{$t('m.Upload')}}</el-button>
      </div>
    </panel>
  </div>
</template>

<script>
  import api from '@admin/api'
  import utils from '@/utils/utils'

  const QDUOJ_TYPES = ['.zip']
  const FPS_TYPES = ['.xml', '.zip']

  export default {
    name: 'import_and_export',
    data () {
      return {
        fileList1: [],
        fileList2: [],
        page: 1,
        limit: 10,
        total: 0,
        loadingProblems: false,
        loadingImporting: false,
        keyword: '',
        problems: [],
        selected_problems: []
      }
    },
    mounted () {
      this.getProblems()
    },
    methods: {
      handleSelectionChange (val) {
        this.selected_problems = val
      },
      getProblems (page = 1) {
        let params = {
          keyword: this.keyword,
          offset: (page - 1) * this.limit,
          limit: this.limit
        }
        this.loadingProblems = true
        api.getProblemList(params).then(res => {
          this.problems = res.data.data.results
          this.total = res.data.data.total
          this.loadingProblems = false
        })
      },
      exportProblems () {
        let params = []
        for (let p of this.selected_problems) {
          params.push('problem_id=' + p.id)
        }
        let url = '/admin/export_problem?' + params.join('&')
        utils.downloadFile(url)
      },
      submitUpload (ref) {
        this.$refs[ref].submit()
      },
      validateExtension (file, allowed) {
        const name = (file.name || '').toLowerCase()
        return allowed.some(ext => name.endsWith(ext))
      },
      onFile1Change (file, fileList) {
        if (!this.validateExtension(file, QDUOJ_TYPES)) {
          this.$error(this.$t('m.Invalid_File_Type', {types: QDUOJ_TYPES.join(', ')}))
          this.fileList1 = []
          this.$refs.QDU.clearFiles()
          return
        }
        this.fileList1 = fileList.slice(-1)
      },
      onFile2Change (file, fileList) {
        if (!this.validateExtension(file, FPS_TYPES)) {
          this.$error(this.$t('m.Invalid_File_Type', {types: FPS_TYPES.join(', ')}))
          this.fileList2 = []
          this.$refs.FPS.clearFiles()
          return
        }
        this.fileList2 = fileList.slice(-1)
      },
      beforeUploadZip (file) {
        if (!this.validateExtension(file, QDUOJ_TYPES)) {
          this.$error(this.$t('m.Invalid_File_Type', {types: QDUOJ_TYPES.join(', ')}))
          return false
        }
        return true
      },
      beforeUploadFps (file) {
        if (!this.validateExtension(file, FPS_TYPES)) {
          this.$error(this.$t('m.Invalid_File_Type', {types: FPS_TYPES.join(', ')}))
          return false
        }
        return true
      },
      uploadSucceeded (response) {
        if (response.error) {
          this.$error(response.data)
        } else {
          this.$success(this.$t('m.Import_Success', {count: response.data.import_count}))
          this.getProblems()
        }
      },
      uploadFailed () {
        this.$error(this.$t('m.Upload_Failed'))
      }
    },
    watch: {
      'keyword' () {
        this.getProblems()
      }
    }
  }
</script>

<style lang="less" scoped>
  @import (reference) '../../../../styles/theme-oj.less';

  .view {
    font-family: 'Funnel Display', "Helvetica Neue", Helvetica, Arial, sans-serif;
  }

  .upv-upload {
    /deep/ .el-upload-dragger {
      width: 100%;
      border: 2px dashed @oj-secondary;
      border-radius: 16px;
      background: #fbfcfd;
      transition: all .25s ease;

      &:hover {
        border-color: @oj-primary;
        background: fade(@oj-primary, 4%);
      }

      .el-icon-upload {
        color: @oj-primary;
      }
    }

    /deep/ .el-upload-dragger.is-dragover {
      border-color: @oj-primary;
      background: fade(@oj-primary, 8%);
    }

    /deep/ .el-upload__text {
      color: @oj-dark;
      font-weight: 500;

      em {
        color: @oj-primary;
        font-weight: 700;
        font-style: normal;
      }
    }

    /deep/ .el-upload__tip {
      color: fade(@oj-secondary, 90%);
      font-size: 13px;
      margin-top: 8px;
    }

    /deep/ .el-upload {
      width: 100%;
      display: block;
    }
  }

  .upload-actions {
    margin-top: 14px;
    display: flex;
    justify-content: flex-end;
  }
</style>
