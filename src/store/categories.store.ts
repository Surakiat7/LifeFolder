import { create } from 'zustand';
import { Category, CategoryInsert, CategoryUpdate } from '../utils/types';
import * as categoriesApi from '../api/categories.api';

interface CategoriesState {
  // State
  categories: Category[];
  currentCategory: Category | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchCategories: (userId: string) => Promise<void>;
  fetchCategoryById: (categoryId: string, userId: string) => Promise<Category | null>;
  createCategory: (category: CategoryInsert) => Promise<Category | null>;
  updateCategory: (categoryId: string, userId: string, updates: CategoryUpdate) => Promise<Category | null>;
  deleteCategory: (categoryId: string, userId: string) => Promise<boolean>;
  checkNameExists: (userId: string, name: string, excludeId?: string) => Promise<boolean>;
  clearCurrentCategory: () => void;
  clearError: () => void;
  reset: () => void;
}

export const useCategoriesStore = create<CategoriesState>((set, get) => ({
  // Initial state
  categories: [],
  currentCategory: null,
  isLoading: false,
  error: null,

  // Fetch all categories
  fetchCategories: async (userId) => {
    try {
      set({ isLoading: true, error: null });

      const categories = await categoriesApi.getCategories(userId);

      set({
        categories,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      set({
        isLoading: false,
        error: 'Failed to fetch categories',
      });
    }
  },

  // Fetch single category
  fetchCategoryById: async (categoryId, userId) => {
    try {
      set({ isLoading: true, error: null });

      const category = await categoriesApi.getCategoryById(categoryId, userId);

      set({
        currentCategory: category,
        isLoading: false,
      });

      return category;
    } catch (error) {
      console.error('Error fetching category:', error);
      set({
        isLoading: false,
        error: 'Failed to fetch category',
      });
      return null;
    }
  },

  // Create category
  createCategory: async (category) => {
    try {
      set({ isLoading: true, error: null });

      const newCategory = await categoriesApi.createCategory(category);

      set(state => ({
        categories: [...state.categories, newCategory].sort((a, b) =>
          a.name.localeCompare(b.name)
        ),
        isLoading: false,
      }));

      return newCategory;
    } catch (error) {
      console.error('Error creating category:', error);
      set({
        isLoading: false,
        error: 'Failed to create category',
      });
      return null;
    }
  },

  // Update category
  updateCategory: async (categoryId, userId, updates) => {
    try {
      set({ isLoading: true, error: null });

      const updatedCategory = await categoriesApi.updateCategory(
        categoryId,
        userId,
        updates
      );

      set(state => ({
        categories: state.categories
          .map(cat => (cat.id === categoryId ? updatedCategory : cat))
          .sort((a, b) => a.name.localeCompare(b.name)),
        currentCategory:
          state.currentCategory?.id === categoryId
            ? updatedCategory
            : state.currentCategory,
        isLoading: false,
      }));

      return updatedCategory;
    } catch (error) {
      console.error('Error updating category:', error);
      set({
        isLoading: false,
        error: 'Failed to update category',
      });
      return null;
    }
  },

  // Delete category
  deleteCategory: async (categoryId, userId) => {
    try {
      set({ isLoading: true, error: null });

      await categoriesApi.deleteCategory(categoryId, userId);

      set(state => ({
        categories: state.categories.filter(cat => cat.id !== categoryId),
        currentCategory:
          state.currentCategory?.id === categoryId
            ? null
            : state.currentCategory,
        isLoading: false,
      }));

      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      set({
        isLoading: false,
        error: 'Failed to delete category',
      });
      return false;
    }
  },

  // Check if category name exists
  checkNameExists: async (userId, name, excludeId) => {
    try {
      return await categoriesApi.categoryNameExists(userId, name, excludeId);
    } catch (error) {
      console.error('Error checking category name:', error);
      return false;
    }
  },

  // Clear current category
  clearCurrentCategory: () => {
    set({ currentCategory: null });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Reset store
  reset: () => {
    set({
      categories: [],
      currentCategory: null,
      isLoading: false,
      error: null,
    });
  },
}));
