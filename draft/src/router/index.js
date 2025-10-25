import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Profile from '../views/Profile.vue';
import DailyTracker from '../views/DailyTracker.vue';
import WeeklyTracker from '../views/WeeklyTracker.vue';
import ActivitiesOverview from '../views/ActivitiesOverview.vue';
import ActivitiesPlanner from '../views/ActivitiesPlanner.vue';
import Auth from '../views/Auth.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/auth',
      name: 'auth',
      component: Auth
    },
    {
      path: '/profile',
      name: 'profile',
      component: Profile
    },
    {
      path: '/daily-tracker',
      name: 'daily-tracker',
      component: DailyTracker
    },
    {
      path: '/weekly-tracker',
      name: 'weekly-tracker',
      component: WeeklyTracker
    },
    {
      path: '/activities',
      name: 'activities',
      component: ActivitiesOverview
    },
    {
      path: '/activities/planner',
      name: 'activities-planner',
      component: ActivitiesPlanner
    }
  ]
});

export default router;

