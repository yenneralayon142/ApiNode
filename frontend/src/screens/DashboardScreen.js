import React, { useCallback, useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import * as reportService from '../services/reportService';
import * as transactionService from '../services/transactionService';

const FILTERS = [
  { id: 'day', label: 'Diario' },
  { id: 'week', label: 'Semanal' },
  { id: 'month', label: 'Mensual' }
];

const formatCurrency = (value) => {
  const number = Number.isFinite(Number(value)) ? Number(value) : 0;
  const formatted = number.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `$${formatted}`;
};

const formatDateTime = (value) => {
  if (!value) {
    return '-';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString('es-MX', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getGreeting = () => {
  const now = new Date();
  const hour = now.getHours();
  if (hour < 12) {
    return 'Buenos dias';
  }
  if (hour < 18) {
    return 'Buenas tardes';
  }
  return 'Buenas noches';
};

export const DashboardScreen = ({ navigation }) => {
  const { user, accessToken } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState('month');
  const [summary, setSummary] = useState(null);
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [categorySummary, setCategorySummary] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const buildFilters = useCallback((filterId = selectedFilter) => {
    const now = new Date();
    const toDate = now.toISOString();
    const fromDate = new Date(now);
    const activeFilter = filterId || selectedFilter;

    if (activeFilter === 'day') {
      fromDate.setHours(0, 0, 0, 0);
    } else if (activeFilter === 'week') {
      fromDate.setHours(0, 0, 0, 0);
      fromDate.setDate(fromDate.getDate() - 6);
    } else {
      fromDate.setHours(0, 0, 0, 0);
      fromDate.setDate(1);
    }

    return {
      from: fromDate.toISOString(),
      to: toDate
    };
  }, [selectedFilter]);

  const loadData = useCallback(async ({ mode = 'initial', filterId } = {}) => {
    if (!accessToken) {
      return;
    }

    const filters = buildFilters(filterId);
    setError(null);

    if (mode === 'refresh') {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [summaryRes, monthlyRes, categoryRes, transactionRes] = await Promise.all([
        reportService.getSummary({ token: accessToken, filters }),
        reportService.getMonthlySummary({ token: accessToken, filters }),
        reportService.getCategorySummary({ token: accessToken, filters: { ...filters, limit: 5 } }),
        transactionService.listTransactions({ token: accessToken, filters: { ...filters, limit: 5 } })
      ]);

      if (!summaryRes?.success) {
        throw new Error(summaryRes?.message || 'No fue posible obtener el resumen.');
      }
      if (!monthlyRes?.success) {
        throw new Error(monthlyRes?.message || 'No fue posible obtener el historico mensual.');
      }
      if (!categoryRes?.success) {
        throw new Error(categoryRes?.message || 'No fue posible obtener las categorias.');
      }
      if (!transactionRes?.success) {
        throw new Error(transactionRes?.message || 'No fue posible obtener las transacciones.');
      }

      setSummary(summaryRes.data || null);
      setMonthlySummary(monthlyRes.data || []);
      setCategorySummary(categoryRes.data?.items || []);
      setTransactions(transactionRes.data?.items || []);
    } catch (loadError) {
      console.error('Error loading dashboard', loadError);
      setError(loadError.message || 'No fue posible cargar la informacion.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [accessToken, buildFilters]);



  const progress = useMemo(() => {
    const income = summary?.total_income || 0;
    const expense = summary?.total_expense || 0;
    if (income <= 0) {
      return 0;
    }
    const ratio = Math.min(expense / income, 1);
    return Math.round(ratio * 100);
  }, [summary]);

  const topIncomeCategory = useMemo(() => {
    return categorySummary.reduce((acc, item) => {
      if (!item) {
        return acc;
      }
      if (item.income > (acc?.income || 0)) {
        return item;
      }
      return acc;
    }, null);
  }, [categorySummary]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const topExpenseCategory = useMemo(() => {
    return categorySummary.reduce((acc, item) => {
      if (!item) {
        return acc;
      }
      if (item.expense > (acc?.expense || 0)) {
        return item;
      }
      return acc;
    }, null);
  }, [categorySummary]);

  const lastPeriod = useMemo(() => {
    if (!monthlySummary.length) {
      return null;
    }
    return monthlySummary[monthlySummary.length - 1];
  }, [monthlySummary]);

  const handleRefresh = useCallback(() => {
    loadData({ mode: 'refresh' });
  }, [loadData]);

  const handleFilterChange = (filterId) => {
    if (filterId === selectedFilter) {
      return;
    }
    setSelectedFilter(filterId);
    loadData({ mode: 'filter', filterId });
  };

  const greeting = useMemo(() => getGreeting(), []);

  const incomeText = formatCurrency(summary?.total_income || 0);
  const expenseText = formatCurrency(summary?.total_expense || 0);
  const balanceText = formatCurrency(summary?.balance || 0);
  const progressCaption = summary?.total_income
    ? `Gastaste el ${progress}% de tus ingresos.`
    : 'Registra ingresos para medir tu progreso.';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor='#2E86DE' />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.greeting}>{`${greeting},`}</Text>
              <Text style={styles.userName}>{user?.name || user?.email || 'Usuario'}</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.profileButton}>
              <Ionicons name='person-circle-outline' size={22} color='#fff' />
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Saldo actual</Text>
              <Text style={styles.statValue}>{balanceText}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Ingresos</Text>
              <Text style={styles.statValue}>{incomeText}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Gastos</Text>
              <Text style={[styles.statValue, styles.negativeValue]}>{expenseText}</Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>{progressCaption}</Text>
          </View>
        </View>

        <View style={styles.cardsContainer}>
          <View style={styles.card}>
            <MaterialIcons name='query-stats' size={24} color='#2E86DE' />
            <View>
              <Text style={styles.cardLabel}>Ultimo periodo</Text>
              <Text style={styles.cardValue}>
                {lastPeriod
                  ? `${lastPeriod.period} - Balance ${formatCurrency(lastPeriod.balance)}`
                  : 'Aun no hay datos para mostrar.'}
              </Text>
            </View>
          </View>
          <View style={styles.card}>
            <Ionicons name='trending-up-outline' size={24} color='#27AE60' />
            <View>
              <Text style={styles.cardLabel}>Categoria con mas ingresos</Text>
              <Text style={styles.cardValue}>
                {topIncomeCategory
                  ? `${topIncomeCategory.category_name}: ${formatCurrency(topIncomeCategory.income)}`
                  : 'Sin ingresos registrados.'}
              </Text>
            </View>
          </View>
          <View style={styles.card}>
            <FontAwesome5 name='receipt' size={22} color='#E74C3C' />
            <View>
              <Text style={styles.cardLabel}>Categoria con mas gastos</Text>
              <Text style={styles.cardValue}>
                {topExpenseCategory
                  ? `${topExpenseCategory.category_name}: ${formatCurrency(topExpenseCategory.expense)}`
                  : 'Sin gastos registrados.'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.filterContainer}>
          {FILTERS.map((filter) => {
            const active = filter.id === selectedFilter;
            return (
              <TouchableOpacity
                key={filter.id}
                style={[styles.filterButton, active ? styles.filterActive : styles.filterInactive]}
                onPress={() => handleFilterChange(filter.id)}
              >
                <Text style={[styles.filterText, active && styles.filterActiveText]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Movimientos recientes</Text>
            <Text style={styles.sectionSubtitle}>
              {transactions.length ? `${transactions.length} registros` : 'Sin movimientos'}
            </Text>
          </View>

          {loading && !refreshing ? (
            <ActivityIndicator color='#2E86DE' style={styles.sectionLoader} />
          ) : null}

          {!loading && !refreshing && !transactions.length ? (
            <Text style={styles.emptyState}>
              Aun no registras movimientos en este periodo. Crea tus primeras transacciones para
              verlas aqui.
            </Text>
          ) : null}

          {transactions.map((item) => {
            const isIncome = item.type === 'income';
            const icon = isIncome ? 'attach-money' : 'shopping-basket';
            const amountStyle = [
              styles.listAmount,
              isIncome ? styles.incomeText : styles.expenseText
            ];
            return (
              <View key={item.id} style={styles.listItem}>
                {isIncome ? (
                  <MaterialIcons name={icon} size={24} color='#27AE60' />
                ) : (
                  <FontAwesome5 name={icon} size={22} color='#E67E22' />
                )}
                <View style={styles.listTextContainer}>
                  <Text style={styles.listTitle}>{item.description || 'Sin descripcion'}</Text>
                  <Text style={styles.listDate}>{formatDateTime(item.occurred_at)}</Text>
                </View>
                <Text style={amountStyle}>
                  {isIncome ? formatCurrency(item.amount) : `-${formatCurrency(item.amount)}`}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.bottomAction}
            onPress={() => navigation.navigate('Dashboard')}
          >
            <Ionicons name='home' size={26} color='#fff' />
            <Text style={styles.bottomLabel}>Inicio</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bottomAction}
            onPress={() => loadData({ mode: 'refresh' })}
          >
            <Ionicons name='stats-chart' size={26} color='#fff' />
            <Text style={styles.bottomLabel}>Actualizar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.bottomAction, styles.bottomActionPrimary]}
            onPress={() => navigation.navigate('NewExpense')}
          >
            <Ionicons name='wallet' size={26} color='#2E86DE' />
            <Text style={[styles.bottomLabel, styles.bottomLabelPrimary]}>Nuevo gasto</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bottomAction}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name='person-circle' size={26} color='#fff' />
            <Text style={styles.bottomLabel}>Perfil</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F5F7FA'
  },
  scroll: {
    paddingBottom: 90
  },
  header: {
    backgroundColor: '#2E86DE',
    padding: 24,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  greeting: {
    color: '#EAF2F8',
    fontSize: 18,
    fontWeight: '500'
  },
  userName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 4
  },
  profileButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)'
  },
  errorText: {
    marginTop: 16,
    color: '#FFCDD2',
    fontSize: 13
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24
  },
  statBox: {
    flex: 1,
    alignItems: 'center'
  },
  statLabel: {
    color: '#EAF2F8',
    fontSize: 13
  },
  statValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4
  },
  negativeValue: {
    color: '#FDEDEC'
  },
  progressContainer: {
    marginTop: 24
  },
  progressBar: {
    height: 10,
    backgroundColor: '#D6EAF8',
    borderRadius: 10,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#58D68D'
  },
  progressText: {
    marginTop: 8,
    color: '#fff',
    fontSize: 13
  },
  cardsContainer: {
    marginTop: 16,
    paddingHorizontal: 20
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',

    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  cardLabel: {
    color: '#2E4053',
    fontWeight: '600'
  },
  cardValue: {
    color: '#34495E',
    marginTop: 4
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20
  },
  filterInactive: {
    backgroundColor: '#D6EAF8'
  },
  filterActive: {
    backgroundColor: '#2E86DE'
  },
  filterText: {
    fontWeight: '600',
    color: '#2E4053'
  },
  filterActiveText: {
    color: '#fff'
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 20
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2E4053'
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#7B8A8B'
  },
  sectionLoader: {
    marginTop: 20,
    marginBottom: 10
  },
  emptyState: {
    color: '#7B8A8B',
    fontSize: 13,
    marginBottom: 10
  },
  listItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  listTextContainer: {
    flex: 1,
    marginHorizontal: 10
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E4053'
  },
  listDate: {
    fontSize: 12,
    color: '#7B8A8B'
  },
  listAmount: {
    fontSize: 16,
    fontWeight: '700'
  },
  incomeText: {
    color: '#27AE60'
  },
  expenseText: {
    color: '#E74C3C'
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#2E86DE',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30
  },
  bottomAction: {
    alignItems: 'center'
  },
  bottomActionPrimary: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20
  },
  bottomLabel: {
    color: '#fff',
    fontSize: 11,
    marginTop: 4
  },
  bottomLabelPrimary: {
    color: '#2E86DE',
    fontWeight: '600'
  }
});








