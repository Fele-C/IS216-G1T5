<template>
  <nav
    class="navbar navbar-expand-lg custom-navbar"
    :class="{ 'navbar-active': showNavbar }"
  >
    <div class="container-fluid">
      <router-link to="/" class="navbar-brand">
        <img src="/logofull.png" alt="HealthTracker" style="height: 40px;" />
      </router-link>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <router-link to="/" class="nav-link">Home</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/daily-tracker" class="nav-link">Daily Tracker</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/weekly-tracker" class="nav-link">Weekly Tracker</router-link>
          </li>
          <li class="nav-item dropdown">
            <a
              class="nav-link dropdown-toggle"
              href="#"
              id="activitiesDropdown"
              role="button"
              data-bs-toggle="dropdown"
            >
              Activities
            </a>
            <ul class="dropdown-menu" aria-labelledby="activitiesDropdown">
              <li><router-link to="/activities" class="dropdown-item">Overview</router-link></li>
              <li><router-link to="/activities/planner" class="dropdown-item">Planner</router-link></li>
            </ul>
          </li>
          <li class="nav-item" v-if="!user">
            <router-link to="/auth" class="nav-link">Sign In</router-link>
          </li>
          <li class="nav-item dropdown" v-if="user">
            <a
              class="nav-link dropdown-toggle"
              href="#"
              id="userDropdown"
              role="button"
              data-bs-toggle="dropdown"
            >
              {{ userName || user.email }}
            </a>
            <ul class="dropdown-menu" aria-labelledby="userDropdown">
              <li><router-link to="/profile" class="dropdown-item">Profile</router-link></li>
              <li><button @click="handleSignOut" class="dropdown-item">Sign Out</button></li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const showNavbar = ref(false);

const handleMouseMove = (e) => {
  // Show navbar if mouse is in top 80px of viewport
  showNavbar.value = e.clientY < 80;
};

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove);
});

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove);
});
</script>

<style scoped>
.custom-navbar {
  position: fixed;
  top: -80px; /* hidden above viewport */
  width: 100%;
  z-index: 1000;
  backdrop-filter: blur(10px);
  background-color: rgba(255, 255, 255, 0.15); /* glass effect */
  transition: top 0.35s ease, opacity 0.35s ease;
  opacity: 0;
}

.navbar-active {
  top: 0;
  opacity: 1;
}

/* Nav links glow */
.nav-link {
  color: #5E6472;
  font-weight: 500;
  transition: color 0.3s ease, text-shadow 0.3s ease;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: hsl(183, 100%, 93%);
  text-shadow: 0 0 4px hsl(183, 100%, 93%), 0 0 8px hsl(183, 100%, 93%);
}
</style>
