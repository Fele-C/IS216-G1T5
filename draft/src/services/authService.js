import { ref } from 'vue';
import { supabase } from '../lib/supabase';

export const useAuth = () => {
  const user = ref(null);
  const loading = ref(false);
  const error = ref(null);

  // Initialize auth state
  const initAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      user.value = session?.user || null;
    } catch (err) {
      console.error('Error initializing auth:', err);
    }
  };

  // Sign up with profile data
  const signUp = async (signUpData) => {
    loading.value = true;
    error.value = null;

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signUpData.email,
        password: signUpData.password,
      });

      if (authError) {
        throw authError;
      }

      if (authData.user) {
        // Create user profile in users table
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: authData.user.id,
              name: signUpData.profile.name,
              age: signUpData.profile.age,
              gender: signUpData.profile.gender,
              weight: signUpData.profile.weight,
              height: signUpData.profile.height,
              bmi: signUpData.profile.bmi,
              goal: signUpData.profile.goal,
              preferred_activity: signUpData.profile.preferredActivity,
              recommended_calories: signUpData.profile.recommendedCalories,
            }
          ]);

        if (profileError) {
          throw profileError;
        }

        user.value = authData.user;
      }

      return authData;
    } catch (err) {
      error.value = err.message || 'Failed to create account';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Sign in
  const signIn = async (email, password) => {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      user.value = data.user;
      return data;
    } catch (err) {
      error.value = err.message || 'Failed to sign in';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Sign out
  const signOut = async () => {
    loading.value = true;
    error.value = null;

    try {
      const { error: signOutError } = await supabase.auth.signOut();
      
      if (signOutError) {
        throw signOutError;
      }

      user.value = null;
    } catch (err) {
      error.value = err.message || 'Failed to sign out';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Get user profile
  const getUserProfile = async (userId) => {
    try {
      const { data, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        throw profileError;
      }

      return data;
    } catch (err) {
      error.value = err.message || 'Failed to get user profile';
      throw err;
    }
  };

  // Update user profile
  const updateUserProfile = async (userId, updates) => {
    loading.value = true;
    error.value = null;

    try {
      const { error: updateError } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId);

      if (updateError) {
        throw updateError;
      }
    } catch (err) {
      error.value = err.message || 'Failed to update profile';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Listen for auth changes
  supabase.auth.onAuthStateChange((event, session) => {
    user.value = session?.user || null;
  });

  return {
    user,
    loading,
    error,
    initAuth,
    signUp,
    signIn,
    signOut,
    getUserProfile,
    updateUserProfile,
  };
};

