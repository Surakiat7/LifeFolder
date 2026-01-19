import { create } from 'zustand';
import { Reminder, ReminderInsert, ReminderUpdate, ReminderWithItem } from '../utils/types';
import * as remindersApi from '../api/reminders.api';
import * as notificationUtils from '../utils/notifications';

interface RemindersState {
  // State
  reminders: ReminderWithItem[];
  upcomingReminders: ReminderWithItem[];
  overdueReminders: ReminderWithItem[];
  todayReminders: ReminderWithItem[];
  currentReminder: ReminderWithItem | null;
  isLoading: boolean;
  error: string | null;
  counts: {
    total: number;
    upcoming: number;
    overdue: number;
  };

  // Actions
  fetchReminders: (userId: string) => Promise<void>;
  fetchUpcomingReminders: (userId: string, limit?: number) => Promise<void>;
  fetchOverdueReminders: (userId: string) => Promise<void>;
  fetchTodayReminders: (userId: string) => Promise<void>;
  fetchReminderById: (reminderId: string, userId: string) => Promise<ReminderWithItem | null>;
  fetchReminderCounts: (userId: string) => Promise<void>;
  createReminder: (reminder: ReminderInsert, itemTitle: string) => Promise<Reminder | null>;
  updateReminder: (
    reminderId: string, 
    userId: string, 
    updates: ReminderUpdate,
    itemTitle?: string
  ) => Promise<Reminder | null>;
  deleteReminder: (reminderId: string, userId: string) => Promise<boolean>;
  markAsSent: (reminderId: string, userId: string) => Promise<void>;
  clearCurrentReminder: () => void;
  clearError: () => void;
  reset: () => void;
}

export const useRemindersStore = create<RemindersState>((set, get) => ({
  // Initial state
  reminders: [],
  upcomingReminders: [],
  overdueReminders: [],
  todayReminders: [],
  currentReminder: null,
  isLoading: false,
  error: null,
  counts: {
    total: 0,
    upcoming: 0,
    overdue: 0,
  },

  // Fetch all reminders
  fetchReminders: async (userId) => {
    try {
      set({ isLoading: true, error: null });

      const reminders = await remindersApi.getReminders(userId);

      set({
        reminders,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching reminders:', error);
      set({
        isLoading: false,
        error: 'Failed to fetch reminders',
      });
    }
  },

  // Fetch upcoming reminders
  fetchUpcomingReminders: async (userId, limit) => {
    try {
      const upcomingReminders = await remindersApi.getUpcomingReminders(userId, limit);
      set({ upcomingReminders });
    } catch (error) {
      console.error('Error fetching upcoming reminders:', error);
    }
  },

  // Fetch overdue reminders
  fetchOverdueReminders: async (userId) => {
    try {
      const overdueReminders = await remindersApi.getOverdueReminders(userId);
      set({ overdueReminders });
    } catch (error) {
      console.error('Error fetching overdue reminders:', error);
    }
  },

  // Fetch today's reminders
  fetchTodayReminders: async (userId) => {
    try {
      const todayReminders = await remindersApi.getTodayReminders(userId);
      set({ todayReminders });
    } catch (error) {
      console.error('Error fetching today reminders:', error);
    }
  },

  // Fetch single reminder
  fetchReminderById: async (reminderId, userId) => {
    try {
      set({ isLoading: true, error: null });

      const reminder = await remindersApi.getReminderById(reminderId, userId);

      set({
        currentReminder: reminder,
        isLoading: false,
      });

      return reminder;
    } catch (error) {
      console.error('Error fetching reminder:', error);
      set({
        isLoading: false,
        error: 'Failed to fetch reminder',
      });
      return null;
    }
  },

  // Fetch reminder counts
  fetchReminderCounts: async (userId) => {
    try {
      const counts = await remindersApi.getRemindersCount(userId);
      set({ counts });
    } catch (error) {
      console.error('Error fetching reminder counts:', error);
    }
  },

  // Create reminder
  createReminder: async (reminder, itemTitle) => {
    try {
      set({ isLoading: true, error: null });

      const newReminder = await remindersApi.createReminder(reminder);

      // Schedule local notification
      await notificationUtils.scheduleReminderNotification(
        newReminder,
        itemTitle
      );

      // Refresh reminders list
      await get().fetchReminders(reminder.user_id);
      await get().fetchReminderCounts(reminder.user_id);

      set({ isLoading: false });
      return newReminder;
    } catch (error) {
      console.error('Error creating reminder:', error);
      set({
        isLoading: false,
        error: 'Failed to create reminder',
      });
      return null;
    }
  },

  // Update reminder
  updateReminder: async (reminderId, userId, updates, itemTitle) => {
    try {
      set({ isLoading: true, error: null });

      const updatedReminder = await remindersApi.updateReminder(
        reminderId,
        userId,
        updates
      );

      // Reschedule notification if date changed
      if (updates.notify_at && itemTitle) {
        await notificationUtils.scheduleReminderNotification(
          updatedReminder,
          itemTitle
        );
      }

      // Update local state
      set(state => ({
        reminders: state.reminders.map(r =>
          r.id === reminderId ? { ...r, ...updatedReminder } : r
        ),
        upcomingReminders: state.upcomingReminders.map(r =>
          r.id === reminderId ? { ...r, ...updatedReminder } : r
        ),
        overdueReminders: state.overdueReminders.map(r =>
          r.id === reminderId ? { ...r, ...updatedReminder } : r
        ),
        currentReminder:
          state.currentReminder?.id === reminderId
            ? { ...state.currentReminder, ...updatedReminder }
            : state.currentReminder,
        isLoading: false,
      }));

      return updatedReminder;
    } catch (error) {
      console.error('Error updating reminder:', error);
      set({
        isLoading: false,
        error: 'Failed to update reminder',
      });
      return null;
    }
  },

  // Delete reminder
  deleteReminder: async (reminderId, userId) => {
    try {
      set({ isLoading: true, error: null });

      await remindersApi.deleteReminder(reminderId, userId);

      // Update local state
      set(state => ({
        reminders: state.reminders.filter(r => r.id !== reminderId),
        upcomingReminders: state.upcomingReminders.filter(r => r.id !== reminderId),
        overdueReminders: state.overdueReminders.filter(r => r.id !== reminderId),
        todayReminders: state.todayReminders.filter(r => r.id !== reminderId),
        currentReminder:
          state.currentReminder?.id === reminderId ? null : state.currentReminder,
        counts: {
          ...state.counts,
          total: Math.max(0, state.counts.total - 1),
        },
        isLoading: false,
      }));

      return true;
    } catch (error) {
      console.error('Error deleting reminder:', error);
      set({
        isLoading: false,
        error: 'Failed to delete reminder',
      });
      return false;
    }
  },

  // Mark reminder as sent
  markAsSent: async (reminderId, userId) => {
    try {
      await remindersApi.markReminderAsSent(reminderId, userId);

      set(state => ({
        reminders: state.reminders.map(r =>
          r.id === reminderId ? { ...r, is_sent: true } : r
        ),
        overdueReminders: state.overdueReminders.filter(r => r.id !== reminderId),
      }));
    } catch (error) {
      console.error('Error marking reminder as sent:', error);
    }
  },

  // Clear current reminder
  clearCurrentReminder: () => {
    set({ currentReminder: null });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Reset store
  reset: () => {
    set({
      reminders: [],
      upcomingReminders: [],
      overdueReminders: [],
      todayReminders: [],
      currentReminder: null,
      isLoading: false,
      error: null,
      counts: {
        total: 0,
        upcoming: 0,
        overdue: 0,
      },
    });
  },
}));
