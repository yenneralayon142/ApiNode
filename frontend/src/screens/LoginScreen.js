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
      setError(result.message || 'No fue posible iniciar sesión');
    }
  };

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
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
          enableVisibilityToggle
        />
        <TextLink
          label="¿Olvidaste tu contraseña?"
          onPress={() => navigation.navigate('ForgotPassword')}
          style={styles.forgotLink}
        />
        <PrimaryButton
          title={actionLoading ? 'Ingresando...' : 'Ingreso'}
          onPress={handleLogin}
          disabled={actionLoading}
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
  errorText: {
    color: '#FF6B6B',
    marginBottom: spacing.md,
    fontSize: typography.small,
    textAlign: 'center',
  },
});

