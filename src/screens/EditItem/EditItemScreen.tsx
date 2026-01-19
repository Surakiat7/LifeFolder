import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Spinner } from 'heroui-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore, useItemsStore, useCategoriesStore, useTagsStore } from '../../store';
import { useAppToast } from '../../hooks/useAppToast';
import { HomeStackParamList } from '../../navigation/AppNavigator';
import { SCREENS, COLORS, SPACING, TYPOGRAPHY, SHADOWS, BORDER_RADIUS, STORAGE_BUCKET } from '../../utils/constants';
import { Category, Tag, Attachment, SelectedFile } from '../../utils/types';
import { pickDocument, pickImage } from '../../utils/file';
import { formatFileSize } from '../../utils/format';
import { uploadFile } from '../../api/storage.api';
import { createAttachment, deleteAttachment } from '../../api/attachments.api';

type EditItemRouteProp = RouteProp<HomeStackParamList, typeof SCREENS.EDIT_ITEM>;
type EditItemNavigationProp = NativeStackNavigationProp<HomeStackParamList, typeof SCREENS.EDIT_ITEM>;

const EditItemScreen: React.FC = () => {
  const navigation = useNavigation<EditItemNavigationProp>();
  const route = useRoute<EditItemRouteProp>();
  const { itemId } = route.params;
  
  const { user } = useAuthStore();
  const { currentItem, isLoading: itemsLoading, fetchItemById, updateItem, clearCurrentItem } = useItemsStore();
  const { categories, fetchCategories, isLoading: categoriesLoading } = useCategoriesStore();
  const { tags, fetchTags, isLoading: tagsLoading } = useTagsStore();
  const { showError, showSuccess } = useAppToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<Attachment[]>([]);
  const [newAttachments, setNewAttachments] = useState<SelectedFile[]>([]);
  const [deletedAttachmentIds, setDeletedAttachmentIds] = useState<string[]>([]);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showTagsPicker, setShowTagsPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchCategories(user.id);
      fetchTags(user.id);
      fetchItemById(itemId, user.id);
    }
    
    return () => {
      clearCurrentItem();
    };
  }, [user?.id, itemId]);

  // Initialize form with current item data
  useEffect(() => {
    if (currentItem && !isInitialized) {
      setTitle(currentItem.title);
      setDescription(currentItem.description || '');
      setSelectedCategory(currentItem.category || null);
      setSelectedTags(currentItem.tags || []);
      setExistingAttachments(currentItem.attachments || []);
      setIsInitialized(true);
    }
  }, [currentItem, isInitialized]);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleSelectCategory = (category: Category) => {
    setSelectedCategory(category);
    setShowCategoryPicker(false);
  };

  const handleToggleTag = (tag: Tag) => {
    setSelectedTags(prev => {
      const exists = prev.find(t => t.id === tag.id);
      if (exists) {
        return prev.filter(t => t.id !== tag.id);
      }
      return [...prev, tag];
    });
  };

  const handleAddDocument = async () => {
    try {
      const result = await pickDocument();
      if (result) {
        setNewAttachments(prev => [...prev, result]);
      }
    } catch (error) {
      showError('Failed to pick document');
    }
  };

  const handleAddImage = async () => {
    try {
      const result = await pickImage();
      if (result) {
        setNewAttachments(prev => [...prev, result]);
      }
    } catch (error) {
      showError('Failed to pick image');
    }
  };

  const handleRemoveExistingAttachment = (attachmentId: string) => {
    setDeletedAttachmentIds(prev => [...prev, attachmentId]);
    setExistingAttachments(prev => prev.filter(a => a.id !== attachmentId));
  };

  const handleRemoveNewAttachment = (index: number) => {
    setNewAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      showError('Please enter a title');
      return;
    }

    if (!user?.id) {
      showError('Please sign in to continue');
      return;
    }

    setIsSubmitting(true);

    try {
      // Delete removed attachments
      for (const attachmentId of deletedAttachmentIds) {
        await deleteAttachment(attachmentId, user.id);
      }

      // Upload new attachments
      for (const attachment of newAttachments) {
        try {
          const result = await uploadFile(user.id, attachment, itemId);

          if (result) {
            await createAttachment({
              item_id: itemId,
              user_id: user.id,
              bucket: STORAGE_BUCKET,
              path: result.path,
              file_url: result.url,
              file_type: attachment.mimeType,
              file_name: attachment.name,
              file_size: attachment.size,
            });
          }
        } catch (uploadError) {
          console.error('Failed to upload attachment:', uploadError);
        }
      }

      // Update the item
      const success = await updateItem(
        itemId,
        user.id,
        {
          title: title.trim(),
          description: description.trim() || null,
          category_id: selectedCategory?.id || null,
        },
        selectedTags.map(t => t.id)
      );

      if (success) {
        showSuccess('Document updated successfully');
        navigation.goBack();
      } else {
        showError('Failed to update document');
      }
    } catch (error) {
      console.error('Update item error:', error);
      showError('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = title.trim().length > 0;

  if (itemsLoading && !currentItem) {
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
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.closeButton} onPress={handleGoBack}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Edit Document</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter document title"
              placeholderTextColor={COLORS.textTertiary}
              autoCapitalize="sentences"
            />
          </View>

          {/* Description Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Add a description (optional)"
              placeholderTextColor={COLORS.textTertiary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Category Selector */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <Pressable 
              style={styles.selector}
              onPress={() => setShowCategoryPicker(!showCategoryPicker)}
            >
              {selectedCategory ? (
                <View style={styles.selectedCategory}>
                  <View style={[
                    styles.categoryDot,
                    { backgroundColor: selectedCategory.color || COLORS.primary }
                  ]} />
                  <Text style={styles.selectorText}>{selectedCategory.name}</Text>
                </View>
              ) : (
                <Text style={styles.selectorPlaceholder}>Select a category</Text>
              )}
              <Ionicons 
                name={showCategoryPicker ? "chevron-up" : "chevron-down"} 
                size={20} 
                color={COLORS.textSecondary} 
              />
            </Pressable>

            {showCategoryPicker && (
              <View style={styles.pickerContainer}>
                {/* Clear category option */}
                <Pressable
                  style={styles.pickerItem}
                  onPress={() => {
                    setSelectedCategory(null);
                    setShowCategoryPicker(false);
                  }}
                >
                  <Ionicons name="close-circle-outline" size={20} color={COLORS.textSecondary} />
                  <Text style={styles.pickerItemText}>No category</Text>
                </Pressable>
                {categoriesLoading ? (
                  <View style={styles.pickerLoading}>
                    <Spinner size="sm" color="primary" />
                  </View>
                ) : categories.length === 0 ? (
                  <Text style={styles.emptyPicker}>No categories yet</Text>
                ) : (
                  categories.map((category) => (
                    <Pressable
                      key={category.id}
                      style={[
                        styles.pickerItem,
                        selectedCategory?.id === category.id && styles.pickerItemSelected
                      ]}
                      onPress={() => handleSelectCategory(category)}
                    >
                      <View style={[
                        styles.categoryDot,
                        { backgroundColor: category.color || COLORS.primary }
                      ]} />
                      <Text style={styles.pickerItemText}>{category.name}</Text>
                      {selectedCategory?.id === category.id && (
                        <Ionicons name="checkmark" size={18} color={COLORS.primary} />
                      )}
                    </Pressable>
                  ))
                )}
              </View>
            )}
          </View>

          {/* Tags Selector */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tags</Text>
            <Pressable 
              style={styles.selector}
              onPress={() => setShowTagsPicker(!showTagsPicker)}
            >
              {selectedTags.length > 0 ? (
                <Text style={styles.selectorText}>
                  {selectedTags.length} tag{selectedTags.length > 1 ? 's' : ''} selected
                </Text>
              ) : (
                <Text style={styles.selectorPlaceholder}>Select tags</Text>
              )}
              <Ionicons 
                name={showTagsPicker ? "chevron-up" : "chevron-down"} 
                size={20} 
                color={COLORS.textSecondary} 
              />
            </Pressable>

            {selectedTags.length > 0 && !showTagsPicker && (
              <View style={styles.selectedTagsContainer}>
                {selectedTags.map(tag => (
                  <Pressable
                    key={tag.id}
                    style={styles.selectedTag}
                    onPress={() => handleToggleTag(tag)}
                  >
                    <Text style={styles.selectedTagText}>{tag.name}</Text>
                    <Ionicons name="close-circle" size={16} color={COLORS.primary} />
                  </Pressable>
                ))}
              </View>
            )}

            {showTagsPicker && (
              <View style={styles.pickerContainer}>
                {tagsLoading ? (
                  <View style={styles.pickerLoading}>
                    <Spinner size="sm" color="primary" />
                  </View>
                ) : tags.length === 0 ? (
                  <Text style={styles.emptyPicker}>No tags yet</Text>
                ) : (
                  tags.map((tag) => (
                    <Pressable
                      key={tag.id}
                      style={[
                        styles.pickerItem,
                        selectedTags.find(t => t.id === tag.id) && styles.pickerItemSelected
                      ]}
                      onPress={() => handleToggleTag(tag)}
                    >
                      <Ionicons 
                        name={selectedTags.find(t => t.id === tag.id) ? "checkbox" : "square-outline"} 
                        size={20} 
                        color={selectedTags.find(t => t.id === tag.id) ? COLORS.primary : COLORS.textSecondary} 
                      />
                      <Text style={styles.pickerItemText}>{tag.name}</Text>
                    </Pressable>
                  ))
                )}
              </View>
            )}
          </View>

          {/* Attachments */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Attachments</Text>
            <View style={styles.attachmentButtons}>
              <Pressable style={styles.attachmentButton} onPress={handleAddDocument}>
                <Ionicons name="document-attach" size={24} color={COLORS.primary} />
                <Text style={styles.attachmentButtonText}>Document</Text>
              </Pressable>
              <Pressable style={styles.attachmentButton} onPress={handleAddImage}>
                <Ionicons name="image" size={24} color={COLORS.primary} />
                <Text style={styles.attachmentButtonText}>Image</Text>
              </Pressable>
            </View>

            {/* Existing Attachments */}
            {existingAttachments.length > 0 && (
              <View style={styles.attachmentsList}>
                <Text style={styles.attachmentsLabel}>Current attachments:</Text>
                {existingAttachments.map((attachment) => (
                  <View key={attachment.id} style={styles.attachmentItem}>
                    <Ionicons 
                      name={attachment.file_type.startsWith('image/') ? 'image' : 'document'} 
                      size={24} 
                      color={COLORS.primary} 
                    />
                    <View style={styles.attachmentInfo}>
                      <Text style={styles.attachmentName} numberOfLines={1}>
                        {attachment.file_name}
                      </Text>
                      <Text style={styles.attachmentSize}>
                        {formatFileSize(attachment.file_size ?? 0)}
                      </Text>
                    </View>
                    <Pressable onPress={() => handleRemoveExistingAttachment(attachment.id)}>
                      <Ionicons name="close-circle" size={24} color={COLORS.error} />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}

            {/* New Attachments */}
            {newAttachments.length > 0 && (
              <View style={styles.attachmentsList}>
                <Text style={styles.attachmentsLabel}>New attachments:</Text>
                {newAttachments.map((attachment, index) => (
                  <View key={index} style={styles.attachmentItem}>
                    <Ionicons 
                      name={attachment.mimeType.startsWith('image/') ? 'image' : 'document'} 
                      size={24} 
                      color={COLORS.success} 
                    />
                    <View style={styles.attachmentInfo}>
                      <Text style={styles.attachmentName} numberOfLines={1}>
                        {attachment.name}
                      </Text>
                      <Text style={styles.attachmentSize}>
                        {formatFileSize(attachment.size)}
                      </Text>
                    </View>
                    <Pressable onPress={() => handleRemoveNewAttachment(index)}>
                      <Ionicons name="close-circle" size={24} color={COLORS.error} />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.footer}>
          {isSubmitting ? (
            <View style={styles.loadingButton}>
              <ActivityIndicator size="small" color={COLORS.white} />
              <Text style={styles.loadingButtonText}>Saving...</Text>
            </View>
          ) : (
            <Button
              onPress={handleSubmit}
              isDisabled={!isFormValid}
              className="w-full"
              size="lg"
            >
              Save Changes
            </Button>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.headline,
    color: COLORS.text,
  },
  headerSpacer: {
    width: 44,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.xl,
  },
  inputGroup: {
    marginBottom: SPACING.xl,
  },
  label: {
    ...TYPOGRAPHY.subheadline,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    minHeight: 100,
    paddingTop: SPACING.lg,
  },
  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectorText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
  },
  selectorPlaceholder: {
    ...TYPOGRAPHY.body,
    color: COLORS.textTertiary,
  },
  selectedCategory: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: SPACING.sm,
  },
  pickerContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  pickerLoading: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  emptyPicker: {
    ...TYPOGRAPHY.body,
    color: COLORS.textTertiary,
    padding: SPACING.lg,
    textAlign: 'center',
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  pickerItemSelected: {
    backgroundColor: COLORS.primaryLight + '10',
  },
  pickerItemText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  selectedTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  selectedTagText: {
    ...TYPOGRAPHY.subheadline,
    color: COLORS.primary,
    marginRight: SPACING.xs,
  },
  attachmentButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  attachmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  attachmentButtonText: {
    ...TYPOGRAPHY.subheadline,
    color: COLORS.primary,
    marginLeft: SPACING.sm,
  },
  attachmentsList: {
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  attachmentsLabel: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.small,
  },
  attachmentInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  attachmentName: {
    ...TYPOGRAPHY.subheadline,
    color: COLORS.text,
    fontWeight: '500',
  },
  attachmentSize: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  footer: {
    padding: SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  loadingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  loadingButtonText: {
    ...TYPOGRAPHY.headline,
    color: COLORS.white,
  },
});

export default EditItemScreen;
