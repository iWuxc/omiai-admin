<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { EyeIcon } from 'tdesign-icons-vue-next';
import { Button, Card, Input, message, Select, Table, Tag } from 'tdesign-vue-next';

import { getFollowUpList } from '#/api/omiai';
import { FollowUpMethodMap, MatchStatusMap } from '#/constants/omiai';
import type { FollowUpRecord } from '#/types/omiai';

// 列表数据
const followUpList = ref<FollowUpRecord[]>([]);
const total = ref(0);
const loading = ref(false);

// 查询参数
const queryParams = ref({
  page: 1,
  page_size: 10,
  keyword: '',
});

// 表格列定义
const columns = [
  {
    title: '匹配对',
    dataIndex: 'match_row',
    key: 'match_row',
  },
  {
    title: '跟进时间',
    dataIndex: 'follow_up_date',
    key: 'follow_up_date',
    width: 150,
  },
  {
    title: '跟进方式',
    dataIndex: 'method',
    key: 'method',
    width: 100,
  },
  {
    title: '满意度',
    dataIndex: 'satisfaction',
    key: 'satisfaction',
    width: 100,
  },
  {
    title: '下次跟进',
    dataIndex: 'next_follow_up_at',
    key: 'next_follow_up_at',
    width: 150,
  },
  {
    title: '操作',
    key: 'action',
    width: 100,
  },
];

// 获取列表数据
async function fetchList() {
  loading.value = true;
  try {
    // 这里应该调用获取所有跟进记录的接口
    // 由于没有单独的接口，暂时使用空数据
    followUpList.value = [];
    total.value = 0;
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

// 分页变化
function handlePageChange(page: number, pageSize: number) {
  queryParams.value.page = page;
  queryParams.value.page_size = pageSize;
  fetchList();
}

onMounted(() => {
  fetchList();
});
</script>

<template>
  <div class="followup-list-container">
    <t-card>
      <!-- 搜索区域 -->
      <div class="search-area">
        <t-input
          v-model="queryParams.keyword"
          placeholder="搜索客户姓名"
          style="width: 200px"
          @enter="handleSearch"
        />
        <t-button theme="primary" @click="handleSearch">搜索</t-button>
      </div>

      <!-- 数据表格 -->
      <t-table
        :columns="columns"
        :data="followUpList"
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
        @page-change="handlePageChange"
      >
        <template #action="{ column, row }">
          <template v-if="column.key === 'match_row'">
            <div v-if="row.match_row">
              {{ row.match_row.male_client?.name }} & {{ row.match_row.female_client?.name }}
            </div>
          </template>

          <template v-if="column.key === 'method'">
            {{ FollowUpMethodMap[row.method] }}
          </template>

          <template v-if="column.key === 'satisfaction'">
            <span v-if="row.satisfaction" class="satisfaction">
              {{ '★'.repeat(row.satisfaction) }}
            </span>
            <span v-else>-</span>
          </template>

          <template v-if="column.key === 'action'">
            <t-button variant="text" size="small">
              <EyeIcon />
              查看
            </t-button>
          </template>
        </template>
      </t-table>
    </t-card>
  </div>
</template>

<style scoped>
.followup-list-container {
  padding: 24px;
}

.search-area {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.satisfaction {
  color: #faad14;
}
</style>
