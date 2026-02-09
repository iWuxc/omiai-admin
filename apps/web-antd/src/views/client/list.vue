<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import {
  PlusOutlined,
  DownloadOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
} from '@ant-design/icons-vue';
import {
  Button,
  Card,
  Input,
  Select,
  Table,
  Tag,
  Modal,
  message,
} from 'ant-design-vue';

import { deleteClient, getClientList } from '#/api/omiai';
import {
  ClientStatus,
  ClientStatusMap,
  Education,
  EducationMap,
  Gender,
  GenderMap,
} from '#/constants/omiai';
import type { Client, ClientListParams } from '#/types/omiai';

const router = useRouter();

// 列表数据
const clientList = ref<Client[]>([]);
const total = ref(0);
const loading = ref(false);

// 查询参数
const queryParams = ref<ClientListParams>({
  page: 1,
  page_size: 10,
  keyword: '',
  gender: undefined,
  status: undefined,
  education: undefined,
});

// 获取列表数据
async function fetchList() {
  loading.value = true;
  try {
    const res = await getClientList(queryParams.value);
    if (res.data.code === 0) {
      clientList.value = res.data.data.list;
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
    keyword: '',
    gender: undefined,
    status: undefined,
    education: undefined,
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
function handleView(record: Client) {
  router.push(`/client/detail/${record.id}`);
}

// 编辑
function handleEdit(record: Client) {
  router.push(`/client/edit/${record.id}`);
}

// 删除
async function handleDelete(record: Client) {
  Modal.confirm({
    title: '确认删除',
    content: '删除后无法恢复，是否确认？',
    okText: '确认',
    cancelText: '取消',
    async onOk() {
      try {
        const res = await deleteClient(record.id);
        if (res.data.code === 0) {
          message.success('删除成功');
          fetchList();
        } else {
          message.error(res.data.message || '删除失败');
        }
      } catch (error) {
        message.error('删除失败');
      }
    },
  });
}

// 新增
function handleCreate() {
  router.push('/client/create');
}

// 导入
function handleImport() {
  router.push('/client/import');
}

onMounted(() => {
  fetchList();
});
</script>

<template>
  <div class="client-list-container">
    <Card :bordered="true">
      <!-- 搜索区域 -->
      <div class="search-area">
        <Input
          v-model:value="queryParams.keyword"
          placeholder="搜索姓名/手机号"
          style="width: 200px"
          @pressEnter="handleSearch"
        />
        <Select
          v-model:value="queryParams.gender"
          placeholder="性别"
          style="width: 120px"
          allow-clear
          @change="handleSearch"
        >
          <Select.Option :value="Gender.Male">男</Select.Option>
          <Select.Option :value="Gender.Female">女</Select.Option>
        </Select>
        <Select
          v-model:value="queryParams.status"
          placeholder="状态"
          style="width: 120px"
          allow-clear
          @change="handleSearch"
        >
          <Select.Option :value="ClientStatus.Single">单身</Select.Option>
          <Select.Option :value="ClientStatus.Matching">匹配中</Select.Option>
          <Select.Option :value="ClientStatus.Matched">已匹配</Select.Option>
        </Select>
        <Select
          v-model:value="queryParams.education"
          placeholder="学历"
          style="width: 120px"
          allow-clear
          @change="handleSearch"
        >
          <Select.Option :value="Education.HighSchool">高中及以下</Select.Option>
          <Select.Option :value="Education.JuniorCollege">大专</Select.Option>
          <Select.Option :value="Education.Bachelor">本科</Select.Option>
          <Select.Option :value="Education.Master">硕士</Select.Option>
          <Select.Option :value="Education.Doctor">博士</Select.Option>
        </Select>
        <Button type="primary" @click="handleSearch">搜索</Button>
        <Button @click="handleReset">重置</Button>
      </div>

      <!-- 操作按钮 -->
      <div class="action-area">
        <Button type="primary" @click="handleCreate">
          <PlusOutlined />
          新增客户
        </Button>
        <Button @click="handleImport">
          <DownloadOutlined />
          批量导入
        </Button>
      </div>

      <!-- 数据表格 -->
      <Table
        :columns="[
          { title: '头像', dataIndex: 'avatar', width: 80 },
          { title: '姓名', dataIndex: 'name' },
          { title: '性别', dataIndex: 'gender', width: 80 },
          { title: '年龄', dataIndex: 'age', width: 80 },
          { title: '身高', dataIndex: 'height', width: 100 },
          { title: '学历', dataIndex: 'education', width: 100 },
          { title: '状态', dataIndex: 'status', width: 100 },
          { title: '更新时间', dataIndex: 'updated_at', width: 180 },
          { title: '操作', dataIndex: 'action', width: 200, fixed: 'right' },
        ]"
        :data-source="clientList"
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
          <template v-if="column.dataIndex === 'avatar'">
            <img
              v-if="record.avatar"
              :src="record.avatar"
              alt="头像"
              class="avatar-img"
            />
            <div v-else class="avatar-placeholder">暂无</div>
          </template>
          
          <template v-if="column.dataIndex === 'gender'">
            {{ GenderMap[record.gender as Gender] }}
          </template>
          
          <template v-if="column.dataIndex === 'education'">
            {{ EducationMap[record.education as Education] }}
          </template>
          
          <template v-if="column.dataIndex === 'status'">
            <Tag :color="ClientStatusMap[record.status as ClientStatus]?.color">
              {{ ClientStatusMap[record.status as ClientStatus]?.label }}
            </Tag>
          </template>
          
          <template v-if="column.dataIndex === 'action'">
            <Button type="link" @click="handleView(record)">
              <EyeOutlined />
              查看
            </Button>
            <Button type="link" @click="handleEdit(record)">
              <EditOutlined />
              编辑
            </Button>
            <Button type="link" danger @click="handleDelete(record)">
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
.client-list-container {
  padding: 24px;
}

.search-area {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.action-area {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.avatar-img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 12px;
}
</style>
