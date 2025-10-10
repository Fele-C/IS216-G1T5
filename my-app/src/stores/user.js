import { defineStore } from 'pinia';
import axios from 'axios';
import { ref } from 'vue';

export const useUserStore = defineStore('user', () => {
  const API_BASE = 'http://localhost/IS216/Project/IS216-G1T5/api'; // <<-- update this to your PHP api base
  const userId = ref(1); // default logged-in user id
  const weeklyGoal = ref(null);
  const weekActivities = ref([]); // activities for current week
  const latestActivities = ref([]);
  const topActivities = ref([]);
  const loading = ref(false);

  async function fetchWeekActivities() {
    loading.value = true;
    try {
      const res = await axios.get(`${API_BASE}/activities.php`, {
        params: { action: 'week', user_id: userId.value }
      });
      weekActivities.value = Array.isArray(res.data) ? res.data : [];
    } finally {
      loading.value = false;
    }
  }

  async function fetchLatestActivities() {
    const res = await axios.get(`${API_BASE}/activities.php`, {
      params: { action: 'latest', user_id: userId.value }
    });
    latestActivities.value = Array.isArray(res.data) ? res.data : [];
  }

  async function fetchTopActivities() {
    const res = await axios.get(`${API_BASE}/activities.php`, {
      params: { action: 'top', user_id: userId.value }
    });
    topActivities.value = Array.isArray(res.data) ? res.data : [];
  }

  async function fetchWeeklyGoal() {
    const res = await axios.get(`${API_BASE}/goal.php`, {
      params: { user_id: userId.value }
    });
    weeklyGoal.value = res.data?.goal ?? null;
  }

  async function addActivity(activity, date, duration) {
    const payload = { user_id: userId.value, activity, date, duration };
    const res = await axios.post(`${API_BASE}/activities.php`, payload);
    return res.data;
  }

  async function setGoal(goal) {
    const payload = { user_id: userId.value, goal };
    const res = await axios.post(`${API_BASE}/goal.php`, payload);
    return res.data;
  }

  return {
    userId,
    weeklyGoal,
    weekActivities,
    latestActivities,
    topActivities,
    loading,
    fetchWeekActivities,
    fetchLatestActivities,
    fetchTopActivities,
    fetchWeeklyGoal,
    addActivity,
    setGoal
  };
});