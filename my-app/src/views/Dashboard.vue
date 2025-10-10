<template>
  <div>
    <h2>Weekly Dashboard</h2>

    <section class="summary">
      <div>
        <h3>Weekly progress</h3>
        <p>{{ progressText }}</p>
        <progress :value="completed" :max="goal || 1"></progress>
        <p>{{ completed }} / {{ store.weeklyGoal || '—' }} activities</p>
        <p class="motivational">{{ motivational }}</p>
      </div>

      <div>
        <TopActivitiesChart :data="chartData" />
      </div>
    </section>

    <section style="margin-top: 1.5rem;">
      <h3>Latest activities</h3>
      <div v-if="latest.length === 0">No recent activities.</div>
      <div v-else>
        <ActivityCard v-for="act in latest" :key="act.id" :activity="act" />
      </div>
    </section>

    <section style="margin-top: 1.5rem;">
      <router-link to="/add"><button>Add new activity</button></router-link>
    </section>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, onUnmounted, computed } from 'vue';
import { useUserStore } from '@/stores/user';
import ActivityCard from '@/components/ActivityCard.vue';
import TopActivitiesChart from '@/components/TopActivitiesChart.vue';

const store = useUserStore();

onMounted(async () => {
  console.log('[Dashboard] mounted');
  console.log("Fetching data...");
  await store.fetchWeeklyGoal();
  console.log("weeklyGoal after fetch:", store.weeklyGoal);

  await store.fetchTopActivities();
  console.log("topActivities after fetch:", store.topActivities);

  await store.fetchLatestActivities();
  console.log("latestActivities after fetch:", store.latestActivities);

  await store.fetchWeekActivities();
  console.log("weekActivities after fetch:", store.weekActivities);

});

onBeforeUnmount(() => {
  console.log('[Dashboard] beforeUnmount');
});

onUnmounted(() => {
  console.log('[Dashboard] unmounted');
});

const latest = computed(() => store.latestActivities);
const completed = computed(() => store.weekActivities.length);
//const goal = computed(() => store.weeklyGoal?.goal ?? null);
const goal = computed(() => store.weeklyGoal);

const chartData = computed(() => {
  // expects array of {activity, count}
  return store.topActivities.map(t => ({ label: t.activity, value: t.count }));
});

const progressText = computed(() => {
  if (!goal.value) return 'No weekly goal set.';
  const pct = Math.round((completed.value / goal.value) * 100);
  return `${pct}% of weekly goal`;
});

const motivational = computed(() => {
  if (!goal) return 'Set a weekly goal to get started!';
  if (completed.value >= goal.value) return "Awesome — you've hit your weekly goal! Keep it up!";
  if (completed.value >= Math.ceil(goal.value * 0.75)) return "Almost there — a little push and you'll hit your goal!";
  if (completed.value >= Math.ceil(goal.value * 0.4)) return 'Nice progress — keep going!';
  return "Let's try to complete an activity today!";
});
</script>

<style scoped>
.summary { display:flex; gap:2rem; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; }
.motivational { font-weight:600; margin-top:.6rem; }
</style>