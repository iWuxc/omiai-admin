<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { EyeOutlined, HeartFilled } from '@ant-design/icons-vue';
import { Button, Card, Input, Select, Table, Tag, message } from 'ant-design-vue';

import { getMatchList } from '#/api/omiai';
import { MatchStatus, MatchStatusMap } from '#/constants/omiai';
import type { MatchListParams, MatchRecord } from '#/types/omiai';

const router = useRouter();

// 列表数据
const matchList = ref<MatchRecord[]>([]);
const total = ref(0);
const loading = ref(false);

// 查询参数
const queryParams = ref<MatchListParams>({
  page: 1,
  page_size: 10,
  status: undefined,
  keyword: '',
});

// 获取列表数据
async function fetchList() {
  loading.value = true;
  try {
    const res = await getMatchList(queryParams.value);
    if (res.data.code === 0) {
      matchList.value = res.data.data.list;
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
    status: undefined,
    keyword: '',
  };
  fetchList();
}

// 分页变化
function handlePageChange(page: number, pageSize: number) {
  queryParams.value.page = page;
  queryParams.value.page_size = pageSize;
  fetchList();
}

// 查看详情
function handleView(record: MatchRecord) {
  router.push(`/couple/detail/${record.id}`);
}

onMounted(() => {
  fetchList();
});
</script>

<template>
  <div class="couple-list-container">
    <Card>
      <!-- 搜索区域 -->
      <div class="search-area">
        <Input
          v-model:value="queryParams.keyword"
          placeholder="搜索客户姓名"
          style="width: 200px"
          @pressEnter="handleSearch"
        />
        <Select
          v-model:value="queryParams.status"
          placeholder="匹配状态"
          style="width: 120px"
          allow-clear
          @change="handleSearch"
        >
          <Select.Option :value="MatchStatus.Acquaintance">相识</Select.Option>
          <Select.Option :value="MatchStatus.Dating">交往</Select.Option>
          <Select.Option :value="MatchStatus.Stable">稳定</Select.Option>
          <Select.Option :value="MatchStatus.Engagement">订婚</Select.Option>
          <Select.Option :value="MatchStatus.Married">结婚</Select.Option>
          <Select.Option :value="MatchStatus.Broken">分手</Select.Option>
        </Select>
        <Button type="primary" @click="handleSearch">搜索</Button>
        <Button @click="handleReset">重置</Button>
      </div>

      <!-- 数据表格 -->
      <Table
        :columns="[
          { title: '男方', dataIndex: 'male_client' },
          { title: '女方', dataIndex: 'female_client' },
          { title: '匹配日期', dataIndex: 'match_date', width: 120 },
          { title: '匹配度', dataIndex: 'match_score', width: 100 },
          { title: '当前状态', dataIndex: 'status', width: 100 },
          { title: '操作', dataIndex: 'action', width: 150, fixed: 'right' },
        ]"
        :data-source="matchList"
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
          <template v-if="column.dataIndex === 'male_client'">
            <div class="client-cell">
              <img
                v-if="record.male_client?.avatar"
                :src="record.male_client.avatar"
                class="client-avatar"
              />
              <span>{{ record.male_client?.name }}</span>
            </div>
          </template>

          <template v-if="column.dataIndex === 'female_client'">
            <div class="client-cell">
              <img
                v-if="record.female_client?.avatar"
                :src="record.female_client.avatar"
                class="client-avatar"
              />
              <span>{{ record.female_client?.name }}</span>
            </div>
          </template>

          <template v-if="column.dataIndex === 'match_score'">
            <span class="score">{{ record.match_score }}分</span>
          </template>

          <template v-if="column.dataIndex === 'status'">
            <Tag :color="MatchStatusMap[record.status]?.color">
              {{ MatchStatusMap[record.status]?.label }}
            </Tag>
          </template>

          <template v-if="column.dataIndex === 'action'">
            <Button type="link" size="small" @click="handleView(record)">
              <EyeOutlined />
              详情
            </Button>
          </template>
        </template>
      </Table>
    </Card>
  </div>
</template>

<style scoped>
.couple-list-container {
  padding: 24px;
}

.search-area {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.client-cell {
  display: flex;
  align-items: center;
  gap: 8px;

  .client-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
  }
}

.score {
  color: #cf1322;
  font-weight: bold;
}
</style>
