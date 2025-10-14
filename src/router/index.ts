import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { useGlobalState } from '@/composables/useGlobalState';
import DefaultLayout from '@/layouts/default.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/auth',
    component: () => import('@/layouts/auth.vue'),
    children: [
      {
        path: 'login',
        name: 'Login',
        component: () => import('@/pages/Auth/Login.vue'),
        meta: { requiresGuest: true },
      },
      {
        path: 'register',
        name: 'Register',
        component: () => import('@/pages/Auth/Register.vue'),
        meta: { requiresGuest: true },
      },
      {
        path: 'forgot-password',
        name: 'ForgotPassword',
        component: () => import('@/pages/Auth/ForgotPassword.vue'),
        meta: { requiresGuest: true },
      },
    ],
  },
  {
    path: '/',
    component: DefaultLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/pages/Dashboard.vue'),
      },
      {
        path: 'clients',
        name: 'ClientsList',
        component: () => import('@/pages/Clients/ClientsList.vue'),
      },
      {
        path: 'clients/new',
        name: 'ClientForm',
        component: () => import('@/pages/Clients/ClientForm.vue'),
      },
      {
        path: 'clients/:id',
        name: 'ClientDetails',
        component: () => import('@/pages/Clients/ClientDetails.vue'),
      },
      {
        path: 'vehicles',
        name: 'VehiclesList',
        component: () => import('@/pages/Vehicles/VehiclesList.vue'),
      },
      {
        path: 'vehicles/new',
        name: 'VehicleForm',
        component: () => import('@/pages/Vehicles/VehicleForm.vue'),
      },
      {
        path: 'vehicles/:id',
        name: 'VehicleDetails',
        component: () => import('@/pages/Vehicles/VehicleDetails.vue'),
      },
      {
        path: 'repairs',
        name: 'RepairsList',
        component: () => import('@/pages/Repairs/RepairsList.vue'),
      },
      {
        path: 'repairs/new',
        name: 'RepairForm',
        component: () => import('@/pages/Repairs/RepairForm.vue'),
      },
      {
        path: 'repairs/:id',
        name: 'RepairDetails',
        component: () => import('@/pages/Repairs/RepairDetails.vue'),
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/pages/Settings.vue'),
      },
    ],
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const { isAuthenticated, loading } = useGlobalState();

  if (loading.value) {
    await until(loading).toBe(false);
  }

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest);

  if (requiresAuth && !isAuthenticated.value) {
    next({ name: 'Login', query: { redirect: to.fullPath } });
  } else if (requiresGuest && isAuthenticated.value) {
    next({ name: 'Dashboard' });
  } else {
    next();
  }
});