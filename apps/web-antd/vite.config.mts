import { defineConfig } from '@vben/vite-config';

export default defineConfig(async () => {
  return {
    application: {},
    vite: {
      server: {
        proxy: {
          '/api': {
            changeOrigin: true,
            // 后端API地址（根据后端服务实际端口调整）
            target: 'http://localhost:10131',
            ws: true,
          },
        },
      },
    },
  };
});
