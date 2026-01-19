import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Spinner, Chip } from 'heroui-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore, useItemsStore, useRemindersStore, useUIStore } from '../../store';
import { useAppToast } from '../../hooks/useAppToast';
import { HomeStackParamList } from '../../navigation/AppNavigator';
import { Attachment } from '../../utils/types';
import { SCREENS, COLORS, SPACING, TYPOGRAPHY, SHADOWS, BORDER_RADIUS } from '../../utils/constants';
import { formatDateTime, formatRelativeTime, formatFileSize, isOverdue } from '../../utils/format';
import { getFileIcon } from '../../utils/file';

type ItemDetailRouteProp = RouteProp<HomeStackParamList, typeof SCREENS.ITEM_DETAIL>;
type ItemDetailNavigationProp = NativeStackNavigationProp<HomeStackParamList, typeof SCREENS.ITEM_DETAIL>;

const { width } = Dimensions.get('window');

const ItemDetailScreen: React.FC = () => {
  const navigation = useNavigation<ItemDetailNavigationProp>();
  const route = useRoute<ItemDetailRouteProp>();
  const { itemId } = route.params;
  
  const { user } = useAuthStore();
  const { currentItem, isLoading, fetchItemById, deleteItem, clearCurrentItem } = useItemsStore();
  const { showConfirmModal } = useUIStore();
  const { showSuccess, showError } = useAppToast();
  
  useEffect(() => {
    if (user?.id && itemId) {
      fetchItemById(itemId, user.id);
    }
    
    return () => {
      clearCurrentItem();
    };
  }, [itemId, user?.id]);

  const handleEdit = () => {
    navigation.navigate(SCREENS.EDIT_ITEM, { itemId });
  };

  const handleDelete = () => {
    showConfirmModal({
      title: 'Delete Document',
      message: 'Are you sure you want to delete this document? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      isDestructive: true,
      onConfirm: async () => {
        if (user?.id) {
          const success = await deleteItem(itemId, user.id);
          if (success) {
            showSuccess('Document deleted successfully');
            navigation.goBack();
          } else {
            showError('Failed to delete document');
          }
        }
      },
    });
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  if (isLoading && !currentItem) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Spinner size="lg" color="primary" />
        </View>
      </SafeAreaView>
    );
  }

  if (!currentItem) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={COLORS.textTertiary} />
          <Text style={styles.errorTitle}>Document not found</Text>
          <Button onPress={handleGoBack} className="mt-4">
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleGoBack}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </Pressable>
        <View style={styles.headerActions}>
          <Pressable style={styles.headerButton} onPress={handleEdit}>
            <Ionicons name="create-outline" size={24} color={COLORS.primary} />
          </Pressable>
          <Pressable style={styles.headerButton} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={24} color={COLORS.error} />
          </Pressable>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <View style={[
            styles.iconContainer,
            { backgroundColor: (currentItem.category?.color || COLORS.primary) + '20' }
          ]}>
            <Ionicons 
              name={currentItem.is_folder ? 'folder' : 'document-text'} 
              size={40} 
              color={currentItem.category?.color || COLORS.primary} 
            />
          </View>
          <Text style={styles.title}>{currentItem.title}</Text>
          {currentItem.description && (
            <Text style={styles.description}>{currentItem.description}</Text>
          )}
        </View>

        {/* Meta Info */}
        <View style={styles.metaSection}>
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={18} color={COLORS.textSecondary} />
            <Text style={styles.metaText}>
              Created {formatDateTime(currentItem.created_at)}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={18} color={COLORS.textSecondary} />
            <Text style={styles.metaText}>
              Updated {formatRelativeTime(currentItem.updated_at)}
            </Text>
          </View>
        </View>

        {/* Category */}
        {currentItem.category && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category</Text>
            <View style={[
              styles.categoryBadge,
              { backgroundColor: (currentItem.category.color || COLORS.primary) + '20' }
            ]}>
              <View style={[
                styles.categoryDot,
                { backgroundColor: currentItem.category.color || COLORS.primary }
              ]} />
              <Text style={[
                styles.categoryText,
                { color: currentItem.category.color || COLORS.primary }
              ]}>
                {currentItem.category.name}
              </Text>
            </View>
          </View>
        )}

        {/* Tags */}
        {currentItem.tags && currentItem.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagsContainer}>
              {currentItem.tags.map((tag) => (
                <View key={tag.id} style={styles.tag}>
                  <Ionicons name="pricetag" size={14} color={COLORS.primary} />
                  <Text style={styles.tagText}>{tag.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Attachments */}
        {currentItem.attachments && currentItem.attachments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Attachments ({currentItem.attachments.length})
            </Text>
            <View style={styles.attachmentsContainer}>
              {currentItem.attachments.map((attachment) => (
                <AttachmentItem key={attachment.id} attachment={attachment} />
              ))}
            </View>
          </View>
        )}

        {/* Reminders */}
        {currentItem.reminders && currentItem.reminders.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reminders</Text>
            <View style={styles.remindersContainer}>
              {currentItem.reminders.map((reminder) => (
                <View key={reminder.id} style={styles.reminderItem}>
                  <View style={[
                    styles.reminderIcon,
                    isOverdue(reminder.notify_at) && styles.reminderIconOverdue
                  ]}>
                    <Ionicons 
                      name="notifications" 
                      size={18} 
                      color={isOverdue(reminder.notify_at) ? COLORS.error : COLORS.warning} 
                    />
                  </View>
                  <View style={styles.reminderContent}>
                    <Text style={styles.reminderDate}>
                      {formatDateTime(reminder.notify_at)}
                    </Text>
                    {reminder.note && (
                      <Text style={styles.reminderNote}>{reminder.note}</Text>
                    )}
                    {isOverdue(reminder.notify_at) && (
                      <Text style={styles.reminderOverdue}>Overdue</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const AttachmentItem: React.FC<{ attachment: Attachment }> = ({ attachment }) => {
  const iconName = getFileIcon(attachment.file_type);
  
  return (
    <Pressable style={styles.attachmentItem}>
      <View style={styles.attachmentIcon}>
        <Ionicons name={iconName as any} size={24} color={COLORS.primary} />
      </View>
      <View style={styles.attachmentContent}>
        <Text style={styles.attachmentName} numberOfLines={1}>
          {attachment.file_name}
        </Text>
        <Text style={styles.attachmentSize}>
          {formatFileSize(attachment.file_size ?? 0)}
        </Text>
      </View>
      <Ionicons name="download-outline" size={20} color={COLORS.textSecondary} />
    </Pressable>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorTitle: {
    ...TYPOGRAPHY.headline,
    color: COLORS.textSecondary,
    marginTop: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.xl,
    paddingBottom: 40,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    ...SHADOWS.medium,
  },
  title: {
    ...TYPOGRAPHY.title1,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  description: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  metaSection: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    ...SHADOWS.small,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  metaText: {
    ...TYPOGRAPHY.subheadline,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    ...TYPOGRAPHY.headline,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.sm,
  },
  categoryText: {
    ...TYPOGRAPHY.subheadline,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  tagText: {
    ...TYPOGRAPHY.subheadline,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  attachmentsContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  attachmentIcon: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  attachmentContent: {
    flex: 1,
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
  remindersContainer: {
    gap: SPACING.sm,
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.small,
  },
  reminderIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.warning + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  reminderIconOverdue: {
    backgroundColor: COLORS.error + '20',
  },
  reminderContent: {
    flex: 1,
  },
  reminderDate: {
    ...TYPOGRAPHY.subheadline,
    color: COLORS.text,
    fontWeight: '500',
  },
  reminderNote: {
    ...TYPOGRAPHY.footnote,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  reminderOverdue: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.error,
    fontWeight: '600',
    marginTop: 4,
  },
});

export default ItemDetailScreen;
