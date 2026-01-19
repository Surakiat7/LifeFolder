import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Pressable,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Spinner } from 'heroui-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore, useTagsStore, useUIStore } from '../../store';
import { useAppToast } from '../../hooks/useAppToast';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, BORDER_RADIUS } from '../../utils/constants';
import { Tag } from '../../utils/types';

const TagsScreen: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    tags, 
    isLoading, 
    fetchTags, 
    createTag, 
    updateTag, 
    deleteTag 
  } = useTagsStore();
  const { showConfirmModal } = useUIStore();
  const { showError, showSuccess } = useAppToast();

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tagName, setTagName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchTags(user.id);
    }
  }, [user?.id]);

  const filteredTags = tags.filter(tag => 
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartAdd = () => {
    setIsAddingNew(true);
    setEditingId(null);
    setTagName('');
  };

  const handleStartEdit = (tag: Tag) => {
    setIsAddingNew(false);
    setEditingId(tag.id);
    setTagName(tag.name);
  };

  const handleCancel = () => {
    setIsAddingNew(false);
    setEditingId(null);
    setTagName('');
  };

  const handleSave = async () => {
    if (!tagName.trim()) {
      showError('Please enter a tag name');
      return;
    }

    if (!user?.id) return;

    if (editingId) {
      // Update existing tag
      const success = await updateTag(editingId, user.id, { name: tagName.trim() });
      if (success) {
        showSuccess('Tag updated');
        handleCancel();
      } else {
        showError('Failed to update tag');
      }
    } else {
      // Create new tag
      const newTag = await createTag({ user_id: user.id, name: tagName.trim() });
      if (newTag) {
        showSuccess('Tag created');
        handleCancel();
      } else {
        showError('Failed to create tag');
      }
    }
  };

  const handleDelete = (tag: Tag) => {
    showConfirmModal({
      title: 'Delete Tag',
      message: `Are you sure you want to delete "${tag.name}"? This tag will be removed from all documents.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      isDestructive: true,
      onConfirm: async () => {
        if (user?.id) {
          const success = await deleteTag(tag.id, user.id);
          if (success) {
            showSuccess('Tag deleted');
          } else {
            showError('Failed to delete tag');
          }
        }
      },
    });
  };

  const renderTagItem = ({ item }: { item: Tag }) => {
    const isEditing = editingId === item.id;

    if (isEditing) {
      return (
        <View style={styles.editForm}>
          <TextInput
            style={styles.input}
            value={tagName}
            onChangeText={setTagName}
            placeholder="Tag name"
            placeholderTextColor={COLORS.textTertiary}
            autoFocus
          />
          <View style={styles.editActions}>
            <Pressable style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save</Text>
            </Pressable>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.tagItem}>
        <View style={styles.tagIcon}>
          <Ionicons name="pricetag" size={20} color={COLORS.primary} />
        </View>
        <Text style={styles.tagName}>{item.name}</Text>
        <Pressable 
          style={styles.actionButton} 
          onPress={() => handleStartEdit(item)}
        >
          <Ionicons name="create-outline" size={20} color={COLORS.textSecondary} />
        </Pressable>
        <Pressable 
          style={styles.actionButton} 
          onPress={() => handleDelete(item)}
        >
          <Ionicons name="trash-outline" size={20} color={COLORS.error} />
        </Pressable>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.title}>Tags</Text>
        <Text style={styles.subtitle}>
          Add tags to your documents for quick access
        </Text>
      </View>
      {!isAddingNew && !editingId && (
        <Pressable style={styles.addButton} onPress={handleStartAdd}>
          <Ionicons name="add" size={24} color={COLORS.surface} />
        </Pressable>
      )}
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={COLORS.textTertiary} />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search tags..."
          placeholderTextColor={COLORS.textTertiary}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={COLORS.textTertiary} />
          </Pressable>
        )}
      </View>
    </View>
  );

  const renderAddForm = () => {
    if (!isAddingNew) return null;

    return (
      <View style={styles.addForm}>
        <Text style={styles.formTitle}>New Tag</Text>
        <TextInput
          style={styles.input}
          value={tagName}
          onChangeText={setTagName}
          placeholder="Tag name"
          placeholderTextColor={COLORS.textTertiary}
          autoFocus
        />
        <View style={styles.formActions}>
          <Pressable style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
          <Pressable style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Create</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  const renderTagsCount = () => (
    <View style={styles.countContainer}>
      <Text style={styles.countText}>
        {filteredTags.length} {filteredTags.length === 1 ? 'tag' : 'tags'}
        {searchQuery && ` matching "${searchQuery}"`}
      </Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="pricetags-outline" size={64} color={COLORS.textTertiary} />
      <Text style={styles.emptyTitle}>
        {searchQuery ? 'No Tags Found' : 'No Tags Yet'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery 
          ? `No tags match "${searchQuery}"`
          : 'Create tags to organize and find your documents easily'
        }
      </Text>
      {!searchQuery && (
        <Button onPress={handleStartAdd} className="mt-4">
          Create Tag
        </Button>
      )}
    </View>
  );

  if (isLoading && tags.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Spinner size="lg" color="primary" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={filteredTags}
        renderItem={renderTagItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {renderHeader()}
            {renderSearchBar()}
            {renderAddForm()}
            {tags.length > 0 && renderTagsCount()}
          </>
        }
        ListEmptyComponent={!isAddingNew ? renderEmptyState : null}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    ...TYPOGRAPHY.title1,
    color: COLORS.text,
  },
  subtitle: {
    ...TYPOGRAPHY.subheadline,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    ...SHADOWS.small,
  },
  searchInput: {
    flex: 1,
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    marginLeft: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  countContainer: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.md,
  },
  countText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.textSecondary,
  },
  listContent: {
    paddingBottom: 100,
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.small,
  },
  tagIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  tagName: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '500',
    flex: 1,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addForm: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.medium,
  },
  editForm: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.medium,
  },
  formTitle: {
    ...TYPOGRAPHY.headline,
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.md,
    marginTop: SPACING.xl,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  cancelButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.background,
  },
  cancelButtonText: {
    ...TYPOGRAPHY.subheadline,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  saveButton: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.primary,
  },
  saveButtonText: {
    ...TYPOGRAPHY.subheadline,
    color: COLORS.surface,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    paddingTop: 80,
  },
  emptyTitle: {
    ...TYPOGRAPHY.headline,
    color: COLORS.text,
    marginTop: SPACING.lg,
  },
  emptySubtitle: {
    ...TYPOGRAPHY.subheadline,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
});

export default TagsScreen;
