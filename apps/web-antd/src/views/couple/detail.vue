<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
  ArrowLeftOutlined,
  HeartFilled,
  MessageOutlined,
} from '@ant-design/icons-vue';
import { Button, Card, Descriptions, Timeline, Tag, message } from 'ant-design-vue';

import { getMatchList, getStatusHistory } from '#/api/omiai';
import { MatchStatus, MatchStatusMap } from '#/constants/omiai';
import type { MatchRecord, MatchStatusHistory } from '#/types/omiai';

const route = useRoute();
const router = useRouter();
const recordId = Number(route.params.id);

// 匹配记录
const matchRecord = ref<MatchRecord | null>(null);
const loading = ref(false);

// 状态历史
const statusHistory = ref<MatchStatusHistory[]>([]);

// 获取匹配详情
async function fetchDetail() {
  loading.value = true;
  try {
    const res = await getMatchList({ page: 1, page_size: 1 });
    // 由于拦截器配置，res 已经是 data 字段的内容
    const list = Array.isArray(res) ? res : [];
    matchRecord.value = list.find((item: MatchRecord) => item.id === recordId) || null;
  } catch (error) {
    message.error('获取详情失败');
  } finally {
    loading.value = false;
  }
}

// 获取状态历史
async function fetchStatusHistory() {
  try {
    const res = await getStatusHistory(recordId);
    // 由于拦截器配置，res 已经是 data 字段的内容
    statusHistory.value = Array.isArray(res) ? res : [];
  } catch (error) {
    console.error('获取状态历史失败', error);
  }
}

// 返回
function handleBack() {
  router.back();
}

onMounted(() => {
  fetchDetail();
  fetchStatusHistory();
});
</script>

<template>
  <div class="couple-detail-container">
    <Card :loading="loading">
      <!-- 头部 -->
      <div class="header-actions">
        <Button @click="handleBack">
          <ArrowLeftOutlined />
          返回
        </Button>
        <h2>情侣档案详情</h2>
        <div></div>
      </div>

      <div v-if="matchRecord" class="detail-content">
        <!-- 双方信息对比 -->
        <div class="couple-header">
          <div class="client-card male">
            <img
              v-if="matchRecord.male_client?.avatar"
              :src="matchRecord.male_client.avatar"
              class="client-avatar"
            />
            <div v-else class="client-avatar-placeholder">
              {{ matchRecord.male_client?.name?.charAt(0) }}
            </div>
            <h3>{{ matchRecord.male_client?.name }}</h3>
            <p>{{ matchRecord.male_client?.age }}岁 | {{ matchRecord.male_client?.height }}cm</p>
          </div>

          <div class="match-info">
            <HeartFilled class="heart-icon" />
            <div class="match-score">{{ matchRecord.match_score }}分</div>
            <Tag :color="MatchStatusMap[matchRecord.status]?.color" size="large">
              {{ MatchStatusMap[matchRecord.status]?.label }}
            </Tag>
          </div>

          <div class="client-card female">
            <img
              v-if="matchRecord.female_client?.avatar"
              :src="matchRecord.female_client.avatar"
              class="client-avatar"
            />
            <div v-else class="client-avatar-placeholder female">
              {{ matchRecord.female_client?.name?.charAt(0) }}
            </div>
            <h3>{{ matchRecord.female_client?.name }}</h3>
            <p>{{ matchRecord.female_client?.age }}岁 | {{ matchRecord.female_client?.height }}cm</p>
          </div>
        </div>

        <!-- 详细信息 -->
        <Card title="基本信息">
          <Descriptions bordered :column="2">
            <Descriptions.Item label="匹配日期">
              {{ matchRecord.match_date }}
            </Descriptions.Item>
            <Descriptions.Item label="匹配得分">
              {{ matchRecord.match_score }}分
            </Descriptions.Item>
            <Descriptions.Item label="当前状态">
              <Tag :color="MatchStatusMap[matchRecord.status]?.color">
                {{ MatchStatusMap[matchRecord.status]?.label }}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="备注">
              {{ matchRecord.remark || '-' }}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <!-- 状态历史 -->
        <Card title="状态历史" style="margin-top: 24px;">
          <Timeline v-if="statusHistory.length > 0">
            <Timeline.Item
              v-for="history in statusHistory"
              :key="history.id"
              :color="MatchStatusMap[history.new_status]?.color"
            >
              <p>
                <strong>{{ MatchStatusMap[history.old_status]?.label }}</strong>
                <span style="margin: 0 8px">→</span>
                <strong>{{ MatchStatusMap[history.new_status]?.label }}</strong>
              </p>
              <p>操作人: {{ history.operator }}</p>
              <p>原因: {{ history.reason || '-' }}</p>
              <p>时间: {{ history.change_time }}</p>
            </Timeline.Item>
          </Timeline>
          <div v-else class="empty-history">暂无状态变更记录</div>
        </Card>
      </div>
    </Card>
  </div>
</template>

<style scoped>
.couple-detail-container {
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

.couple-header {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 48px;
  margin-bottom: 32px;
  padding: 32px;
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%);
  border-radius: 16px;

  .client-card {
    text-align: center;

    .client-avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      object-fit: cover;
      border: 4px solid white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .client-avatar-placeholder {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 36px;
      font-weight: bold;
      border: 4px solid white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

      &.female {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      }
    }

    h3 {
      margin: 12px 0 4px 0;
      font-size: 20px;
    }

    p {
      margin: 0;
      color: #666;
    }
  }

  .match-info {
    text-align: center;

    .heart-icon {
      font-size: 48px;
      color: #ff4d4f;
    }

    .match-score {
      font-size: 24px;
      font-weight: bold;
      color: #ff4d4f;
      margin: 8px 0;
    }
  }
}

.empty-history {
  text-align: center;
  padding: 40px 0;
  color: #999;
}
</style>
