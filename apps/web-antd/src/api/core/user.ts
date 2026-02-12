import type { UserInfo } from '@vben/types';

import { requestClient } from '#/api/request';

/**
 * 获取用户信息
 */
export async function getUserInfoApi(): Promise<UserInfo> {
  // 由于 requestClient 配置了 responseReturn: 'data'，所以 res 直接就是 data 字段的内容
  const userInfo = await requestClient.get<{
    id: number;
    nickname: string;
    avatar: string;
    role: string;
  }>('/user/info');

  console.log('getUserInfoApi - 用户信息:', userInfo);

  // 检查数据是否存在
  if (!userInfo || !userInfo.id) {
    console.error('getUserInfoApi - 用户信息为空:', userInfo);
    throw new Error('获取用户信息失败：返回数据为空');
  }

  // 将后端返回的用户信息转换为前端 UserInfo 格式
  return {
    userId: String(userInfo.id),
    username: userInfo.nickname,
    realName: userInfo.nickname,
    avatar: userInfo.avatar || '',
    roles: [userInfo.role],
    homePath: '/dashboard',
  };
}
