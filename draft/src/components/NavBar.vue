<template>
  <nav class="navbar navbar-expand-lg custom-navbar">
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
import { ref, watch, onMounted } from 'vue';
import { useAuth } from '../services/authService.js';
import { userService } from '../services/userService.js';
import { supabase } from '../lib/supabase.js';
import { useRouter } from 'vue-router';

const { user, signOut } = useAuth();
const router = useRouter();
const userName = ref('');

// Function to load user profile
const loadUserProfile = async () => {
  if (user.value) {
    const { data } = await supabase.from('users').select('*').eq('id', user.value.id).maybeSingle();
    
    if (data && data.name) {
      userName.value = data.name;
    }
  }
};

// Load profile on mount
onMounted(async () => {
  await loadUserProfile();
});

// Watch for user changes (login/logout)
watch(user, async (newUser) => {
  if (newUser) {
    await loadUserProfile();
  } else {
    userName.value = '';
  }
});

const handleSignOut = async () => {
  try {
    await signOut();
    userName.value = '';
    router.push('/');
  } catch (error) {
    console.error('Error signing out:', error);
  }
};
</script>

<style scoped>
.custom-navbar {
  position: fixed;               /* stay on top */
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  
  background-color: rgba(255, 255, 255, 0.2); /* semi-transparent */
  backdrop-filter: blur(10px);               /* blur background */
  -webkit-backdrop-filter: blur(10px);       /* Safari support */

  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  padding: 0.5rem 1rem;
  border-bottom-left-radius: 12px;   /* optional rounded corners */
  border-bottom-right-radius: 12px;
}

.navbar-brand,
.nav-link,
.dropdown-item {
  color: #fff !important;           
}


.nav-link:hover,
.nav-link.router-link-active {
  color: hsl(183, 100%, 93%);
  text-shadow:
    0 0 4px hsl(183, 100%, 93%),
    0 0 8px hsl(183, 100%, 93%),
    0 0 12px hsl(183, 100%, 93%);
  animation: float 1.5s ease-in-out infinite;
}

/* Float animation */
@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px); /* float up by 4px */
  }
}


.navbar-brand:hover {
  color: #FFA69E;
  text-shadow:
    0 0 4px #FFA69E,
    0 0 8px #FFA69E,
    0 0 12px #FFA69E;
  animation: float 1.5s ease-in-out infinite;
}

.dropdown-menu {
  background-color: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

</style>
