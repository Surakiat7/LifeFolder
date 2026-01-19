// Database Types for Supabase
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      items: {
        Row: Item;
        Insert: ItemInsert;
        Update: ItemUpdate;
      };
      attachments: {
        Row: Attachment;
        Insert: AttachmentInsert;
        Update: AttachmentUpdate;
      };
      categories: {
        Row: Category;
        Insert: CategoryInsert;
        Update: CategoryUpdate;
      };
      tags: {
        Row: Tag;
        Insert: TagInsert;
        Update: TagUpdate;
      };
      item_tags: {
        Row: ItemTag;
        Insert: ItemTagInsert;
        Update: ItemTagUpdate;
      };
      reminders: {
        Row: Reminder;
        Insert: ReminderInsert;
        Update: ReminderUpdate;
      };
    };
  };
}

// Items
export interface Item {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category_id: string | null;
  is_folder: boolean;
  created_at: string;
  updated_at: string;
}

export interface ItemInsert {
  id?: string;
  user_id: string;
  title: string;
  description?: string | null;
  category_id?: string | null;
  is_folder?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ItemUpdate {
  id?: string;
  user_id?: string;
  title?: string;
  description?: string | null;
  category_id?: string | null;
  is_folder?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Item with relations
export interface ItemWithRelations extends Item {
  category?: Category | null;
  attachments?: Attachment[];
  tags?: Tag[];
  reminders?: Reminder[];
}

// Attachments
export interface Attachment {
  id: string;
  item_id: string;
  user_id: string;
  bucket: string;
  path: string;
  file_url: string;
  file_type: string;
  file_name: string;
  file_size?: number;

  description: string | null;
  reminder_date: string | null;
  reminder_note: string | null;
  created_at: string;
}

export interface AttachmentInsert {
  id?: string;
  item_id: string;
  user_id: string;
  bucket: string;
  path: string;
  file_url: string;
  file_type: string;
  file_name: string;
  file_size?: number;

  description?: string | null;
  reminder_date?: string | null;
  reminder_note?: string | null;
  created_at?: string;
}

export interface AttachmentUpdate {
  id?: string;
  item_id?: string;
  user_id?: string;
  bucket?: string;
  path?: string;
  file_url?: string;
  file_type?: string;
  file_name?: string;
  file_size?: number;

  description?: string | null;
  reminder_date?: string | null;
  reminder_note?: string | null;
  created_at?: string;
}

// Categories
export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string | null;
  icon: string | null;
  created_at: string;
}

export interface CategoryInsert {
  id?: string;
  user_id: string;
  name: string;
  color?: string | null;
  icon?: string | null;
  created_at?: string;
}

export interface CategoryUpdate {
  id?: string;
  user_id?: string;
  name?: string;
  color?: string | null;
  icon?: string | null;
  created_at?: string;
}

// Tags
export interface Tag {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface TagInsert {
  id?: string;
  user_id: string;
  name: string;
  created_at?: string;
}

export interface TagUpdate {
  id?: string;
  user_id?: string;
  name?: string;
  created_at?: string;
}

// Item Tags (Junction Table)
export interface ItemTag {
  id: string;
  item_id: string;
  tag_id: string;
}

export interface ItemTagInsert {
  id?: string;
  item_id: string;
  tag_id: string;
}

export interface ItemTagUpdate {
  id?: string;
  item_id?: string;
  tag_id?: string;
}

// Reminders
export interface Reminder {
  id: string;
  user_id: string;
  item_id: string;
  notify_at: string;
  note: string | null;
  is_sent: boolean;
  created_at: string;
}

export interface ReminderInsert {
  id?: string;
  user_id: string;
  item_id: string;
  notify_at: string;
  note?: string | null;
  is_sent?: boolean;
  created_at?: string;
}

export interface ReminderUpdate {
  id?: string;
  user_id?: string;
  item_id?: string;
  notify_at?: string;
  note?: string | null;
  is_sent?: boolean;
  created_at?: string;
}

// Reminder with Item
export interface ReminderWithItem extends Reminder {
  item?: Item | null;
}

// User Profile
export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
}

// File types for upload
export type FileType = 'image' | 'pdf' | 'doc' | 'video' | 'other';

export interface SelectedFile {
  uri: string;
  name: string;
  type: string;
  size: number;
  mimeType: string;
}

// Filter types
export interface ItemFilters {
  search?: string;
  categoryId?: string | null;
  tagIds?: string[];
  hasReminder?: boolean;
  sortBy?: 'created_at' | 'updated_at' | 'title';
  sortOrder?: 'asc' | 'desc';
}

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// API Response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

// Auth types
export interface AuthState {
  user: UserProfile | null;
  session: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// UI State types
export interface UIState {
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
}
