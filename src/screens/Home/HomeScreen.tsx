import React, { useEffect, useCallback, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  RefreshControl, 
  Pressable,
  TextInput,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Spinner, Card, Chip } from 'heroui-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore, useItemsStore, useCategoriesStore, useTagsStore } from '../../store';
import { HomeStackParamList } from '../../navigation/AppNavigator';
import { ItemWithRelations } from '../../utils/types';
import { SCREENS, COLORS, SPACING, TYPOGRAPHY, SHADOWS, BORDER_RADIUS } from '../../utils/constants';
import { formatRelativeTime, truncateText } from '../../utils/format';

type HomeScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, typeof SCREENS.HOME>;

const { width } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user } = useAuthStore();
  const { 
    items, 
    recentItems,
    isLoading, 
    isRefreshing, 
    hasMore,
    filters,
    fetchItems, 
    fetchRecentItems,
    setFilters,
    clearFilters,
    loadMore,
  } = useItemsStore();
  const { categories, fetchCategories } = useCategoriesStore();
  const { tags, fetchTags } = useTagsStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchItems(user.id, true);
      fetchRecentItems(user.id);
      fetchCategories(user.id);
      fetchTags(user.id);
    }
  }, [user?.id]);

  const handleRefresh = useCallback(() => {
    if (user?.id) {
      fetchItems(user.id, true);
      fetchRecentItems(user.id);
    }
  }, [user?.id]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoading && user?.id) {
      loadMore(user.id);
    }
  }, [hasMore, isLoading, user?.id]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    setFilters({ search: text || undefined });
    if (user?.id) {
      fetchItems(user.id, true);
    }
  };

  const handleCategoryFilter = (categoryId: string | null) => {
    setFilters({ categoryId: categoryId || undefined });
    if (user?.id) {
      fetchItems(user.id, true);
    }
  };

  const handleCreateItem = () => {
    navigation.navigate(SCREENS.CREATE_ITEM);
  };

  const handleItemPress = (item: ItemWithRelations) => {
    navigation.navigate(SCREENS.ITEM_DETAIL, { itemId: item.id });
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Greeting Section */}
      <View style={styles.greetingSection}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.full_name || 'User'}</Text>
        </View>
        <Pressable 
          style={styles.searchButton}
          onPress={() => setShowSearch(!showSearch)}
        >
          <Ionicons 
            name={showSearch ? 'close' : 'search'} 
            size={24} 
            color={COLORS.text} 
          />
        </Pressable>
      </View>

      {/* Search Bar */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search documents..."
            placeholderTextColor={COLORS.textTertiary}
            value={searchQuery}
            onChangeText={handleSearch}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
            </Pressable>
          )}
        </View>
      )}

      {/* Categories Filter */}
      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ id: null, name: 'All' }, ...categories]}
          keyExtractor={(item) => item.id || 'all'}
          renderItem={({ item }) => (
            <Pressable
              style={[
                styles.categoryChip,
                filters.categoryId === item.id && styles.categoryChipActive,
                !filters.categoryId && !item.id && styles.categoryChipActive,
              ]}
              onPress={() => handleCategoryFilter(item.id)}
            >
              <Text 
                style={[
                  styles.categoryChipText,
                  (filters.categoryId === item.id || (!filters.categoryId && !item.id)) && 
                    styles.categoryChipTextActive,
                ]}
              >
                {item.name}
              </Text>
            </Pressable>
          )}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* Tags Section */}
      <View style={styles.tagsSection}>
        <View style={styles.tagsSectionHeader}>
          <Text style={styles.tagsSectionTitle}>Tags</Text>
          <Pressable 
            style={styles.manageTagsButton}
            onPress={() => navigation.navigate(SCREENS.TAGS)}
          >
            <Ionicons name="settings-outline" size={16} color={COLORS.primary} />
            <Text style={styles.manageTagsText}>Manage</Text>
          </Pressable>
        </View>
        {tags.length > 0 ? (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={tags}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable style={styles.tagChip}>
                <Ionicons name="pricetag" size={12} color={COLORS.primary} />
                <Text style={styles.tagChipText}>{item.name}</Text>
              </Pressable>
            )}
            contentContainerStyle={styles.tagsList}
          />
        ) : (
          <Text style={styles.noTagsText}>No tags yet. Tap Manage to create tags.</Text>
        )}
      </View>

      {/* Recent Section */}
      {recentItems.length > 0 && !searchQuery && !filters.categoryId && (
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={recentItems.slice(0, 5)}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable 
                style={styles.recentCard}
                onPress={() => handleItemPress(item)}
              >
                <View style={styles.recentIconContainer}>
                  <Ionicons 
                    name={item.is_folder ? 'folder' : 'document-text'} 
                    size={24} 
                    color={item.category?.color || COLORS.primary} 
                  />
                </View>
                <Text style={styles.recentTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.recentTime}>
                  {formatRelativeTime(item.updated_at)}
                </Text>
              </Pressable>
            )}
            contentContainerStyle={styles.recentList}
          />
        </View>
      )}

      {/* All Documents Header */}
      <View style={styles.allDocsHeader}>
        <Text style={styles.sectionTitle}>All Documents</Text>
        <Text style={styles.itemCount}>{items.length} items</Text>
      </View>
    </View>
  );

  const renderItem = ({ item }: { item: ItemWithRelations }) => (
    <Pressable 
      style={styles.itemCard}
      onPress={() => handleItemPress(item)}
    >
      <View style={styles.itemIconContainer}>
        <Ionicons 
          name={item.is_folder ? 'folder' : 'document-text'} 
          size={28} 
          color={item.category?.color || COLORS.primary} 
        />
      </View>
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle} numberOfLines={1}>
          {item.title}
        </Text>
        {item.description && (
          <Text style={styles.itemDescription} numberOfLines={2}>
            {truncateText(item.description, 80)}
          </Text>
        )}
        <View style={styles.itemMeta}>
          {item.category && (
            <View style={[styles.itemCategory, { backgroundColor: (item.category.color || COLORS.primary) + '20' }]}>
              <Text style={[styles.itemCategoryText, { color: item.category.color || COLORS.primary }]}>
                {item.category.name}
              </Text>
            </View>
          )}
          {item.attachments && item.attachments.length > 0 && (
            <View style={styles.itemAttachments}>
              <Ionicons name="attach" size={14} color={COLORS.textSecondary} />
              <Text style={styles.itemAttachmentsText}>{item.attachments.length}</Text>
            </View>
          )}
          {item.reminders && item.reminders.length > 0 && (
            <View style={styles.itemReminder}>
              <Ionicons name="notifications" size={14} color={COLORS.warning} />
            </View>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
    </Pressable>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="folder-open-outline" size={64} color={COLORS.textTertiary} />
      </View>
      <Text style={styles.emptyTitle}>No documents yet</Text>
      <Text style={styles.emptyDescription}>
        Start organizing your life by adding your first document
      </Text>
      <Button 
        size="lg"
        onPress={handleCreateItem}
        className="mt-6"
      >
        Add Document
      </Button>
    </View>
  );

  const renderFooter = () => {
    if (!isLoading || items.length === 0) return null;
    return (
      <View style={styles.footerLoader}>
        <Spinner size="sm" color="primary" />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!isLoading ? renderEmpty : null}
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      <Pressable style={styles.fab} onPress={handleCreateItem}>
        <Ionicons name="add" size={28} color={COLORS.textInverse} />
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  headerContainer: {
    paddingTop: SPACING.lg,
  },
  greetingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  greeting: {
    ...TYPOGRAPHY.subheadline,
    color: COLORS.textSecondary,
  },
  userName: {
    ...TYPOGRAPHY.title2,
    color: COLORS.text,
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    height: 48,
    ...SHADOWS.small,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    ...TYPOGRAPHY.body,
    color: COLORS.text,
  },
  categoriesContainer: {
    marginBottom: SPACING.lg,
  },
  categoriesList: {
    paddingHorizontal: SPACING.xl,
  },
  categoryChip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
    marginRight: SPACING.sm,
    ...SHADOWS.small,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
  },
  categoryChipText: {
    ...TYPOGRAPHY.subheadline,
    color: COLORS.text,
  },
  categoryChipTextActive: {
    color: COLORS.textInverse,
    fontWeight: '600',
  },
  tagsSection: {
    marginBottom: SPACING.lg,
  },
  tagsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.sm,
  },
  tagsSectionTitle: {
    ...TYPOGRAPHY.subheadline,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  manageTagsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  manageTagsText: {
    ...TYPOGRAPHY.footnote,
    color: COLORS.primary,
    fontWeight: '600',
  },
  tagsList: {
    paddingHorizontal: SPACING.xl,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primaryLight + '20',
    marginRight: SPACING.sm,
  },
  tagChipText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.primary,
    fontWeight: '500',
  },
  noTagsText: {
    ...TYPOGRAPHY.footnote,
    color: COLORS.textTertiary,
    paddingHorizontal: SPACING.xl,
    fontStyle: 'italic',
  },
  recentSection: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    ...TYPOGRAPHY.headline,
    color: COLORS.text,
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.md,
  },
  recentList: {
    paddingHorizontal: SPACING.xl,
  },
  recentCard: {
    width: 140,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginRight: SPACING.md,
    ...SHADOWS.small,
  },
  recentIconContainer: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  recentTitle: {
    ...TYPOGRAPHY.subheadline,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  recentTime: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.textTertiary,
  },
  allDocsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.md,
  },
  itemCount: {
    ...TYPOGRAPHY.footnote,
    color: COLORS.textSecondary,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.small,
  },
  itemIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primaryLight + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    ...TYPOGRAPHY.headline,
    color: COLORS.text,
    marginBottom: 4,
  },
  itemDescription: {
    ...TYPOGRAPHY.footnote,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemCategory: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.xs,
    marginRight: SPACING.sm,
  },
  itemCategoryText: {
    ...TYPOGRAPHY.caption2,
    fontWeight: '600',
  },
  itemAttachments: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  itemAttachmentsText: {
    ...TYPOGRAPHY.caption2,
    color: COLORS.textSecondary,
    marginLeft: 2,
  },
  itemReminder: {
    marginRight: SPACING.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xxxl,
    paddingTop: 60,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  emptyTitle: {
    ...TYPOGRAPHY.title3,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  emptyDescription: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  footerLoader: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: SPACING.xl,
    bottom: SPACING.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.large,
  },
});

export default HomeScreen;
