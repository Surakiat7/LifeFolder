import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SCREENS, TABS, COLORS } from '../utils/constants';

// Screens
import {
  HomeScreen,
  ItemDetailScreen,
  CreateItemScreen,
  EditItemScreen,
  CategoriesScreen,
  TagsScreen,
  ReminderCenterScreen,
  ProfileScreen,
  SettingsScreen,
  SecuritySettingsScreen,
} from '../screens';

// Type definitions
export type HomeStackParamList = {
  [SCREENS.HOME]: undefined;
  [SCREENS.ITEM_DETAIL]: { itemId: string };
  [SCREENS.CREATE_ITEM]: { categoryId?: string } | undefined;
  [SCREENS.EDIT_ITEM]: { itemId: string };
  [SCREENS.TAGS]: undefined;
};

export type CategoriesStackParamList = {
  [SCREENS.CATEGORIES]: undefined;
};

export type RemindersStackParamList = {
  [SCREENS.REMINDER_CENTER]: undefined;
};

export type ProfileStackParamList = {
  [SCREENS.PROFILE]: undefined;
  [SCREENS.SETTINGS]: undefined;
  [SCREENS.SECURITY_SETTINGS]: undefined;
};

// Alias for Settings screens to use
export type SettingsStackParamList = ProfileStackParamList;

export type TabParamList = {
  [TABS.HOME]: undefined;
  [TABS.CATEGORIES]: undefined;
  [TABS.REMINDERS]: undefined;
  [TABS.PROFILE]: undefined;
};

// Stack Navigators
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const CategoriesStack = createNativeStackNavigator<CategoriesStackParamList>();
const RemindersStack = createNativeStackNavigator<RemindersStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Home Stack Navigator
const HomeStackNavigator: React.FC = () => {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <HomeStack.Screen name={SCREENS.HOME} component={HomeScreen} />
      <HomeStack.Screen name={SCREENS.ITEM_DETAIL} component={ItemDetailScreen} />
      <HomeStack.Screen 
        name={SCREENS.CREATE_ITEM} 
        component={CreateItemScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <HomeStack.Screen 
        name={SCREENS.EDIT_ITEM} 
        component={EditItemScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <HomeStack.Screen name={SCREENS.TAGS} component={TagsScreen} />
    </HomeStack.Navigator>
  );
};

// Categories Stack Navigator
const CategoriesStackNavigator: React.FC = () => {
  return (
    <CategoriesStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <CategoriesStack.Screen name={SCREENS.CATEGORIES} component={CategoriesScreen} />
    </CategoriesStack.Navigator>
  );
};

// Reminders Stack Navigator
const RemindersStackNavigator: React.FC = () => {
  return (
    <RemindersStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <RemindersStack.Screen name={SCREENS.REMINDER_CENTER} component={ReminderCenterScreen} />
    </RemindersStack.Navigator>
  );
};

// Profile Stack Navigator
const ProfileStackNavigator: React.FC = () => {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <ProfileStack.Screen name={SCREENS.PROFILE} component={ProfileScreen} />
      <ProfileStack.Screen name={SCREENS.SETTINGS} component={SettingsScreen} />
      <ProfileStack.Screen name={SCREENS.SECURITY_SETTINGS} component={SecuritySettingsScreen} />
    </ProfileStack.Navigator>
  );
};

// Main App Navigator with Bottom Tabs
const AppNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textTertiary,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 8,
          height: 88,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case TABS.HOME:
              iconName = focused ? 'home' : 'home-outline';
              break;
            case TABS.CATEGORIES:
              iconName = focused ? 'folder' : 'folder-outline';
              break;
            case TABS.REMINDERS:
              iconName = focused ? 'notifications' : 'notifications-outline';
              break;
            case TABS.PROFILE:
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'home-outline';
          }

          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name={TABS.HOME} 
        component={HomeStackNavigator}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name={TABS.CATEGORIES} 
        component={CategoriesStackNavigator}
        options={{ tabBarLabel: 'Categories' }}
      />
      <Tab.Screen 
        name={TABS.REMINDERS} 
        component={RemindersStackNavigator}
        options={{ tabBarLabel: 'Reminders' }}
      />
      <Tab.Screen 
        name={TABS.PROFILE} 
        component={ProfileStackNavigator}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export default AppNavigator;
