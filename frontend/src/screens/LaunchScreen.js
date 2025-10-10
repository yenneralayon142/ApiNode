import React from 'react';
import { SafeAreaView, View, Text, StyleSheet } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, spacing, radii, typography } from '../theme';

export const LaunchScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.logoWrapper}>
          <View style={styles.logoBase}>
            <View style={[styles.bar, styles.barShort]} />
            <View style={[styles.bar, styles.barMedium]} />
            <View style={[styles.bar, styles.barTall]} />
            <View style={styles.arrow} />
          </View>
        </View>
        <Text style={styles.title}>YenAnd Gestion</Text>
        <Text style={styles.subtitle}>
          Gestiona tu dinero y cumple tus metas con claridad y control.
        </Text>
        <View style={styles.actions}>
          <PrimaryButton
            title="Ingreso"
            onPress={() => navigation.navigate('Login')}
            style={styles.control}
          />
          <PrimaryButton
            title="Registrarse"
            variant="secondary"
            onPress={() => navigation.navigate('Register')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.surface,
    margin: spacing.xl,
    borderRadius: radii.lg,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 12,
  },
  logoWrapper: {
    marginBottom: spacing.lg,
  },
  logoBase: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 6,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: spacing.sm,
    position: 'relative',
  },
  bar: {
    width: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
    marginHorizontal: 4,
  },
  barShort: {
    height: 28,
  },
  barMedium: {
    height: 44,
  },
  barTall: {
    height: 60,
  },
  arrow: {
    position: 'absolute',
    top: 28,
    right: 30,
    width: 24,
    height: 24,
    borderTopWidth: 6,
    borderRightWidth: 6,
    borderColor: colors.accent,
    transform: [{ rotate: '45deg' }],
  },
  title: {
    fontSize: typography.heading,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.body,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  actions: {
    width: '100%',
    gap: spacing.md,
  },
  control: {
    marginBottom: spacing.md,
  },
});
