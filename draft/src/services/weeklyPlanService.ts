import { supabase } from '../lib/supabase';

export interface WeeklyPlan {
  id?: string;
  user_id: string;
  week_start_date: string;
  day_of_week: number;
  activity_name: string;
  duration: number;
  estimated_calories: number;
  location: string;
  is_outdoor: boolean;
  created_at?: string;
}

export const weeklyPlanService = {
  async getPlansByWeek(userId: string, weekStart: string): Promise<WeeklyPlan[]> {
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

  async createPlan(plan: Omit<WeeklyPlan, 'id' | 'created_at'>): Promise<WeeklyPlan | null> {
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

  async createMultiplePlans(plans: Omit<WeeklyPlan, 'id' | 'created_at'>[]): Promise<WeeklyPlan[]> {
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

  async updatePlan(planId: string, updates: Partial<WeeklyPlan>): Promise<WeeklyPlan | null> {
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

  async deletePlan(planId: string): Promise<boolean> {
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

  async deletePlansByWeek(userId: string, weekStart: string): Promise<boolean> {
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
