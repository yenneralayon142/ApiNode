import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AuthLayout } from '../components/AuthLayout';
import { TextField } from '../components/TextField';
import { PrimaryButton } from '../components/PrimaryButton';
import { TextLink } from '../components/TextLink';
import { spacing, colors, typography } from '../theme';

export const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <AuthLayout
      title="Bienvenido"
      subtitle="Ingresa para revisar tus finanzas"
      footer={
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>¿No tienes una cuenta?</Text>
          <TextLink
            label="Regístrate"
            onPress={() => navigation.navigate('Register')}
          />
        </View>
      }
    >
      <View>
        <TextField
          style={styles.control}
          placeholder="example@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextField
          style={styles.control}
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextLink
          label="¿Olvidaste tu contraseña?"
          onPress={() => navigation.navigate('ForgotPassword')}
          style={styles.forgotLink}
        />
        <PrimaryButton
          title="Ingreso"
          onPress={() => navigation.navigate('DashboardPlaceholder')}
          style={styles.control}
        />
        <PrimaryButton
          title="Registro"
          variant="secondary"
          onPress={() => navigation.navigate('Register')}
          style={styles.control}
        />
      </View>
    </AuthLayout>
  );
};

const styles = StyleSheet.create({
  control: {
    marginBottom: spacing.md,
  },
  forgotLink: {
    alignSelf: 'flex-end',
    marginBottom: spacing.md,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    color: colors.muted,
    fontSize: typography.small,
    marginRight: spacing.xs,
  },
});
