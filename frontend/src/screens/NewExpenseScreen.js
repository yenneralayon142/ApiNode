import React, { useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { TextField } from '../components/TextField';
import { PrimaryButton } from '../components/PrimaryButton';
import * as transactionService from '../services/transactionService';
import * as categoryService from '../services/categoryService';
import { colors, spacing, typography, radii } from '../theme';

export const NewExpenseScreen = ({ navigation }) => {
  const { accessToken } = useAuth();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!accessToken) {
        return;
      }
      setCategoriesError(null);
      setLoadingCategories(true);
      try {
        const response = await categoryService.listCategories({
          token: accessToken,
          filters: { type: 'expense' }
        });
        if (!response?.success) {
          throw new Error(response?.message || 'No fue posible cargar las categorias.');
        }
        setCategories(response.data || []);
      } catch (error) {
        console.error('Error fetching categories', error);
        setCategoriesError(error.message || 'No fue posible cargar las categorias.');
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [accessToken]);

  const disableSubmit = useMemo(() => {
    return submitting || !amount.trim();
  }, [amount, submitting]);

  const parseAmount = () => {
    const normalized = amount.replace(/,/g, '.');
    const value = Number(normalized);
    if (!Number.isFinite(value) || value <= 0) {
      return null;
    }
    return Math.round(value * 100) / 100;
  };

  const handleSubmit = async () => {
    if (!accessToken) {
      setSubmitError('No se encontro la sesion. Inicia sesion nuevamente.');
      return;
    }

    setSubmitError(null);
    setSubmitSuccess(null);

    const value = parseAmount();
    if (value === null) {
      setSubmitError('Ingresa un monto valido mayor a cero.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        type: 'expense',
        amount: value,
        description: description.trim() || null,
        occurredAt: new Date().toISOString(),
        categoryId: categoryId ? Number(categoryId) : null
      };

      const response = await transactionService.createTransaction({
        token: accessToken,
        body: payload
      });

      if (!response?.success) {
        throw new Error(response?.message || 'No fue posible registrar el gasto.');
      }

      setSubmitSuccess('Gasto registrado correctamente.');
      setAmount('');
      setDescription('');
      setCategoryId(null);

      setTimeout(() => {
        navigation.goBack();
      }, 500);
    } catch (error) {
      console.error('Error creating expense', error);
      setSubmitError(error.message || 'No fue posible registrar el gasto.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name='chevron-back' size={22} color={colors.heading} />
            </TouchableOpacity>
            <Text style={styles.title}>Nuevo gasto</Text>
            <Text style={styles.subtitle}>
              Registra tus desembolsos para mantener el control de tus finanzas.
            </Text>
          </View>

          <View style={styles.form}>
            <TextField
              label='Monto'
              placeholder='0.00'
              keyboardType='decimal-pad'
              value={amount}
              onChangeText={setAmount}
              style={styles.field}
            />

            <TextField
              label='Descripcion'
              placeholder='Ej. Pago de renta'
              value={description}
              onChangeText={setDescription}
              style={styles.field}
            />

            <View style={styles.categoriesSection}>
              <Text style={styles.sectionTitle}>Categoria</Text>
              {loadingCategories ? (
                <ActivityIndicator color={colors.primary} style={styles.loader} />
              ) : null}
              {categoriesError ? <Text style={styles.errorText}>{categoriesError}</Text> : null}
              {!loadingCategories && !categories.length ? (
                <Text style={styles.helperText}>
                  No hay Categorias de gasto disponibles. Crea una desde el panel web o contacta al
                  administrador.
                </Text>
              ) : null}

              <View style={styles.categoriesGrid}>
                {categories.map((category) => {
                  const selected = category.id === categoryId;
                  return (
                    <TouchableOpacity
                      key={category.id}
                      style={[styles.categoryChip, selected ? styles.categoryChipActive : null]}
                      onPress={() => setCategoryId(selected ? null : category.id)}
                    >
                      <Text style={[styles.categoryChipText, selected ? styles.categoryChipTextActive : null]}>
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {submitError ? <Text style={styles.errorText}>{submitError}</Text> : null}
            {submitSuccess ? <Text style={styles.successText}>{submitSuccess}</Text> : null}

            <PrimaryButton
              title={submitting ? 'Guardando...' : 'Registrar gasto'}
              onPress={handleSubmit}
              disabled={disableSubmit}
              style={styles.submitButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  safe: {
    flex: 1,
    backgroundColor: '#F5F7FA'
  },
  scroll: {
    padding: spacing.lg,
    paddingBottom: spacing.xl
  },
  header: {
    marginBottom: spacing.lg
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF2F8',
    marginBottom: spacing.sm
  },
  title: {
    fontSize: typography.heading,
    fontWeight: '700',
    color: colors.heading,
    marginBottom: spacing.xs
  },
  subtitle: {
    fontSize: typography.body,
    color: colors.muted
  },
  form: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3
  },
  field: {
    marginBottom: spacing.md
  },
  categoriesSection: {
    marginBottom: spacing.lg
  },
  sectionTitle: {
    fontSize: typography.subheading,
    fontWeight: '600',
    color: colors.heading,
    marginBottom: spacing.sm
  },
  loader: {
    marginBottom: spacing.sm
  },
  helperText: {
    fontSize: typography.small,
    color: colors.muted,
    marginBottom: spacing.sm
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs
  },
  categoryChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.xs,
    marginBottom: spacing.xs,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 107, 255, 0.25)',
    backgroundColor: '#FFFFFF'
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  categoryChipText: {
    color: colors.heading,
    fontSize: typography.small,
    fontWeight: '500'
  },
  categoryChipTextActive: {
    color: '#FFFFFF'
  },
  errorText: {
    color: '#E74C3C',
    fontSize: typography.small,
    marginBottom: spacing.sm
  },
  successText: {
    color: '#27AE60',
    fontSize: typography.small,
    marginBottom: spacing.sm
  },
  submitButton: {
    marginTop: spacing.sm
  }
});
