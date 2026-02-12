<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';

import {
  Button,
  Card,
  Col,
  Form,
  FormItem,
  Input,
  InputNumber,
  Modal,
  Radio,
  Row,
  message,
} from 'ant-design-vue';

import {
  createBanner,
  getBannerDetail,
  updateBanner,
  uploadFile,
} from '#/api/omiai';
import { BannerStatus } from '#/constants/omiai';
import type { Banner, BannerFormData } from '#/types/omiai';

const router = useRouter();
const route = useRoute();

const formRef = ref();
const loading = ref(false);
const detailLoading = ref(false);
const isEdit = !!route.params.id;

const formData = reactive<BannerFormData>({
  id: 0,
  title: '',
  image_url: '',
  link_url: '',
  sort_order: 0,
  status: BannerStatus.Enabled,
});

// 表单验证规则
const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  image_url: [{ required: true, message: '请上传图片', trigger: 'change' }],
  sort_order: [{ required: true, message: '请输入排序', trigger: 'blur' }],
};

// 获取详情
async function fetchDetail() {
  if (!isEdit) return;

  detailLoading.value = true;
  try {
    const res = await getBannerDetail(Number(route.params.id));
    // 由于拦截器配置，res 已经是 data 字段的内容
    Object.assign(formData, {
      id: res.id,
      title: res.title,
      image_url: res.image_url,
      link_url: res.link_url || '',
      sort_order: res.sort_order,
      status: res.status,
    });
  } catch (error) {
    message.error('获取详情失败');
  } finally {
    detailLoading.value = false;
  }
}

// 上传图片
async function handleUpload(file: File) {
  try {
    const res = await uploadFile(file);
    // 由于拦截器配置，res 已经是 data 字段的内容
    formData.image_url = res.url;
    message.success('上传成功');
  } catch (error) {
    message.error('上传失败');
  }
  return false;
}

// 提交表单
async function handleSubmit() {
  try {
    await formRef.value.validate();
    loading.value = true;

    const apiCall = isEdit ? updateBanner : createBanner;
    await apiCall(formData);

    message.success(isEdit ? '更新成功' : '创建成功');
    handleCancel();
  } catch (error) {
    console.error('Submit error:', error);
  } finally {
    loading.value = false;
  }
}

function handleCancel() {
  router.back();
}

onMounted(() => {
  fetchDetail();
});
</script>

<template>
  <div class="banner-edit-container">
    <Card :title="isEdit ? '编辑 Banner' : '新增 Banner'">
      <Form
        ref="formRef"
        :model="formData"
        :rules="rules"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 20 }"
      >
        <FormItem label="标题" name="title">
          <Input v-model:value="formData.title" placeholder="请输入标题" />
        </FormItem>

        <FormItem label="图片" name="image_url">
          <Input
            v-model:value="formData.image_url"
            placeholder="请输入图片URL或点击下方按钮上传"
          />
          <div style="margin-top: 8px">
            <input
              type="file"
              accept="image/*"
              @change="(e: Event) => {
                const target = e.target as HTMLInputElement;
                const file = target.files?.[0];
                if (file) handleUpload(file);
              }"
            />
            <Button style="margin-left: 8px" size="small">
              上传图片
            </Button>
          </div>
          <div v-if="formData.image_url" style="margin-top: 8px">
            <img
              :src="formData.image_url"
              alt="预览"
              style="max-width: 100%; max-height: 200px"
            />
          </div>
        </FormItem>

        <FormItem label="链接" name="link_url">
          <Input
            v-model:value="formData.link_url"
            placeholder="请输入跳转链接（选填）"
          />
        </FormItem>

        <FormItem label="排序" name="sort_order">
          <InputNumber
            v-model:value="formData.sort_order"
            :min="0"
            placeholder="请输入排序值（数字越小越靠前）"
            style="width: 100%"
          />
        </FormItem>

        <FormItem label="状态" name="status">
          <Radio.Group v-model:value="formData.status">
            <Radio :value="BannerStatus.Enabled">启用</Radio>
            <Radio :value="BannerStatus.Disabled">禁用</Radio>
          </Radio.Group>
        </FormItem>

        <FormItem :wrapper-col="{ offset: 4, span: 20 }">
          <Button type="primary" :loading="loading" @click="handleSubmit">
            {{ isEdit ? '更新' : '创建' }}
          </Button>
          <Button style="margin-left: 8px" @click="handleCancel">
            取消
          </Button>
        </FormItem>
      </Form>
    </Card>
  </div>
</template>

<style scoped>
.banner-edit-container {
  padding: 24px;
}
</style>
