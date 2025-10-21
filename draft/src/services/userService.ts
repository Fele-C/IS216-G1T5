import { supabase } from '../lib/supabase';

export interface User {
  id: string;
  name: string;
  age_group: string;
  weight: number;
  height: number;
  bmi: number;
  goal: 'maintain' | 'lose' | 'gain';
  preferred_activity: string;
  recommended_calories: number;
  created_at?: string;
  updated_at?: string;
}

export const userService = {
  async getUser(userId: string): Promise<User | null> {
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

  async createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User | null> {
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

  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return null;
    }

    return data;
  },

  async getCurrentUser(): Promise<User | null> {
    const { data: authUser } = await supabase.auth.getUser();

    if (!authUser.user) {
      return null;
    }

    return this.getUser(authUser.user.id);
  }
};
