import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AuthLayout } from '../components/AuthLayout';
import { TextField } from '../components/TextField';
import { PrimaryButton } from '../components/PrimaryButton';
import { TextLink } from '../components/TextLink';
import { spacing, colors, typography } from '../theme';

export const RegisterScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    birthdate: '',
    password: '',
    confirmPassword: '',
  });

  const updateField = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
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
        <TextField
          style={styles.control}
          placeholder="Nombre Completo"
          value={form.name}
          onChangeText={value => updateField('name', value)}
        />
        <TextField
          style={styles.control}
          placeholder="correo@example.com"
          value={form.email}
          onChangeText={value => updateField('email', value)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextField
          style={styles.control}
          placeholder="+57 3000000000"
          value={form.phone}
          onChangeText={value => updateField('phone', value)}
          keyboardType="phone-pad"
        />
        <TextField
          style={styles.control}
          placeholder="DD / MM / YYYY"
          value={form.birthdate}
          onChangeText={value => updateField('birthdate', value)}
        />
        <TextField
          style={styles.control}
          placeholder="Contraseña"
          value={form.password}
          onChangeText={value => updateField('password', value)}
          secureTextEntry
        />
        <TextField
          style={styles.control}
          placeholder="Confirmar Contraseña"
          value={form.confirmPassword}
          onChangeText={value => updateField('confirmPassword', value)}
          secureTextEntry
        />
        <Text style={styles.disclaimer}>
          Al registrarte aceptas los términos, políticas de privacidad y confirmas que tu información es correcta.
        </Text>
        <PrimaryButton
          title="Registro"
          onPress={() => navigation.navigate('Login')}
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
});
