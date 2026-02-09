<script setup lang="ts">
import { onMounted, ref } from 'vue';

import {
  BellFilled,
  CheckCircleFilled,
  ExclamationCircleFilled,
  ClockCircleFilled,
} from '@ant-design/icons-vue';
import { Card } from 'ant-design-vue';

import { getReminderStats } from '#/api/omiai';
import type { ReminderStats } from '#/types/omiai';

// 统计数据
const stats = ref<ReminderStats>({
  total: 0,
  pending: 0,
  today: 0,
  high_priority: 0,
});

// 趋势数据（模拟数据）
const trendData = ref([
  { date: '2026-01-01', count: 5 },
  { date: '2026-01-02', count: 8 },
  { date: '2026-01-03', count: 12 },
  { date: '2026-01-04', count: 6 },
  { date: '2026-01-05', count: 15 },
  { date: '2026-01-06', count: 9 },
  { date: '2026-01-07', count: 11 },
]);

// 类型分布（模拟数据）
const typeDistribution = ref([
  { type: '回访提醒', count: 45, color: '#1890ff' },
  { type: '生日提醒', count: 23, color: '#52c41a' },
  { type: '纪念日', count: 12, color: '#faad14' },
  { type: '流失预警', count: 5, color: '#ff4d4f' },
]);

// 获取统计数据
async function fetchStats() {
  try {
    const res = await getReminderStats();
    if (res.data.code === 0) {
      stats.value = res.data.data;
    }
  } catch (error) {
    console.error('获取统计失败', error);
  }
}

onMounted(() => {
  fetchStats();
});
</script>

<template>
  <div class="reminder-stats-container">
    <!-- 统计卡片 -->
    <div class="stats-grid">
      <Card class="stat-card primary">
        <div class="stat-content">
          <BellFilled class="stat-icon" />
          <div class="stat-info">
            <div class="stat-value">{{ stats.total }}</div>
            <div class="stat-label">总提醒数</div>
          </div>
        </div>
      </Card>

      <Card class="stat-card warning">
        <div class="stat-content">
          <ClockCircleFilled class="stat-icon" />
          <div class="stat-info">
            <div class="stat-value">{{ stats.pending }}</div>
            <div class="stat-label">待处理</div>
          </div>
        </div>
      </Card>

      <Card class="stat-card success">
        <div class="stat-content">
          <CheckCircleFilled class="stat-icon" />
          <div class="stat-info">
            <div class="stat-value">{{ stats.today }}</div>
            <div class="stat-label">今日提醒</div>
          </div>
        </div>
      </Card>

      <Card class="stat-card danger">
        <div class="stat-content">
          <ExclamationCircleFilled class="stat-icon" />
          <div class="stat-info">
            <div class="stat-value">{{ stats.high_priority }}</div>
            <div class="stat-label">高优先级</div>
          </div>
        </div>
      </Card>
    </div>

    <!-- 趋势图表 -->
    <Card title="提醒趋势（近7天）" class="chart-card">
      <div class="trend-chart">
        <div
          v-for="item in trendData"
          :key="item.date"
          class="trend-bar"
          :style="{ height: `${(item.count / 20) * 100}%` }"
        >
          <div class="bar-value">{{ item.count }}</div>
          <div class="bar-date">{{ item.date.slice(5) }}</div>
        </div>
      </div>
    </Card>

    <!-- 类型分布 -->
    <Card title="提醒类型分布" class="distribution-card">
      <div class="distribution-list">
        <div
          v-for="item in typeDistribution"
          :key="item.type"
          class="distribution-item"
        >
          <div class="distribution-color" :style="{ background: item.color }"></div>
          <div class="distribution-label">{{ item.type }}</div>
          <div class="distribution-value">{{ item.count }}</div>
          <div class="distribution-percent">
            {{ Math.round((item.count / typeDistribution.reduce((sum, i) => sum + i.count, 0)) * 100) }}%
          </div>
        </div>
      </div>
    </Card>
  </div>
</template>

<style scoped>
.reminder-stats-container {
  padding: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  :deep(.ant-card-body) {
    padding: 24px;
  }

  &.primary .stat-icon {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  &.warning .stat-icon {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  }

  &.success .stat-icon {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  }

  &.danger .stat-icon {
    background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  }
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;

  .stat-icon {
    width: 64px;
    height: 64px;
    border-radius: 12px;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
  }

  .stat-info {
    .stat-value {
      font-size: 32px;
      font-weight: bold;
      color: #262626;
    }

    .stat-label {
      font-size: 14px;
      color: #8c8c8c;
    }
  }
}

.chart-card {
  margin-bottom: 24px;

  .trend-chart {
    display: flex;
    align-items: flex-end;
    gap: 16px;
    height: 200px;
    padding: 20px 0;

    .trend-bar {
      flex: 1;
      background: linear-gradient(180deg, #1890ff 0%, #096dd9 100%);
      border-radius: 4px 4px 0 0;
      min-height: 20px;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      align-items: center;
      padding-bottom: 8px;
      transition: all 0.3s;

      &:hover {
        opacity: 0.8;
      }

      .bar-value {
        color: white;
        font-weight: bold;
        margin-bottom: 4px;
      }

      .bar-date {
        color: #8c8c8c;
        font-size: 12px;
        position: absolute;
        bottom: -24px;
      }
    }
  }
}

.distribution-card {
  .distribution-list {
    .distribution-item {
      display: flex;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .distribution-color {
        width: 16px;
        height: 16px;
        border-radius: 4px;
        margin-right: 12px;
      }

      .distribution-label {
        flex: 1;
        color: #595959;
      }

      .distribution-value {
        width: 60px;
        text-align: right;
        font-weight: 500;
      }

      .distribution-percent {
        width: 60px;
        text-align: right;
        color: #8c8c8c;
      }
    }
  }
}
</style>
