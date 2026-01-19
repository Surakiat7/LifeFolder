import { create } from 'zustand';
import { 
  Item, 
  ItemInsert, 
  ItemUpdate, 
  ItemWithRelations, 
  ItemFilters,
  PaginationParams,
  SelectedFile,
} from '../utils/types';
import * as itemsApi from '../api/items.api';
import * as tagsApi from '../api/tags.api';
import * as storageApi from '../api/storage.api';
import * as attachmentsApi from '../api/attachments.api';
import { STORAGE_BUCKET } from '../utils/constants';

interface ItemsState {
  // State
  items: ItemWithRelations[];
  currentItem: ItemWithRelations | null;
  recentItems: ItemWithRelations[];
  filters: ItemFilters;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
  total: number;

  // Actions
  fetchItems: (userId: string, refresh?: boolean) => Promise<void>;
  fetchItemById: (itemId: string, userId: string) => Promise<ItemWithRelations | null>;
  fetchRecentItems: (userId: string) => Promise<void>;
  createItem: (
    item: ItemInsert, 
    userId: string, 
    tagIds?: string[], 
    files?: SelectedFile[]
  ) => Promise<Item | null>;
  updateItem: (
    itemId: string, 
    userId: string, 
    updates: ItemUpdate, 
    tagIds?: string[]
  ) => Promise<Item | null>;
  deleteItem: (itemId: string, userId: string) => Promise<boolean>;
  setFilters: (filters: Partial<ItemFilters>) => void;
  clearFilters: () => void;
  searchItems: (userId: string, searchTerm: string) => Promise<ItemWithRelations[]>;
  loadMore: (userId: string) => Promise<void>;
  clearCurrentItem: () => void;
  clearError: () => void;
  reset: () => void;
}

const initialFilters: ItemFilters = {
  search: undefined,
  categoryId: undefined,
  tagIds: undefined,
  hasReminder: undefined,
  sortBy: 'created_at',
  sortOrder: 'desc',
};

export const useItemsStore = create<ItemsState>((set, get) => ({
  // Initial state
  items: [],
  currentItem: null,
  recentItems: [],
  filters: initialFilters,
  isLoading: false,
  isRefreshing: false,
  error: null,
  page: 1,
  hasMore: true,
  total: 0,

  // Fetch items with pagination
  fetchItems: async (userId, refresh = false) => {
    try {
      const { filters, page } = get();
      
      if (refresh) {
        set({ isRefreshing: true, page: 1 });
      } else {
        set({ isLoading: true });
      }

      const result = await itemsApi.getItems(
        userId,
        filters,
        { page: refresh ? 1 : page, limit: 20 }
      );

      set({
        items: refresh ? result.data : [...get().items, ...result.data],
        total: result.total,
        hasMore: result.hasMore,
        page: refresh ? 1 : page,
        isLoading: false,
        isRefreshing: false,
        error: null,
      });
    } catch (error) {
      console.error('Error fetching items:', error);
      set({
        isLoading: false,
        isRefreshing: false,
        error: 'Failed to fetch items',
      });
    }
  },

  // Fetch single item by ID
  fetchItemById: async (itemId, userId) => {
    try {
      set({ isLoading: true, error: null });

      const item = await itemsApi.getItemById(itemId, userId);

      set({
        currentItem: item,
        isLoading: false,
      });

      return item;
    } catch (error) {
      console.error('Error fetching item:', error);
      set({
        isLoading: false,
        error: 'Failed to fetch item',
      });
      return null;
    }
  },

  // Fetch recent items
  fetchRecentItems: async (userId) => {
    try {
      const recentItems = await itemsApi.getRecentItems(userId, 5);
      set({ recentItems });
    } catch (error) {
      console.error('Error fetching recent items:', error);
    }
  },

  // Create item with tags and files
  createItem: async (item, userId, tagIds, files) => {
    try {
      set({ isLoading: true, error: null });

      // Create the item
      const newItem = await itemsApi.createItem(item);

      // Add tags if provided
      if (tagIds && tagIds.length > 0) {
        await tagsApi.addTagsToItem(newItem.id, tagIds);
      }

      // Upload files if provided
      if (files && files.length > 0) {
        const uploadedFiles = await storageApi.uploadFiles(userId, files, newItem.id);
        
        // Create attachment records
        const attachments = uploadedFiles.map(file => ({
          item_id: newItem.id,
          user_id: userId,
          bucket: STORAGE_BUCKET,
          path: file.path,
          file_url: file.url,
          file_type: file.mimeType,
          file_name: file.fileName,
          file_size: file.fileSize,
        }));

        await attachmentsApi.createAttachments(attachments);
      }

      // Refresh items list
      await get().fetchItems(userId, true);

      set({ isLoading: false });
      return newItem;
    } catch (error) {
      console.error('Error creating item:', error);
      set({
        isLoading: false,
        error: 'Failed to create item',
      });
      return null;
    }
  },

  // Update item
  updateItem: async (itemId, userId, updates, tagIds) => {
    try {
      set({ isLoading: true, error: null });

      const updatedItem = await itemsApi.updateItem(itemId, userId, updates);

      // Update tags if provided
      if (tagIds !== undefined) {
        await tagsApi.setItemTags(itemId, tagIds);
      }

      // Update local state
      set(state => ({
        items: state.items.map(item =>
          item.id === itemId ? { ...item, ...updatedItem } : item
        ),
        currentItem: state.currentItem?.id === itemId
          ? { ...state.currentItem, ...updatedItem }
          : state.currentItem,
        isLoading: false,
      }));

      return updatedItem;
    } catch (error) {
      console.error('Error updating item:', error);
      set({
        isLoading: false,
        error: 'Failed to update item',
      });
      return null;
    }
  },

  // Delete item
  deleteItem: async (itemId, userId) => {
    try {
      set({ isLoading: true, error: null });

      // Get item attachments to delete files from storage
      const attachments = await attachmentsApi.getAttachmentsByItemId(itemId, userId);
      
      // Delete files from storage
      if (attachments.length > 0) {
        const paths = attachments.map(a => a.path);
        await storageApi.deleteFiles(paths);
      }

      // Delete the item (cascades to attachments, reminders, item_tags)
      await itemsApi.deleteItem(itemId, userId);

      // Update local state
      set(state => ({
        items: state.items.filter(item => item.id !== itemId),
        currentItem: state.currentItem?.id === itemId ? null : state.currentItem,
        total: state.total - 1,
        isLoading: false,
      }));

      return true;
    } catch (error) {
      console.error('Error deleting item:', error);
      set({
        isLoading: false,
        error: 'Failed to delete item',
      });
      return false;
    }
  },

  // Set filters
  setFilters: (newFilters) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters },
      page: 1,
      hasMore: true,
    }));
  },

  // Clear filters
  clearFilters: () => {
    set({
      filters: initialFilters,
      page: 1,
      hasMore: true,
    });
  },

  // Search items
  searchItems: async (userId, searchTerm) => {
    try {
      set({ isLoading: true });
      const results = await itemsApi.searchItems(userId, searchTerm);
      set({ isLoading: false });
      return results;
    } catch (error) {
      console.error('Error searching items:', error);
      set({ isLoading: false });
      return [];
    }
  },

  // Load more items (pagination)
  loadMore: async (userId) => {
    const { hasMore, isLoading, page } = get();
    
    if (!hasMore || isLoading) return;

    set({ page: page + 1 });
    await get().fetchItems(userId);
  },

  // Clear current item
  clearCurrentItem: () => {
    set({ currentItem: null });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Reset store
  reset: () => {
    set({
      items: [],
      currentItem: null,
      recentItems: [],
      filters: initialFilters,
      isLoading: false,
      isRefreshing: false,
      error: null,
      page: 1,
      hasMore: true,
      total: 0,
    });
  },
}));
