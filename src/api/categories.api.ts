import { supabase } from './supabase';
import { Category, CategoryInsert, CategoryUpdate } from '../utils/types';

/**
 * Get all categories for the current user
 */
export const getCategories = async (userId: string): Promise<Category[]> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

/**
 * Get a single category by ID
 */
export const getCategoryById = async (
  categoryId: string,
  userId: string
): Promise<Category | null> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', categoryId)
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
    console.error('Error fetching category:', error);
    throw error;
  }
};

/**
 * Create a new category
 */
export const createCategory = async (
  category: CategoryInsert
): Promise<Category> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert(category)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

/**
 * Update a category
 */
export const updateCategory = async (
  categoryId: string,
  userId: string,
  updates: CategoryUpdate
): Promise<Category> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', categoryId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

/**
 * Delete a category
 */
export const deleteCategory = async (
  categoryId: string,
  userId: string
): Promise<void> => {
  try {
    // First, unset category_id for all items with this category
    await supabase
      .from('items')
      .update({ category_id: null })
      .eq('category_id', categoryId)
      .eq('user_id', userId);

    // Then delete the category
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

/**
 * Check if category name exists
 */
export const categoryNameExists = async (
  userId: string,
  name: string,
  excludeId?: string
): Promise<boolean> => {
  try {
    let query = supabase
      .from('categories')
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
    console.error('Error checking category name:', error);
    throw error;
  }
};

/**
 * Get categories count
 */
export const getCategoriesCount = async (userId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return count || 0;
  } catch (error) {
    console.error('Error getting categories count:', error);
    throw error;
  }
};
