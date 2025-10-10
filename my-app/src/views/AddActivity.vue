<template>
  <div>
    <h2>Add new activity</h2>
    <ActivityForm @submitted="onSubmit" />
  </div>
</template>

<script setup>
import ActivityForm from '@/components/ActivityForm.vue';
import { useUserStore } from '@/stores/user';
import { useRouter } from 'vue-router';

const store = useUserStore();
const router = useRouter();

async function onSubmit(payload) {
  // payload: { activity, date, duration }
  try {
    const res = await store.addActivity(payload.activity, payload.date, payload.duration);
    if (res.success) {
      // refresh caches
      await Promise.all([store.fetchWeekActivities(), store.fetchLatestActivities(), store.fetchTopActivities()]);
      router.push('/');
    } else {
      alert('Failed: ' + (res.message || 'unknown'));
    }
  } catch (err) {
    console.error(err);
    alert('Error submitting activity');
  }
}
</script>