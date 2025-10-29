import { supabase } from '../lib/supabase';

export const userService = {
  async getUser(userId) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }

    return data;
  },

  async createUser(user) {
    const { data: authUser } = await supabase.auth.getUser();

    if (!authUser.user) {
      console.error('No authenticated user');
      return null;
    }

    const { data, error } = await supabase
      .from('users')
      .insert([{ ...user, id: authUser.user.id }])
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      return null;
    }

    return data;
  },

  async updateUser(userId, updates) {
    console.log('Updating user:', userId, 'with data:', updates);
    
    const { data, error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      console.error('Error details:', error.message, error.code, error.details);
      return null;
    }

    console.log('Update successful:', data);
    return data;
  },

  async getCurrentUser() {
    const { data: authUser } = await supabase.auth.getUser();

    if (!authUser.user) {
      return null;
    }

    return this.getUser(authUser.user.id);
  }
};

