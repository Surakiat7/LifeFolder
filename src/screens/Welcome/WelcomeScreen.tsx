import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from 'heroui-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { SCREENS, COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../../utils/constants';

type WelcomeScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, typeof SCREENS.WELCOME>;

const { width, height } = Dimensions.get('window');

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();

  const handleGetStarted = () => {
    navigation.navigate(SCREENS.LOGIN);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.iconContainer}>
            <Ionicons name="folder-open" size={80} color={COLORS.primary} />
          </View>
          
          <Text style={styles.title}>LifeFolder</Text>
          <Text style={styles.subtitle}>
            Your personal document manager
          </Text>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <FeatureItem 
            icon="shield-checkmark-outline" 
            title="Secure Storage"
            description="Keep your documents safe with Google authentication"
          />
          <FeatureItem 
            icon="folder-outline" 
            title="Organized"
            description="Categories and tags to keep everything in order"
          />
          <FeatureItem 
            icon="notifications-outline" 
            title="Reminders"
            description="Never miss important document deadlines"
          />
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <Button
            size="lg"
            onPress={handleGetStarted}
            className="w-full"
          >
            Get Started
          </Button>
          
          <Text style={styles.termsText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

interface FeatureItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ icon, title, description }) => (
  <View style={styles.featureItem}>
    <View style={styles.featureIconContainer}>
      <Ionicons name={icon} size={24} color={COLORS.primary} />
    </View>
    <View style={styles.featureTextContainer}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    justifyContent: 'space-between',
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: height * 0.08,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    ...SHADOWS.medium,
  },
  title: {
    ...TYPOGRAPHY.largeTitle,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  featuresSection: {
    paddingVertical: SPACING.xxxl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: 16,
    ...SHADOWS.small,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    ...TYPOGRAPHY.headline,
    color: COLORS.text,
    marginBottom: 4,
  },
  featureDescription: {
    ...TYPOGRAPHY.subheadline,
    color: COLORS.textSecondary,
  },
  ctaSection: {
    paddingBottom: SPACING.xxxl,
  },
  termsText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.textTertiary,
    textAlign: 'center',
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.xl,
  },
});

export default WelcomeScreen;
