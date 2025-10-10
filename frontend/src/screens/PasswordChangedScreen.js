import React from 'react';
import { SafeAreaView, View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '../theme';
import { PrimaryButton } from '../components/PrimaryButton';

export const PasswordChangedScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.badge}>
          <View style={styles.innerDot} />
        </View>
        <Text style={styles.title}>La Contraseña Ha Sido Cambiada</Text>
        <Text style={styles.subtitle}>Satisfactoriamente</Text>
        <PrimaryButton
          title="Volver al inicio"
          onPress={() => navigation.navigate('Login')}
          style={styles.action}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  badge: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 6,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  innerDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  title: {
    color: '#FFFFFF',
    fontSize: typography.heading,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#FFFFFF',
    fontSize: typography.subheading,
    marginBottom: 40,
  },
  action: {
    alignSelf: 'stretch',
  },
});
