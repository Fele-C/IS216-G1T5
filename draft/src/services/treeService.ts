import { supabase } from '../lib/supabase';

export interface TreeLog {
  id?: string;
  user_id: string;
  tree_name: string;
  week_start_date: string;
  week_end_date: string;
  total_calories_burnt: number;
  growth_percentage: number;
  size: 'small' | 'medium' | 'large';
  color: string;
  is_fully_grown: boolean;
  created_at?: string;
}

export const treeService = {
  async getAllTrees(userId: string): Promise<TreeLog[]> {
    const { data, error } = await supabase
      .from('tree_logs')
      .select('*')
      .eq('user_id', userId)
      .order('week_start_date', { ascending: false });

    if (error) {
      console.error('Error fetching trees:', error);
      return [];
    }

    return data || [];
  },

  async getTreeByWeek(userId: string, weekStart: string): Promise<TreeLog | null> {
    const { data, error } = await supabase
      .from('tree_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('week_start_date', weekStart)
      .maybeSingle();

    if (error) {
      console.error('Error fetching tree:', error);
      return null;
    }

    return data;
  },

  async createTree(tree: Omit<TreeLog, 'id' | 'created_at'>): Promise<TreeLog | null> {
    const { data, error } = await supabase
      .from('tree_logs')
      .insert([tree])
      .select()
      .single();

    if (error) {
      console.error('Error creating tree:', error);
      return null;
    }

    return data;
  },

  async updateTree(treeId: string, updates: Partial<TreeLog>): Promise<TreeLog | null> {
    const { data, error } = await supabase
      .from('tree_logs')
      .update(updates)
      .eq('id', treeId)
      .select()
      .single();

    if (error) {
      console.error('Error updating tree:', error);
      return null;
    }

    return data;
  }
};
