import { supabase } from '../lib/supabase';

export const activityService = {
  async getActivitiesByDate(userId, date) {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('activity_date', date)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching activities:', error);
      return [];
    }

    return data || [];
  },

  async getActivitiesByWeek(userId, weekStart) {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('activity_date', weekStart)
      .lte('activity_date', weekEnd.toISOString().split('T')[0])
      .order('activity_date', { ascending: true });

    if (error) {
      console.error('Error fetching weekly activities:', error);
      return [];
    }

    return data || [];
  },

  async createActivity(activity) {
    const { data, error } = await supabase
      .from('activity_logs')
      .insert([activity])
      .select()
      .single();

    if (error) {
      console.error('Error creating activity:', error);
      return null;
    }

    return data;
  },

  async updateActivity(activityId, updates) {
    const { data, error } = await supabase
      .from('activity_logs')
      .update(updates)
      .eq('id', activityId)
      .select()
      .single();

    if (error) {
      console.error('Error updating activity:', error);
      return null;
    }

    return data;
  },

  async deleteActivity(activityId) {
    const { error } = await supabase
      .from('activity_logs')
      .delete()
      .eq('id', activityId);

    if (error) {
      console.error('Error deleting activity:', error);
      return false;
    }

    return true;
  }
};

