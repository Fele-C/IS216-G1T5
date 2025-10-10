<template>
  <div id="app" class="app-shell">
    <header class="header">
      <h1>Activity Tracker</h1>
      <nav>
        <router-link to="/">Dashboard</router-link>
        <router-link to="/add">Add Activity</router-link>
        <router-link to="/goal">Set Weekly Goal</router-link>
      </nav>
    </header>

    <main class="main">
      <router-view/>
    </main>

    <footer class="footer">
      <small>Built with Vue 3 • Demo mode (user auto-logged in)</small>
    </footer>
  </div>
</template>

<style scoped>
.app-shell {
  max-width: 980px;
  margin: 0 auto;
  padding: 1rem;
  font-family: system-ui, Arial, sans-serif;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.header nav a {
  margin-left: 1rem;
  text-decoration: none;
}
.main { min-height: 60vh; }
.footer { margin-top: 2rem; text-align: center; color: #666; }
</style>