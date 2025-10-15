import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AuthLayout } from '../components/AuthLayout';
import { TextField } from '../components/TextField';
import { PrimaryButton } from '../components/PrimaryButton';
import { spacing, colors, typography } from '../theme';
import { resetPassword } from '../services/authService';

export const ResetPasswordScreen = ({ navigation }) => {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    setError(null);
    if (!token) {
      setError('Ingresa el token de recuperacion.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contrasenas no coinciden.');
      return;
    }
    setLoading(true);
    try {
      const result = await resetPassword({ token, newPassword: password });
      if (result.success) {
        navigation.navigate('PasswordChanged');
      } else {
        setError(result.message || 'No fue posible actualizar la contrasena.');
      }
    } catch (err) {
      setError(err.message || 'Error al actualizar la contrasena.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Nueva contrasena"
      subtitle="Crea una contrasena segura"
    >
      <View style={styles.form}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <TextField
          placeholder="Token de recuperacion"
          value={token}
          onChangeText={setToken}
          autoCapitalize="none"
        />
        <TextField
          placeholder="Nueva contrasena"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          enableVisibilityToggle
        />
        <TextField
          placeholder="Confirmar contrasena"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          enableVisibilityToggle
        />
        <PrimaryButton
          title={loading ? 'Actualizando...' : 'Cambiar contrase?a'}
          onPress={handleReset}
          disabled={loading}
        />
        <Text style={styles.helper}>
          Recuerda no compartir tu nueva contrasena y actualizarla periodicamente.
        </Text>
      </View>
    </AuthLayout>
  );
};

const styles = StyleSheet.create({
  form: {
    width: '100%',
    gap: spacing.md,
  },
  helper: {
    color: colors.muted,
    fontSize: typography.small,
    textAlign: 'center',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: typography.small,
    textAlign: 'center',
  },
});

