import { supabase } from '../lib/supabase';

export interface ActivityLog {
  id?: string;
  user_id: string;
  activity_name: string;
  activity_date: string;
  duration: number;
  calories_burnt: number;
  location: string;
  is_outdoor: boolean;
  completion_percentage: number;
  created_at?: string;
}

export const activityService = {
  async getActivitiesByDate(userId: string, date: string): Promise<ActivityLog[]> {
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

  async getActivitiesByWeek(userId: string, weekStart: string): Promise<ActivityLog[]> {
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

  async createActivity(activity: Omit<ActivityLog, 'id' | 'created_at'>): Promise<ActivityLog | null> {
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

  async updateActivity(activityId: string, updates: Partial<ActivityLog>): Promise<ActivityLog | null> {
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

  async deleteActivity(activityId: string): Promise<boolean> {
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
