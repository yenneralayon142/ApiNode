import { SafeAreaView, View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

export const DashboardPlaceholder = () => {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Encabezado */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Hola, Bienvenido de Vuelta</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Saldo Total</Text>
              <Text style={styles.statValue}>$7,783.00</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Gasto Total</Text>
              <Text style={[styles.statValue, { color: "#E74C3C" }]}>
                -$1,187.40
              </Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: "30%" }]} />
            </View>
            <Text style={styles.progressText}>30% de tus gastos, se ve bien.</Text>
          </View>
        </View>

        {/* Tarjetas informativas */}
        <View style={styles.cardsContainer}>
          <View style={styles.card}>
            <Ionicons name="car" size={24} color="#2E86DE" />
            <View>
              <Text style={styles.cardLabel}>Ahorro y Metas</Text>
              <Text style={styles.cardValue}>Ingresos semanales $4,000.00</Text>
            </View>
          </View>

          <View style={styles.card}>
            <FontAwesome5 name="utensils" size={22} color="#E67E22" />
            <View>
              <Text style={styles.cardLabel}>Comida semana pasada</Text>
              <Text style={[styles.cardValue, { color: "#E74C3C" }]}>
                -$100.00.00
              </Text>
            </View>
          </View>
        </View>

        {/* Botones de filtro */}
        <View style={styles.filterContainer}>
          <View style={[styles.filterButton, styles.filterInactive]}>
            <Text style={styles.filterText}>A diario</Text>
          </View>
          <View style={[styles.filterButton, styles.filterInactive]}>
            <Text style={styles.filterText}>Semanalmente</Text>
          </View>
          <View style={[styles.filterButton, styles.filterActive]}>
            <Text style={[styles.filterText, styles.filterActiveText]}>Mensual</Text>
          </View>
        </View>

        {/* Listado de movimientos */}
        <View style={styles.listContainer}>
          <View style={styles.listItem}>
            <MaterialIcons name="attach-money" size={24} color="#27AE60" />
            <View style={styles.listTextContainer}>
              <Text style={styles.listTitle}>Salario</Text>
              <Text style={styles.listDate}>18:27 - April 30</Text>
            </View>
            <Text style={styles.listAmount}>$4,000.00</Text>
          </View>

          <View style={styles.listItem}>
            <FontAwesome5 name="shopping-basket" size={22} color="#F39C12" />
            <View style={styles.listTextContainer}>
              <Text style={styles.listTitle}>Comestibles</Text>
              <Text style={styles.listDate}>17:00 - April 24</Text>
            </View>
            <Text style={[styles.listAmount, { color: "#E74C3C" }]}>-$100.00</Text>
          </View>

          <View style={styles.listItem}>
            <Ionicons name="home" size={22} color="#3498DB" />
            <View style={styles.listTextContainer}>
              <Text style={styles.listTitle}>Alquiler</Text>
              <Text style={styles.listDate}>8:30 - April 15</Text>
            </View>
            <Text style={[styles.listAmount, { color: "#E74C3C" }]}>-$674.40</Text>
          </View>
        </View>

        {/* Barra inferior simulada */}
        <View style={styles.bottomBar}>
          <Ionicons name="home" size={26} color="#fff" />
          <Ionicons name="stats-chart" size={26} color="#fff" />
          <Ionicons name="wallet" size={26} color="#fff" />
          <Ionicons name="person" size={26} color="#fff" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  scroll: {
    paddingBottom: 90,
  },
  header: {
    backgroundColor: "#2E86DE",
    padding: 24,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  greeting: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statBox: {
    alignItems: "center",
  },
  statLabel: {
    color: "#EAF2F8",
    fontSize: 14,
  },
  statValue: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  progressContainer: {
    marginTop: 16,
  },
  progressBar: {
    height: 10,
    backgroundColor: "#D6EAF8",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#58D68D",
  },
  progressText: {
    marginTop: 8,
    color: "#fff",
    fontSize: 13,
  },
  cardsContainer: {
    marginTop: 16,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardLabel: {
    color: "#2E4053",
    fontWeight: "600",
  },
  cardValue: {
    color: "#34495E",
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  filterInactive: {
    backgroundColor: "#D6EAF8",
  },
  filterActive: {
    backgroundColor: "#2E86DE",
  },
  filterText: {
    fontWeight: "600",
  },
  filterActiveText: {
    color: "#fff",
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  listItem: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  listTextContainer: {
    flex: 1,
    marginHorizontal: 10,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  listDate: {
    fontSize: 12,
    color: "#7B8A8B",
  },
  listAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#27AE60",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#2E86DE",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
});
