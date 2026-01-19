import { supabase } from './supabase';
import { 
  Item, 
  ItemInsert, 
  ItemUpdate, 
  ItemWithRelations,
  ItemFilters,
  PaginationParams,
  PaginatedResponse,
} from '../utils/types';
import { DEFAULT_PAGE_SIZE } from '../utils/constants';

/**
 * Get all items for the current user with pagination
 */
export const getItems = async (
  userId: string,
  filters?: ItemFilters,
  pagination?: PaginationParams
): Promise<PaginatedResponse<ItemWithRelations>> => {
  try {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || DEFAULT_PAGE_SIZE;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('items')
      .select(`
        *,
        category:categories(*),
        attachments(*),
        reminders(*)
      `, { count: 'exact' })
      .eq('user_id', userId);

    // Apply filters
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (filters?.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }

    if (filters?.hasReminder) {
      // Filter items that have reminders
      query = query.not('reminders', 'is', null);
    }

    // Apply sorting
    const sortBy = filters?.sortBy || 'created_at';
    const sortOrder = filters?.sortOrder || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    // If filtering by tags, we need to do it client-side after fetching
    let filteredData = data || [];
    
    if (filters?.tagIds && filters.tagIds.length > 0) {
      // Get item_tags for the filtered tag ids
      const { data: itemTags } = await supabase
        .from('item_tags')
        .select('item_id')
        .in('tag_id', filters.tagIds);
      
      const itemIdsWithTags = new Set(itemTags?.map(it => it.item_id) || []);
      filteredData = filteredData.filter(item => itemIdsWithTags.has(item.id));
    }

    // Fetch tags for each item
    const itemsWithTags: ItemWithRelations[] = await Promise.all(
      filteredData.map(async (item) => {
        const { data: itemTags } = await supabase
          .from('item_tags')
          .select('tag_id, tags(*)')
          .eq('item_id', item.id);
        
        return {
          ...item,
          tags: itemTags?.map((it: any) => it.tags).filter(Boolean) || [],
        };
      })
    );

    return {
      data: itemsWithTags,
      total: count || 0,
      page,
      limit,
      hasMore: offset + limit < (count || 0),
    };
  } catch (error) {
    console.error('Error fetching items:', error);
    throw error;
  }
};

/**
 * Get a single item by ID with all relations
 */
export const getItemById = async (
  itemId: string,
  userId: string
): Promise<ItemWithRelations | null> => {
  try {
    const { data, error } = await supabase
      .from('items')
      .select(`
        *,
        category:categories(*),
        attachments(*),
        reminders(*)
      `)
      .eq('id', itemId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw error;
    }

    // Fetch tags
    const { data: itemTags } = await supabase
      .from('item_tags')
      .select('tag_id, tags(*)')
      .eq('item_id', itemId);

    return {
      ...data,
      tags: itemTags?.map((it: any) => it.tags).filter(Boolean) || [],
    };
  } catch (error) {
    console.error('Error fetching item:', error);
    throw error;
  }
};

/**
 * Create a new item
 */
export const createItem = async (item: ItemInsert): Promise<Item> => {
  try {
    const { data, error } = await supabase
      .from('items')
      .insert(item)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error creating item:', error);
    throw error;
  }
};

/**
 * Update an item
 */
export const updateItem = async (
  itemId: string,
  userId: string,
  updates: ItemUpdate
): Promise<Item> => {
  try {
    const { data, error } = await supabase
      .from('items')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', itemId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error updating item:', error);
    throw error;
  }
};

/**
 * Delete an item
 */
export const deleteItem = async (itemId: string, userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', itemId)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting item:', error);
    throw error;
  }
};

/**
 * Get recent items
 */
export const getRecentItems = async (
  userId: string,
  limit: number = 5
): Promise<ItemWithRelations[]> => {
  try {
    const { data, error } = await supabase
      .from('items')
      .select(`
        *,
        category:categories(*),
        attachments(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching recent items:', error);
    throw error;
  }
};

/**
 * Get items count by category
 */
export const getItemsCountByCategory = async (
  userId: string
): Promise<{ categoryId: string | null; count: number }[]> => {
  try {
    const { data, error } = await supabase
      .from('items')
      .select('category_id')
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    // Count items per category
    const counts = (data || []).reduce((acc, item) => {
      const categoryId = item.category_id || 'uncategorized';
      acc[categoryId] = (acc[categoryId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts).map(([categoryId, count]) => ({
      categoryId: categoryId === 'uncategorized' ? null : categoryId,
      count,
    }));
  } catch (error) {
    console.error('Error fetching items count:', error);
    throw error;
  }
};

/**
 * Search items
 */
export const searchItems = async (
  userId: string,
  searchTerm: string
): Promise<ItemWithRelations[]> => {
  try {
    const { data, error } = await supabase
      .from('items')
      .select(`
        *,
        category:categories(*),
        attachments(*)
      `)
      .eq('user_id', userId)
      .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .order('updated_at', { ascending: false })
      .limit(20);

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error searching items:', error);
    throw error;
  }
};
