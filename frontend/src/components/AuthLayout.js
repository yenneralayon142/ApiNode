import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing, typography } from '../theme';

export const AuthLayout = ({
  title,
  subtitle,
  children,
  footer,
}) => {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>{title}</Text>
          {subtitle ? <Text style={styles.heroSubtitle}>{subtitle}</Text> : null}
        </View>
        <View style={styles.cardWrapper}>
          <ScrollView
            contentContainerStyle={styles.card}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  hero: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: spacing.xl * 2,
    paddingBottom: spacing.xl + spacing.sm,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  heroTitle: {
    fontSize: typography.heading,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  heroSubtitle: {
    fontSize: typography.body,
    color: '#FFFFFF',
    marginTop: spacing.xs,
    opacity: 0.85,
    textAlign: 'center',
  },
  cardWrapper: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    marginTop: -spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 32,
    padding: spacing.xl,
    width: '100%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
  },
  footer: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
});

