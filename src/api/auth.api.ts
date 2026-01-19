import { supabase } from './supabase';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { UserProfile } from '../utils/types';

// Complete auth session for web browser
WebBrowser.maybeCompleteAuthSession();

/**
 * Sign in with Google OAuth using Supabase
 */
export const signInWithGoogle = async (): Promise<{ user: UserProfile | null; error: string | null }> => {
  try {
    // Use AuthSession.makeRedirectUri for proper redirect URL
    const redirectUrl = AuthSession.makeRedirectUri({
      scheme: 'lifefolder',
      path: 'auth/callback',
    });
    
    console.log('Using redirect URL:', redirectUrl);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true,
        queryParams: {
          prompt: 'select_account',
        },
      },
    });

    if (error) {
      console.error('OAuth error:', error);
      return { user: null, error: error.message };
    }

    if (data?.url) {
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUrl
      );

      console.log('Auth result type:', result.type);

      if (result.type === 'success' && result.url) {
        console.log('Success URL:', result.url);
        
        // Parse the URL for tokens or code
        const url = new URL(result.url);
        let params: URLSearchParams;
        
        if (url.hash && url.hash.length > 1) {
          params = new URLSearchParams(url.hash.substring(1));
        } else {
          params = new URLSearchParams(url.search);
        }
        
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const code = params.get('code');

        console.log('Has access_token:', !!accessToken);
        console.log('Has code:', !!code);

        if (accessToken) {
          console.log('Decoding JWT token...');
          
          // Decode JWT to get user info directly - don't wait for setSession
          try {
            const payload = accessToken.split('.')[1];
            const decoded = JSON.parse(atob(payload));
            console.log('JWT decoded, email:', decoded.email);
            
            const userProfile: UserProfile = {
              id: decoded.sub,
              email: decoded.email || '',
              full_name: decoded.user_metadata?.full_name || decoded.user_metadata?.name || null,
              avatar_url: decoded.user_metadata?.avatar_url || decoded.user_metadata?.picture || null,
            };
            
            console.log('User profile created:', userProfile.email);
            
            // Set session in background (don't await - it hangs)
            supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            }).then(() => console.log('Background setSession done'))
              .catch(e => console.log('Background setSession error:', e));
            
            return { user: userProfile, error: null };
          } catch (decodeError) {
            console.error('JWT decode error:', decodeError);
            return { user: null, error: 'Failed to decode token' };
          }
        } else if (code) {
          // Exchange authorization code for session
          const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            console.error('Code exchange error:', exchangeError);
            return { user: null, error: exchangeError.message };
          }
          
          if (sessionData.user) {
            const userProfile: UserProfile = {
              id: sessionData.user.id,
              email: sessionData.user.email || '',
              full_name: sessionData.user.user_metadata?.full_name || sessionData.user.user_metadata?.name || null,
              avatar_url: sessionData.user.user_metadata?.avatar_url || sessionData.user.user_metadata?.picture || null,
            };
            return { user: userProfile, error: null };
          }
        } else {
          const errorMsg = params.get('error_description') || params.get('error');
          if (errorMsg) {
            return { user: null, error: errorMsg };
          }
        }
      }

      if (result.type === 'cancel' || result.type === 'dismiss') {
        return { user: null, error: 'Sign in was cancelled' };
      }
    }

    return { user: null, error: 'Failed to complete sign in' };
  } catch (error) {
    console.error('Google sign in error:', error);
    return { user: null, error: 'An unexpected error occurred during sign in' };
  }
};

/**
 * Sign out the current user
 */
export const signOut = async (): Promise<{ error: string | null }> => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return { error: error.message };
    }
    
    return { error: null };
  } catch (error) {
    console.error('Sign out error:', error);
    return { error: 'An unexpected error occurred during sign out' };
  }
};

/**
 * Get the current session
 */
export const getSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      return { session: null, error: error.message };
    }
    
    return { session, error: null };
  } catch (error) {
    console.error('Get session error:', error);
    return { session: null, error: 'Failed to get session' };
  }
};

/**
 * Get the current user profile
 */
export const getCurrentUser = async (): Promise<{ user: UserProfile | null; error: string | null }> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      return { user: null, error: error.message };
    }
    
    if (user) {
      const userProfile: UserProfile = {
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
        avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
      };
      
      return { user: userProfile, error: null };
    }
    
    return { user: null, error: null };
  } catch (error) {
    console.error('Get user error:', error);
    return { user: null, error: 'Failed to get user' };
  }
};

/**
 * Refresh the current session
 */
export const refreshSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.refreshSession();
    
    if (error) {
      return { session: null, error: error.message };
    }
    
    return { session, error: null };
  } catch (error) {
    console.error('Refresh session error:', error);
    return { session: null, error: 'Failed to refresh session' };
  }
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
  
  return subscription;
};
