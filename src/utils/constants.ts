// App Constants
export const APP_NAME = 'LifeFolder';
export const APP_VERSION = '1.0.0';

// Storage Bucket
export const STORAGE_BUCKET = 'lifefolder-files';

// Pagination
export const DEFAULT_PAGE_SIZE = 20;

// Secure Store Keys
export const SECURE_STORE_KEYS = {
  BIOMETRIC_ENABLED: 'biometric_enabled',
  USER_PREFERENCES: 'user_preferences',
  LAST_SYNC: 'last_sync',
} as const;

// Category Colors
export const CATEGORY_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FFEAA7', // Yellow
  '#DDA0DD', // Plum
  '#98D8C8', // Mint
  '#F7DC6F', // Gold
  '#BB8FCE', // Purple
  '#85C1E9', // Light Blue
  '#F8B500', // Orange
  '#82E0AA', // Light Green
] as const;

// Category Icons
export const CATEGORY_ICONS = [
  'folder',
  'document-text',
  'image',
  'film',
  'card',
  'medical',
  'car',
  'home',
  'school',
  'briefcase',
  'airplane',
  'receipt',
  'cash',
  'shield-checkmark',
  'people',
  'heart',
  'fitness',
  'restaurant',
  'gift',
  'calendar',
] as const;

// File Type Icons
export const FILE_TYPE_ICONS: Record<string, string> = {
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/gif': 'image',
  'image/webp': 'image',
  'application/pdf': 'document-text',
  'application/msword': 'document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'document',
  'application/vnd.ms-excel': 'stats-chart',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'stats-chart',
  'video/mp4': 'videocam',
  'video/quicktime': 'videocam',
  'video/x-msvideo': 'videocam',
  'audio/mpeg': 'musical-notes',
  'audio/wav': 'musical-notes',
  default: 'document-attach',
};

// Supported File Types
export const SUPPORTED_FILE_TYPES = {
  images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic'],
  documents: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  videos: ['video/mp4', 'video/quicktime', 'video/x-msvideo'],
} as const;

// Max File Size (in bytes) - 50MB
export const MAX_FILE_SIZE = 50 * 1024 * 1024;

// Date Formats
export const DATE_FORMATS = {
  display: 'MMM dd, yyyy',
  displayWithTime: 'MMM dd, yyyy HH:mm',
  iso: "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
  short: 'MM/dd/yyyy',
  time: 'HH:mm',
} as const;

// Theme Colors
export const COLORS = {
  // Primary
  primary: '#007AFF',
  primaryLight: '#4DA3FF',
  primaryDark: '#0056B3',
  
  // Secondary
  secondary: '#5856D6',
  secondaryLight: '#7B7AE0',
  secondaryDark: '#3D3CB3',
  
  // Neutral
  background: '#F8F9FA',
  surface: '#FFFFFF',
  surfaceSecondary: '#F2F2F7',
  white: '#FFFFFF',
  black: '#000000',
  
  // Text
  text: '#1C1C1E',
  textSecondary: '#8E8E93',
  textTertiary: '#AEAEB2',
  textInverse: '#FFFFFF',
  
  // Semantic
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#007AFF',
  
  // Border
  border: '#E5E5EA',
  borderLight: '#F2F2F7',
  
  // Status
  upcoming: '#007AFF',
  overdue: '#FF3B30',
  completed: '#34C759',
  
  // Misc
  overlay: 'rgba(0, 0, 0, 0.5)',
  disabled: '#C7C7CC',
  placeholder: '#C7C7CC',
} as const;

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

// Border Radius
export const BORDER_RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

// Typography
export const TYPOGRAPHY = {
  largeTitle: {
    fontSize: 34,
    fontWeight: '700' as const,
    lineHeight: 41,
  },
  title1: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
  },
  title2: {
    fontSize: 22,
    fontWeight: '700' as const,
    lineHeight: 28,
  },
  title3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 25,
  },
  headline: {
    fontSize: 17,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  body: {
    fontSize: 17,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  callout: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 21,
  },
  subheadline: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  footnote: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
  },
  caption1: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  caption2: {
    fontSize: 11,
    fontWeight: '400' as const,
    lineHeight: 13,
  },
} as const;

// Shadow Styles
export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
} as const;

// Animation Durations
export const ANIMATION = {
  fast: 150,
  normal: 250,
  slow: 400,
} as const;

// Screen Names
export const SCREENS = {
  // Auth
  WELCOME: 'Welcome',
  LOGIN: 'Login',
  
  // Main
  HOME: 'Home',
  ITEM_DETAIL: 'ItemDetail',
  CREATE_ITEM: 'CreateItem',
  EDIT_ITEM: 'EditItem',
  
  // Categories
  CATEGORIES: 'Categories',
  CREATE_CATEGORY: 'CreateCategory',
  EDIT_CATEGORY: 'EditCategory',
  
  // Tags
  TAGS: 'Tags',
  CREATE_TAG: 'CreateTag',
  EDIT_TAG: 'EditTag',
  
  // Reminders
  REMINDER_CENTER: 'ReminderCenter',
  CREATE_REMINDER: 'CreateReminder',
  EDIT_REMINDER: 'EditReminder',
  
  // Profile
  PROFILE: 'Profile',
  SETTINGS: 'Settings',
  SECURITY_SETTINGS: 'SecuritySettings',
} as const;

// Tab Names
export const TABS = {
  HOME: 'HomeTab',
  CATEGORIES: 'CategoriesTab',
  REMINDERS: 'RemindersTab',
  PROFILE: 'ProfileTab',
} as const;
