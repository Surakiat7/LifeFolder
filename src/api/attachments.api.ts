import { supabase } from './supabase';
import { Attachment, AttachmentInsert, AttachmentUpdate } from '../utils/types';

/**
 * Get all attachments for an item
 */
export const getAttachmentsByItemId = async (
  itemId: string,
  userId: string
): Promise<Attachment[]> => {
  try {
    const { data, error } = await supabase
      .from('attachments')
      .select('*')
      .eq('item_id', itemId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching attachments:', error);
    throw error;
  }
};

/**
 * Get a single attachment by ID
 */
export const getAttachmentById = async (
  attachmentId: string,
  userId: string
): Promise<Attachment | null> => {
  try {
    const { data, error } = await supabase
      .from('attachments')
      .select('*')
      .eq('id', attachmentId)
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
    console.error('Error fetching attachment:', error);
    throw error;
  }
};

/**
 * Create a new attachment record
 */
export const createAttachment = async (
  attachment: AttachmentInsert
): Promise<Attachment> => {
  try {
    const { data, error } = await supabase
      .from('attachments')
      .insert(attachment)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error creating attachment:', error);
    throw error;
  }
};

/**
 * Create multiple attachment records
 */
export const createAttachments = async (
  attachments: AttachmentInsert[]
): Promise<Attachment[]> => {
  try {
    const { data, error } = await supabase
      .from('attachments')
      .insert(attachments)
      .select();

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error creating attachments:', error);
    throw error;
  }
};

/**
 * Update an attachment
 */
export const updateAttachment = async (
  attachmentId: string,
  userId: string,
  updates: AttachmentUpdate
): Promise<Attachment> => {
  try {
    const { data, error } = await supabase
      .from('attachments')
      .update(updates)
      .eq('id', attachmentId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error updating attachment:', error);
    throw error;
  }
};

/**
 * Delete an attachment record
 */
export const deleteAttachment = async (
  attachmentId: string,
  userId: string
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('attachments')
      .delete()
      .eq('id', attachmentId)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting attachment:', error);
    throw error;
  }
};

/**
 * Delete all attachments for an item
 */
export const deleteAttachmentsByItemId = async (
  itemId: string,
  userId: string
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('attachments')
      .delete()
      .eq('item_id', itemId)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting attachments:', error);
    throw error;
  }
};

/**
 * Get total attachments count for a user
 */
export const getAttachmentsCount = async (userId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('attachments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return count || 0;
  } catch (error) {
    console.error('Error getting attachments count:', error);
    throw error;
  }
};

/**
 * Get recent attachments
 */
export const getRecentAttachments = async (
  userId: string,
  limit: number = 10
): Promise<Attachment[]> => {
  try {
    const { data, error } = await supabase
      .from('attachments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching recent attachments:', error);
    throw error;
  }
};
