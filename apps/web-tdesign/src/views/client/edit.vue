<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
  ArrowLeftIcon,
  SaveIcon,
} from 'tdesign-icons-vue-next';
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  InputNumber,
  MessagePlugin,
  Select,
  Steps,
  Upload,
} from 'tdesign-vue-next';

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
      MessagePlugin.success(isEdit.value ? '更新成功' : '创建成功');
      router.push('/client/list');
    } else {
      MessagePlugin.error(res.data.message || '保存失败');
    }
  } catch (error) {
    MessagePlugin.error('请检查表单填写是否正确');
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
    <t-card :loading="loading">
      <!-- 头部 -->
      <div class="header-actions">
        <t-button @click="handleBack">
          <ArrowLeftIcon />
          返回
        </t-button>
        <h2>{{ isEdit ? '编辑客户' : '新增客户' }}</h2>
        <t-button theme="primary" :loading="saving" @click="handleSave">
          <SaveIcon />
          保存
        </t-button>
      </div>

      <!-- 步骤条 -->
      <t-steps :current="currentStep" class="steps">
        <t-step-item title="基础信息" />
        <t-step-item title="教育职业" />
        <t-step-item title="家庭情况" />
        <t-step-item title="择偶要求" />
      </t-steps>

      <!-- 表单 -->
      <t-form
        ref="formRef"
        :model="formData"
        :label-width="120"
        class="edit-form"
      >
        <!-- 步骤1: 基础信息 -->
        <div v-show="currentStep === 0">
          <t-form-item
            label="姓名"
            name="name"
            :rules="[{ required: true, message: '请输入姓名' }]"
          >
            <t-input v-model="formData.name" placeholder="请输入姓名" />
          </t-form-item>

          <t-form-item
            label="性别"
            name="gender"
            :rules="[{ required: true, message: '请选择性别' }]"
          >
            <t-select v-model="formData.gender">
              <t-option :value="Gender.Male" label="男" />
              <t-option :value="Gender.Female" label="女" />
            </t-select>
          </t-form-item>

          <t-form-item
            label="手机号"
            name="phone"
            :rules="[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' },
            ]"
          >
            <t-input v-model="formData.phone" placeholder="请输入手机号" />
          </t-form-item>

          <t-form-item label="出生年月" name="birthday">
            <t-date-picker
              v-model="formData.birthday"
              format="YYYY-MM"
              mode="month"
              style="width: 100%"
            />
          </t-form-item>

          <t-form-item label="年龄" name="age">
            <t-input-number v-model="formData.age" :min="18" :max="100" style="width: 100%" />
          </t-form-item>

          <t-form-item label="身高(cm)" name="height">
            <t-input-number v-model="formData.height" :min="100" :max="250" style="width: 100%" />
          </t-form-item>

          <t-form-item label="体重(kg)" name="weight">
            <t-input-number v-model="formData.weight" :min="30" :max="200" style="width: 100%" />
          </t-form-item>
        </div>

        <!-- 步骤2: 教育职业 -->
        <div v-show="currentStep === 1">
          <t-form-item label="学历" name="education">
            <t-select v-model="formData.education">
              <t-option :value="Education.HighSchool" label="高中及以下" />
              <t-option :value="Education.JuniorCollege" label="大专" />
              <t-option :value="Education.Bachelor" label="本科" />
              <t-option :value="Education.Master" label="硕士" />
              <t-option :value="Education.Doctor" label="博士" />
            </t-select>
          </t-form-item>

          <t-form-item label="职业" name="profession">
            <t-input v-model="formData.profession" placeholder="请输入职业" />
          </t-form-item>

          <t-form-item label="工作城市" name="work_city">
            <t-input v-model="formData.work_city" placeholder="请输入工作城市" />
          </t-form-item>

          <t-form-item label="月收入" name="income">
            <t-input-number
              v-model="formData.income"
              :min="0"
              :step="1000"
              style="width: 100%"
              placeholder="请输入月收入"
            />
          </t-form-item>

          <t-form-item label="房产情况" name="house_status">
            <t-select v-model="formData.house_status">
              <t-option :value="HouseStatus.NoHouse" label="无房" />
              <t-option :value="HouseStatus.HasHouse" label="已购房" />
              <t-option :value="HouseStatus.LoanHouse" label="贷款购房" />
            </t-select>
          </t-form-item>

          <t-form-item label="车辆情况" name="car_status">
            <t-select v-model="formData.car_status">
              <t-option :value="CarStatus.NoCar" label="无车" />
              <t-option :value="CarStatus.HasCar" label="有车" />
            </t-select>
          </t-form-item>
        </div>

        <!-- 步骤3: 家庭情况 -->
        <div v-show="currentStep === 2">
          <t-form-item label="家庭住址" name="address">
            <t-textarea
              v-model="formData.address"
              :rows="2"
              placeholder="请输入家庭住址"
            />
          </t-form-item>

          <t-form-item label="家庭成员" name="family_description">
            <t-textarea
              v-model="formData.family_description"
              :rows="3"
              placeholder="请描述家庭成员情况"
            />
          </t-form-item>

          <t-form-item label="父母工作" name="parents_profession">
            <t-input v-model="formData.parents_profession" placeholder="请输入父母工作情况" />
          </t-form-item>

          <t-form-item label="红娘备注" name="remark">
            <t-textarea
              v-model="formData.remark"
              :rows="4"
              placeholder="请输入红娘备注信息"
            />
          </t-form-item>
        </div>

        <!-- 步骤4: 择偶要求 -->
        <div v-show="currentStep === 3">
          <t-form-item label="年龄范围">
            <t-space>
              <t-input-number
                v-model="formData.partner_requirements.age_min"
                :min="18"
                :max="100"
                placeholder="最小"
                style="width: 120px"
              />
              <span>-</span>
              <t-input-number
                v-model="formData.partner_requirements.age_max"
                :min="18"
                :max="100"
                placeholder="最大"
                style="width: 120px"
              />
            </t-space>
          </t-form-item>

          <t-form-item label="身高范围">
            <t-space>
              <t-input-number
                v-model="formData.partner_requirements.height_min"
                :min="100"
                :max="250"
                placeholder="最小"
                style="width: 120px"
              />
              <span>-</span>
              <t-input-number
                v-model="formData.partner_requirements.height_max"
                :min="100"
                :max="250"
                placeholder="最大"
                style="width: 120px"
              />
            </t-space>
          </t-form-item>

          <t-form-item label="学历要求">
            <t-select
              v-model="formData.partner_requirements.education"
              multiple
              placeholder="请选择学历要求"
            >
              <t-option :value="Education.HighSchool" label="高中及以下" />
              <t-option :value="Education.JuniorCollege" label="大专" />
              <t-option :value="Education.Bachelor" label="本科" />
              <t-option :value="Education.Master" label="硕士" />
              <t-option :value="Education.Doctor" label="博士" />
            </t-select>
          </t-form-item>

          <t-form-item label="其他要求">
            <t-textarea
              v-model="formData.partner_requirements.other_requirements"
              :rows="4"
              placeholder="请输入其他择偶要求"
            />
          </t-form-item>
        </div>

        <!-- 步骤按钮 -->
        <div class="step-actions">
          <t-button v-if="currentStep > 0" @click="prevStep">
            上一步
          </t-button>
          <t-button v-if="currentStep < 3" theme="primary" @click="nextStep">
            下一步
          </t-button>
        </div>
      </t-form>
    </t-card>
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
