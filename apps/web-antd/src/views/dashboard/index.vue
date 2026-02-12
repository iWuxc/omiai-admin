<script setup lang="ts">
import { onMounted, ref } from 'vue';

import {
  PlusOutlined,
  HeartFilled,
  BellFilled,
  UserOutlined,
} from '@ant-design/icons-vue';
import { Button, Card, Tag } from 'ant-design-vue';

import { getDashboardStats, getTodoList, getClientTrend, getMatchTrend } from '#/api/omiai';

// 统计数据
const stats = ref({
  client_total: 0,
  client_today_new: 0,
  client_month_new: 0,
  match_total: 0,
  match_month_new: 0,
  follow_up_pending: 0,
});

// 待办事项
const todos = ref<Array<{
  id: number;
  type: string;
  title: string;
  description: string;
  due_time: string;
  priority: number;
}>>([]);

// 趋势数据
const clientTrend = ref<{ dates: string[]; values: number[] }>({ dates: [], values: [] });
const matchTrend = ref<{ dates: string[]; values: number[] }>({ dates: [], values: [] });

// 加载状态
const loadingStats = ref(false);
const loadingTodos = ref(false);
const loadingCharts = ref(false);

// 获取统计数据
async function fetchStats() {
  loadingStats.value = true;
  try {
    const res = await getDashboardStats();
    // 由于拦截器配置，res 已经是 data 字段的内容
    stats.value = res;
  } finally {
    loadingStats.value = false;
  }
}

// 获取待办事项
async function fetchTodos() {
  loadingTodos.value = true;
  try {
    const res = await getTodoList();
    // 由于拦截器配置，res 已经是 data 字段的内容
    todos.value = Array.isArray(res) ? res : [];
  } finally {
    loadingTodos.value = false;
  }
}

// 获取趋势数据
async function fetchTrends() {
  loadingCharts.value = true;
  try {
    const [clientRes, matchRes] = await Promise.all([
      getClientTrend(30),
      getMatchTrend(30),
    ]);
    // 由于拦截器配置，res 已经是 data 字段的内容
    clientTrend.value = clientRes;
    matchTrend.value = matchRes;
  } finally {
    loadingCharts.value = false;
  }
}

// 页面加载
onMounted(() => {
  fetchStats();
  fetchTodos();
  fetchTrends();
});
</script>

<template>
  <div class="dashboard-container">
    <!-- 统计数据卡片 -->
    <div class="stats-row">
      <Card class="stat-card" :bordered="true" :loading="loadingStats">
        <div class="stat-content">
          <div class="stat-icon primary">
            <UserOutlined />
          </div>
          <div class="stat-info">
            <div class="stat-value" style="color: #0052d9;">{{ stats.client_total }}</div>
            <div class="stat-label">客户总数</div>
          </div>
        </div>
      </Card>
      
      <Card class="stat-card" :bordered="true" :loading="loadingStats">
        <div class="stat-content">
          <div class="stat-icon success">
            <PlusOutlined />
          </div>
          <div class="stat-info">
            <div class="stat-value" style="color: #00a870;">{{ stats.client_today_new }}</div>
            <div class="stat-label">今日新增</div>
          </div>
        </div>
      </Card>
      
      <Card class="stat-card" :bordered="true" :loading="loadingStats">
        <div class="stat-content">
          <div class="stat-icon success">
            <PlusOutlined />
          </div>
          <div class="stat-info">
            <div class="stat-value" style="color: #00a870;">{{ stats.client_month_new }}</div>
            <div class="stat-label">本月新增</div>
          </div>
        </div>
      </Card>
      
      <Card class="stat-card" :bordered="true" :loading="loadingStats">
        <div class="stat-content">
          <div class="stat-icon error">
            <HeartFilled />
          </div>
          <div class="stat-info">
            <div class="stat-value" style="color: #e34d59;">{{ stats.match_total }}</div>
            <div class="stat-label">总撮合数</div>
          </div>
        </div>
      </Card>
      
      <Card class="stat-card" :bordered="true" :loading="loadingStats">
        <div class="stat-content">
          <div class="stat-icon error">
            <HeartFilled />
          </div>
          <div class="stat-info">
            <div class="stat-value" style="color: #e34d59;">{{ stats.match_month_new }}</div>
            <div class="stat-label">本月撮合</div>
          </div>
        </div>
      </Card>
      
      <Card class="stat-card" :bordered="true" :loading="loadingStats">
        <div class="stat-content">
          <div class="stat-icon warning">
            <BellFilled />
          </div>
          <div class="stat-info">
            <div class="stat-value" style="color: #ed7b2f;">{{ stats.follow_up_pending }}</div>
            <div class="stat-label">待跟进</div>
          </div>
        </div>
      </Card>
    </div>

    <!-- 趋势图表区域 -->
    <div class="charts-row">
      <Card title="客户增长趋势" class="chart-card" :bordered="true" :loading="loadingCharts">
        <div class="chart-placeholder">
          <p>最近30天客户增长数据</p>
          <p>日期: {{ clientTrend.dates.join(', ') }}</p>
          <p>数量: {{ clientTrend.values.join(', ') }}</p>
        </div>
      </Card>
      
      <Card title="撮合增长趋势" class="chart-card" :bordered="true" :loading="loadingCharts">
        <div class="chart-placeholder">
          <p>最近30天撮合增长数据</p>
          <p>日期: {{ matchTrend.dates.join(', ') }}</p>
          <p>数量: {{ matchTrend.values.join(', ') }}</p>
        </div>
      </Card>
    </div>

    <!-- 待办事项 -->
    <Card title="待办事项" class="todo-card" :bordered="true" :loading="loadingTodos">
      <div v-if="todos.length === 0" class="empty-todos">
        暂无待办事项
      </div>
      <div v-else class="todo-list">
        <div
          v-for="todo in todos"
          :key="todo.id"
          class="todo-item"
          :class="`priority-${todo.priority}`"
        >
          <div class="todo-info">
            <h4>{{ todo.title }}</h4>
            <p>{{ todo.description }}</p>
            <span class="todo-time">{{ todo.due_time }}</span>
          </div>
          <div class="todo-actions">
            <Button type="primary" size="small">查看</Button>
          </div>
        </div>
      </div>
    </Card>
  </div>
</template>

<style scoped>
.dashboard-container {
  padding: 24px;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  :deep(.ant-card-body) {
    padding: 20px;
  }
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.stat-icon.primary {
  background: linear-gradient(135deg, #0052d9 0%, #1890ff 100%);
}

.stat-icon.success {
  background: linear-gradient(135deg, #00a870 0%, #52c41a 100%);
}

.stat-icon.error {
  background: linear-gradient(135deg, #e34d59 0%, #ff4d4f 100%);
}

.stat-icon.warning {
  background: linear-gradient(135deg, #ed7b2f 0%, #faad14 100%);
}

.stat-info {
  .stat-value {
    font-size: 28px;
    font-weight: bold;
    line-height: 1;
    margin-bottom: 4px;
  }

  .stat-label {
    color: #999;
    font-size: 14px;
  }
}

.charts-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.chart-card {
  .chart-placeholder {
    padding: 40px 0;
    text-align: center;
    color: #999;
  }
}

.todo-card {
  .empty-todos {
    text-align: center;
    padding: 40px 0;
    color: #999;
  }

  .todo-list {
    .todo-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 16px;
      border-bottom: 1px solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      &.priority-3 {
        border-left: 3px solid #e34d59;
      }

      &.priority-2 {
        border-left: 3px solid #ed7b2f;
      }

      &.priority-1 {
        border-left: 3px solid #00a870;
      }

      .todo-info {
        flex: 1;

        h4 {
          margin: 0 0 8px 0;
          font-size: 14px;
          font-weight: 500;
        }

        p {
          margin: 0 0 8px 0;
          color: #666;
          font-size: 13px;
        }

        .todo-time {
          color: #999;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
