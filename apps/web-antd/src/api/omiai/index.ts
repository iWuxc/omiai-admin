/**
 * 红娘助手 - API 请求封装
 */

import type { AxiosRequestConfig } from 'axios';

import { requestClient } from '#/api/request';

import type {
  ApiResponse,
  Banner,
  BannerFormData,
  Client,
  ClientFormData,
  ClientListParams,
  ClientStats,
  ConfirmMatchRequest,
  CreateFollowUpRequest,
  DashboardStats,
  DissolveMatchRequest,
  FollowUpRecord,
  ImportAnalysisResult,
  ImportBatchRequest,
  MatchListParams,
  MatchRecord,
  MatchStats,
  MatchStatusHistory,
  PaginationParams,
  PaginationResult,
  Reminder,
  ReminderListParams,
  ReminderStats,
  TodoItem,
  TrendData,
  UpdateMatchStatusRequest,
} from '../types/omiai';

// ==================== 通用工具函数 ====================

/**
 * 构建查询参数
 */
function buildParams(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  const queryString = searchParams.toString();
  return queryString ? `?\${queryString}` : '';
}

// ==================== 认证模块 API ====================

/**
 * 发送短信验证码
 */
export function sendSms(phone: string) {
  return requestClient.post<null>>('/auth/send_sms', { phone });
}

/**
 * H5 登录（已废弃，请使用 core/auth.ts 中的 loginApi）
 */
export function h5Login(phone: string, password: string) {
  return requestClient.post<{
    accessToken: string;
    user: {
      id: number;
      nickname: string;
      avatar: string;
      role: string;
    };
  }>(
    '/auth/login/h5',
    { phone, password },
  );
}

/**
 * 微信登录（已废弃，请使用 core/auth.ts 中的 wxLoginApi）
 */
export function wxLogin(code: string) {
  return requestClient.post<{
    accessToken: string;
    user: {
      id: number;
      nickname: string;
      avatar: string;
      role: string;
    };
  }>(
    '/auth/login/wx',
    { code },
  );
}

/**
 * 退出登录
 */
export function logout() {
  return requestClient.post('/auth/logout', {
    withCredentials: true,
  });
}

/**
 * 获取用户信息
 */
export function getUserInfo() {
  return requestClient.get<{
    id: number;
    nickname: string;
    avatar: string;
    role: string;
  }>('/user/info');
}

/**
 * 修改密码
 */
export function changePassword(oldPassword: string, newPassword: string) {
  return requestClient.post<null>>('/user/change_password', {
    old_password: oldPassword,
    new_password: newPassword,
  });
}

/**
 * 获取用户权限码
 */
export function getAccessCodes() {
  return requestClient.get<string[]>('/auth/codes');
}

// ==================== 客户管理 API ====================

/**
 * 获取客户列表
 */
export function getClientList(params: ClientListParams) {
  return requestClient.get<PaginationResult<Client>>(
    `/clients/list${buildParams(params)}`,
  );
}

/**
 * 获取客户详情
 */
export function getClientDetail(id: number) {
  return requestClient.get<Client>(`/clients/detail/${id}`);
}

/**
 * 创建客户
 */
export function createClient(data: ClientFormData) {
  return requestClient.post<Client>('/clients/create', data);
}

/**
 * 更新客户
 */
export function updateClient(data: ClientFormData) {
  return requestClient.post<Client>('/clients/update', data);
}

/**
 * 删除客户
 */
export function deleteClient(id: number) {
  return requestClient.delete<null>(`/clients/delete/${id}`);
}

/**
 * 获取客户统计
 */
export function getClientStats() {
  return requestClient.get<ClientStats>('/clients/stats');
}

/**
 * 认领客户
 */
export function claimClient(clientId: number) {
  return requestClient.post<null>('/clients/claim', {
    client_id: clientId,
  });
}

/**
 * 释放客户
 */
export function releaseClient(clientId: number) {
  return requestClient.post<null>('/clients/release', {
    client_id: clientId,
  });
}

/**
 * 获取候选人推荐列表
 */
export function getCandidates(clientId: number) {
  return requestClient.get<
    Array<{
      candidate_id: number;
      name: string;
      avatar: string;
      match_score: number;
      tags: string[];
      age: number;
      height: number;
      education: number;
    }>
  >(`/clients/${clientId}/candidates`);
}

/**
 * 对比两个客户
 */
export function compareClients(clientId: number, candidateId: number) {
  return requestClient.get<{
    basic_info: Record<string, Record<string, unknown>>;
    personality_radar: Record<string, Record<string, number>>;
    interests: Record<string, unknown>;
    values: Record<string, unknown>;
    relationship_expectations: Record<string, Record<string, number>>;
  }>(`/clients/${clientId}/compare/${candidateId}`);
}

/**
 * 分析导入文件
 */
export function analyzeImportFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return requestClient.post<ImportAnalysisResult>(
    '/clients/import/analyze',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      } as AxiosRequestConfig,
    },
  );
}

/**
 * 批量导入客户
 */
export function batchImportClients(data: ImportBatchRequest) {
  return requestClient.post<{ success: number; failed: number }>(
    '/clients/import/batch',
    data,
  );
}

// ==================== 匹配/情侣管理 API ====================

/**
 * 获取匹配记录列表
 */
export function getMatchList(params: MatchListParams) {
  return requestClient.get<PaginationResult<MatchRecord>>(
    `/couples/list${buildParams(params)}`,
  );
}

/**
 * 创建匹配
 */
export function createMatch(data: {
  male_client_id: number;
  female_client_id: number;
  remark?: string;
}) {
  return requestClient.post<MatchRecord>('/couples/create', data);
}

/**
 * 确认匹配
 */
export function confirmMatch(data: ConfirmMatchRequest) {
  return requestClient.post<MatchRecord>('/couples/confirm', data);
}

/**
 * 解除匹配
 */
export function dissolveMatch(data: DissolveMatchRequest) {
  return requestClient.post<null>('/couples/dissolve', data);
}

/**
 * 更新匹配状态
 */
export function updateMatchStatus(data: UpdateMatchStatusRequest) {
  return requestClient.post<null>('/couples/update_status', data);
}

/**
 * 获取跟进记录列表
 */
export function getFollowUpList(matchRecordId: number) {
  return requestClient.get<FollowUpRecord[]>(
    `/couples/followup/list?match_record_id=${matchRecordId}`,
  );
}

/**
 * 创建跟进记录
 */
export function createFollowUp(data: CreateFollowUpRequest) {
  return requestClient.post<FollowUpRecord>('/couples/followup/create', data);
}

/**
 * 获取状态变更历史
 */
export function getStatusHistory(recordId: number) {
  return requestClient.get<MatchStatusHistory[]>(
    `/couples/status/history?record_id=${recordId}`,
  );
}

/**
 * 获取匹配统计
 */
export function getMatchStats() {
  return requestClient.get<MatchStats>('/couples/stats');
}

// ==================== 提醒管理 API ====================

/**
 * 获取提醒列表
 */
export function getReminderList(params: ReminderListParams) {
  return requestClient.get<PaginationResult<Reminder>>(
    `/reminders/list${buildParams(params)}`,
  );
}

/**
 * 获取今日提醒
 */
export function getTodayReminders() {
  return requestClient.get<Reminder[]>('/reminders/today');
}

/**
 * 获取待处理提醒
 */
export function getPendingReminders() {
  return requestClient.get<Reminder[]>('/reminders/pending');
}

/**
 * 获取提醒统计
 */
export function getReminderStats() {
  return requestClient.get<ReminderStats>('/reminders/stats');
}

/**
 * 标记提醒已读
 */
export function markReminderAsRead(id: number) {
  return requestClient.post<null>('/reminders/read', { id });
}

/**
 * 标记提醒已完成
 */
export function markReminderAsDone(id: number) {
  return requestClient.post<null>('/reminders/done', { id });
}

/**
 * 删除提醒
 */
export function deleteReminder(id: number) {
  return requestClient.delete<null>(`/reminders/delete?id=${id}`);
}

// ==================== Banner 管理 API ====================

/**
 * 获取 Banner 列表
 */
export function getBannerList() {
  return requestClient.get<Banner[]>('/banner/list');
}

/**
 * 获取 Banner 详情
 */
export function getBannerDetail(id: number) {
  return requestClient.get<Banner>(`/banner/detail?id=${id}`);
}

/**
 * 创建 Banner
 */
export function createBanner(data: BannerFormData) {
  return requestClient.post<Banner>('/banner/create', data);
}

/**
 * 更新 Banner
 */
export function updateBanner(data: BannerFormData) {
  return requestClient.post<Banner>('/banner/update', data);
}

/**
 * 删除 Banner
 */
export function deleteBanner(id: number) {
  return requestClient.delete<null>(`/banner/delete/${id}`);
}

// ==================== Dashboard API ====================

/**
 * 获取 Dashboard 统计数据
 */
export function getDashboardStats() {
  return requestClient.get<DashboardStats>('/dashboard/stats');
}

/**
 * 获取待办事项列表
 */
export function getTodoList() {
  return requestClient.get<TodoItem[]>('/dashboard/todos');
}

/**
 * 获取客户增长趋势
 */
export function getClientTrend(days = 30) {
  return requestClient.get<TrendData>(
    `/dashboard/chart/client?days=${days}`,
  );
}

/**
 * 获取撮合增长趋势
 */
export function getMatchTrend(days = 30) {
  return requestClient.get<TrendData>(
    `/dashboard/chart/match?days=${days}`,
  );
}

// ==================== AI API ====================

/**
 * AI 匹配分析
 */
export function aiAnalyzeMatch(clientId: number, candidateId: number) {
  return requestClient.post<{
    score: number;
    analysis: string;
    suggestions: string[];
    tags: string[];
  }>(
    '/ai/analyze',
    { client_id: clientId, candidate_id: candidateId },
  );
}

/**
 * AI 破冰话题
 */
export function aiIceBreaker(clientId: number, candidateId: number) {
  return requestClient.post<{ topics: string[]; scenarios: string[] }>(
    '/ai/ice-breaker',
    { client_id: clientId, candidate_id: candidateId },
  );
}

// ==================== 通用 API ====================

/**
 * 文件上传
 */
export function uploadFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return requestClient.post<{ url: string; name: string }>(
    '/common/upload',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      } as AxiosRequestConfig,
    },
  );
}

