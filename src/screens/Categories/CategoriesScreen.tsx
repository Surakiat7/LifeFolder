import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Spinner } from 'heroui-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore, useCategoriesStore, useUIStore } from '../../store';
import { useAppToast } from '../../hooks/useAppToast';
import { CategoriesStackParamList } from '../../navigation/AppNavigator';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, BORDER_RADIUS, CATEGORY_COLORS } from '../../utils/constants';
import { Category } from '../../utils/types';

type CategoriesNavigationProp = NativeStackNavigationProp<CategoriesStackParamList>;

const CategoriesScreen: React.FC = () => {
  const navigation = useNavigation<CategoriesNavigationProp>();
  
  const { user } = useAuthStore();
  const { 
    categories, 
    isLoading, 
    fetchCategories, 
    createCategory, 
    updateCategory, 
    deleteCategory 
  } = useCategoriesStore();
  const { showConfirmModal } = useUIStore();
  const { showError, showSuccess } = useAppToast();

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>(CATEGORY_COLORS[0]);

  useEffect(() => {
    if (user?.id) {
      fetchCategories(user.id);
    }
  }, [user?.id]);

  const handleStartAdd = () => {
    setIsAddingNew(true);
    setEditingId(null);
    setCategoryName('');
    setSelectedColor(CATEGORY_COLORS[0]);
  };

  const handleStartEdit = (category: Category) => {
    setIsAddingNew(false);
    setEditingId(category.id);
    setCategoryName(category.name);
    setSelectedColor(category.color || CATEGORY_COLORS[0]);
  };

  const handleCancel = () => {
    setIsAddingNew(false);
    setEditingId(null);
    setCategoryName('');
    setSelectedColor(CATEGORY_COLORS[0]);
  };

  const handleSave = async () => {
    if (!categoryName.trim()) {
      showError('Please enter a category name');
      return;
    }

    if (!user?.id) return;

    if (editingId) {
      // Update existing category
      const success = await updateCategory(editingId, user.id, {
        name: categoryName.trim(),
        color: selectedColor,
      });
      if (success) {
        showSuccess('Category updated');
        handleCancel();
      } else {
        showError('Failed to update category');
      }
    } else {
      // Create new category
      const newCategory = await createCategory({
        user_id: user.id,
        name: categoryName.trim(),
        color: selectedColor,
      });
      if (newCategory) {
        showSuccess('Category created');
        handleCancel();
      } else {
        showError('Failed to create category');
      }
    }
  };

  const handleDelete = (category: Category) => {
    showConfirmModal({
      title: 'Delete Category',
      message: `Are you sure you want to delete "${category.name}"? Documents in this category won't be deleted.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      isDestructive: true,
      onConfirm: async () => {
        if (user?.id) {
          const success = await deleteCategory(category.id, user.id);
          if (success) {
            showSuccess('Category deleted');
          } else {
            showError('Failed to delete category');
          }
        }
      },
    });
  };

  const renderCategoryItem = ({ item }: { item: Category }) => {
    const isEditing = editingId === item.id;

    if (isEditing) {
      return (
        <View style={styles.editForm}>
          <TextInput
            style={styles.input}
            value={categoryName}
            onChangeText={setCategoryName}
            placeholder="Category name"
            placeholderTextColor={COLORS.textTertiary}
            autoFocus
          />
          <View style={styles.colorPicker}>
            {CATEGORY_COLORS.map((color) => (
              <Pressable
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  selectedColor === color && styles.colorOptionSelected,
                ]}
                onPress={() => setSelectedColor(color)}
              >
                {selectedColor === color && (
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                )}
              </Pressable>
            ))}
          </View>
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
      <View style={styles.categoryItem}>
        <View style={[styles.categoryIcon, { backgroundColor: (item.color || COLORS.primary) + '20' }]}>
          <View style={[styles.categoryDot, { backgroundColor: item.color || COLORS.primary }]} />
        </View>
        <Text style={styles.categoryName}>{item.name}</Text>
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
        <Text style={styles.title}>Categories</Text>
        <Text style={styles.subtitle}>
          Organize your documents with categories
        </Text>
      </View>
      {!isAddingNew && !editingId && (
        <Pressable style={styles.addButton} onPress={handleStartAdd}>
          <Ionicons name="add" size={24} color={COLORS.surface} />
        </Pressable>
      )}
    </View>
  );

  const renderAddForm = () => {
    if (!isAddingNew) return null;

    return (
      <View style={styles.addForm}>
        <Text style={styles.formTitle}>New Category</Text>
        <TextInput
          style={styles.input}
          value={categoryName}
          onChangeText={setCategoryName}
          placeholder="Category name"
          placeholderTextColor={COLORS.textTertiary}
          autoFocus
        />
        <Text style={styles.colorLabel}>Select a color:</Text>
        <View style={styles.colorPicker}>
          {CATEGORY_COLORS.map((color) => (
            <Pressable
              key={color}
              style={[
                styles.colorOption,
                { backgroundColor: color },
                selectedColor === color && styles.colorOptionSelected,
              ]}
              onPress={() => setSelectedColor(color)}
            >
              {selectedColor === color && (
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              )}
            </Pressable>
          ))}
        </View>
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

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="folder-open-outline" size={64} color={COLORS.textTertiary} />
      <Text style={styles.emptyTitle}>No Categories Yet</Text>
      <Text style={styles.emptySubtitle}>
        Create categories to organize your documents
      </Text>
      <Button onPress={handleStartAdd} className="mt-4">
        Create Category
      </Button>
    </View>
  );

  if (isLoading && categories.length === 0) {
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
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {renderHeader()}
            {renderAddForm()}
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
  listContent: {
    paddingBottom: 100,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.small,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  categoryDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  categoryName: {
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
  colorLabel: {
    ...TYPOGRAPHY.subheadline,
    color: COLORS.textSecondary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: COLORS.surface,
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

export default CategoriesScreen;
