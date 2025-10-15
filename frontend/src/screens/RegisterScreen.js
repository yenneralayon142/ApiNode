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
  });
  const [error, setError] = useState(null);
  const { signUp, actionLoading } = useAuth();

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleRegister = async () => {
    setError(null);
    if (!form.email || !form.password) {
      setError('Completa correo y contrasena.');
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
      title="Crear una cuenta"
      subtitle="Configura tu acceso a YenAndGestion"
      footer={
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Ya tienes cuenta?</Text>
          <TextLink
            label="Ingresa"
            onPress={() => navigation.navigate('Login')}
            textStyle={styles.footerLink}
          />
        </View>
      }
    >
      <View style={styles.form}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <TextField
          placeholder="Nombre"
          value={form.name}
          onChangeText={(value) => updateField('name', value)}
        />
        <TextField
          placeholder="Apellido"
          value={form.lastname}
          onChangeText={(value) => updateField('lastname', value)}
        />
        <TextField
          placeholder="correo@example.com"
          value={form.email}
          onChangeText={(value) => updateField('email', value)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextField
          placeholder="3112006677"
          value={form.phone}
          onChangeText={(value) => updateField('phone', value)}
          keyboardType="phone-pad"
        />
        <TextField
          placeholder="Contrasena"
          value={form.password}
          onChangeText={(value) => updateField('password', value)}
          secureTextEntry
          enableVisibilityToggle
        />
        <PrimaryButton
          title={actionLoading ? 'Creando cuenta...' : 'Registro'}
          onPress={handleRegister}
          disabled={actionLoading}
        />
      </View>
    </AuthLayout>
  );
};

const styles = StyleSheet.create({
  form: {
    width: '100%',
    gap: spacing.md,
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
    fontSize: typography.small,
    textAlign: 'center',
  },
});

