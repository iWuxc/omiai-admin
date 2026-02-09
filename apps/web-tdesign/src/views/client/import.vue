<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import {
  ArrowLeftIcon,
  DownloadIcon,
  UploadIcon,
  CheckCircleIcon,
  CloseCircleIcon,
} from 'tdesign-icons-vue-next';
import {
  Button,
  Card,
  MessagePlugin,
  Steps,
  Table,
  Tag,
  Upload,
} from 'tdesign-vue-next';

import { analyzeImportFile, batchImportClients } from '#/api/omiai';
import type { ImportAnalysisResult } from '#/types/omiai';

const router = useRouter();

// 当前步骤
const currentStep = ref(0);

// 分析结果
const analysisResult = ref<ImportAnalysisResult | null>(null);

// 加载状态
const analyzing = ref(false);
const importing = ref(false);

// 下载模板
function downloadTemplate() {
  // 创建CSV模板内容
  const template = `姓名,性别,手机号,出生年月,身高,体重,学历,婚姻状况,职业,工作城市,月收入,房产情况,车辆情况,家庭住址
张三,男,13800138001,1990-05,175,70,本科,未婚,工程师,北京,20000,已购房,有车,北京市朝阳区
李四,女,13800138002,1992-08,165,55,硕士,未婚,教师,上海,15000,无房,无车,上海市浦东新区`;
  
  const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = '客户导入模板.csv';
  link.click();
  MessagePlugin.success('模板下载成功');
}

// 上传配置
const uploadProps = {
  accept: '.csv,.xlsx,.xls',
  showUploadList: false,
  customRequest: async ({ file }: { file: File }) => {
    analyzing.value = true;
    try {
      const res = await analyzeImportFile(file);
      if (res.data.code === 0) {
        analysisResult.value = res.data.data;
        currentStep.value = 1;
        MessagePlugin.success('文件分析完成');
      } else {
        MessagePlugin.error(res.data.message || '分析失败');
      }
    } catch (error) {
      MessagePlugin.error('文件分析失败');
    } finally {
      analyzing.value = false;
    }
  },
};

// 确认导入
async function handleImport() {
  if (!analysisResult.value) return;
  
  importing.value = true;
  try {
    const res = await batchImportClients({
      clients: analysisResult.value.preview,
    });
    if (res.data.code === 0) {
      currentStep.value = 2;
      MessagePlugin.success('导入成功');
    } else {
      MessagePlugin.error(res.data.message || '导入失败');
    }
  } catch (error) {
    MessagePlugin.error('导入失败');
  } finally {
    importing.value = false;
  }
}

// 返回
function handleBack() {
  router.back();
}

// 完成
function handleFinish() {
  router.push('/client/list');
}
</script>

<template>
  <div class="client-import-container">
    <t-card>
      <!-- 头部 -->
      <div class="header-actions">
        <t-button @click="handleBack">
          <ArrowLeftIcon />
          返回
        </t-button>
        <h2>批量导入客户</h2>
        <div></div>
      </div>

      <!-- 步骤条 -->
      <t-steps :current="currentStep" class="steps">
        <t-step-item title="上传文件" />
        <t-step-item title="数据预览" />
        <t-step-item title="导入完成" />
      </t-steps>

      <!-- 步骤1: 上传文件 -->
      <div v-if="currentStep === 0" class="upload-area">
        <div class="template-download">
          <p>请先下载导入模板，按照模板格式填写数据</p>
          <t-button @click="downloadTemplate">
            <DownloadIcon />
            下载模板
          </t-button>
        </div>

        <div class="upload-box">
          <t-upload v-bind="uploadProps" :disabled="analyzing" draggable>
            <template #dragContent>
              <div class="t-upload__dragger">
                <p class="t-upload__dragger-icon">
                  <UploadIcon />
                </p>
                <p class="t-upload__dragger-text">点击或拖拽文件到此区域上传</p>
                <p class="t-upload__dragger-hint">
                  支持 .csv, .xlsx, .xls 格式文件
                </p>
              </div>
            </template>
          </t-upload>
        </div>

        <div class="upload-tips">
          <h4>导入说明：</h4>
          <ul>
            <li>文件格式支持 CSV、Excel (.xlsx, .xls)</li>
            <li>单次导入建议不超过 500 条数据</li>
            <li>手机号将作为唯一标识，重复数据将被跳过</li>
            <li>必填字段：姓名、性别、手机号</li>
          </ul>
        </div>
      </div>

      <!-- 步骤2: 数据预览 -->
      <div v-if="currentStep === 1 && analysisResult" class="preview-area">
        <div class="analysis-summary">
          <div class="summary-item success">
            <CheckCircleIcon />
            <span>有效数据: {{ analysisResult.valid }} 条</span>
          </div>
          <div class="summary-item error">
            <CloseCircleIcon />
            <span>无效数据: {{ analysisResult.invalid }} 条</span>
          </div>
        </div>

        <div v-if="analysisResult.errors.length > 0" class="error-list">
          <h4>错误信息：</h4>
          <ul>
            <li v-for="(error, index) in analysisResult.errors" :key="index">
              第 {{ error.row }} 行: {{ error.message }}
            </li>
          </ul>
        </div>

        <div class="preview-table">
          <h4>数据预览：</h4>
          <t-table
            :data="analysisResult.preview"
            :pagination="{ pageSize: 10 }"
            size="small"
          >
            <t-table-column title="姓名" colKey="name" />
            <t-table-column title="性别" colKey="gender" />
            <t-table-column title="手机号" colKey="phone" />
            <t-table-column title="年龄" colKey="age" />
            <t-table-column title="身高" colKey="height" />
            <t-table-column title="学历" colKey="education" />
          </t-table>
        </div>

        <div class="preview-actions">
          <t-button @click="currentStep = 0">重新上传</t-button>
          <t-button
            theme="primary"
            :loading="importing"
            :disabled="analysisResult.valid === 0"
            @click="handleImport"
          >
            确认导入 ({{ analysisResult.valid }} 条)
          </t-button>
        </div>
      </div>

      <!-- 步骤3: 导入完成 -->
      <div v-if="currentStep === 2" class="success-area">
        <div class="success-icon">
          <CheckCircleIcon />
        </div>
        <h3>导入成功</h3>
        <p>客户数据已成功导入系统</p>
        <t-button theme="primary" @click="handleFinish">
          返回客户列表
        </t-button>
      </div>
    </t-card>
  </div>
</template>

<style scoped>
.client-import-container {
  padding: 24px;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  h2 {
    margin: 0;
  }
}

.steps {
  margin-bottom: 32px;
}

.upload-area {
  max-width: 600px;
  margin: 0 auto;

  .template-download {
    text-align: center;
    margin-bottom: 24px;
    padding: 24px;
    background: #f5f5f5;
    border-radius: 8px;

    p {
      margin-bottom: 12px;
      color: #666;
    }
  }

  .upload-box {
    margin-bottom: 24px;
  }

  .upload-tips {
    padding: 16px;
    background: #f6ffed;
    border: 1px solid #b7eb8f;
    border-radius: 8px;

    h4 {
      margin: 0 0 8px 0;
      color: #52c41a;
    }

    ul {
      margin: 0;
      padding-left: 20px;
      color: #666;

      li {
        margin-bottom: 4px;
      }
    }
  }
}

.preview-area {
  .analysis-summary {
    display: flex;
    gap: 24px;
    margin-bottom: 24px;

    .summary-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;

      &.success {
        color: #52c41a;
      }

      &.error {
        color: #ff4d4f;
      }

        .t-icon {
          font-size: 24px;
        }
    }
  }

  .error-list {
    margin-bottom: 24px;
    padding: 16px;
    background: #fff2f0;
    border: 1px solid #ffccc7;
    border-radius: 8px;

    h4 {
      margin: 0 0 12px 0;
      color: #ff4d4f;
    }

    ul {
      margin: 0;
      padding-left: 20px;
      color: #ff4d4f;
    }
  }

  .preview-table {
    margin-bottom: 24px;

    h4 {
      margin-bottom: 12px;
    }
  }

  .preview-actions {
    display: flex;
    justify-content: center;
    gap: 16px;
  }
}

.success-area {
  text-align: center;
  padding: 48px 0;

  .success-icon {
    font-size: 72px;
    color: #52c41a;
    margin-bottom: 24px;
  }

  h3 {
    margin-bottom: 12px;
    font-size: 24px;
  }

  p {
    color: #666;
    margin-bottom: 24px;
  }
}
</style>
