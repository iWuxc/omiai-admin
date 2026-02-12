export namespace AuthApi {
  /** 登录接口参数 */
  export interface LoginParams {
    phone: string;
    password: string;
  }

  /** 登录接口返回值 */
  export interface LoginResult {
    accessToken: string;
    user: {
      id: number;
      nickname: string;
      avatar: string;
      role: string;
    };
  }

  export interface RefreshTokenResult {
    data: string;
    status: number;
  }
}

/**
 * 登录
 */
export async function loginApi(data: AuthApi.LoginParams) {
  return requestClient.post<AuthApi.LoginResult>('/auth/login/h5', data);
}

/**
 * 刷新accessToken
 */
export async function refreshTokenApi() {
  return baseRequestClient.post<AuthApi.RefreshTokenResult>('/auth/refresh', {
    withCredentials: true,
  });
}

/**
 * 退出登录
 */
export async function logoutApi() {
  return baseRequestClient.post('/auth/logout', {
    withCredentials: true,
  });
}

/**
 * 获取用户权限码
 */
export async function getAccessCodesApi() {
  return requestClient.get<string[]>('/auth/codes');
}
