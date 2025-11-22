import { route } from 'quasar/wrappers';
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router';
import routes from './routes';
import { useAuthStore } from '../stores/auth.store';

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory);

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE)
  });

  Router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    const requiresAuth = to.matched.some(record => record.meta?.requiresAuth !== false);
    const isAuthPage = to.path === '/auth';

    if (isAuthPage && authStore.isAuthenticated) {
      next({ name: 'home' });
      return;
    }

    if (!isAuthPage && !authStore.isAuthenticated && requiresAuth) {
      next({ name: 'auth' });
      return;
    }

    next();
  });

  return Router;
});