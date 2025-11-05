import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      // Proxy API calls to Firebase Functions emulator or local server
      // For Firebase emulator: Run 'firebase emulators:start' and uncomment the emulator proxy
      // For local server: Run 'node server.js' and use the localhost proxy below
      '/api': {
        target: 'http://localhost:3000', // Local Express server
        // target: 'http://localhost:5001', // Firebase Functions emulator
        changeOrigin: true,
        secure: false,
      }
    }
  }
})

