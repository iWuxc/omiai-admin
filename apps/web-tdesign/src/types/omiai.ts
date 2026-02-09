/**
 * 红娘助手 - TypeScript 类型定义
 */

import type {
  BannerStatus,
  CarStatus,
  ClientStatus,
  Education,
  Gender,
  HouseStatus,
  MaritalStatus,
  MatchStatus,
  ReminderPriority,
  ReminderType,
} from '../constants/omiai';

// ==================== 基础类型 ====================

// 分页请求参数
export interface PaginationParams {
  page?: number;
  page_size?: number;
}

// 分页响应数据
export interface PaginationResult<T> {
  list: T[];
  total: number;
  current_page: number;
  page_size: number;
}

// 通用 API 响应
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

// ==================== 客户管理类型 ====================

// 择偶要求
export interface PartnerRequirements {
  age_min?: number;
  age_max?: number;
  height_min?: number;
  height_max?: number;
  education?: number[];
  marital_status?: number[];
  income_min?: number;
  work_city?: string[];
  other_requirements?: string;
}

// 客户
export interface Client {
  id: number;
  name: string;
  gender: Gender;
  phone: string;
  birthday: string;
  avatar: string;
  age: number;
  zodiac: string;
  height: number;
  weight: number;
  education: Education;
  marital_status: MaritalStatus;
  address: string;
  family_description: string;
  income: number;
  profession: string;
  work_city: string;
  house_status: HouseStatus;
  house_address: string;
  car_status: CarStatus;
  status: ClientStatus;
  partner_id?: number;
  partner?: Client;
  manager_id: number;
  is_public: boolean;
  tags: string[];
  partner_requirements: PartnerRequirements;
  parents_profession: string;
  remark: string;
  photos: string[];
  candidate_cache_json?: string;
  created_at: string;
  updated_at: string;
}

// 客户列表查询参数
export interface ClientListParams extends PaginationParams {
  keyword?: string;
  gender?: Gender;
  status?: ClientStatus;
  education?: Education;
  age_min?: number;
  age_max?: number;
  height_min?: number;
  height_max?: number;
  marital_status?: MaritalStatus;
  house_status?: HouseStatus;
  car_status?: CarStatus;
  work_city?: string;
  start_time?: string;
  end_time?: string;
  order_by?: string;
}

// 创建/更新客户请求
export interface ClientFormData {
  id?: number;
  name: string;
  gender: Gender;
  phone: string;
  birthday?: string;
  avatar?: string;
  age?: number;
  zodiac?: string;
  height?: number;
  weight?: number;
  education?: Education;
  marital_status?: MaritalStatus;
  address?: string;
  family_description?: string;
  income?: number;
  profession?: string;
  work_city?: string;
  house_status?: HouseStatus;
  house_address?: string;
  car_status?: CarStatus;
  tags?: string[];
  partner_requirements?: PartnerRequirements;
  parents_profession?: string;
  remark?: string;
  photos?: string[];
}

// 客户统计数据
export interface ClientStats {
  total: number;
  today_new: number;
  month_new: number;
  pending: number;
  matched: number;
}

// 导入分析结果
export interface ImportAnalysisResult {
  total: number;
  valid: number;
  invalid: number;
  errors: Array<{
    row: number;
    message: string;
  }>;
  preview: Partial<Client>[];
}

// 批量导入请求
export interface ImportBatchRequest {
  clients: Partial<Client>[];
}

// ==================== 匹配管理类型 ====================

// 匹配记录
export interface MatchRecord {
  id: number;
  male_client_id: number;
  female_client_id: number;
  male_client?: Client;
  female_client?: Client;
  match_date: string;
  match_score: number;
  status: MatchStatus;
  remark: string;
  admin_id: string;
  created_at: string;
  updated_at: string;
}

// 匹配记录列表查询参数
export interface MatchListParams extends PaginationParams {
  status?: MatchStatus;
  start_date?: string;
  end_date?: string;
  keyword?: string;
}

// 候选人
export interface Candidate {
  candidate_id: number;
  name: string;
  avatar: string;
  match_score: number;
  tags: string[];
  age: number;
  height: number;
  education: number;
}

// 对比详情
export interface Comparison {
  basic_info: Record<string, Record<string, unknown>>;
  personality_radar: Record<string, Record<string, number>>;
  interests: Record<string, unknown>;
  values: Record<string, unknown>;
  relationship_expectations: Record<string, Record<string, number>>;
}

// 确认匹配请求
export interface ConfirmMatchRequest {
  client_id: number;
  candidate_id: number;
  remark?: string;
}

// 更新匹配状态请求
export interface UpdateMatchStatusRequest {
  record_id: number;
  old_status: MatchStatus;
  new_status: MatchStatus;
  reason?: string;
}

// 解除匹配请求
export interface DissolveMatchRequest {
  client_id: number;
  reason?: string;
}

// 匹配统计数据
export interface MatchStats {
  total_matches: number;
  status_distribution: Record<number, number>;
  married_count: number;
  success_rate: number;
}

// ==================== 跟进记录类型 ====================

// 跟进记录
export interface FollowUpRecord {
  id: number;
  match_record_id: number;
  match_record?: MatchRecord;
  follow_up_date: string;
  method: string;
  content: string;
  feedback: string;
  satisfaction: number;
  attachments: string[];
  next_follow_up_at?: string;
  created_at: string;
  updated_at: string;
}

// 创建跟进记录请求
export interface CreateFollowUpRequest {
  match_record_id: number;
  method: string;
  content: string;
  feedback?: string;
  satisfaction?: number;
  attachments?: string[];
  next_follow_up_at?: string;
}

// 状态变更历史
export interface MatchStatusHistory {
  id: number;
  match_record_id: number;
  old_status: MatchStatus;
  new_status: MatchStatus;
  change_time: string;
  operator: string;
  reason: string;
  created_at: string;
}

// ==================== 提醒管理类型 ====================

// 提醒
export interface Reminder {
  id: number;
  user_id: number;
  type: ReminderType;
  client_id?: number;
  match_record_id?: number;
  client?: Client;
  match_record?: MatchRecord;
  title: string;
  content: string;
  remind_at: string;
  is_read: number;
  is_done: number;
  priority: ReminderPriority;
  created_at: string;
  updated_at: string;
}

// 提醒列表查询参数
export interface ReminderListParams extends PaginationParams {
  is_done?: number;
  type?: ReminderType;
  priority?: ReminderPriority;
}

// 提醒统计
export interface ReminderStats {
  total: number;
  pending: number;
  today: number;
  high_priority: number;
}

// ==================== Banner 管理类型 ====================

// Banner
export interface Banner {
  id: number;
  title: string;
  image_url: string;
  sort_order: number;
  status: BannerStatus;
  link_url: string;
  created_at: string;
  updated_at: string;
}

// Banner 表单
export interface BannerFormData {
  id?: number;
  title: string;
  image_url: string;
  sort_order: number;
  status: BannerStatus;
  link_url?: string;
}

// ==================== 仪表盘类型 ====================

// Dashboard 统计数据
export interface DashboardStats {
  client_total: number;
  client_today_new: number;
  client_month_new: number;
  match_total: number;
  match_month_new: number;
  follow_up_pending: number;
}

// 待办事项
export interface TodoItem {
  id: number;
  type: string;
  title: string;
  description: string;
  due_time: string;
  priority: number;
  client_id?: number;
}

// 趋势数据
export interface TrendData {
  dates: string[];
  values: number[];
}

// ==================== AI 类型 ====================

// AI 匹配分析请求
export interface AIAnalyzeRequest {
  client_id: number;
  candidate_id: number;
}

// AI 匹配分析结果
export interface AIAnalyzeResult {
  score: number;
  analysis: string;
  suggestions: string[];
  tags: string[];
}

// AI 破冰话题请求
export interface AIIceBreakerRequest {
  client_id: number;
  candidate_id: number;
}

// AI 破冰话题结果
export interface AIIceBreakerResult {
  topics: string[];
  scenarios: string[];
}

// ==================== 通用类型 ====================

// 上传响应
export interface UploadResult {
  url: string;
  name: string;
  size: number;
}
