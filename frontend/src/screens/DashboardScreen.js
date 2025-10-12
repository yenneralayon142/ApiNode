import React from 'react';
import { SafeAreaView, View, Text, StyleSheet } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, spacing, typography } from '../theme';
import { useAuth } from '../context/AuthContext';

export const DashboardScreen = () => {
  const { user, signOut } = useAuth();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hola, {user?.name || user?.email || 'Usuario'} 👋</Text>
        <Text style={styles.subtitle}>Tu panel estará disponible pronto.</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Resumen rápido</Text>
        <Text style={styles.sectionText}>
          Aquí veremos tus gastos, ingresos y objetivos seguidos del dashboard final.
        </Text>
      </View>
      <PrimaryButton title="Cerrar sesión" onPress={signOut} style={styles.logout} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  greeting: {
    color: '#FFFFFF',
    fontSize: typography.heading,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.infoLight,
    fontSize: typography.body,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 28,
    padding: spacing.xl,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.15,
    shadowRadius: 28,
    elevation: 10,
  },
  sectionTitle: {
    color: colors.heading,
    fontSize: typography.subheading,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  sectionText: {
    color: colors.muted,
    fontSize: typography.body,
    lineHeight: 22,
  },
  logout: {
    marginTop: spacing.xl,
  },
});
