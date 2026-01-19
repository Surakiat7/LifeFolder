import { supabase } from './supabase';
import { Tag, TagInsert, TagUpdate } from '../utils/types';

/**
 * Get all tags for the current user
 */
export const getTags = async (userId: string): Promise<Tag[]> => {
  try {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching tags:', error);
    throw error;
  }
};

/**
 * Get a single tag by ID
 */
export const getTagById = async (
  tagId: string,
  userId: string
): Promise<Tag | null> => {
  try {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('id', tagId)
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
    console.error('Error fetching tag:', error);
    throw error;
  }
};

/**
 * Create a new tag
 */
export const createTag = async (tag: TagInsert): Promise<Tag> => {
  try {
    const { data, error } = await supabase
      .from('tags')
      .insert(tag)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error creating tag:', error);
    throw error;
  }
};

/**
 * Update a tag
 */
export const updateTag = async (
  tagId: string,
  userId: string,
  updates: TagUpdate
): Promise<Tag> => {
  try {
    const { data, error } = await supabase
      .from('tags')
      .update(updates)
      .eq('id', tagId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error updating tag:', error);
    throw error;
  }
};

/**
 * Delete a tag
 */
export const deleteTag = async (tagId: string, userId: string): Promise<void> => {
  try {
    // First, delete all item_tags associations
    await supabase
      .from('item_tags')
      .delete()
      .eq('tag_id', tagId);

    // Then delete the tag
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', tagId)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting tag:', error);
    throw error;
  }
};

/**
 * Check if tag name exists
 */
export const tagNameExists = async (
  userId: string,
  name: string,
  excludeId?: string
): Promise<boolean> => {
  try {
    let query = supabase
      .from('tags')
      .select('id')
      .eq('user_id', userId)
      .ilike('name', name);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return (data?.length || 0) > 0;
  } catch (error) {
    console.error('Error checking tag name:', error);
    throw error;
  }
};

/**
 * Get tags count
 */
export const getTagsCount = async (userId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('tags')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return count || 0;
  } catch (error) {
    console.error('Error getting tags count:', error);
    throw error;
  }
};

/**
 * Add tags to an item
 */
export const addTagsToItem = async (
  itemId: string,
  tagIds: string[]
): Promise<void> => {
  try {
    const itemTags = tagIds.map(tagId => ({
      item_id: itemId,
      tag_id: tagId,
    }));

    const { error } = await supabase
      .from('item_tags')
      .insert(itemTags);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error adding tags to item:', error);
    throw error;
  }
};

/**
 * Remove tags from an item
 */
export const removeTagsFromItem = async (
  itemId: string,
  tagIds: string[]
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('item_tags')
      .delete()
      .eq('item_id', itemId)
      .in('tag_id', tagIds);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error removing tags from item:', error);
    throw error;
  }
};

/**
 * Set tags for an item (replaces existing tags)
 */
export const setItemTags = async (
  itemId: string,
  tagIds: string[]
): Promise<void> => {
  try {
    // Delete existing tags
    await supabase
      .from('item_tags')
      .delete()
      .eq('item_id', itemId);

    // Add new tags
    if (tagIds.length > 0) {
      const itemTags = tagIds.map(tagId => ({
        item_id: itemId,
        tag_id: tagId,
      }));

      const { error } = await supabase
        .from('item_tags')
        .insert(itemTags);

      if (error) {
        throw error;
      }
    }
  } catch (error) {
    console.error('Error setting item tags:', error);
    throw error;
  }
};

/**
 * Get tags for an item
 */
export const getTagsForItem = async (itemId: string): Promise<Tag[]> => {
  try {
    const { data, error } = await supabase
      .from('item_tags')
      .select('tags(*)')
      .eq('item_id', itemId);

    if (error) {
      throw error;
    }

    return data?.map((it: any) => it.tags).filter(Boolean) || [];
  } catch (error) {
    console.error('Error fetching item tags:', error);
    throw error;
  }
};

/**
 * Get items count for each tag
 */
export const getTagsWithItemCount = async (
  userId: string
): Promise<(Tag & { itemCount: number })[]> => {
  try {
    const tags = await getTags(userId);
    
    const tagsWithCount = await Promise.all(
      tags.map(async (tag) => {
        const { count } = await supabase
          .from('item_tags')
          .select('*', { count: 'exact', head: true })
          .eq('tag_id', tag.id);
        
        return {
          ...tag,
          itemCount: count || 0,
        };
      })
    );

    return tagsWithCount;
  } catch (error) {
    console.error('Error fetching tags with item count:', error);
    throw error;
  }
};
