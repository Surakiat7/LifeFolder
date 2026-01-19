import { create } from 'zustand';
import { Tag, TagInsert, TagUpdate } from '../utils/types';
import * as tagsApi from '../api/tags.api';

interface TagWithCount extends Tag {
  itemCount: number;
}

interface TagsState {
  // State
  tags: Tag[];
  tagsWithCount: TagWithCount[];
  currentTag: Tag | null;
  selectedTagIds: string[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchTags: (userId: string) => Promise<void>;
  fetchTagsWithCount: (userId: string) => Promise<void>;
  fetchTagById: (tagId: string, userId: string) => Promise<Tag | null>;
  createTag: (tag: TagInsert) => Promise<Tag | null>;
  updateTag: (tagId: string, userId: string, updates: TagUpdate) => Promise<Tag | null>;
  deleteTag: (tagId: string, userId: string) => Promise<boolean>;
  checkNameExists: (userId: string, name: string, excludeId?: string) => Promise<boolean>;
  setSelectedTagIds: (tagIds: string[]) => void;
  toggleTagSelection: (tagId: string) => void;
  clearSelection: () => void;
  clearCurrentTag: () => void;
  clearError: () => void;
  reset: () => void;
}

export const useTagsStore = create<TagsState>((set, get) => ({
  // Initial state
  tags: [],
  tagsWithCount: [],
  currentTag: null,
  selectedTagIds: [],
  isLoading: false,
  error: null,

  // Fetch all tags
  fetchTags: async (userId) => {
    try {
      set({ isLoading: true, error: null });

      const tags = await tagsApi.getTags(userId);

      set({
        tags,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching tags:', error);
      set({
        isLoading: false,
        error: 'Failed to fetch tags',
      });
    }
  },

  // Fetch tags with item count
  fetchTagsWithCount: async (userId) => {
    try {
      set({ isLoading: true, error: null });

      const tagsWithCount = await tagsApi.getTagsWithItemCount(userId);

      set({
        tagsWithCount,
        tags: tagsWithCount.map(({ itemCount, ...tag }) => tag),
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching tags with count:', error);
      set({
        isLoading: false,
        error: 'Failed to fetch tags',
      });
    }
  },

  // Fetch single tag
  fetchTagById: async (tagId, userId) => {
    try {
      set({ isLoading: true, error: null });

      const tag = await tagsApi.getTagById(tagId, userId);

      set({
        currentTag: tag,
        isLoading: false,
      });

      return tag;
    } catch (error) {
      console.error('Error fetching tag:', error);
      set({
        isLoading: false,
        error: 'Failed to fetch tag',
      });
      return null;
    }
  },

  // Create tag
  createTag: async (tag) => {
    try {
      set({ isLoading: true, error: null });

      const newTag = await tagsApi.createTag(tag);

      set(state => ({
        tags: [...state.tags, newTag].sort((a, b) =>
          a.name.localeCompare(b.name)
        ),
        tagsWithCount: [...state.tagsWithCount, { ...newTag, itemCount: 0 }].sort(
          (a, b) => a.name.localeCompare(b.name)
        ),
        isLoading: false,
      }));

      return newTag;
    } catch (error) {
      console.error('Error creating tag:', error);
      set({
        isLoading: false,
        error: 'Failed to create tag',
      });
      return null;
    }
  },

  // Update tag
  updateTag: async (tagId, userId, updates) => {
    try {
      set({ isLoading: true, error: null });

      const updatedTag = await tagsApi.updateTag(tagId, userId, updates);

      set(state => ({
        tags: state.tags
          .map(tag => (tag.id === tagId ? updatedTag : tag))
          .sort((a, b) => a.name.localeCompare(b.name)),
        tagsWithCount: state.tagsWithCount
          .map(tag =>
            tag.id === tagId ? { ...updatedTag, itemCount: tag.itemCount } : tag
          )
          .sort((a, b) => a.name.localeCompare(b.name)),
        currentTag:
          state.currentTag?.id === tagId ? updatedTag : state.currentTag,
        isLoading: false,
      }));

      return updatedTag;
    } catch (error) {
      console.error('Error updating tag:', error);
      set({
        isLoading: false,
        error: 'Failed to update tag',
      });
      return null;
    }
  },

  // Delete tag
  deleteTag: async (tagId, userId) => {
    try {
      set({ isLoading: true, error: null });

      await tagsApi.deleteTag(tagId, userId);

      set(state => ({
        tags: state.tags.filter(tag => tag.id !== tagId),
        tagsWithCount: state.tagsWithCount.filter(tag => tag.id !== tagId),
        currentTag: state.currentTag?.id === tagId ? null : state.currentTag,
        selectedTagIds: state.selectedTagIds.filter(id => id !== tagId),
        isLoading: false,
      }));

      return true;
    } catch (error) {
      console.error('Error deleting tag:', error);
      set({
        isLoading: false,
        error: 'Failed to delete tag',
      });
      return false;
    }
  },

  // Check if tag name exists
  checkNameExists: async (userId, name, excludeId) => {
    try {
      return await tagsApi.tagNameExists(userId, name, excludeId);
    } catch (error) {
      console.error('Error checking tag name:', error);
      return false;
    }
  },

  // Set selected tag IDs
  setSelectedTagIds: (tagIds) => {
    set({ selectedTagIds: tagIds });
  },

  // Toggle tag selection
  toggleTagSelection: (tagId) => {
    set(state => {
      const isSelected = state.selectedTagIds.includes(tagId);
      return {
        selectedTagIds: isSelected
          ? state.selectedTagIds.filter(id => id !== tagId)
          : [...state.selectedTagIds, tagId],
      };
    });
  },

  // Clear selection
  clearSelection: () => {
    set({ selectedTagIds: [] });
  },

  // Clear current tag
  clearCurrentTag: () => {
    set({ currentTag: null });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Reset store
  reset: () => {
    set({
      tags: [],
      tagsWithCount: [],
      currentTag: null,
      selectedTagIds: [],
      isLoading: false,
      error: null,
    });
  },
}));
