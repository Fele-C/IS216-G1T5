import { supabase } from '../lib/supabase';

export const activityService = {
  async getCompletedActivitiesByDate(userId, date) {
    const { data, error } = await supabase
      .from('activity_log')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching activities:', error);
      return [];
    }

    return data || [];
  },

  async getActivityPlanByDate(week, today) {
    const { data, error } = await supabase
      .from('daily_activity')
      .select('*')
      .eq('week', week)
      .eq('date', today);

    if (error) {
      console.error('Error fetching activities:', error);
      return [];
    }

    return data || [];
  },

  async getActivitiesByWeek(userId, today) {
  
    const { data, error } = await supabase
      .from('weekly_plan')
      .select('*')
      .eq('user_id', userId)
      .lte('start_date', today)
      .gte('end_date', today); // checks date falls within the week

    if (error) {
      console.error('Error fetching weekly activities:', error);
      return [];
    }

    return data || [];
  },

  async extraActivity(activity) {
    const { data, error } = await supabase
      .from('daily_activity')
      .insert([activity])
      .select()
      .single();

    if (error) {
      console.error('Error adding activity:', error);
      console.log('Entry', activity)
      return null;
    }

    return data;
  },

  async createActivity(activity) {
    const { data, error } = await supabase
      .from('activity_log')
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
      .from('activity_log')
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

  async getActivityList() {
    const {data, error} = await supabase
      .from ('activity_list')
      .select('*');

    if (error) {
      console.error('Error fetching activity list', error);
      return [];
    }

    return data || [];
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
