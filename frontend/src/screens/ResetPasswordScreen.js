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
      setError('Ingresa el token de recuperación.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setLoading(true);
    try {
      const result = await resetPassword({ token, newPassword: password });
      if (result.success) {
        navigation.navigate('PasswordChanged');
      } else {
        setError(result.message || 'No fue posible actualizar la contraseña.');
      }
    } catch (err) {
      setError(err.message || 'Error al actualizar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Nueva Contraseña"
      subtitle="Crea una contraseña segura"
    >
      <View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <TextField
          style={styles.control}
          placeholder="Token de recuperación"
          value={token}
          onChangeText={setToken}
          autoCapitalize="none"
        />
        <TextField
          style={styles.control}
          placeholder="Nueva contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          enableVisibilityToggle
        />
        <TextField
          style={styles.control}
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          enableVisibilityToggle
        />
        <PrimaryButton
          title={loading ? 'Actualizando...' : 'Cambiar Contraseña'}
          onPress={handleReset}
          disabled={loading}
          style={styles.control}
        />
        <Text style={styles.helper}>
          Recuerda no compartir tu nueva contraseña y actualizarla periódicamente.
        </Text>
      </View>
    </AuthLayout>
  );
};

const styles = StyleSheet.create({
  control: {
    marginBottom: spacing.md,
  },
  helper: {
    color: colors.muted,
    fontSize: typography.small,
    textAlign: 'center',
  },
  errorText: {
    color: '#FF6B6B',
    marginBottom: spacing.md,
    fontSize: typography.small,
    textAlign: 'center',
  },
});

