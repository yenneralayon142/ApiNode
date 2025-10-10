import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AuthLayout } from '../components/AuthLayout';
import { TextField } from '../components/TextField';
import { PrimaryButton } from '../components/PrimaryButton';
import { TextLink } from '../components/TextLink';
import { spacing, colors, typography } from '../theme';

export const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');

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
        <TextField
          style={styles.control}
          placeholder="example@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <PrimaryButton
          title="Siguiente Paso"
          onPress={() => navigation.navigate('ResetPassword')}
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
});
