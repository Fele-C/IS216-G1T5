import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Profile from '../views/Profile.vue';
import DailyTracker from '../views/DailyTracker.vue';
import WeeklyTracker from '../views/WeeklyTracker.vue';
import ActivitiesOverview from '../views/ActivitiesOverview.vue';
import ActivitiesPlanner from '../views/ActivitiesPlanner.vue';
import Auth from '../views/Auth.vue';
import { supabase } from '../lib/supabase';

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
      component: Profile,
      meta: { requiresAuth: true }
    },
    {
      path: '/daily-tracker',
      name: 'daily-tracker',
      component: DailyTracker,
      meta: { requiresAuth: true }
    },
    {
      path: '/weekly-tracker',
      name: 'weekly-tracker',
      component: WeeklyTracker,
      meta: { requiresAuth: true }
    },
    {
      path: '/activities',
      name: 'activities',
      component: ActivitiesOverview,
      meta: { requiresAuth: true }
    },
    {
      path: '/activities/planner',
      name: 'activities-planner',
      component: ActivitiesPlanner,
      meta: { requiresAuth: true }
    }
  ]
});

// Navigation guard to protect routes
router.beforeEach(async (to, from, next) => {
  // Check if the route requires authentication
  if (to.meta.requiresAuth) {
    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // User is authenticated, allow access
        next();
      } else {
        // User is not authenticated, redirect to auth page
        next({ name: 'auth' });
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      // On error, redirect to auth page for safety
      next({ name: 'auth' });
    }
  } else {
    // Route doesn't require authentication, allow access
    next();
  }
});

export default router;