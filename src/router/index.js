import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'App',
    component: () => import('../App.vue')
  },
  {
    path: '/vote',
    name: 'Vote',
    component: () => import('../views/VotePage.vue')
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;