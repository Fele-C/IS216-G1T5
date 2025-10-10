import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '@/views/Dashboard.vue';
import AddActivity from '../views/AddActivity.vue'
import WeeklyGoal from '../views/WeeklyGoal.vue'

const routes = [
  { path: '/', name: 'Dashboard', component: Dashboard },
  { path: '/add', name: 'AddActivity', component: AddActivity },
  { path: '/goal', name: 'WeeklyGoal', component: WeeklyGoal }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;