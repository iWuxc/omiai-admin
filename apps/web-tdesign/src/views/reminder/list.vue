<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import {
  BellIcon,
  CheckIcon,
  DeleteIcon,
  EyeIcon,
} from 'tdesign-icons-vue-next';
import { Button, Card, Input, message, Select, Table, Tag } from 'tdesign-vue-next';

import {
  deleteReminder,
  getReminderList,
  getReminderStats,
  markReminderAsDone,
  markReminderAsRead,
} from '#/api/omiai';
import {
  ReminderPriority,
  ReminderPriorityMap,
  ReminderType,
  ReminderTypeMap,
} from '#/constants/omiai';
import type { Reminder, ReminderListParams, ReminderStats } from '#/types/omiai';

const router = useRouter();

// 统计数据
const stats = ref<ReminderStats>({
  total: 0,
  pending: 0,
  today: 0,
  high_priority: 0,
});

// 列表数据
const reminderList = ref<Reminder[]>([]);
const total = ref(0);
const loading = ref(false);

// 查询参数
const queryParams = ref<ReminderListParams>({
  page: 1,
  page_size: 10,
  is_done: 0,
  type: undefined,
  priority: undefined,
});

// 表格列定义
const columns = [
  {
    title: '类型',
    dataIndex: 'type',
    key: 'type',
    width: 120,
  },
  {
    title: '标题',
    dataIndex: 'title',
    key: 'title',
  },
  {
    title: '内容',
    dataIndex: 'content',
    key: 'content',
  },
  {
    title: '优先级',
    dataIndex: 'priority',
    key: 'priority',
    width: 100,
  },
  {
    title: '提醒时间',
    dataIndex: 'remind_at',
    key: 'remind_at',
    width: 150,
  },
  {
    title: '状态',
    dataIndex: 'is_done',
    key: 'is_done',
    width: 100,
  },
  {
    title: '操作',
    key: 'action',
    width: 200,
  },
];

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

// 获取列表数据
async function fetchList() {
  loading.value = true;
  try {
    const res = await getReminderList(queryParams.value);
    if (res.data.code === 0) {
      reminderList.value = res.data.data.list;
      total.value = res.data.data.total;
    } else {
      MessagePlugin.error(res.data.message || '获取列表失败');
    }
  } catch (error) {
    MessagePlugin.error('获取列表失败');
  } finally {
    loading.value = false;
  }
}

// 搜索
function handleSearch() {
  queryParams.value.page = 1;
  fetchList();
}

// 重置
function handleReset() {
  queryParams.value = {
    page: 1,
    page_size: 10,
    is_done: 0,
    type: undefined,
    priority: undefined,
  };
  fetchList();
}

// 分页变化
function handlePageChange(page: number, pageSize: number) {
  queryParams.value.page = page;
  queryParams.value.page_size = pageSize;
  fetchList();
}

// 标记已读
async function handleMarkAsRead(row: Reminder) {
  try {
    const res = await markReminderAsRead(row.id);
    if (res.data.code === 0) {
      MessagePlugin.success('标记成功');
      fetchList();
    }
  } catch (error) {
    MessagePlugin.error('操作失败');
  }
}

// 标记完成
async function handleMarkAsDone(row: Reminder) {
  try {
    const res = await markReminderAsDone(row.id);
    if (res.data.code === 0) {
      MessagePlugin.success('标记成功');
      fetchList();
      fetchStats();
    }
  } catch (error) {
    MessagePlugin.error('操作失败');
  }
}

// 删除
async function handleDelete(row: Reminder) {
  try {
    const res = await deleteReminder(row.id);
    if (res.data.code === 0) {
      MessagePlugin.success('删除成功');
      fetchList();
      fetchStats();
    }
  } catch (error) {
    MessagePlugin.error('删除失败');
  }
}

// 查看客户
function handleViewClient(row: Reminder) {
  if (row.client_id) {
    router.push(`/client/detail/${row.client_id}`);
  }
}

onMounted(() => {
  fetchStats();
  fetchList();
});
</script>

<template>
  <div class="reminder-list-container">
    <!-- 统计卡片 -->
    <div class="stats-row">
      <t-card class="stat-card">
        <div class="stat-item">
          <BellIcon class="stat-icon" />
          <div class="stat-info">
            <div class="stat-value">{{ stats.total }}</div>
            <div class="stat-label">总提醒</div>
          </div>
        </div>
      </t-card>
      <t-card class="stat-card">
        <div class="stat-item">
          <div class="stat-icon pending">!</div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.pending }}</div>
            <div class="stat-label">待处理</div>
          </div>
        </div>
      </t-card>
      <t-card class="stat-card">
        <div class="stat-item">
          <div class="stat-icon today">今</div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.today }}</div>
            <div class="stat-label">今日提醒</div>
          </div>
        </div>
      </t-card>
      <t-card class="stat-card">
        <div class="stat-item">
          <div class="stat-icon high">急</div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.high_priority }}</div>
            <div class="stat-label">高优先级</div>
          </div>
        </div>
      </t-card>
    </div>

    <t-card>
      <!-- 搜索区域 -->
      <div class="search-area">
        <t-select
          v-model="queryParams.is_done"
          placeholder="状态"
          style="width: 120px"
          @change="handleSearch"
        >
          <t-select.Option :value="0">待处理</t-option>
          <t-select.Option :value="1">已完成</t-option>
        </t-select>
        <t-select
          v-model="queryParams.type"
          placeholder="类型"
          style="width: 120px"
          clearable
          @change="handleSearch"
        >
          <t-select.Option :value="ReminderType.FollowUp">回访提醒</t-option>
          <t-select.Option :value="ReminderType.Birthday">生日提醒</t-option>
          <t-select.Option :value="ReminderType.Anniversary">纪念日</t-option>
          <t-select.Option :value="ReminderType.ChurnRisk">流失预警</t-option>
        </t-select>
        <t-select
          v-model="queryParams.priority"
          placeholder="优先级"
          style="width: 120px"
          clearable
          @change="handleSearch"
        >
          <t-select.Option :value="ReminderPriority.High">高</t-option>
          <t-select.Option :value="ReminderPriority.Medium">中</t-option>
          <t-select.Option :value="ReminderPriority.Low">低</t-option>
        </t-select>
        <t-button theme="primary" @click="handleSearch">搜索</t-button>
        <t-button @click="handleReset">重置</t-button>
      </div>

      <!-- 数据表格 -->
      <t-table
        :columns="columns"
        :data="reminderList"
        :loading="loading"
        :pagination="{
          current: queryParams.page,
          pageSize: queryParams.page_size,
          total: total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total: number) => `共 ${total} 条`,
        }"
        row-key="id"
        @change="handlePageChange"
      >
        <template #action="{ column, row }">
          <template v-if="column.key === 'type'">
            <div class="type-cell">
              <t-tag :color="ReminderTypeMap[row.type].color">
                {{ ReminderTypeMap[row.type].label }}
              </t-tag>
            </div>
          </template>

          <template v-if="column.key === 'priority'">
            <t-tag :color="ReminderPriorityMap[row.priority].color">
              {{ ReminderPriorityMap[row.priority].label }}
            </t-tag>
          </template>

          <template v-if="column.key === 'is_done'">
            <t-tag v-if="row.is_done === 1" color="success">已完成</t-tag>
            <t-tag v-else color="warning">待处理</t-tag>
          </template>

          <template v-if="column.key === 'action'">
            <t-button
              v-if="row.is_done === 0"
              variant="text"
              size="small"
              @click="handleMarkAsDone(row)"
            >
              <CheckIcon />
              标记完成
            </t-button>
            <t-button
              variant="text"
              size="small"
              @click="handleViewClient(row)"
            >
              <EyeIcon />
              查看客户
            </t-button>
            <t-button
              variant="text"
              :theme="danger"
              size="small"
              @click="handleDelete(row)"
            >
              <DeleteIcon />
              删除
            </t-button>
          </template>
        </template>
      </t-table>
    </t-card>
  </div>
</template>

<style scoped>
.reminder-list-container {
  padding: 24px;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  :deep(.t-card-body) {
    padding: 20px;
  }
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 16px;

  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    background: #1890ff;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;

    &.pending {
      background: #faad14;
    }

    &.today {
      background: #52c41a;
    }

    &.high {
      background: #ff4d4f;
    }
  }

  .stat-info {
    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: #262626;
    }

    .stat-label {
      color: #8c8c8c;
    }
  }
}

.search-area {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.type-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
