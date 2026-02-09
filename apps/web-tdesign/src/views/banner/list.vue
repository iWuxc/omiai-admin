<script setup lang="ts">
import { onMounted, ref } from 'vue';

import {
  DeleteIcon,
  EditIcon,
  EyeIcon,
  PlusIcon,
} from 'tdesign-icons-vue-next';
import {
  Button,
  Card,
  Image,
  message,
  Modal,
  Switch,
  Table,
  Tag,
} from 'tdesign-vue-next';

import { deleteBanner, getBannerList, updateBanner } from '#/api/omiai';
import { BannerStatus, BannerStatusMap } from '#/constants/omiai';
import type { Banner } from '#/types/omiai';

// Banner 列表
const bannerList = ref<Banner[]>([]);
const loading = ref(false);

// 获取 Banner 列表
async function fetchList() {
  loading.value = true;
  try {
    const res = await getBannerList();
    if (res.data.code === 0) {
      bannerList.value = res.data.data;
    } else {
      MessagePlugin.error(res.data.message || '获取列表失败');
    }
  } catch (error) {
    MessagePlugin.error('获取列表失败');
  } finally {
    loading.value = false;
  }
}

// 更新状态
async function handleStatusChange(banner: Banner, checked: boolean) {
  try {
    const res = await updateBanner({
      ...banner,
      status: checked ? BannerStatus.Enabled : BannerStatus.Disabled,
    });
    if (res.data.code === 0) {
      MessagePlugin.success('更新成功');
      fetchList();
    } else {
      MessagePlugin.error(res.data.message || '更新失败');
    }
  } catch (error) {
    MessagePlugin.error('更新失败');
  }
}

// 删除
async function handleDelete(banner: Banner) {
  DialogPlugin.confirm({
    title: '确认删除',
    content: `确定要删除 Banner "${banner.title}" 吗？`,
    okText: '确认',
    cancelText: '取消',
    async onOk() {
      try {
        const res = await deleteBanner(banner.id);
        if (res.data.code === 0) {
          MessagePlugin.success('删除成功');
          fetchList();
        } else {
          MessagePlugin.error(res.data.message || '删除失败');
        }
      } catch (error) {
        MessagePlugin.error('删除失败');
      }
    },
  });
}

// 新增
function handleCreate() {
  MessagePlugin.info('新增功能开发中...');
}

// 编辑
function handleEdit(banner: Banner) {
  MessagePlugin.info('编辑功能开发中...');
}

onMounted(() => {
  fetchList();
});
</script>

<template>
  <div class="banner-list-container">
    <t-card>
      <!-- 操作按钮 -->
      <div class="action-area">
        <t-button theme="primary" @click="handleCreate">
          <PlusIcon />
          新增 Banner
        </t-button>
      </div>

      <!-- 数据表格 -->
      <t-table
        :data="bannerList"
        :loading="loading"
        row-key="id"
      >
        <t-table.Column title="ID" data-index="id" width="80" />
        
        <t-table.Column title="图片" data-index="image_url" width="200">
          <template #action="{ row }">
            <t-image
              :src="row.image_url"
              :alt="row.title"
              style="width: 150px; height: 60px; object-fit: cover"
            />
          </template>
        </t-table-column>

        <t-table.Column title="标题" data-index="title" />

        <t-table.Column title="链接" data-index="link_url">
          <template #action="{ row }">
            <a v-if="row.link_url" :href="row.link_url" target="_blank">
              {{ row.link_url }}
            </a>
            <span v-else>-</span>
          </template>
        </t-table-column>

        <t-table.Column title="排序" data-index="sort_order" width="100" />

        <t-table.Column title="状态" data-index="status" width="100">
          <template #action="{ row }">
            <t-switch
              :checked="row.status === BannerStatus.Enabled"
              @update:model-value="(checked: boolean) => handleStatusChange(row, checked)"
            />
          </template>
        </t-table-column>

        <t-table.Column title="操作" width="200" fixed="right">
          <template #action="{ row }">
            <t-button variant="text" size="small" @click="handleEdit(row)">
              <EditIcon />
              编辑
            </t-button>
            <t-button variant="text" :theme="danger" size="small" @click="handleDelete(row)">
              <DeleteIcon />
              删除
            </t-button>
          </template>
        </t-table-column>
      </t-table>
    </t-card>
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
