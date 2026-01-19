import { create } from 'zustand';
import { UserProfile } from '../utils/types';
import * as authApi from '../api/auth.api';
import { supabase } from '../api/supabase';

interface AuthState {
  // State
  user: UserProfile | null;
  session: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
  setUser: (user: UserProfile | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,

  // Initialize auth state
  initialize: async () => {
    try {
      set({ isLoading: true });

      // Get current session
      const { session, error } = await authApi.getSession();

      if (error) {
        set({ 
          isLoading: false, 
          isInitialized: true,
          error 
        });
        return;
      }

      if (session) {
        // Get user profile
        const { user } = await authApi.getCurrentUser();
        
        set({
          user,
          session,
          isAuthenticated: !!user,
          isLoading: false,
          isInitialized: true,
          error: null,
        });
      } else {
        set({
          user: null,
          session: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
          error: null,
        });
      }

      // Listen to auth state changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const { user } = await authApi.getCurrentUser();
          set({
            user,
            session,
            isAuthenticated: !!user,
          });
        } else if (event === 'SIGNED_OUT') {
          set({
            user: null,
            session: null,
            isAuthenticated: false,
          });
        } else if (event === 'TOKEN_REFRESHED' && session) {
          set({ session });
        }
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({
        isLoading: false,
        isInitialized: true,
        error: 'Failed to initialize authentication',
      });
    }
  },

  // Sign in with Google
  signInWithGoogle: async () => {
    try {
      set({ isLoading: true, error: null });
      console.log('Store: Starting Google sign in...');

      const { user, error } = await authApi.signInWithGoogle();
      
      console.log('Store: signInWithGoogle returned');
      console.log('Store: user:', user?.email);
      console.log('Store: error:', error);

      if (error) {
        set({ isLoading: false, error });
        return { success: false, error };
      }

      if (user) {
        // Don't call getSession - it hangs. Just set user directly.
        console.log('Store: Setting user state...');
        
        set({
          user,
          session: null, // Session will be set by onAuthStateChange listener
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        console.log('Store: Sign in complete!');
        return { success: true };
      }

      set({ isLoading: false });
      return { success: false, error: 'Sign in failed' };
    } catch (error) {
      console.error('Sign in error:', error);
      const errorMessage = 'An unexpected error occurred';
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Sign out
  signOut: async () => {
    try {
      set({ isLoading: true });

      await authApi.signOut();

      set({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Sign out error:', error);
      set({ 
        isLoading: false, 
        error: 'Failed to sign out' 
      });
    }
  },

  // Refresh session
  refreshSession: async () => {
    try {
      const { session, error } = await authApi.refreshSession();

      if (error) {
        // Session refresh failed, user needs to re-authenticate
        set({
          user: null,
          session: null,
          isAuthenticated: false,
          error,
        });
        return;
      }

      if (session) {
        set({ session });
      }
    } catch (error) {
      console.error('Session refresh error:', error);
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Set user (for external updates)
  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
  },
}));
