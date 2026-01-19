// Date and formatting utilities

/**
 * Format a date string to a readable format
 */
export const formatDate = (date: string | Date, options?: Intl.DateTimeFormatOptions): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  
  return dateObj.toLocaleDateString('en-US', options || defaultOptions);
};

/**
 * Format a date string to include time
 */
export const formatDateTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format a date to relative time (e.g., "2 days ago", "in 3 hours")
 */
export const formatRelativeTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInMs = dateObj.getTime() - now.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  
  const isFuture = diffInMs > 0;
  const absSeconds = Math.abs(diffInSeconds);
  const absMinutes = Math.abs(diffInMinutes);
  const absHours = Math.abs(diffInHours);
  const absDays = Math.abs(diffInDays);
  
  if (absSeconds < 60) {
    return 'Just now';
  }
  
  if (absMinutes < 60) {
    const unit = absMinutes === 1 ? 'minute' : 'minutes';
    return isFuture ? `in ${absMinutes} ${unit}` : `${absMinutes} ${unit} ago`;
  }
  
  if (absHours < 24) {
    const unit = absHours === 1 ? 'hour' : 'hours';
    return isFuture ? `in ${absHours} ${unit}` : `${absHours} ${unit} ago`;
  }
  
  if (absDays < 7) {
    const unit = absDays === 1 ? 'day' : 'days';
    return isFuture ? `in ${absDays} ${unit}` : `${absDays} ${unit} ago`;
  }
  
  if (absDays < 30) {
    const weeks = Math.floor(absDays / 7);
    const unit = weeks === 1 ? 'week' : 'weeks';
    return isFuture ? `in ${weeks} ${unit}` : `${weeks} ${unit} ago`;
  }
  
  if (absDays < 365) {
    const months = Math.floor(absDays / 30);
    const unit = months === 1 ? 'month' : 'months';
    return isFuture ? `in ${months} ${unit}` : `${months} ${unit} ago`;
  }
  
  const years = Math.floor(absDays / 365);
  const unit = years === 1 ? 'year' : 'years';
  return isFuture ? `in ${years} ${unit}` : `${years} ${unit} ago`;
};

/**
 * Check if a date is overdue
 */
export const isOverdue = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.getTime() < new Date().getTime();
};

/**
 * Check if a date is today
 */
export const isToday = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
};

/**
 * Check if a date is tomorrow
 */
export const isTomorrow = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return (
    dateObj.getDate() === tomorrow.getDate() &&
    dateObj.getMonth() === tomorrow.getMonth() &&
    dateObj.getFullYear() === tomorrow.getFullYear()
  );
};

/**
 * Check if a date is within this week (next 7 days from today, excluding today and tomorrow)
 */
export const isThisWeek = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  
  // Start from day after tomorrow
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() + 2);
  startDate.setHours(0, 0, 0, 0);
  
  // End at 7 days from now
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + 7);
  endDate.setHours(23, 59, 59, 999);
  
  return dateObj.getTime() >= startDate.getTime() && dateObj.getTime() <= endDate.getTime();
};

/**
 * Check if a date is within the next N days
 */
export const isWithinDays = (date: string | Date, days: number): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  
  return dateObj.getTime() >= now.getTime() && dateObj.getTime() <= futureDate.getTime();
};

/**
 * Format file size to human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${units[i]}`;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

/**
 * Get file extension from filename
 */
export const getFileExtension = (filename: string): string => {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
};

/**
 * Get filename without extension
 */
export const getFileNameWithoutExtension = (filename: string): string => {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.slice(0, -1).join('.') : filename;
};

/**
 * Generate initials from name
 */
export const getInitials = (name: string): string => {
  if (!name) return '';
  
  const parts = name.trim().split(' ').filter(Boolean);
  
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/**
 * Capitalize first letter of each word
 */
export const capitalizeWords = (text: string): string => {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Format number with commas
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

/**
 * Create a slug from text
 */
export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};
