import React from 'react';
import { SafeAreaView, View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '../theme';
import { PrimaryButton } from '../components/PrimaryButton';

export const DashboardPlaceholder = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Panel en construcción</Text>
        <Text style={styles.subtitle}>
          Estamos construyendo la experiencia principal según los mockups de YenAndGestion.
        </Text>
        <PrimaryButton
          title="Volver"
          onPress={() => navigation.navigate('Login')}
        />
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
    padding: 32,
    justifyContent: 'center',
  },
  title: {
    color: colors.heading,
    fontSize: typography.heading,
    fontWeight: '700',
    marginBottom: 16,
  },
  subtitle: {
    color: colors.muted,
    fontSize: typography.body,
    marginBottom: 32,
  },
});
