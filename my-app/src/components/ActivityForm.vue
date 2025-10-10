<template>
  <form @submit.prevent="submit">
    <div>
      <label>Activity</label>
      <select v-model="activity" required>
        <option disabled value="">Select activity</option>
        <option v-for="a in activities" :key="a" :value="a">{{ a }}</option>
      </select>
    </div>

    <div>
      <label>Date</label>
      <input type="date" v-model="date" required />
    </div>

    <div>
      <label>Duration (minutes)</label>
      <input type="number" v-model.number="duration" min="1" required />
    </div>

    <div style="margin-top: 1rem;">
      <button type="submit">Confirm & Submit</button>
    </div>
  </form>
</template>

<script setup>
import { ref } from 'vue';
import { format } from 'date-fns';

const activities = [
  'Running', 'Walking', 'Yoga', 'Cycling', 'Swimming',
  'Strength Training', 'Meditation', 'Reading', 'Study', 'Other'
];

const activity = ref('');
const today = new Date();
const date = ref(format(today, 'yyyy-MM-dd'));
const duration = ref(30);

function submit() {
  if (!activity.value) {
    alert('Choose an activity');
    return;
  }
  const payload = {
    activity: activity.value,
    date: date.value,
    duration: duration.value
  };
  // emit to parent
  const ev = new CustomEvent('submitted', { detail: payload });
  // Vue emits via $emit; in script setup we use defineEmits instead:
  emit('submitted', payload);
}
const emit = defineEmits(['submitted']);
</script>

<style scoped>
label { display:block; margin-bottom: .25rem; }
input, select { padding: .4rem; width: 100%; max-width: 360px; margin-bottom: .8rem; }
button { padding: .5rem 1rem; }
</style>