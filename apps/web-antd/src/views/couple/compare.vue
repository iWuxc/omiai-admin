<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
  ArrowLeftOutlined,
  CheckOutlined,
  UserOutlined,
} from '@ant-design/icons-vue';
import { Button, Card, Descriptions, Tag, message } from 'ant-design-vue';

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
    // 由于拦截器配置，res 已经是 data 字段的内容
    comparison.value = res;
  } catch (error) {
    message.error('获取对比数据失败');
  } finally {
    loading.value = false;
  }
}

// 确认匹配
async function handleConfirm() {
  confirming.value = true;
  try {
    await confirmMatch({
      client_id: clientId,
      candidate_id: candidateId,
    });
    message.success('匹配成功');
    router.push('/couple/list');
  } catch (error) {
    message.error('匹配失败');
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
    <Card :loading="loading">
      <!-- 头部 -->
      <div class="header-actions">
        <Button @click="handleBack">
          <ArrowLeftOutlined />
          返回
        </Button>
        <h2>客户对比分析</h2>
        <Button
          type="primary"
          :loading="confirming"
          @click="handleConfirm"
        >
          <CheckOutlined />
          确认匹配
        </Button>
      </div>

      <div v-if="comparison" class="compare-content">
        <!-- 基础信息对比 -->
        <Card title="基础信息对比" class="compare-section">
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
                <Tag v-if="value.match" color="success">匹配</Tag>
                <Tag v-else-if="value.diff" color="warning">{{ value.diff }}</Tag>
                <span v-else>-</span>
              </div>
            </div>
          </div>
        </Card>

        <!-- 性格雷达图对比 -->
        <Card title="性格特质对比" class="compare-section">
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
        </Card>

        <!-- 兴趣爱好 -->
        <Card title="兴趣爱好" class="compare-section">
          <Descriptions bordered :column="1">
            <Descriptions.Item label="重叠度">
              {{ (comparison.interests.overlap_percentage as number) * 100 }}%
            </Descriptions.Item>
            <Descriptions.Item label="共同爱好">
              <Tag v-for="item in (comparison.interests.common_list as string[])" :key="item">
                {{ item }}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <!-- 价值观匹配 -->
        <Card title="价值观匹配" class="compare-section">
          <Descriptions bordered :column="1">
            <Descriptions.Item label="匹配度">
              {{ (comparison.values.match_percentage as number) * 100 }}%
            </Descriptions.Item>
            <Descriptions.Item label="匹配点">
              <p v-for="detail in (comparison.values.details as string[])" :key="detail">
                {{ detail }}
              </p>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </Card>
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
