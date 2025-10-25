import { supabase } from '../lib/supabase';

export const treeService = {
  async getAllTrees(userId) {
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

  async getTreeByWeek(userId, weekStart) {
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

  async createTree(tree) {
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

  async updateTree(treeId, updates) {
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

