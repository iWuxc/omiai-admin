<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
} from '@ant-design/icons-vue';
import {
  Button,
  Card,
  Image,
  Modal,
  Switch,
  Table,
  Tag,
  message,
} from 'ant-design-vue';

import { deleteBanner, getBannerList, updateBanner } from '#/api/omiai';
import { BannerStatus } from '#/constants/omiai';
import type { Banner } from '#/types/omiai';

const router = useRouter();

// Banner 列表
const bannerList = ref<Banner[]>([]);
const loading = ref(false);

// 获取 Banner 列表
async function fetchList() {
  loading.value = true;
  try {
    const res = await getBannerList();
    // 由于拦截器配置，res 已经是 data 字段的内容
    bannerList.value = res?.list || [];
  } catch (error) {
    message.error('获取列表失败');
  } finally {
    loading.value = false;
  }
}

// 更新状态
async function handleStatusChange(banner: Banner, checked: boolean) {
  try {
    await updateBanner({
      ...banner,
      status: checked ? BannerStatus.Enabled : BannerStatus.Disabled,
    });
    message.success('更新成功');
    fetchList();
  } catch (error) {
    message.error('更新失败');
  }
}

// 删除
async function handleDelete(banner: Banner) {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除 Banner "${banner.title}" 吗？`,
    okText: '确认',
    cancelText: '取消',
    async onOk() {
      try {
        await deleteBanner(banner.id);
        message.success('删除成功');
        fetchList();
      } catch (error) {
        message.error('删除失败');
      }
    },
  });
}

// 新增
function handleCreate() {
  router.push('/banner/create');
}

// 编辑
function handleEdit(banner: Banner) {
  router.push(`/banner/edit/${banner.id}`);
}

onMounted(() => {
  fetchList();
});
</script>

<template>
  <div class="banner-list-container">
    <Card>
      <!-- 操作按钮 -->
      <div class="action-area">
        <Button type="primary" @click="handleCreate">
          <PlusOutlined />
          新增 Banner
        </Button>
      </div>

      <!-- 数据表格 -->
      <Table
        :data-source="bannerList"
        :loading="loading"
        row-key="id"
        :columns="[
          { title: 'ID', dataIndex: 'id', width: 80 },
          { title: '图片', dataIndex: 'image_url', width: 200 },
          { title: '标题', dataIndex: 'title' },
          { title: '链接', dataIndex: 'link_url' },
          { title: '排序', dataIndex: 'sort_order', width: 100 },
          { title: '状态', dataIndex: 'status', width: 100 },
          { title: '操作', dataIndex: 'action', width: 200, fixed: 'right' },
        ]"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'image_url'">
            <Image
              :src="record.image_url"
              :alt="record.title"
              style="width: 150px; height: 60px; object-fit: cover"
            />
          </template>

          <template v-if="column.dataIndex === 'link_url'">
            <a v-if="record.link_url" :href="record.link_url" target="_blank">
              {{ record.link_url }}
            </a>
            <span v-else>-</span>
          </template>

          <template v-if="column.dataIndex === 'status'">
            <Switch
              :checked="record.status === BannerStatus.Enabled"
              @update:checked="(checked: boolean) => handleStatusChange(record, checked)"
            />
          </template>

          <template v-if="column.dataIndex === 'action'">
            <Button type="link" size="small" @click="handleEdit(record)">
              <EditOutlined />
              编辑
            </Button>
            <Button type="link" danger size="small" @click="handleDelete(record)">
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
.banner-list-container {
  padding: 24px;
}

.action-area {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}
</style>
