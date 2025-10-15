import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AuthLayout } from '../components/AuthLayout';
import { TextField } from '../components/TextField';
import { PrimaryButton } from '../components/PrimaryButton';
import { TextLink } from '../components/TextLink';
import { spacing, colors, typography } from '../theme';
import { useAuth } from '../context/AuthContext';

export const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { signIn, actionLoading } = useAuth();

  const handleLogin = async () => {
    setError(null);
    const result = await signIn({ email, password });
    if (!result.success) {
      setError(result.message || 'No fue posible iniciar sesion');
    }
  };

  return (
    <AuthLayout
      title="Bienvenido"
      subtitle="Ingresa para revisar tus finanzas"
      footer={
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>No tienes una cuenta?</Text>
          <TextLink
            label="Registrate"
            onPress={() => navigation.navigate('Register')}
            textStyle={styles.footerLink}
          />
        </View>
      }
    >
      <View style={styles.form}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <TextField
          placeholder="example@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextField
          placeholder="********"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          enableVisibilityToggle
        />
        <TextLink
          label="¿Olvidaste tu contraseña?"
          onPress={() => navigation.navigate('ForgotPassword')}
          textStyle={styles.link}
        />
        <View style={styles.actions}>
          <PrimaryButton
            title={actionLoading ? 'Ingresando...' : 'Ingreso'}
            onPress={handleLogin}
            disabled={actionLoading}
          />
          <PrimaryButton
            title="Registro"
            variant="secondary"
            onPress={() => navigation.navigate('Register')}
          />
        </View>
      </View>
    </AuthLayout>
  );
};

const styles = StyleSheet.create({
  form: {
    width: '100%',
    gap: spacing.md,
  },
  actions: {
    width: '100%',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  link: {
    alignSelf: 'center',
    color: colors.primary,
    fontSize: typography.small,
    fontWeight: '600',
    marginTop: spacing.xs,
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
  footerLink: {
    color: colors.primary,
    fontSize: typography.small,
    fontWeight: '600',
  },
  errorText: {
    color: '#FF6B6B',
    textAlign: 'center',
    fontSize: typography.small,
  },
});

