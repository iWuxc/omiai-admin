import type { UserInfo } from '@vben/types';

import { requestClient } from '#/api/request';

/**
 * 获取用户信息
 */
export async function getUserInfoApi() {
  // 模拟用户信息
  return Promise.resolve({
    data: {
      userId: '1',
      username: 'admin',
      realName: '管理员',
      avatar: '',
      roles: ['admin'],
      homePath: '/dashboard',
    },
  });
}
