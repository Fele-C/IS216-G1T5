<template>
  <div class="card">
    <div class="left">
      <strong>{{ activity.activity }}</strong>
      <div class="meta">{{ formattedDate }} • {{ activity.duration }} min</div>
    </div>
    <div class="right">
      <small>ID: {{ activity.id }}</small>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
const props = defineProps({ activity: Object });

const formattedDate = computed(() => {
  const d = new Date(props.activity.date);
  return d.toLocaleDateString();
});
</script>

<style scoped>
.card {
  display:flex;
  justify-content:space-between;
  padding:.6rem;
  border:1px solid #eee;
  border-radius:6px;
  margin-bottom:.6rem;
}
.meta { color:#666; font-size:.9rem; margin-top:.3rem; }
</style>