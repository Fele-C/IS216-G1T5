<template>
  <nav class="navbar navbar-expand-lg custom-navbar">
    <div class="container-fluid">
      <router-link to="/" class="navbar-brand">HealthTracker</router-link>
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
            <router-link to="/profile" class="nav-link">Profile</router-link>
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
              {{ user.email }}
            </a>
            <ul class="dropdown-menu" aria-labelledby="userDropdown">
              <li><button @click="handleSignOut" class="dropdown-item">Sign Out</button></li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useAuth } from '../services/authService.js';
import { useRouter } from 'vue-router';

const { user, signOut } = useAuth();
const router = useRouter();

const handleSignOut = async () => {
  try {
    await signOut();
    router.push('/');
  } catch (error) {
    console.error('Error signing out:', error);
  }
};
</script>

<style scoped>
.custom-navbar {
  background-color: #AED9E0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1rem 0;
}

.navbar-brand {
  font-weight: 700;
  font-size: 1.5rem;
  color: #5E6472;
  transition: color 0.3s ease;
}

.navbar-brand:hover {
  color: #FFA69E;
}

.nav-link {
  color: #5E6472;
  font-weight: 500;
  margin: 0 0.5rem;
  transition: color 0.3s ease;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: #FFA69E;
}

.dropdown-menu {
  background-color: #FAF3DD;
  border: none;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.dropdown-item {
  color: #5E6472;
  transition: background-color 0.3s ease;
}

.dropdown-item:hover {
  background-color: #B8F2E6;
  color: #5E6472;
}
</style>
