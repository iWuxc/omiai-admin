<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
  ArrowLeftIcon,
  CheckIcon,
  UserIcon,
} from 'tdesign-icons-vue-next';
import { Button, Card, Descriptions, message, Tag } from 'tdesign-vue-next';

import { compareClients, confirmMatch } from '#/api/omiai';
import { EducationMap, MatchStatusMap } from '#/constants/omiai';
import type { Comparison } from '#/types/omiai';

const route = useRoute();
const router = useRouter();
const clientId = Number(route.params.clientId);
const candidateId = Number(route.params.candidateId);

// 对比数据
const comparison = ref<Comparison | null>(null);
const loading = ref(false);
const confirming = ref(false);

// 获取对比数据
async function fetchComparison() {
  loading.value = true;
  try {
    const res = await compareClients(clientId, candidateId);
    if (res.data.code === 0) {
      comparison.value = res.data.data;
    } else {
      MessagePlugin.error(res.data.message || '获取对比数据失败');
    }
  } catch (error) {
    MessagePlugin.error('获取对比数据失败');
  } finally {
    loading.value = false;
  }
}

// 确认匹配
async function handleConfirm() {
  confirming.value = true;
  try {
    const res = await confirmMatch({
      client_id: clientId,
      candidate_id: candidateId,
    });
    if (res.data.code === 0) {
      MessagePlugin.success('匹配成功');
      router.push('/couple/list');
    } else {
      MessagePlugin.error(res.data.message || '匹配失败');
    }
  } catch (error) {
    MessagePlugin.error('匹配失败');
  } finally {
    confirming.value = false;
  }
}

// 返回
function handleBack() {
  router.back();
}

onMounted(() => {
  fetchComparison();
});
</script>

<template>
  <div class="couple-compare-container">
    <t-card :loading="loading">
      <!-- 头部 -->
      <div class="header-actions">
        <t-button @click="handleBack">
          <ArrowLeftIcon />
          返回
        </t-button>
        <h2>客户对比分析</h2>
        <t-button
          theme="primary"
          :loading="confirming"
          @click="handleConfirm"
        >
          <CheckIcon />
          确认匹配
        </t-button>
      </div>

      <div v-if="comparison" class="compare-content">
        <!-- 基础信息对比 -->
        <t-card title="基础信息对比" class="compare-section">
          <div class="compare-grid">
            <div class="compare-row header">
              <div class="compare-label">对比项</div>
              <div class="compare-client">客户</div>
              <div class="compare-candidate">候选人</div>
              <div class="compare-diff">差异</div>
            </div>
            <div
              v-for="(value, key) in comparison.basic_info"
              :key="key"
              class="compare-row"
            >
              <div class="compare-label">{{ key }}</div>
              <div class="compare-client">{{ value.client }}</div>
              <div class="compare-candidate">{{ value.candidate }}</div>
              <div class="compare-diff">
                <t-tag v-if="value.match" theme="success">匹配</t-tag>
                <t-tag v-else-if="value.diff" theme="warning">{{ value.diff }}</t-tag>
                <span v-else>-</span>
              </div>
            </div>
          </div>
        </t-card>

        <!-- 性格雷达图对比 -->
        <t-card title="性格特质对比" class="compare-section">
          <div class="radar-compare">
            <div
              v-for="(values, trait) in comparison.personality_radar"
              :key="trait"
              class="radar-item"
            >
              <div class="radar-label">{{ trait }}</div>
              <div class="radar-bar">
                <div class="bar-client" :style="{ width: `${values.client}%` }">
                  {{ values.client }}
                </div>
                <div class="bar-candidate" :style="{ width: `${values.candidate}%` }">
                  {{ values.candidate }}
                </div>
              </div>
            </div>
          </div>
        </t-card>

        <!-- 兴趣爱好 -->
        <t-card title="兴趣爱好" class="compare-section">
          <t-descriptions bordered :column="1">
            <t-descriptions.Item label="重叠度">
              {{ (comparison.interests.overlap_percentage as number) * 100 }}%
            </t-descriptions-item>
            <t-descriptions.Item label="共同爱好">
              <t-tag v-for="item in (comparison.interests.common_list as string[])" :key="item">
                {{ item }}
              </t-tag>
            </t-descriptions-item>
          </t-descriptions>
        </t-card>

        <!-- 价值观匹配 -->
        <t-card title="价值观匹配" class="compare-section">
          <t-descriptions bordered ::column="1">
            <t-descriptions.Item label="匹配度">
              {{ (comparison.values.match_percentage as number) * 100 }}%
            </t-descriptions-item>
            <t-descriptions.Item label="匹配点">
              <p v-for="detail in (comparison.values.details as string[])" :key="detail">
                {{ detail }}
              </p>
            </t-descriptions-item>
          </t-descriptions>
        </t-card>
      </div>
    </t-card>
  </div>
</template>

<style scoped>
.couple-compare-container {
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

.compare-section {
  margin-bottom: 24px;
}

.compare-grid {
  .compare-row {
    display: grid;
    grid-template-columns: 120px 1fr 1fr 120px;
    gap: 16px;
    padding: 12px;
    border-bottom: 1px solid #f0f0f0;

    &.header {
      font-weight: bold;
      background: #f5f5f5;
    }

    .compare-label {
      color: #666;
    }
  }
}

.radar-compare {
  .radar-item {
    margin-bottom: 16px;

    .radar-label {
      margin-bottom: 8px;
      font-weight: 500;
    }

    .radar-bar {
      display: flex;
      gap: 8px;

      .bar-client,
      .bar-candidate {
        height: 24px;
        line-height: 24px;
        text-align: center;
        color: white;
        font-size: 12px;
        border-radius: 4px;
        transition: width 0.3s;
      }

      .bar-client {
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      }

      .bar-candidate {
        background: linear-gradient(90deg, #f093fb 0%, #f5576c 100%);
      }
    }
  }
}
</style>
