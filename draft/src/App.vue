<script setup>
import { onMounted } from 'vue';
import Navbar from './components/NavBar.vue';
import { useAuth } from './services/authService.js';

const { initAuth } = useAuth();

onMounted(() => {
  initAuth();
});
</script>

<template>
  <div id="app">
    <Navbar />
    <router-view />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  min-height: 100vh;
}
</style>
