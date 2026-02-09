<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import {
  AddIcon,
  DownloadIcon,
  EditIcon,
  ViewIcon,
  DeleteIcon,
} from 'tdesign-icons-vue-next';
import {
  Button,
  Card,
  DialogPlugin,
  Input,
  Loading,
  MessagePlugin,
  Pagination,
  Select,
  Table,
  Tag,
} from 'tdesign-vue-next';

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

// 表格列定义
const columns = [
  {
    title: '头像',
    colKey: 'avatar',
    width: 80,
  },
  {
    title: '姓名',
    colKey: 'name',
  },
  {
    title: '性别',
    colKey: 'gender',
    width: 80,
  },
  {
    title: '年龄',
    colKey: 'age',
    width: 80,
  },
  {
    title: '身高',
    colKey: 'height',
    width: 100,
  },
  {
    title: '学历',
    colKey: 'education',
    width: 100,
  },
  {
    title: '状态',
    colKey: 'status',
    width: 100,
  },
  {
    title: '更新时间',
    colKey: 'updated_at',
    width: 180,
  },
  {
    title: '操作',
    colKey: 'action',
    width: 200,
    fixed: 'right',
  },
];

// 获取列表数据
async function fetchList() {
  loading.value = true;
  try {
    const res = await getClientList(queryParams.value);
    if (res.data.code === 0) {
      clientList.value = res.data.data.list;
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
    keyword: '',
    gender: undefined,
    status: undefined,
    education: undefined,
  };
  fetchList();
}

// 分页变化
function handlePageChange(pageInfo: { current: number; pageSize: number }) {
  queryParams.value.page = pageInfo.current;
  queryParams.value.page_size = pageInfo.pageSize;
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
  const confirmDia = DialogPlugin.confirm({
    header: '确认删除',
    body: '删除后无法恢复，是否确认？',
    confirmBtn: '确认',
    cancelBtn: '取消',
    onConfirm: async () => {
      try {
        const res = await deleteClient(record.id);
        if (res.data.code === 0) {
          MessagePlugin.success('删除成功');
          fetchList();
        } else {
          MessagePlugin.error(res.data.message || '删除失败');
        }
      } catch (error) {
        MessagePlugin.error('删除失败');
      }
      confirmDia.destroy();
    },
    onClose: () => {
      confirmDia.destroy();
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
          v-model="queryParams.keyword"
          placeholder="搜索姓名/手机号"
          style="width: 200px"
          @enter="handleSearch"
        />
        <Select
          v-model="queryParams.gender"
          placeholder="性别"
          style="width: 120px"
          clearable
          @change="handleSearch"
        >
          <Select.Option :value="Gender.Male">男</Select.Option>
          <Select.Option :value="Gender.Female">女</Select.Option>
        </Select>
        <Select
          v-model="queryParams.status"
          placeholder="状态"
          style="width: 120px"
          clearable
          @change="handleSearch"
        >
          <Select.Option :value="ClientStatus.Single">单身</Select.Option>
          <Select.Option :value="ClientStatus.Matching">匹配中</Select.Option>
          <Select.Option :value="ClientStatus.Matched">已匹配</Select.Option>
        </Select>
        <Select
          v-model="queryParams.education"
          placeholder="学历"
          style="width: 120px"
          clearable
          @change="handleSearch"
        >
          <Select.Option :value="Education.HighSchool">高中及以下</Select.Option>
          <Select.Option :value="Education.JuniorCollege">大专</Select.Option>
          <Select.Option :value="Education.Bachelor">本科</Select.Option>
          <Select.Option :value="Education.Master">硕士</Select.Option>
          <Select.Option :value="Education.Doctor">博士</Select.Option>
        </Select>
        <Button theme="primary" @click="handleSearch">搜索</Button>
        <Button @click="handleReset">重置</Button>
      </div>

      <!-- 操作按钮 -->
      <div class="action-area">
        <Button theme="primary" @click="handleCreate">
          <AddIcon />
          新增客户
        </Button>
        <Button @click="handleImport">
          <DownloadIcon />
          批量导入
        </Button>
      </div>

      <!-- 数据表格 -->
      <Loading :loading="loading">
        <Table
          :columns="columns"
          :data="clientList"
          row-key="id"
          :pagination="{
            current: queryParams.page,
            pageSize: queryParams.page_size,
            total: total,
            showJumper: true,
            showPageSize: true,
          }"
          @page-change="handlePageChange"
        >
          <template #avatar="{ row }">
            <img
              v-if="row.avatar"
              :src="row.avatar"
              alt="头像"
              class="avatar-img"
            />
            <div v-else class="avatar-placeholder">暂无</div>
          </template>
          
          <template #gender="{ row }">
            {{ GenderMap[row.gender as Gender] }}
          </template>
          
          <template #education="{ row }">
            {{ EducationMap[row.education as Education] }}
          </template>
          
          <template #status="{ row }">
            <Tag :theme="ClientStatusMap[row.status as ClientStatus]?.color" variant="light">
              {{ ClientStatusMap[row.status as ClientStatus]?.label }}
            </Tag>
          </template>
          
          <template #action="{ row }">
            <Button theme="primary" variant="text" @click="handleView(row)">
              <ViewIcon />
              查看
            </Button>
            <Button theme="primary" variant="text" @click="handleEdit(row)">
              <EditIcon />
              编辑
            </Button>
            <Button theme="danger" variant="text" @click="handleDelete(row)">
              <DeleteIcon />
              删除
            </Button>
          </template>
        </Table>
      </Loading>
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
