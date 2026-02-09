<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { EyeOutlined } from '@ant-design/icons-vue';
import { Button, Card, Input, Table, Tag, message } from 'ant-design-vue';

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

// 获取列表数据
async function fetchList() {
  loading.value = true;
  try {
    // 这里应该调用获取所有跟进记录的接口
    // 由于没有单独的接口，暂时使用空数据
    followUpList.value = [];
    total.value = 0;
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
    <Card>
      <!-- 搜索区域 -->
      <div class="search-area">
        <Input
          v-model:value="queryParams.keyword"
          placeholder="搜索客户姓名"
          style="width: 200px"
          @pressEnter="handleSearch"
        />
        <Button type="primary" @click="handleSearch">搜索</Button>
      </div>

      <!-- 数据表格 -->
      <Table
        :columns="[
          { title: '匹配对', dataIndex: 'match_row' },
          { title: '跟进时间', dataIndex: 'follow_up_date', width: 150 },
          { title: '跟进方式', dataIndex: 'method', width: 100 },
          { title: '满意度', dataIndex: 'satisfaction', width: 100 },
          { title: '下次跟进', dataIndex: 'next_follow_up_at', width: 150 },
          { title: '操作', dataIndex: 'action', width: 100 },
        ]"
        :data-source="followUpList"
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
          <template v-if="column.dataIndex === 'match_row'">
            <div v-if="record.match_row">
              {{ record.match_row.male_client?.name }} & {{ record.match_row.female_client?.name }}
            </div>
          </template>

          <template v-if="column.dataIndex === 'method'">
            {{ FollowUpMethodMap[record.method] }}
          </template>

          <template v-if="column.dataIndex === 'satisfaction'">
            <span v-if="record.satisfaction" class="satisfaction">
              {{ '★'.repeat(record.satisfaction) }}
            </span>
            <span v-else>-</span>
          </template>

          <template v-if="column.dataIndex === 'action'">
            <Button type="link" size="small">
              <EyeOutlined />
              查看
            </Button>
          </template>
        </template>
      </Table>
    </Card>
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
