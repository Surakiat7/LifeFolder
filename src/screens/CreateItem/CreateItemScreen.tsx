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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore, useItemsStore, useCategoriesStore, useTagsStore } from '../../store';
import { useAppToast } from '../../hooks/useAppToast';
import { HomeStackParamList } from '../../navigation/AppNavigator';
import { SCREENS, COLORS, SPACING, TYPOGRAPHY, SHADOWS, BORDER_RADIUS } from '../../utils/constants';
import { Category, Tag, SelectedFile } from '../../utils/types';
import { pickDocument, pickImage } from '../../utils/file';
import { formatFileSize } from '../../utils/format';

type CreateItemNavigationProp = NativeStackNavigationProp<HomeStackParamList, typeof SCREENS.CREATE_ITEM>;

const CreateItemScreen: React.FC = () => {
  const navigation = useNavigation<CreateItemNavigationProp>();
  
  const { user } = useAuthStore();
  const { createItem, isLoading: itemsLoading } = useItemsStore();
  const { categories, fetchCategories, isLoading: categoriesLoading } = useCategoriesStore();
  const { tags, fetchTags, isLoading: tagsLoading } = useTagsStore();
  const { showError, showSuccess } = useAppToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [attachments, setAttachments] = useState<SelectedFile[]>([]);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showTagsPicker, setShowTagsPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchCategories(user.id);
      fetchTags(user.id);
    }
  }, [user?.id]);

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
        setAttachments(prev => [...prev, result]);
      }
    } catch (error) {
      showError('Failed to pick document');
    }
  };

  const handleAddImage = async () => {
    try {
      const result = await pickImage();
      if (result) {
        setAttachments(prev => [...prev, result]);
      }
    } catch (error) {
      showError('Failed to pick image');
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
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
      // Create the item with the store function
      const newItem = await createItem(
        {
          user_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
          category_id: selectedCategory?.id || null,
          is_folder: false,
        },
        user.id,
        selectedTags.map(t => t.id),
        attachments.length > 0 ? attachments : undefined
      );

      if (newItem) {
        showSuccess('Document created successfully');
        navigation.goBack();
      } else {
        showError('Failed to create document');
      }
    } catch (error) {
      console.error('Create item error:', error);
      showError('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = title.trim().length > 0;

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
          <Text style={styles.headerTitle}>New Document</Text>
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
              autoFocus
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

            {attachments.length > 0 && (
              <View style={styles.attachmentsList}>
                {attachments.map((attachment, index) => (
                  <View key={index} style={styles.attachmentItem}>
                    <Ionicons 
                      name={attachment.type.startsWith('image/') ? 'image' : 'document'} 
                      size={24} 
                      color={COLORS.primary} 
                    />
                    <View style={styles.attachmentInfo}>
                      <Text style={styles.attachmentName} numberOfLines={1}>
                        {attachment.name}
                      </Text>
                      <Text style={styles.attachmentSize}>
                        {formatFileSize(attachment.size)}
                      </Text>
                    </View>
                    <Pressable onPress={() => handleRemoveAttachment(index)}>
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
              <ActivityIndicator size="small" color={COLORS.surface} />
              <Text style={styles.loadingButtonText}>Creating...</Text>
            </View>
          ) : (
            <Button
              onPress={handleSubmit}
              isDisabled={!isFormValid}
              className="w-full"
              size="lg"
            >
              Create Document
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
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
  },
  loadingButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.surface,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
});

export default CreateItemScreen;
