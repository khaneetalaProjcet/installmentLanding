import { createRouter, createWebHistory } from 'vue-router'
import InstallmentView from '../views/InstallmentLanding.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'InstallmentLanding',
      component: InstallmentView,
    },
  ],
})

export default router
