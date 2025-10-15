import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AuthLayout } from '../components/AuthLayout';
import { TextField } from '../components/TextField';
import { PrimaryButton } from '../components/PrimaryButton';
import { TextLink } from '../components/TextLink';
import { spacing, colors, typography } from '../theme';
import { useAuth } from '../context/AuthContext';

export const RegisterScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    name: '',
    lastname: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState(null);
  const { signUp, actionLoading } = useAuth();

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleRegister = async () => {
    setError(null);
    if (!form.email || !form.password) {
      setError('Completa correo y contraseña.');
      return;
    }
    const payload = {
      name: form.name,
      lastname: form.lastname,
      email: form.email,
      phone: form.phone,
      password: form.password,
    };
    const result = await signUp(payload);
    if (!result.success) {
      setError(result.message || 'No fue posible registrar la cuenta');
    }
  };

  return (
    <AuthLayout
      title="Crear Una Cuenta"
      subtitle="Configura tu acceso a YenAndGestion"
      footer={
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>¿Ya tienes cuenta?</Text>
          <TextLink label="Ingresa" onPress={() => navigation.navigate('Login')} />
        </View>
      }
    >
      <View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <TextField
          style={styles.control}
          placeholder="Nombre"
          value={form.name}
          onChangeText={(value) => updateField('name', value)}
        />
        <TextField
          style={styles.control}
          placeholder="Apellido"
          value={form.lastname}
          onChangeText={(value) => updateField('lastname', value)}
        />
        <TextField
          style={styles.control}
          placeholder="correo@example.com"
          value={form.email}
          onChangeText={(value) => updateField('email', value)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextField
          style={styles.control}
          placeholder="3112006677"
          value={form.phone}
          onChangeText={(value) => updateField('phone', value)}
          keyboardType="phone-pad"
        />
        <TextField
          style={styles.control}
          placeholder="12345"
          value={form.password}
          onChangeText={(value) => updateField('password', value)}
          secureTextEntry
          enableVisibilityToggle
        />
        <Text style={styles.disclaimer}>
          Al registrarte aceptas los términos, políticas de privacidad y confirmas que tu información es correcta.
        </Text>
        <PrimaryButton
          title={actionLoading ? 'Creando cuenta...' : 'Registro'}
          onPress={handleRegister}
          disabled={actionLoading}
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
  disclaimer: {
    color: colors.muted,
    fontSize: typography.small,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  errorText: {
    color: '#FF6B6B',
    marginBottom: spacing.md,
    fontSize: typography.small,
    textAlign: 'center',
  },
});

