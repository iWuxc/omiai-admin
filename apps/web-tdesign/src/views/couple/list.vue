<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { EyeIcon, HeartIcon, BreakIcon } from 'tdesign-icons-vue-next';
import { Button, Card, Input, MessagePlugin, Select, Table, Tag } from 'tdesign-vue-next';

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

// 表格列定义
const columns = [
  {
    title: '男方',
    dataIndex: 'male_client',
    key: 'male_client',
  },
  {
    title: '女方',
    dataIndex: 'female_client',
    key: 'female_client',
  },
  {
    title: '匹配日期',
    dataIndex: 'match_date',
    key: 'match_date',
    width: 120,
  },
  {
    title: '匹配度',
    dataIndex: 'match_score',
    key: 'match_score',
    width: 100,
  },
  {
    title: '当前状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
  },
  {
    title: '操作',
    key: 'action',
    width: 150,
    fixed: 'right',
  },
];

// 获取列表数据
async function fetchList() {
  loading.value = true;
  try {
    const res = await getMatchList(queryParams.value);
    if (res.data.code === 0) {
      matchList.value = res.data.data.list;
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
    <t-card>
      <!-- 搜索区域 -->
      <div class="search-area">
        <t-input
          v-model="queryParams.keyword"
          placeholder="搜索客户姓名"
          style="width: 200px"
          @enter="handleSearch"
        />
        <t-select
          v-model="queryParams.status"
          placeholder="匹配状态"
          style="width: 120px"
          clearable
          @change="handleSearch"
        >
          <t-option :value="MatchStatus.Acquaintance" label="相识" />
          <t-option :value="MatchStatus.Dating" label="交往" />
          <t-option :value="MatchStatus.Stable" label="稳定" />
          <t-option :value="MatchStatus.Engagement" label="订婚" />
          <t-option :value="MatchStatus.Married" label="结婚" />
          <t-option :value="MatchStatus.Broken" label="分手" />
        </t-select>
        <t-button theme="primary" @click="handleSearch">搜索</t-button>
        <t-button @click="handleReset">重置</t-button>
      </div>

      <!-- 数据表格 -->
      <t-table
        :columns="columns"
        :data="matchList"
        :loading="loading"
        :pagination="{
          current: queryParams.page,
          pageSize: queryParams.page_size,
          total: total,
          showSizeChanger: true,
          showJumper: true,
          showTotal: true,
        }"
        row-key="id"
        @page-change="handlePageChange"
      >
        <template #male_client="{ row }">
          <div class="client-cell">
            <img
              v-if="row.male_client?.avatar"
              :src="row.male_client.avatar"
              class="client-avatar"
            />
            <span>{{ row.male_client?.name }}</span>
          </div>
        </template>

        <template #female_client="{ row }">
          <div class="client-cell">
            <img
              v-if="row.female_client?.avatar"
              :src="row.female_client.avatar"
              class="client-avatar"
            />
            <span>{{ row.female_client?.name }}</span>
          </div>
        </template>

        <template #match_score="{ row }">
          <span class="score">{{ row.match_score }}分</span>
        </template>

        <template #status="{ row }">
          <t-tag :theme="MatchStatusMap[row.status]?.color">
            {{ MatchStatusMap[row.status]?.label }}
          </t-tag>
        </template>

        <template #action="{ row }">
          <t-button variant="text" size="small" @click="handleView(row)">
            <EyeIcon />
            详情
          </t-button>
        </template>
      </t-table>
    </t-card>
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
