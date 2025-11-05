<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h2>{{ isLogin ? 'Welcome Back' : 'Create Your Account' }}</h2>
        <p>{{ isLogin ? 'Sign in to continue your fitness journey' : 'Start your health tracking journey today' }}</p>
      </div>

      <form @submit.prevent="handleSubmit" class="auth-form">
        <!-- Email and Password -->
        <div class="form-group">
          <label for="email">Email Address</label>
          <input
            type="email"
            id="email"
            v-model="formData.email"
            required
            :disabled="loading"
            placeholder="Enter your email"
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            v-model="formData.password"
            required
            :disabled="loading"
            placeholder="Enter your password"
            minlength="6"
          />
        </div>

        <!-- Profile Data (only for signup) -->
        <div v-if="!isLogin" class="profile-section">
          <h3>Tell us about yourself</h3>
          
          <div class="form-group">
            <label for="name">Full Name</label>
            <input
              type="text"
              id="name"
              v-model="formData.name"
              :required="!isLogin"
              :disabled="loading"
              placeholder="Enter your full name"
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="age">Age</label>
              <input
                type="number"
                id="age"
                v-model.number="formData.age"
                :required="!isLogin"
                :disabled="loading"
                placeholder="25"
                min="13"
                max="120"
              />
            </div>

            <div class="form-group">
              <label for="gender">Gender</label>
              <select
                id="gender"
                v-model="formData.gender"
                :required="!isLogin"
                :disabled="loading"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="goal">Fitness Goal</label>
            <select
              id="goal"
              v-model="formData.goal"
              :required="!isLogin"
              :disabled="loading"
            >
              <option value="">Select your goal</option>
              <option value="maintain">Maintain current weight</option>
              <option value="lose">Lose weight</option>
              <option value="gain">Gain weight</option>
            </select>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="weight">Weight (kg)</label>
              <input
                type="number"
                id="weight"
                v-model.number="formData.weight"
                :required="!isLogin"
                :disabled="loading"
                placeholder="70"
                min="30"
                max="300"
                step="0.1"
              />
            </div>

            <div class="form-group">
              <label for="height">Height (cm)</label>
              <input
                type="number"
                id="height"
                v-model.number="formData.height"
                :required="!isLogin"
                :disabled="loading"
                placeholder="170"
                min="100"
                max="250"
                step="0.1"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="preferredActivity">Preferred Activity</label>
            <select
              id="preferredActivity"
              v-model="formData.preferredActivity"
              :required="!isLogin"
              :disabled="loading"
            >
              <option value="">Select preferred activity</option>
              <option value="running">Running</option>
              <option value="walking">Walking</option>
              <option value="cycling">Cycling</option>
              <option value="swimming">Swimming</option>
              <option value="gym">Gym/Weight Training</option>
              <option value="yoga">Yoga</option>
              <option value="dancing">Dancing</option>
              <option value="sports">Sports</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <!-- Submit Button -->
        <button type="submit" class="auth-button" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          {{ loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account') }}
        </button>

        <!-- Toggle between login/signup -->
        <div class="auth-toggle">
          <p>
            {{ isLogin ? "Don't have an account?" : "Already have an account?" }}
            <button type="button" @click="toggleMode" class="toggle-link">
              {{ isLogin ? 'Sign up' : 'Sign in' }}
            </button>
          </p>
        </div>
      </form>

      <!-- Error Message -->
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../services/authService.js';
import { apiService } from '../services/apiService.js';

const router = useRouter();
const { signUp, signIn, loading, error } = useAuth();

const isLogin = ref(true);
const errorMessage = ref('');

const formData = ref({
  email: '',
  password: '',
  name: '',
  age: null,
  gender: '',
  weight: null,
  height: null,
  goal: '',
  preferredActivity: ''
});

const toggleMode = () => {
  isLogin.value = !isLogin.value;
  errorMessage.value = '';
  // Clear form when switching modes
  if (isLogin.value) {
    formData.value = {
      email: '',
      password: '',
      name: '',
      age: null,
      gender: '',
      weight: null,
      height: null,
      goal: '',
      preferredActivity: ''
    };
  }
};

const handleSubmit = async () => {
  errorMessage.value = '';
  
  try {
    if (isLogin.value) {
      await signIn(formData.value.email, formData.value.password);
    } else {
      // Calculate BMI using API
      const result = await apiService.calculateBMI(
        formData.value.weight,
        formData.value.height,
        formData.value.age,
        formData.value.gender
      );

      const bmi = result ? result.bmi : 0;
      let recommendedCalories = 2000;

      if (result && result.bmr && result.bmr > 0) {
        // Use BMR from API
        if (formData.value.goal === 'lose') {
          recommendedCalories = Math.round(result.bmr * 1.2 - 500);
        } else if (formData.value.goal === 'gain') {
          recommendedCalories = Math.round(result.bmr * 1.2 + 500);
        } else {
          recommendedCalories = Math.round(result.bmr * 1.2);
        }
        recommendedCalories = Math.max(1200, recommendedCalories);
      }

      await signUp({
        email: formData.value.email,
        password: formData.value.password,
        profile: {
          name: formData.value.name,
          age: formData.value.age || 0,
          gender: formData.value.gender,
          weight: formData.value.weight || 0,
          height: formData.value.height || 0,
          bmi: Math.round(bmi * 100) / 100,
          goal: formData.value.goal,
          preferredActivity: formData.value.preferredActivity,
          recommendedCalories
        }
      });
    }
    
    // Redirect to home page after successful auth
    router.push('/');
  } catch (err) {
    errorMessage.value = error.value || 'An error occurred. Please try again.';
  }
};
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: url('https://512pixels.net/downloads/macos-wallpapers-thumbs/10-14-Night-Thumb.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding: 20px;
}

.auth-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 500px;
}

.auth-header {
  text-align: center;
  margin-bottom: 30px;
}

.auth-header h2 {
  color: #333;
  margin-bottom: 8px;
  font-size: 28px;
  font-weight: 600;
}

.auth-header p {
  color: #666;
  font-size: 16px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.form-group label {
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.form-group input,
.form-group select {
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
}

.profile-section {
  border-top: 1px solid #e1e5e9;
  padding-top: 20px;
  margin-top: 20px;
}

.profile-section h3 {
  color: #333;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 600;
}

.auth-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 14px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.auth-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.auth-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.auth-toggle {
  text-align: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e1e5e9;
}

.auth-toggle p {
  color: #666;
  margin: 0;
}

.toggle-link {
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  font-weight: 600;
  text-decoration: underline;
}

.toggle-link:hover {
  color: #764ba2;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 12px 16px;
  border-radius: 8px;
  margin-top: 20px;
  border: 1px solid #fcc;
}

@media (max-width: 600px) {
  .auth-card {
    padding: 20px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
