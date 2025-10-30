import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { useGlobalState } from '@/composables/useGlobalState';

const routes: RouteRecordRaw[] = [
  {
    path: '/auth',
    meta: { layout: 'authentication' },
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
    meta: { requiresAuth: true, layout: 'default' },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/pages/Dashboard.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'clients',
        name: 'ClientsList',
        component: () => import('@/pages/Clients/ClientsList.vue'),
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: 'clients/new',
        name: 'ClientForm',
        component: () => import('@/pages/Clients/ClientForm.vue'),
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: 'clients/:id/edit',
        name: 'ClientEdit',
        component: () => import('@/pages/Clients/ClientForm.vue'),
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: 'clients/:id',
        name: 'ClientDetails',
        component: () => import('@/pages/Clients/ClientDetails.vue'),
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: 'vehicles',
        name: 'VehiclesList',
        component: () => import('@/pages/Vehicles/VehiclesList.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'vehicles/new',
        name: 'VehicleForm',
        component: () => import('@/pages/Vehicles/VehicleForm.vue'),
      },
      {
        path: 'vehicles/:id/edit',
        name: 'VehicleEdit',
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
        meta: { requiresAuth: true },
      },
      {
        path: 'repairs/new',
        name: 'RepairForm',
        component: () => import('@/pages/Repairs/RepairForm.vue'),
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: 'repairs/:id/edit',
        name: 'RepairEdit',
        component: () => import('@/pages/Repairs/RepairForm.vue'),
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: 'repairs/:id',
        name: 'RepairDetails',
        component: () => import('@/pages/Repairs/RepairDetails.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'offers',
        name: 'OffersList',
        component: () => import('@/pages/Offers/OffersList.vue'),
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: 'offers/new',
        name: 'OfferForm',
        component: () => import('@/pages/Offers/OfferForm.vue'),
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: 'offers/:id',
        name: 'OfferDetails',
        component: () => import('@/pages/Offers/OfferDetails.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'offers/:id/edit',
        name: 'OfferEdit',
        component: () => import('@/pages/Offers/OfferForm.vue'),
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: '/pending-offers',
        name: 'PendingOffers',
        component: () => import('@/pages/Offers/PendingOffers.vue'),
        meta: { requiresAuth: true, requiresClient: true },
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
      {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('@/pages/Error.vue'),
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
  const { isAuthenticated, globalLoading } = useGlobalState();

  // Wait for auth to initialize
  if (globalLoading.value) {
    await new Promise((resolve) => {
      const checkLoading = setInterval(() => {
        if (!globalLoading.value) {
          clearInterval(checkLoading);
          resolve(true);
        }
      }, 50);
    });
  }

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const requiresGuest = to.matched.some((record) => record.meta.requiresGuest);

  if (requiresAuth && !isAuthenticated.value) {
    next({ name: 'Login', query: { redirect: to.fullPath } });
  } else if (requiresGuest && isAuthenticated.value) {
    next({ name: 'Dashboard' });
  } else {
    next();
  }
});
