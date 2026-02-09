import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:layout-dashboard',
      order: 0,
      title: '仪表盘',
    },
    name: 'OmiaiDashboard',
    path: '/dashboard',
    children: [
      {
        meta: {
          title: '概览',
          affixTab: true,
        },
        name: 'DashboardOverview',
        path: '/dashboard',
        component: () => import('#/views/dashboard/index.vue'),
      },
    ],
  },
  {
    meta: {
      icon: 'lucide:users',
      order: 1,
      title: '客户管理',
    },
    name: 'Client',
    path: '/client',
    children: [
      {
        meta: {
          title: '客户列表',
        },
        name: 'ClientList',
        path: '/client/list',
        component: () => import('#/views/client/list.vue'),
      },
      {
        meta: {
          title: '客户详情',
          hideInMenu: true,
        },
        name: 'ClientDetail',
        path: '/client/detail/:id',
        component: () => import('#/views/client/detail.vue'),
      },
      {
        meta: {
          title: '新增客户',
          hideInMenu: true,
        },
        name: 'ClientCreate',
        path: '/client/create',
        component: () => import('#/views/client/edit.vue'),
      },
      {
        meta: {
          title: '编辑客户',
          hideInMenu: true,
        },
        name: 'ClientEdit',
        path: '/client/edit/:id',
        component: () => import('#/views/client/edit.vue'),
      },
      {
        meta: {
          title: '导入客户',
        },
        name: 'ClientImport',
        path: '/client/import',
        component: () => import('#/views/client/import.vue'),
      },
    ],
  },
  {
    meta: {
      icon: 'lucide:heart',
      order: 2,
      title: '匹配管理',
    },
    name: 'Couple',
    path: '/couple',
    children: [
      {
        meta: {
          title: '情侣档案',
        },
        name: 'CoupleList',
        path: '/couple/list',
        component: () => import('#/views/couple/list.vue'),
      },
      {
        meta: {
          title: '情侣详情',
          hideInMenu: true,
        },
        name: 'CoupleDetail',
        path: '/couple/detail/:id',
        component: () => import('#/views/couple/detail.vue'),
      },
      {
        meta: {
          title: '对比分析',
          hideInMenu: true,
        },
        name: 'CoupleCompare',
        path: '/couple/compare/:clientId/:candidateId',
        component: () => import('#/views/couple/compare.vue'),
      },
      {
        meta: {
          title: '跟进记录',
        },
        name: 'FollowUpList',
        path: '/couple/followup',
        component: () => import('#/views/couple/followup.vue'),
      },
    ],
  },
  {
    meta: {
      icon: 'lucide:bell',
      order: 3,
      title: '提醒中心',
    },
    name: 'Reminder',
    path: '/reminder',
    children: [
      {
        meta: {
          title: '待办提醒',
        },
        name: 'ReminderList',
        path: '/reminder/list',
        component: () => import('#/views/reminder/list.vue'),
      },
      {
        meta: {
          title: '提醒统计',
        },
        name: 'ReminderStats',
        path: '/reminder/stats',
        component: () => import('#/views/reminder/stats.vue'),
      },
    ],
  },
  {
    meta: {
      icon: 'lucide:image',
      order: 4,
      title: 'Banner管理',
    },
    name: 'Banner',
    path: '/banner',
    children: [
      {
        meta: {
          title: 'Banner列表',
        },
        name: 'BannerList',
        path: '/banner/list',
        component: () => import('#/views/banner/list.vue'),
      },
    ],
  },
];

export default routes;
