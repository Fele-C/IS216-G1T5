<template>
  <div>
    <h2>Set weekly goal</h2>
    <div>
      <label>Number of activities per week</label>
      <input type="number" v-model.number="goalValue" min="1" />
    </div>
    <div style="margin-top:1rem;">
      <button @click="save">Save goal</button>
    </div>
    <div v-if="message" style="margin-top:1rem;">{{ message }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/stores/user';

const store = useUserStore();
const goalValue = ref(store.weeklyGoal?.goal || 5);
const message = ref('');

onMounted(async () => {
  await store.fetchWeeklyGoal();
  goalValue.value = store.weeklyGoal?.goal ?? goalValue.value;
});

async function save() {
  try {
    const res = await store.setGoal(goalValue.value);
    if (res.success) {
      message.value = 'Saved!';
      await store.fetchWeeklyGoal();
    } else {
      message.value = 'Save failed';
    }
  } catch (err) {
    console.error(err);
    message.value = 'Error saving goal';
  }
}
</script>