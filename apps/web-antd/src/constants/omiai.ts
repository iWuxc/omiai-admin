/**
 * 红娘助手 - 常量枚举定义
 */

// 客户状态
export enum ClientStatus {
  Single = 1, // 单身
  Matching = 2, // 匹配中
  Matched = 3, // 已匹配
  Stopped = 4, // 停止服务
}

export const ClientStatusMap: Record<number, { label: string; color: string }> = {
  [ClientStatus.Single]: { label: '单身', color: 'success' },
  [ClientStatus.Matching]: { label: '匹配中', color: 'warning' },
  [ClientStatus.Matched]: { label: '已匹配', color: 'primary' },
  [ClientStatus.Stopped]: { label: '停止服务', color: 'default' },
};

// 性别
export enum Gender {
  Male = 1, // 男
  Female = 2, // 女
}

export const GenderMap: Record<number, string> = {
  [Gender.Male]: '男',
  [Gender.Female]: '女',
};

// 婚姻状况
export enum MaritalStatus {
  Unmarried = 1, // 未婚
  Married = 2, // 已婚
  Divorced = 3, // 离异
  Widowed = 4, // 丧偶
}

export const MaritalStatusMap: Record<number, string> = {
  [MaritalStatus.Unmarried]: '未婚',
  [MaritalStatus.Married]: '已婚',
  [MaritalStatus.Divorced]: '离异',
  [MaritalStatus.Widowed]: '丧偶',
};

// 学历
export enum Education {
  HighSchool = 1, // 高中及以下
  JuniorCollege = 2, // 大专
  Bachelor = 3, // 本科
  Master = 4, // 硕士
  Doctor = 5, // 博士
}

export const EducationMap: Record<number, string> = {
  [Education.HighSchool]: '高中及以下',
  [Education.JuniorCollege]: '大专',
  [Education.Bachelor]: '本科',
  [Education.Master]: '硕士',
  [Education.Doctor]: '博士',
};

// 房产情况
export enum HouseStatus {
  NoHouse = 1, // 无房
  HasHouse = 2, // 已购房
  LoanHouse = 3, // 贷款购房
}

export const HouseStatusMap: Record<number, string> = {
  [HouseStatus.NoHouse]: '无房',
  [HouseStatus.HasHouse]: '已购房',
  [HouseStatus.LoanHouse]: '贷款购房',
};

// 车辆情况
export enum CarStatus {
  NoCar = 1, // 无车
  HasCar = 2, // 有车
}

export const CarStatusMap: Record<number, string> = {
  [CarStatus.NoCar]: '无车',
  [CarStatus.HasCar]: '有车',
};

// 匹配状态
export enum MatchStatus {
  Acquaintance = 1, // 相识
  Dating = 2, // 交往
  Stable = 3, // 稳定
  Engagement = 4, // 订婚
  Married = 5, // 结婚
  Broken = 6, // 分手
}

export const MatchStatusMap: Record<number, { label: string; color: string }> = {
  [MatchStatus.Acquaintance]: { label: '相识', color: 'default' },
  [MatchStatus.Dating]: { label: '交往', color: 'primary' },
  [MatchStatus.Stable]: { label: '稳定', color: 'success' },
  [MatchStatus.Engagement]: { label: '订婚', color: 'warning' },
  [MatchStatus.Married]: { label: '结婚', color: 'success' },
  [MatchStatus.Broken]: { label: '分手', color: 'danger' },
};

// 提醒类型
export enum ReminderType {
  FollowUp = 1, // 回访提醒
  Birthday = 2, // 生日提醒
  Anniversary = 3, // 纪念日提醒
  ChurnRisk = 4, // 流失预警
}

export const ReminderTypeMap: Record<number, { label: string; icon: string; color: string }> = {
  [ReminderType.FollowUp]: { label: '回访提醒', icon: 'phone', color: 'primary' },
  [ReminderType.Birthday]: { label: '生日提醒', icon: 'gift', color: 'warning' },
  [ReminderType.Anniversary]: { label: '纪念日', icon: 'heart', color: 'success' },
  [ReminderType.ChurnRisk]: { label: '流失预警', icon: 'warning', color: 'danger' },
};

// 提醒优先级
export enum ReminderPriority {
  Low = 1, // 低
  Medium = 2, // 中
  High = 3, // 高
}

export const ReminderPriorityMap: Record<number, { label: string; color: string }> = {
  [ReminderPriority.Low]: { label: '低', color: 'success' },
  [ReminderPriority.Medium]: { label: '中', color: 'warning' },
  [ReminderPriority.High]: { label: '高', color: 'danger' },
};

// 跟进方式
export enum FollowUpMethod {
  Phone = 'phone', // 电话
  FaceToFace = 'face', // 面谈
  Online = 'online', // 线上
}

export const FollowUpMethodMap: Record<string, string> = {
  [FollowUpMethod.Phone]: '电话',
  [FollowUpMethod.FaceToFace]: '面谈',
  [FollowUpMethod.Online]: '线上',
};

// Banner 状态
export enum BannerStatus {
  Disabled = 0, // 禁用
  Enabled = 1, // 启用
}

export const BannerStatusMap: Record<number, { label: string; color: string }> = {
  [BannerStatus.Disabled]: { label: '禁用', color: 'default' },
  [BannerStatus.Enabled]: { label: '启用', color: 'success' },
};

// 满意度评分
export const SatisfactionOptions = [
  { value: 5, label: '非常满意' },
  { value: 4, label: '满意' },
  { value: 3, label: '一般' },
  { value: 2, label: '不满意' },
  { value: 1, label: '非常不满意' },
];
