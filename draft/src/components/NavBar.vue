<template>
  <nav
    class="navbar navbar-expand-lg navbar-dark bg-dark custom-navbar"
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
              :class="{ active: isActivities }"
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
              :class="{ active: isProfile }"
            >
              {{ userName || user.email }}
            </a>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
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
import { ref, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuth } from '../services/authService.js';

const { user, signOut, getUserProfile } = useAuth();
const userName = ref('');
const route = useRoute();

const isActivities = computed(() => route.path.startsWith('/activities'));
const isProfile = computed(() => route.path.startsWith('/profile'));

const loadUserName = async () => {
  try {
    if (user.value?.id) {
      const profile = await getUserProfile(user.value.id);
      userName.value = profile?.name || '';
    } else {
      userName.value = '';
    }
  } catch (_) {
    userName.value = '';
  }
};

const handleSignOut = async () => {
  await signOut();
};

watch(user, loadUserName, { immediate: true });
</script>

<style scoped>
.custom-navbar {
  position: relative; /* default navbar behavior */
  width: 100%;
  z-index: 1020; /* align with Bootstrap navbar z-index */
}

/* Nav links glow */
.nav-link {
  color: #f8f9fa;
  font-weight: 600;
  transition: color 0.2s ease, text-decoration-color 0.2s ease, transform 0.15s ease;
  text-decoration: none;
  text-underline-offset: 6px;
  padding-bottom: 0.25rem;
  will-change: transform;
}

.nav-link:hover {
  color: #e2efff;
  text-decoration: none;
  transform: translateY(-2px) scale(1.02);
}

/* Selected tab underline */
.nav-link.router-link-active {
  color: #ffffff;
  border-bottom: 3px solid #B8F2E6;
}

/* Also highlight dropdown toggles when active via route */
.nav-link.active {
  color: #ffffff;
  border-bottom: 3px solid #B8F2E6;
}

/* Dropdown menu styles */
.dropdown-menu {
  background-color: #212529; /* Bootstrap dark */
  color: #f8f9fa;
  border: none;
  box-shadow: 0 8px 24px rgba(0,0,0,0.35);
  max-width: calc(100vw - 1rem);
}

/* Ensure right-aligned menus stay within viewport even when opened on hover */
.dropdown-menu.dropdown-menu-end {
  right: 0;
  left: auto;
}

.dropdown-item {
  color: #f8f9fa;
}

.dropdown-item.router-link-active {
  background-color: #2b3035;
  color: #ffffff;
}

.dropdown-item:hover,
.dropdown-item:focus {
  background-color: #2b3035;
  color: #ffffff;
  text-decoration: none;
  transform: translateX(2px);
}

/* Dropdown toggle color */
#userDropdown.nav-link,
#activitiesDropdown.nav-link {
  color: #f8f9fa;
}

#userDropdown.nav-link:hover,
#activitiesDropdown.nav-link:hover {
  color: #e2efff;
}

/* Show dropdowns on hover for desktop */
@media (hover: hover) and (pointer: fine) {
  .dropdown:hover > .dropdown-menu {
    display: block;
    margin-top: 0;
  }
}
</style>
