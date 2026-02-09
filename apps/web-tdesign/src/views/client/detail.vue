<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
  ArrowLeftIcon,
  EditIcon,
  HeartIcon,
  MessageIcon,
} from 'tdesign-icons-vue-next';
import { Button, Card, Descriptions, MessagePlugin, Tabs, Tag } from 'tdesign-vue-next';

import { getClientDetail, getCandidates } from '#/api/omiai';
import {
  ClientStatus,
  ClientStatusMap,
  EducationMap,
  GenderMap,
  HouseStatusMap,
  CarStatusMap,
  MaritalStatusMap,
} from '#/constants/omiai';
import type { Candidate, Client } from '#/types/omiai';

const route = useRoute();
const router = useRouter();
const clientId = Number(route.params.id);

// 客户详情
const client = ref<Client | null>(null);
const loading = ref(false);

// 候选人列表
const candidates = ref<Candidate[]>([]);
const candidatesLoading = ref(false);

// 获取客户详情
async function fetchClientDetail() {
  loading.value = true;
  try {
    const res = await getClientDetail(clientId);
    if (res.data.code === 0) {
      client.value = res.data.data;
    } else {
      MessagePlugin.error(res.data.message || '获取详情失败');
    }
  } catch (error) {
    MessagePlugin.error('获取详情失败');
  } finally {
    loading.value = false;
  }
}

// 获取候选人
async function fetchCandidates() {
  candidatesLoading.value = true;
  try {
    const res = await getCandidates(clientId);
    if (res.data.code === 0) {
      candidates.value = res.data.data;
    }
  } catch (error) {
    MessagePlugin.error('获取候选人失败');
  } finally {
    candidatesLoading.value = false;
  }
}

// 返回列表
function handleBack() {
  router.back();
}

// 编辑
function handleEdit() {
  router.push(`/client/edit/${clientId}`);
}

// 对比
function handleCompare(candidateId: number) {
  router.push(`/couple/compare/${clientId}/${candidateId}`);
}

onMounted(() => {
  fetchClientDetail();
  fetchCandidates();
});
</script>

<template>
  <div class="client-detail-container">
    <t-card :loading="loading">
      <!-- 头部操作栏 -->
      <div class="header-actions">
        <t-button @click="handleBack">
          <ArrowLeftIcon />
          返回
        </t-button>
        <t-button theme="primary" @click="handleEdit">
          <EditIcon />
          编辑
        </t-button>
      </div>

      <div v-if="client" class="detail-content">
        <!-- 基础信息 -->
        <div class="client-header">
          <img
            v-if="client.avatar"
            :src="client.avatar"
            alt="头像"
            class="client-avatar"
          />
          <div v-else class="client-avatar-placeholder">
            {{ client.name?.charAt(0) }}
          </div>
          <div class="client-basic">
            <h2>{{ client.name }}</h2>
            <div class="client-tags">
              <t-tag :theme="ClientStatusMap[client.status]?.color">
                {{ ClientStatusMap[client.status]?.label }}
              </t-tag>
              <t-tag>{{ GenderMap[client.gender] }}</t-tag>
              <t-tag>{{ client.age }}岁</t-tag>
              <t-tag>{{ client.height }}cm</t-tag>
            </div>
          </div>
        </div>

        <!-- 详细信息 -->
        <t-tabs>
          <t-tab-panel value="basic" label="基础资料">
            <t-descriptions bordered :column="2">
              <t-descriptions-item label="姓名">{{ client.name }}</t-descriptions-item>
              <t-descriptions-item label="性别">{{ GenderMap[client.gender] }}</t-descriptions-item>
              <t-descriptions-item label="出生年月">{{ client.birthday }}</t-descriptions-item>
              <t-descriptions-item label="年龄">{{ client.age }}岁</t-descriptions-item>
              <t-descriptions-item label="属相">{{ client.zodiac || '-' }}</t-descriptions-item>
              <t-descriptions-item label="身高">{{ client.height }}cm</t-descriptions-item>
              <t-descriptions-item label="体重">{{ client.weight || '-' }}kg</t-descriptions-item>
              <t-descriptions-item label="学历">{{ EducationMap[client.education] || '-' }}</t-descriptions-item>
              <t-descriptions-item label="婚姻状况">{{ MaritalStatusMap[client.marital_status] || '-' }}</t-descriptions-item>
              <t-descriptions-item label="联系电话">{{ client.phone }}</t-descriptions-item>
              <t-descriptions-item label="工作城市">{{ client.work_city || '-' }}</t-descriptions-item>
              <t-descriptions-item label="职业">{{ client.profession || '-' }}</t-descriptions-item>
              <t-descriptions-item label="月收入">{{ client.income ? `${client.income}元` : '-' }}</t-descriptions-item>
              <t-descriptions-item label="房产情况">{{ HouseStatusMap[client.house_status] || '-' }}</t-descriptions-item>
              <t-descriptions-item label="车辆情况">{{ CarStatusMap[client.car_status] || '-' }}</t-descriptions-item>
              <t-descriptions-item label="家庭住址">{{ client.address || '-' }}</t-descriptions-item>
            </t-descriptions>
          </t-tab-panel>

          <t-tab-panel value="family" label="家庭情况">
            <t-descriptions bordered :column="1">
              <t-descriptions-item label="家庭成员">
                {{ client.family_description || '-' }}
              </t-descriptions-item>
              <t-descriptions-item label="父母工作">
                {{ client.parents_profession || '-' }}
              </t-descriptions-item>
            </t-descriptions>
          </t-tab-panel>

          <t-tab-panel value="requirements" label="择偶要求">
            <t-descriptions bordered :column="1">
              <t-descriptions-item label="年龄范围">
                {{ client.partner_requirements?.age_min || '-' }} - {{ client.partner_requirements?.age_max || '-' }}
              </t-descriptions-item>
              <t-descriptions-item label="身高范围">
                {{ client.partner_requirements?.height_min || '-' }}cm - {{ client.partner_requirements?.height_max || '-' }}cm
              </t-descriptions-item>
              <t-descriptions-item label="学历要求">
                {{ client.partner_requirements?.education?.map(e => EducationMap[e]).join('、') || '-' }}
              </t-descriptions-item>
              <t-descriptions-item label="其他要求">
                {{ client.partner_requirements?.other_requirements || '-' }}
              </t-descriptions-item>
            </t-descriptions>
          </t-tab-panel>

          <t-tab-panel value="photos" label="照片">
            <div v-if="client.photos?.length" class="photo-grid">
              <img
                v-for="(photo, index) in client.photos"
                :key="index"
                :src="photo"
                alt="照片"
                class="photo-item"
              />
            </div>
            <div v-else class="empty-photos">暂无照片</div>
          </t-tab-panel>

          <t-tab-panel value="remark" label="红娘备注">
            <div class="remark-content">
              {{ client.remark || '暂无备注' }}
            </div>
          </t-tab-panel>
        </t-tabs>

        <!-- 智能匹配区域 -->
        <div v-if="client.status === ClientStatus.Single" class="match-section">
          <h3>
            <HeartIcon />
            智能匹配推荐
          </h3>
          <div v-if="candidatesLoading" class="candidates-loading">
            加载中...
          </div>
          <div v-else-if="candidates.length === 0" class="candidates-empty">
            暂无推荐候选人
          </div>
          <div v-else class="candidates-list">
            <t-card
              v-for="candidate in candidates"
              :key="candidate.candidate_id"
              class="candidate-card"
              size="small"
            >
              <div class="candidate-info">
                <img
                  v-if="candidate.avatar"
                  :src="candidate.avatar"
                  alt="头像"
                  class="candidate-avatar"
                />
                <div v-else class="candidate-avatar-placeholder">
                  {{ candidate.name?.charAt(0) }}
                </div>
                <div class="candidate-detail">
                  <h4>{{ candidate.name }}</h4>
                  <p>{{ candidate.age }}岁 | {{ candidate.height }}cm | {{ EducationMap[candidate.education] }}</p>
                  <div class="match-score">
                    匹配度: {{ candidate.match_score }}分
                  </div>
                  <div class="match-tags">
                    <t-tag v-for="tag in candidate.tags" :key="tag" size="small">
                      {{ tag }}
                    </t-tag>
                  </div>
                </div>
              </div>
              <div class="candidate-actions">
                <t-button theme="primary" size="small" @click="handleCompare(candidate.candidate_id)">
                  <MessageIcon />
                  对比详情
                </t-button>
              </div>
            </t-card>
          </div>
        </div>
      </div>
    </t-card>
  </div>
</template>

<style scoped>
.client-detail-container {
  padding: 24px;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
}

.client-header {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f0f0f0;
}

.client-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
}

.client-avatar-placeholder {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 36px;
  font-weight: bold;
}

.client-basic {
  h2 {
    margin: 0 0 12px 0;
    font-size: 24px;
  }

  .client-tags {
    display: flex;
    gap: 8px;
  }
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;

  .photo-item {
    width: 100%;
    height: 150px;
    object-fit: cover;
    border-radius: 8px;
  }
}

.empty-photos {
  text-align: center;
  padding: 40px 0;
  color: #999;
}

.remark-content {
  padding: 16px;
  background: #f5f5f5;
  border-radius: 8px;
  min-height: 100px;
  white-space: pre-wrap;
}

.match-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;

  h3 {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 16px 0;
    color: #cf1322;
  }
}

.candidates-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.candidate-card {
  .candidate-info {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;
  }

  .candidate-avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    object-fit: cover;
  }

  .candidate-avatar-placeholder {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 24px;
    font-weight: bold;
  }

  .candidate-detail {
    flex: 1;

    h4 {
      margin: 0 0 4px 0;
      font-size: 16px;
    }

    p {
      margin: 0 0 4px 0;
      color: #666;
      font-size: 13px;
    }

    .match-score {
      color: #cf1322;
      font-weight: bold;
      margin-bottom: 4px;
    }

    .match-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }
  }

  .candidate-actions {
    display: flex;
    justify-content: flex-end;
  }
}

.candidates-loading,
.candidates-empty {
  text-align: center;
  padding: 40px 0;
  color: #999;
}
</style>
