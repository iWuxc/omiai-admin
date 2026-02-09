<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import {
  BellFilled,
  CheckOutlined,
  DeleteOutlined,
  EyeOutlined,
} from '@ant-design/icons-vue';
import { Button, Card, Select, Table, Tag, message } from 'ant-design-vue';

import {
  deleteReminder,
  getReminderList,
  getReminderStats,
  markReminderAsDone,
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
      message.error(res.data.message || '获取列表失败');
    }
  } catch (error) {
    message.error('获取列表失败');
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

// 标记完成
async function handleMarkAsDone(row: Reminder) {
  try {
    const res = await markReminderAsDone(row.id);
    if (res.data.code === 0) {
      message.success('标记成功');
      fetchList();
      fetchStats();
    }
  } catch (error) {
    message.error('操作失败');
  }
}

// 删除
async function handleDelete(row: Reminder) {
  try {
    const res = await deleteReminder(row.id);
    if (res.data.code === 0) {
      message.success('删除成功');
      fetchList();
      fetchStats();
    }
  } catch (error) {
    message.error('删除失败');
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
      <Card class="stat-card">
        <div class="stat-item">
          <BellFilled class="stat-icon" />
          <div class="stat-info">
            <div class="stat-value">{{ stats.total }}</div>
            <div class="stat-label">总提醒</div>
          </div>
        </div>
      </Card>
      <Card class="stat-card">
        <div class="stat-item">
          <div class="stat-icon pending">!</div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.pending }}</div>
            <div class="stat-label">待处理</div>
          </div>
        </div>
      </Card>
      <Card class="stat-card">
        <div class="stat-item">
          <div class="stat-icon today">今</div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.today }}</div>
            <div class="stat-label">今日提醒</div>
          </div>
        </div>
      </Card>
      <Card class="stat-card">
        <div class="stat-item">
          <div class="stat-icon high">急</div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.high_priority }}</div>
            <div class="stat-label">高优先级</div>
          </div>
        </div>
      </Card>
    </div>

    <Card>
      <!-- 搜索区域 -->
      <div class="search-area">
        <Select
          v-model:value="queryParams.is_done"
          placeholder="状态"
          style="width: 120px"
          @change="handleSearch"
        >
          <Select.Option :value="0">待处理</Select.Option>
          <Select.Option :value="1">已完成</Select.Option>
        </Select>
        <Select
          v-model:value="queryParams.type"
          placeholder="类型"
          style="width: 120px"
          allow-clear
          @change="handleSearch"
        >
          <Select.Option :value="ReminderType.FollowUp">回访提醒</Select.Option>
          <Select.Option :value="ReminderType.Birthday">生日提醒</Select.Option>
          <Select.Option :value="ReminderType.Anniversary">纪念日</Select.Option>
          <Select.Option :value="ReminderType.ChurnRisk">流失预警</Select.Option>
        </Select>
        <Select
          v-model:value="queryParams.priority"
          placeholder="优先级"
          style="width: 120px"
          allow-clear
          @change="handleSearch"
        >
          <Select.Option :value="ReminderPriority.High">高</Select.Option>
          <Select.Option :value="ReminderPriority.Medium">中</Select.Option>
          <Select.Option :value="ReminderPriority.Low">低</Select.Option>
        </Select>
        <Button type="primary" @click="handleSearch">搜索</Button>
        <Button @click="handleReset">重置</Button>
      </div>

      <!-- 数据表格 -->
      <Table
        :columns="[
          { title: '类型', dataIndex: 'type', width: 120 },
          { title: '标题', dataIndex: 'title' },
          { title: '内容', dataIndex: 'content' },
          { title: '优先级', dataIndex: 'priority', width: 100 },
          { title: '提醒时间', dataIndex: 'remind_at', width: 150 },
          { title: '状态', dataIndex: 'is_done', width: 100 },
          { title: '操作', dataIndex: 'action', width: 200 },
        ]"
        :data-source="reminderList"
        :loading="loading"
        :pagination="{
          current: queryParams.page,
          pageSize: queryParams.page_size,
          total: total,
          showSizeChanger: true,
          showQuickJumper: true,
        }"
        row-key="id"
        @change="handlePageChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'type'">
            <div class="type-cell">
              <Tag :color="ReminderTypeMap[record.type].color">
                {{ ReminderTypeMap[record.type].label }}
              </Tag>
            </div>
          </template>

          <template v-if="column.dataIndex === 'priority'">
            <Tag :color="ReminderPriorityMap[record.priority].color">
              {{ ReminderPriorityMap[record.priority].label }}
            </Tag>
          </template>

          <template v-if="column.dataIndex === 'is_done'">
            <Tag v-if="record.is_done === 1" color="success">已完成</Tag>
            <Tag v-else color="warning">待处理</Tag>
          </template>

          <template v-if="column.dataIndex === 'action'">
            <Button
              v-if="record.is_done === 0"
              type="link"
              size="small"
              @click="handleMarkAsDone(record)"
            >
              <CheckOutlined />
              标记完成
            </Button>
            <Button
              type="link"
              size="small"
              @click="handleViewClient(record)"
            >
              <EyeOutlined />
              查看客户
            </Button>
            <Button
              type="link"
              danger
              size="small"
              @click="handleDelete(record)"
            >
              <DeleteOutlined />
              删除
            </Button>
          </template>
        </template>
      </Table>
    </Card>
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
  :deep(.ant-card-body) {
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
