import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    // 投票已并入首页「互动」分类，旧链接重定向到对应模块
    path: '/vote',
    redirect: { path: '/', query: { cat: 'interact', item: 'vote' } }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue')
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;