import { supabase } from '../lib/supabase';

export const weeklyPlanService = {
  async getPlansByWeek(userId, weekStart) {
    const { data, error } = await supabase
      .from('weekly_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('week_start_date', weekStart)
      .order('day_of_week', { ascending: true });

    if (error) {
      console.error('Error fetching weekly plans:', error);
      return [];
    }

    return data || [];
  },

  async createPlan(plan) {
    const { data, error } = await supabase
      .from('weekly_plans')
      .insert([plan])
      .select()
      .single();

    if (error) {
      console.error('Error creating plan:', error);
      return null;
    }

    return data;
  },

  async createMultiplePlans(plans) {
    const { data, error } = await supabase
      .from('weekly_plans')
      .insert(plans)
      .select();

    if (error) {
      console.error('Error creating plans:', error);
      return [];
    }

    return data || [];
  },

  async updatePlan(planId, updates) {
    const { data, error } = await supabase
      .from('weekly_plans')
      .update(updates)
      .eq('id', planId)
      .select()
      .single();

    if (error) {
      console.error('Error updating plan:', error);
      return null;
    }

    return data;
  },

  async deletePlan(planId) {
    const { error } = await supabase
      .from('weekly_plans')
      .delete()
      .eq('id', planId);

    if (error) {
      console.error('Error deleting plan:', error);
      return false;
    }

    return true;
  },

  async deletePlansByWeek(userId, weekStart) {
    const { error } = await supabase
      .from('weekly_plans')
      .delete()
      .eq('user_id', userId)
      .eq('week_start_date', weekStart);

    if (error) {
      console.error('Error deleting weekly plans:', error);
      return false;
    }

    return true;
  }
};

