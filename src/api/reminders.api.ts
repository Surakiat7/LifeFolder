import { supabase } from './supabase';
import { Reminder, ReminderInsert, ReminderUpdate, ReminderWithItem } from '../utils/types';

/**
 * Get all reminders for the current user
 */
export const getReminders = async (userId: string): Promise<ReminderWithItem[]> => {
  try {
    const { data, error } = await supabase
      .from('reminders')
      .select(`
        *,
        item:items(*)
      `)
      .eq('user_id', userId)
      .order('notify_at', { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching reminders:', error);
    throw error;
  }
};

/**
 * Get reminders for a specific item
 */
export const getRemindersByItemId = async (
  itemId: string,
  userId: string
): Promise<Reminder[]> => {
  try {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('item_id', itemId)
      .eq('user_id', userId)
      .order('notify_at', { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching item reminders:', error);
    throw error;
  }
};

/**
 * Get a single reminder by ID
 */
export const getReminderById = async (
  reminderId: string,
  userId: string
): Promise<ReminderWithItem | null> => {
  try {
    const { data, error } = await supabase
      .from('reminders')
      .select(`
        *,
        item:items(*)
      `)
      .eq('id', reminderId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching reminder:', error);
    throw error;
  }
};

/**
 * Create a new reminder
 */
export const createReminder = async (
  reminder: ReminderInsert
): Promise<Reminder> => {
  try {
    const { data, error } = await supabase
      .from('reminders')
      .insert(reminder)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error creating reminder:', error);
    throw error;
  }
};

/**
 * Update a reminder
 */
export const updateReminder = async (
  reminderId: string,
  userId: string,
  updates: ReminderUpdate
): Promise<Reminder> => {
  try {
    const { data, error } = await supabase
      .from('reminders')
      .update(updates)
      .eq('id', reminderId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error updating reminder:', error);
    throw error;
  }
};

/**
 * Delete a reminder
 */
export const deleteReminder = async (
  reminderId: string,
  userId: string
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', reminderId)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting reminder:', error);
    throw error;
  }
};

/**
 * Delete all reminders for an item
 */
export const deleteRemindersByItemId = async (
  itemId: string,
  userId: string
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('item_id', itemId)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting item reminders:', error);
    throw error;
  }
};

/**
 * Get upcoming reminders (not yet due)
 */
export const getUpcomingReminders = async (
  userId: string,
  limit?: number
): Promise<ReminderWithItem[]> => {
  try {
    let query = supabase
      .from('reminders')
      .select(`
        *,
        item:items(*)
      `)
      .eq('user_id', userId)
      .gte('notify_at', new Date().toISOString())
      .order('notify_at', { ascending: true });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching upcoming reminders:', error);
    throw error;
  }
};

/**
 * Get overdue reminders (past due date)
 */
export const getOverdueReminders = async (
  userId: string
): Promise<ReminderWithItem[]> => {
  try {
    const { data, error } = await supabase
      .from('reminders')
      .select(`
        *,
        item:items(*)
      `)
      .eq('user_id', userId)
      .lt('notify_at', new Date().toISOString())
      .eq('is_sent', false)
      .order('notify_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching overdue reminders:', error);
    throw error;
  }
};

/**
 * Mark reminder as sent
 */
export const markReminderAsSent = async (
  reminderId: string,
  userId: string
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('reminders')
      .update({ is_sent: true })
      .eq('id', reminderId)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error marking reminder as sent:', error);
    throw error;
  }
};

/**
 * Get reminders count
 */
export const getRemindersCount = async (userId: string): Promise<{
  total: number;
  upcoming: number;
  overdue: number;
}> => {
  try {
    const now = new Date().toISOString();

    const [totalResult, upcomingResult, overdueResult] = await Promise.all([
      supabase
        .from('reminders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId),
      supabase
        .from('reminders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('notify_at', now),
      supabase
        .from('reminders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .lt('notify_at', now)
        .eq('is_sent', false),
    ]);

    return {
      total: totalResult.count || 0,
      upcoming: upcomingResult.count || 0,
      overdue: overdueResult.count || 0,
    };
  } catch (error) {
    console.error('Error getting reminders count:', error);
    throw error;
  }
};

/**
 * Get reminders for today
 */
export const getTodayReminders = async (
  userId: string
): Promise<ReminderWithItem[]> => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

    const { data, error } = await supabase
      .from('reminders')
      .select(`
        *,
        item:items(*)
      `)
      .eq('user_id', userId)
      .gte('notify_at', startOfDay)
      .lte('notify_at', endOfDay)
      .order('notify_at', { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching today reminders:', error);
    throw error;
  }
};
