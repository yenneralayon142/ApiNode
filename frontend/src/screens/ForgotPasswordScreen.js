import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AuthLayout } from '../components/AuthLayout';
import { TextField } from '../components/TextField';
import { PrimaryButton } from '../components/PrimaryButton';
import { TextLink } from '../components/TextLink';
import { spacing, colors, typography } from '../theme';
import { requestPasswordReset } from '../services/authService';

export const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setFeedback(null);
    if (!email) {
      setError('Ingresa un correo válido.');
      return;
    }
    setLoading(true);
    try {
      const result = await requestPasswordReset({ email });
      if (result.success) {
        setFeedback(result.message || 'Revisa tu correo para continuar.');
        if (result?.data?.resetToken) {
          setFeedback(`${result.message}\nToken: ${result.data.resetToken}`);
        }
      } else {
        setError(result.message || 'No fue posible procesar la solicitud.');
      }
    } catch (err) {
      setError(err.message || 'Error al solicitar recuperación.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Recuperar Contraseña"
      subtitle="Te enviaremos un enlace para restablecerla"
      footer={
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>¿Aún no tienes cuenta?</Text>
          <TextLink label="Regístrate" onPress={() => navigation.navigate('Register')} />
        </View>
      }
    >
      <View>
        <Text style={styles.description}>
          Ingresa el correo asociado a tu cuenta para recibir instrucciones de recuperación.
        </Text>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {feedback ? <Text style={styles.feedbackText}>{feedback}</Text> : null}
        <TextField
          style={styles.control}
          placeholder="example@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <PrimaryButton
          title={loading ? 'Enviando...' : 'Siguiente Paso'}
          onPress={handleSubmit}
          disabled={loading}
          style={styles.control}
        />
        <TextLink
          label="Volver al inicio de sesión"
          onPress={() => navigation.goBack()}
        />
      </View>
    </AuthLayout>
  );
};

const styles = StyleSheet.create({
  control: {
    marginBottom: spacing.md,
  },
  description: {
    color: colors.text,
    fontSize: typography.body,
    marginBottom: spacing.lg,
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
  },
  feedbackText: {
    color: colors.accent,
    marginBottom: spacing.md,
    fontSize: typography.small,
  },
});
