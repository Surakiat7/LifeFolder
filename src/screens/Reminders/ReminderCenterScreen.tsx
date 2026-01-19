import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Pressable,
  SectionList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Spinner } from 'heroui-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore, useRemindersStore, useUIStore } from '../../store';
import { useAppToast } from '../../hooks/useAppToast';
import { RemindersStackParamList } from '../../navigation/AppNavigator';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, BORDER_RADIUS } from '../../utils/constants';
import { Reminder, ReminderWithItem } from '../../utils/types';
import { formatDateTime, formatRelativeTime, isOverdue, isToday, isTomorrow, isThisWeek } from '../../utils/format';

type RemindersNavigationProp = NativeStackNavigationProp<RemindersStackParamList>;

interface ReminderSection {
  title: string;
  data: ReminderWithItem[];
}

const ReminderCenterScreen: React.FC = () => {
  const navigation = useNavigation<RemindersNavigationProp>();
  
  const { user } = useAuthStore();
  const { 
    reminders, 
    isLoading, 
    fetchReminders, 
    deleteReminder,
    markAsSent,
  } = useRemindersStore();
  const { showConfirmModal } = useUIStore();
  const { showSuccess, showError } = useAppToast();

  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'overdue'>('all');

  useEffect(() => {
    if (user?.id) {
      fetchReminders(user.id);
    }
  }, [user?.id]);

  const handleRefresh = async () => {
    if (!user?.id) return;
    setRefreshing(true);
    await fetchReminders(user.id);
    setRefreshing(false);
  };

  const handleMarkComplete = async (reminder: ReminderWithItem) => {
    if (!user?.id) return;
    await markAsSent(reminder.id, user.id);
    showSuccess('Reminder marked as complete');
  };

  const handleDelete = (reminder: ReminderWithItem) => {
    showConfirmModal({
      title: 'Delete Reminder',
      message: 'Are you sure you want to delete this reminder?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      isDestructive: true,
      onConfirm: async () => {
        if (user?.id) {
          const success = await deleteReminder(reminder.id, user.id);
          if (success) {
            showSuccess('Reminder deleted');
          } else {
            showError('Failed to delete reminder');
          }
        }
      },
    });
  };

  // Filter reminders
  const filteredReminders = reminders.filter(reminder => {
    if (filter === 'upcoming') {
      return !isOverdue(reminder.notify_at) && !reminder.is_sent;
    }
    if (filter === 'overdue') {
      return isOverdue(reminder.notify_at) && !reminder.is_sent;
    }
    return !reminder.is_sent;
  });

  // Group reminders by date sections
  const getSections = (): ReminderSection[] => {
    const overdueItems: ReminderWithItem[] = [];
    const todayItems: ReminderWithItem[] = [];
    const tomorrowItems: ReminderWithItem[] = [];
    const thisWeekItems: ReminderWithItem[] = [];
    const laterItems: ReminderWithItem[] = [];

    filteredReminders.forEach(reminder => {
      if (isOverdue(reminder.notify_at)) {
        overdueItems.push(reminder);
      } else if (isToday(reminder.notify_at)) {
        todayItems.push(reminder);
      } else if (isTomorrow(reminder.notify_at)) {
        tomorrowItems.push(reminder);
      } else if (isThisWeek(reminder.notify_at)) {
        thisWeekItems.push(reminder);
      } else {
        laterItems.push(reminder);
      }
    });

    const sections: ReminderSection[] = [];

    if (overdueItems.length > 0) {
      sections.push({ title: '⚠️ Overdue', data: overdueItems });
    }
    if (todayItems.length > 0) {
      sections.push({ title: 'Today', data: todayItems });
    }
    if (tomorrowItems.length > 0) {
      sections.push({ title: 'Tomorrow', data: tomorrowItems });
    }
    if (thisWeekItems.length > 0) {
      sections.push({ title: 'This Week', data: thisWeekItems });
    }
    if (laterItems.length > 0) {
      sections.push({ title: 'Later', data: laterItems });
    }

    return sections;
  };

  const overdueCount = reminders.filter(r => isOverdue(r.notify_at) && !r.is_sent).length;
  const upcomingCount = reminders.filter(r => !isOverdue(r.notify_at) && !r.is_sent).length;

  const renderFilterButton = (
    label: string, 
    value: 'all' | 'upcoming' | 'overdue',
    count?: number
  ) => (
    <Pressable
      style={[
        styles.filterButton,
        filter === value && styles.filterButtonActive,
      ]}
      onPress={() => setFilter(value)}
    >
      <Text style={[
        styles.filterButtonText,
        filter === value && styles.filterButtonTextActive,
      ]}>
        {label}
      </Text>
      {count !== undefined && count > 0 && (
        <View style={[
          styles.filterBadge,
          filter === value && styles.filterBadgeActive,
          value === 'overdue' && styles.filterBadgeOverdue,
        ]}>
          <Text style={[
            styles.filterBadgeText,
            filter === value && styles.filterBadgeTextActive,
          ]}>
            {count}
          </Text>
        </View>
      )}
    </Pressable>
  );

  const renderReminderItem = ({ item }: { item: ReminderWithItem }) => {
    const isReminderOverdue = isOverdue(item.notify_at);
    
    return (
      <View style={[
        styles.reminderItem,
        isReminderOverdue && styles.reminderItemOverdue,
      ]}>
        <View style={styles.reminderContent}>
          <View style={[
            styles.reminderIcon,
            isReminderOverdue && styles.reminderIconOverdue,
          ]}>
            <Ionicons 
              name="notifications" 
              size={20} 
              color={isReminderOverdue ? COLORS.error : COLORS.warning} 
            />
          </View>
          <View style={styles.reminderDetails}>
            <Text style={styles.reminderTitle}>
              {item.item?.title || 'Document'}
            </Text>
            <Text style={[
              styles.reminderTime,
              isReminderOverdue && styles.reminderTimeOverdue,
            ]}>
              {formatDateTime(item.notify_at)}
            </Text>
            {item.note && (
              <Text style={styles.reminderNote}>{item.note}</Text>
            )}
          </View>
        </View>
        <View style={styles.reminderActions}>
          <Pressable 
            style={[styles.actionButton, styles.completeButton]}
            onPress={() => handleMarkComplete(item)}
          >
            <Ionicons name="checkmark" size={18} color={COLORS.success} />
          </Pressable>
          <Pressable 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDelete(item)}
          >
            <Ionicons name="trash-outline" size={18} color={COLORS.error} />
          </Pressable>
        </View>
      </View>
    );
  };

  const renderSectionHeader = ({ section }: { section: ReminderSection }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <Text style={styles.sectionCount}>{section.data.length}</Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.title}>Reminders</Text>
        <Text style={styles.subtitle}>
          Stay on top of important dates
        </Text>
      </View>
      {/* Summary Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{upcomingCount}</Text>
          <Text style={styles.statLabel}>Upcoming</Text>
        </View>
        <View style={[styles.statItem, styles.statItemOverdue]}>
          <Text style={[styles.statNumber, styles.statNumberOverdue]}>
            {overdueCount}
          </Text>
          <Text style={styles.statLabel}>Overdue</Text>
        </View>
      </View>
      {/* Filters */}
      <View style={styles.filtersContainer}>
        {renderFilterButton('All', 'all')}
        {renderFilterButton('Upcoming', 'upcoming', upcomingCount)}
        {renderFilterButton('Overdue', 'overdue', overdueCount)}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="notifications-off-outline" size={64} color={COLORS.textTertiary} />
      <Text style={styles.emptyTitle}>
        {filter === 'overdue' 
          ? 'No Overdue Reminders' 
          : filter === 'upcoming' 
            ? 'No Upcoming Reminders'
            : 'No Reminders'
        }
      </Text>
      <Text style={styles.emptySubtitle}>
        {filter === 'overdue'
          ? "You're all caught up!"
          : 'Set reminders on your documents to never miss important dates'
        }
      </Text>
    </View>
  );

  if (isLoading && reminders.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Spinner size="lg" color="primary" />
        </View>
      </SafeAreaView>
    );
  }

  const sections = getSections();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <SectionList
        sections={sections}
        renderItem={renderReminderItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
          />
        }
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
    padding: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  headerContent: {
    marginBottom: SPACING.lg,
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
  statsContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  statItem: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  statItemOverdue: {
    backgroundColor: COLORS.error + '10',
  },
  statNumber: {
    ...TYPOGRAPHY.title1,
    color: COLORS.primary,
  },
  statNumberOverdue: {
    color: COLORS.error,
  },
  statLabel: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
  },
  filterButtonText: {
    ...TYPOGRAPHY.subheadline,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: COLORS.surface,
  },
  filterBadge: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
    marginLeft: SPACING.xs,
  },
  filterBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  filterBadgeOverdue: {
    backgroundColor: COLORS.error + '20',
  },
  filterBadgeText: {
    ...TYPOGRAPHY.caption2,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  filterBadgeTextActive: {
    color: COLORS.surface,
  },
  listContent: {
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.headline,
    color: COLORS.text,
  },
  sectionCount: {
    ...TYPOGRAPHY.subheadline,
    color: COLORS.textTertiary,
  },
  reminderItem: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.small,
  },
  reminderItemOverdue: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.error,
  },
  reminderContent: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  reminderIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.warning + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  reminderIconOverdue: {
    backgroundColor: COLORS.error + '20',
  },
  reminderDetails: {
    flex: 1,
  },
  reminderTitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '600',
  },
  reminderTime: {
    ...TYPOGRAPHY.subheadline,
    color: COLORS.warning,
    marginTop: 2,
  },
  reminderTimeOverdue: {
    color: COLORS.error,
  },
  reminderNote: {
    ...TYPOGRAPHY.footnote,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  reminderActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeButton: {
    backgroundColor: COLORS.success + '20',
  },
  deleteButton: {
    backgroundColor: COLORS.error + '10',
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
    maxWidth: 280,
  },
});

export default ReminderCenterScreen;
