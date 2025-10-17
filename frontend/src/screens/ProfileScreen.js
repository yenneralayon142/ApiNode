import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import * as profileService from '../services/profileService';
import { TextField } from '../components/TextField';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, spacing, typography } from '../theme';

const mapUserToForm = (data) => ({
  email: data?.email || '',
  name: data?.name || '',
  lastname: data?.lastname || '',
  phone: data?.phone || '',
  image: data?.image || '',
});

export const ProfileScreen = () => {
  const { user, accessToken, updateStoredUser, signOut } = useAuth();
  const [profileForm, setProfileForm] = useState(mapUserToForm(user));
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState(null);
  const [passwordFeedback, setPasswordFeedback] = useState(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    setProfileForm(mapUserToForm(user));
  }, [user]);

  const headerSubtitle = useMemo(() => {
    if (!user?.name && !user?.lastname) {
      return 'Gestiona tu perfil y seguridad';
    }
    return `Hola, ${user?.name || ''} ${user?.lastname || ''}`.trim();
  }, [user]);

  const loadProfile = useCallback(
    async ({ soft = false } = {}) => {
      if (!accessToken) {
        setLoading(false);
        return;
      }
      if (soft) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setProfileFeedback(null);
      try {
        const response = await profileService.getProfile(accessToken);
        if (response?.success) {
          setProfileForm(mapUserToForm(response.data));
          await updateStoredUser(response.data);
        } else {
          setProfileFeedback({ type: 'error', message: response?.message || 'No fue posible cargar tu perfil.' });
        }
      } catch (error) {
        setProfileFeedback({
          type: 'error',
          message: error?.message || 'No fue posible cargar tu perfil.',
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [accessToken, updateStoredUser],
  );

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile]),
  );

  const handleProfileChange = (field, value) => {
    setProfileForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmitProfile = async () => {
    if (!accessToken) {
      setProfileFeedback({ type: 'error', message: 'Sesion expirada. Vuelve a iniciar sesion.' });
      return;
    }

    setUpdatingProfile(true);
    setProfileFeedback(null);
    try {
      const payload = {
        email: profileForm.email?.trim().toLowerCase(),
        name: profileForm.name?.trim() || '',
        lastname: profileForm.lastname?.trim() || '',
        phone: profileForm.phone?.trim() || '',
        image: profileForm.image?.trim() || '',
      };
      const response = await profileService.updateProfile({ token: accessToken, payload });
      if (response?.success) {
        setProfileFeedback({ type: 'success', message: 'Perfil actualizado correctamente.' });
        setProfileForm(mapUserToForm(response.data));
        await updateStoredUser(response.data);
      } else {
        setProfileFeedback({ type: 'error', message: response?.message || 'No fue posible actualizar el perfil.' });
      }
    } catch (error) {
      setProfileFeedback({ type: 'error', message: error?.message || 'No fue posible actualizar el perfil.' });
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handlePasswordChange = (field, value) => {
    setPasswordForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmitPassword = async () => {
    if (!accessToken) {
      setPasswordFeedback({ type: 'error', message: 'Sesion expirada. Vuelve a iniciar sesion.' });
      return;
    }
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setPasswordFeedback({ type: 'error', message: 'Completa los campos requeridos.' });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordFeedback({ type: 'error', message: 'La confirmacion no coincide.' });
      return;
    }

    setChangingPassword(true);
    setPasswordFeedback(null);
    try {
      const response = await profileService.changePassword({
        token: accessToken,
        payload: {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        },
      });
      if (response?.success) {
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        Alert.alert('Contraseña actualizada', 'Debes iniciar sesion nuevamente.', [
          {
            text: 'Aceptar',
            onPress: () => {
              signOut();
            },
          },
        ]);
      } else {
        setPasswordFeedback({ type: 'error', message: response?.message || 'No fue posible actualizar la contrase�a.' });
      }
    } catch (error) {
      setPasswordFeedback({
        type: 'error',
        message: error?.message || 'No fue posible actualizar la contraseña.',
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const FeedbackMessage = ({ feedback }) => {
    if (!feedback?.message) {
      return null;
    }
    const tone = feedback.type === 'success' ? styles.feedbackSuccess : styles.feedbackError;
    return (
      <View style={[styles.feedbackContainer, tone]}>
        <Text style={styles.feedbackText}>{feedback.message}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadProfile({ soft: true })}
            tintColor={colors.surface}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Perfil</Text>
          <Text style={styles.headerSubtitle}>{headerSubtitle}</Text>
        </View>

        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator color={colors.surface} size='large' />
          </View>
        ) : (
          <View style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Datos personales</Text>
              <Text style={styles.sectionSubtitle}>Actualiza tu informacion de contacto.</Text>
              <View style={styles.fields}>
                <TextField
                  label='Correo'
                  autoCapitalize='none'
                  keyboardType='email-address'
                  value={profileForm.email}
                  onChangeText={(value) => handleProfileChange('email', value)}
                />
                <TextField
                  label='Nombre'
                  value={profileForm.name}
                  onChangeText={(value) => handleProfileChange('name', value)}
                />
                <TextField
                  label='Apellido'
                  value={profileForm.lastname}
                  onChangeText={(value) => handleProfileChange('lastname', value)}
                />
                <TextField
                  label='Telefono'
                  keyboardType='phone-pad'
                  value={profileForm.phone}
                  onChangeText={(value) => handleProfileChange('phone', value)}
                />
                <TextField
                  label='Imagen (URL)'
                  value={profileForm.image}
                  onChangeText={(value) => handleProfileChange('image', value)}
                  placeholder='https://...'
                  autoCapitalize='none'
                />
              </View>
              <FeedbackMessage feedback={profileFeedback} />
              <PrimaryButton
                title={updatingProfile ? 'Guardando...' : 'Guardar cambios'}
                onPress={handleSubmitProfile}
                disabled={updatingProfile}
                style={styles.primaryButton}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Seguridad</Text>
              <Text style={styles.sectionSubtitle}>Modifica tu contrase�a de acceso.</Text>
              <View style={styles.fields}>
                <TextField
                  label='Contraseña actual'
                  secureTextEntry
                  enableVisibilityToggle
                  value={passwordForm.currentPassword}
                  onChangeText={(value) => handlePasswordChange('currentPassword', value)}
                />
                <TextField
                  label='Nueva contraseña'
                  secureTextEntry
                  enableVisibilityToggle
                  value={passwordForm.newPassword}
                  onChangeText={(value) => handlePasswordChange('newPassword', value)}
                />
                <TextField
                  label='Confirmar contraseña'
                  secureTextEntry
                  enableVisibilityToggle
                  value={passwordForm.confirmPassword}
                  onChangeText={(value) => handlePasswordChange('confirmPassword', value)}
                />
              </View>
              <FeedbackMessage feedback={passwordFeedback} />
              <PrimaryButton
                title={changingPassword ? 'Actualizando...' : 'Actualizar contraseña'}
                onPress={handleSubmitPassword}
                disabled={changingPassword}
                style={styles.secondaryButton}
              />
            </View>

            <PrimaryButton
              title='Cerrar sesión'
              variant='ghost'
              onPress={() => {
                Alert.alert('Cerrar sesión', '¿Deseas salir de tu cuenta?', [
                  { text: 'Cancelar', style: 'cancel' },
                  { text: 'Salir', style: 'destructive', onPress: () => signOut() },
                ]);
              }}
              style={styles.signOutButton}
              textStyle={styles.signOutText}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    paddingBottom: spacing.xl * 2,
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerTitle: {
    color: colors.surface,
    fontSize: typography.heading,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: spacing.sm,
    fontSize: typography.body,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xl,
  },
  content: {
    paddingHorizontal: spacing.lg,
    marginTop: -spacing.xl,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: spacing.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: typography.subheading,
    fontWeight: '700',
    color: colors.heading,
  },
  sectionSubtitle: {
    color: colors.muted,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  fields: {
    gap: spacing.md,
  },
  feedbackContainer: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  feedbackText: {
    color: colors.surface,
    fontWeight: '500',
    textAlign: 'center',
  },
  feedbackSuccess: {
    backgroundColor: '#27AE60',
  },
  feedbackError: {
    backgroundColor: '#E74C3C',
  },
  primaryButton: {
    marginTop: spacing.sm,
  },
  secondaryButton: {
    marginTop: spacing.sm,
  },
  signOutButton: {
    marginTop: spacing.xl,
  },
  signOutText: {
    color: colors.surface,
  },
});



