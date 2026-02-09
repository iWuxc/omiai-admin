<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
  ArrowLeftOutlined,
  SaveOutlined,
} from '@ant-design/icons-vue';
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  Select,
  Steps,
} from 'ant-design-vue';

import { createClient, getClientDetail, updateClient } from '#/api/omiai';
import {
  CarStatus,
  Education,
  Gender,
  HouseStatus,
  MaritalStatus,
} from '#/constants/omiai';
import type { ClientFormData } from '#/types/omiai';

const route = useRoute();
const router = useRouter();
const isEdit = ref(false);
const clientId = ref<number | null>(null);

// 当前步骤
const currentStep = ref(0);

// 表单数据
const formData = reactive<ClientFormData>({
  name: '',
  gender: Gender.Male,
  phone: '',
  birthday: '',
  avatar: '',
  age: undefined,
  height: undefined,
  weight: undefined,
  education: Education.Bachelor,
  marital_status: MaritalStatus.Unmarried,
  address: '',
  family_description: '',
  income: undefined,
  profession: '',
  work_city: '',
  house_status: HouseStatus.NoHouse,
  car_status: CarStatus.NoCar,
  tags: [],
  partner_requirements: {
    age_min: undefined,
    age_max: undefined,
    height_min: undefined,
    height_max: undefined,
    education: [],
    marital_status: [],
    income_min: undefined,
    work_city: [],
    other_requirements: '',
  },
  parents_profession: '',
  remark: '',
  photos: [],
});

// 表单引用
const formRef = ref();

// 加载状态
const loading = ref(false);
const saving = ref(false);

// 获取客户详情
async function fetchDetail() {
  if (!clientId.value) return;
  loading.value = true;
  try {
    const res = await getClientDetail(clientId.value);
    if (res.data.code === 0) {
      const data = res.data.data;
      Object.assign(formData, {
        id: data.id,
        name: data.name,
        gender: data.gender,
        phone: data.phone,
        birthday: data.birthday,
        avatar: data.avatar,
        age: data.age,
        height: data.height,
        weight: data.weight,
        education: data.education,
        marital_status: data.marital_status,
        address: data.address,
        family_description: data.family_description,
        income: data.income,
        profession: data.profession,
        work_city: data.work_city,
        house_status: data.house_status,
        car_status: data.car_status,
        tags: data.tags || [],
        partner_requirements: data.partner_requirements || {},
        parents_profession: data.parents_profession,
        remark: data.remark,
        photos: data.photos || [],
      });
    }
  } finally {
    loading.value = false;
  }
}

// 保存
async function handleSave() {
  try {
    await formRef.value.validate();
    saving.value = true;

    const api = isEdit.value ? updateClient : createClient;
    const res = await api(formData);

    if (res.data.code === 0) {
      message.success(isEdit.value ? '更新成功' : '创建成功');
      router.push('/client/list');
    } else {
      message.error(res.data.message || '保存失败');
    }
  } catch (error) {
    message.error('请检查表单填写是否正确');
  } finally {
    saving.value = false;
  }
}

// 返回
function handleBack() {
  router.back();
}

// 下一步
function nextStep() {
  formRef.value.validate().then(() => {
    if (currentStep.value < 3) {
      currentStep.value++;
    }
  });
}

// 上一步
function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
}

onMounted(() => {
  const id = route.params.id;
  if (id) {
    isEdit.value = true;
    clientId.value = Number(id);
    fetchDetail();
  }
});
</script>

<template>
  <div class="client-edit-container">
    <Card :loading="loading">
      <!-- 头部 -->
      <div class="header-actions">
        <Button @click="handleBack">
          <ArrowLeftOutlined />
          返回
        </Button>
        <h2>{{ isEdit ? '编辑客户' : '新增客户' }}</h2>
        <Button type="primary" :loading="saving" @click="handleSave">
          <SaveOutlined />
          保存
        </Button>
      </div>

      <!-- 步骤条 -->
      <Steps :current="currentStep" class="steps">
        <Steps.Step title="基础信息" />
        <Steps.Step title="教育职业" />
        <Steps.Step title="家庭情况" />
        <Steps.Step title="择偶要求" />
      </Steps>

      <!-- 表单 -->
      <Form
        ref="formRef"
        :model="formData"
        :label-col="{ span: 6 }"
        class="edit-form"
      >
        <!-- 步骤1: 基础信息 -->
        <div v-show="currentStep === 0">
          <Form.Item
            label="姓名"
            name="name"
            :rules="[{ required: true, message: '请输入姓名' }]"
          >
            <Input v-model:value="formData.name" placeholder="请输入姓名" />
          </Form.Item>

          <Form.Item
            label="性别"
            name="gender"
            :rules="[{ required: true, message: '请选择性别' }]"
          >
            <Select v-model:value="formData.gender">
              <Select.Option :value="Gender.Male">男</Select.Option>
              <Select.Option :value="Gender.Female">女</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="手机号"
            name="phone"
            :rules="[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' },
            ]"
          >
            <Input v-model:value="formData.phone" placeholder="请输入手机号" />
          </Form.Item>

          <Form.Item label="出生年月" name="birthday">
            <DatePicker
              v-model:value="formData.birthday"
              format="YYYY-MM"
              picker="month"
              style="width: 100%"
            />
          </Form.Item>

          <Form.Item label="年龄" name="age">
            <InputNumber v-model:value="formData.age" :min="18" :max="100" style="width: 100%" />
          </Form.Item>

          <Form.Item label="身高(cm)" name="height">
            <InputNumber v-model:value="formData.height" :min="100" :max="250" style="width: 100%" />
          </Form.Item>

          <Form.Item label="体重(kg)" name="weight">
            <InputNumber v-model:value="formData.weight" :min="30" :max="200" style="width: 100%" />
          </Form.Item>
        </div>

        <!-- 步骤2: 教育职业 -->
        <div v-show="currentStep === 1">
          <Form.Item label="学历" name="education">
            <Select v-model:value="formData.education">
              <Select.Option :value="Education.HighSchool">高中及以下</Select.Option>
              <Select.Option :value="Education.JuniorCollege">大专</Select.Option>
              <Select.Option :value="Education.Bachelor">本科</Select.Option>
              <Select.Option :value="Education.Master">硕士</Select.Option>
              <Select.Option :value="Education.Doctor">博士</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="职业" name="profession">
            <Input v-model:value="formData.profession" placeholder="请输入职业" />
          </Form.Item>

          <Form.Item label="工作城市" name="work_city">
            <Input v-model:value="formData.work_city" placeholder="请输入工作城市" />
          </Form.Item>

          <Form.Item label="月收入" name="income">
            <InputNumber
              v-model:value="formData.income"
              :min="0"
              :step="1000"
              style="width: 100%"
              placeholder="请输入月收入"
            />
          </Form.Item>

          <Form.Item label="房产情况" name="house_status">
            <Select v-model:value="formData.house_status">
              <Select.Option :value="HouseStatus.NoHouse">无房</Select.Option>
              <Select.Option :value="HouseStatus.HasHouse">已购房</Select.Option>
              <Select.Option :value="HouseStatus.LoanHouse">贷款购房</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="车辆情况" name="car_status">
            <Select v-model:value="formData.car_status">
              <Select.Option :value="CarStatus.NoCar">无车</Select.Option>
              <Select.Option :value="CarStatus.HasCar">有车</Select.Option>
            </Select>
          </Form.Item>
        </div>

        <!-- 步骤3: 家庭情况 -->
        <div v-show="currentStep === 2">
          <Form.Item label="家庭住址" name="address">
            <Input.TextArea
              v-model:value="formData.address"
              :rows="2"
              placeholder="请输入家庭住址"
            />
          </Form.Item>

          <Form.Item label="家庭成员" name="family_description">
            <Input.TextArea
              v-model:value="formData.family_description"
              :rows="3"
              placeholder="请描述家庭成员情况"
            />
          </Form.Item>

          <Form.Item label="父母工作" name="parents_profession">
            <Input v-model:value="formData.parents_profession" placeholder="请输入父母工作情况" />
          </Form.Item>

          <Form.Item label="红娘备注" name="remark">
            <Input.TextArea
              v-model:value="formData.remark"
              :rows="4"
              placeholder="请输入红娘备注信息"
            />
          </Form.Item>
        </div>

        <!-- 步骤4: 择偶要求 -->
        <div v-show="currentStep === 3">
          <Form.Item label="年龄范围">
            <InputNumber
              v-model:value="formData.partner_requirements.age_min"
              :min="18"
              :max="100"
              placeholder="最小"
              style="width: 120px; margin-right: 8px"
            />
            <span>-</span>
            <InputNumber
              v-model:value="formData.partner_requirements.age_max"
              :min="18"
              :max="100"
              placeholder="最大"
              style="width: 120px; margin-left: 8px"
            />
          </Form.Item>

          <Form.Item label="身高范围">
            <InputNumber
              v-model:value="formData.partner_requirements.height_min"
              :min="100"
              :max="250"
              placeholder="最小"
              style="width: 120px; margin-right: 8px"
            />
            <span>-</span>
            <InputNumber
              v-model:value="formData.partner_requirements.height_max"
              :min="100"
              :max="250"
              placeholder="最大"
              style="width: 120px; margin-left: 8px"
            />
          </Form.Item>

          <Form.Item label="学历要求">
            <Select
              v-model:value="formData.partner_requirements.education"
              mode="multiple"
              placeholder="请选择学历要求"
            >
              <Select.Option :value="Education.HighSchool">高中及以下</Select.Option>
              <Select.Option :value="Education.JuniorCollege">大专</Select.Option>
              <Select.Option :value="Education.Bachelor">本科</Select.Option>
              <Select.Option :value="Education.Master">硕士</Select.Option>
              <Select.Option :value="Education.Doctor">博士</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="其他要求">
            <Input.TextArea
              v-model:value="formData.partner_requirements.other_requirements"
              :rows="4"
              placeholder="请输入其他择偶要求"
            />
          </Form.Item>
        </div>

        <!-- 步骤按钮 -->
        <div class="step-actions">
          <Button v-if="currentStep > 0" @click="prevStep">
            上一步
          </Button>
          <Button v-if="currentStep < 3" type="primary" @click="nextStep">
            下一步
          </Button>
        </div>
      </Form>
    </Card>
  </div>
</template>

<style scoped>
.client-edit-container {
  padding: 24px;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  h2 {
    margin: 0;
  }
}

.steps {
  margin-bottom: 32px;
}

.edit-form {
  max-width: 800px;
  margin: 0 auto;
}

.step-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
}
</style>
