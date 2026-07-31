import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { useCulturalEvents, type CulturalEvent } from "@/hooks/useFinancing";
import { colors, radii, spacing } from "@/theme";

const MONTHS_FR = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];

function monthInRange(month: number, start: number, end: number): boolean {
  if (start <= end) return month >= start && month <= end;
  // Plage qui chevauche l'année (ex. Oct → Fév)
  return month >= start || month <= end;
}

function cellColor(events: CulturalEvent[], cropType: string, month: number): string {
  const matching = events.filter(
    (e) => e.cropType === cropType && monthInRange(month, e.monthStart, e.monthEnd),
  );
  if (matching.length === 0) return colors.gray[50];
  const types = matching.map((e) => e.eventType);
  if (types.includes("harvest")) return colors.amber[400];
  if (types.includes("planting")) return colors.green[600];
  if (types.includes("fertilizing")) return "#93C5FD";
  if (types.includes("irrigation")) return "#7DD3FC";
  return colors.gray[200];
}

export function CulturalCalendar() {
  const { data: events = [], isLoading } = useCulturalEvents();
  const currentMonth = new Date().getMonth() + 1;
  const cropTypes = [...new Set(events.map((e) => e.cropType))].sort();

  return (
    <View style={styles.root} testID="cultural-calendar">
      <View style={styles.headerRow}>
        <Text style={styles.title}>Calendrier cultural</Text>
        <View style={styles.legend}>
          <LegendDot color={colors.green[600]} label="Semis" />
          <LegendDot color={colors.amber[400]} label="Récolte" />
          <LegendDot color="#93C5FD" label="Engrais" />
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.green[700]} style={{ marginVertical: 32 }} />
      ) : cropTypes.length === 0 ? (
        <Text style={styles.empty}>Aucun événement cultural</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={styles.row}>
              <Text style={[styles.cropLabel, styles.headerLabel]}>Culture</Text>
              {MONTHS_FR.map((m, i) => (
                <View key={m} style={styles.monthCol}>
                  <Text
                    style={[
                      styles.monthLabel,
                      i + 1 === currentMonth && styles.monthLabelActive,
                    ]}
                  >
                    {m}
                  </Text>
                  {i + 1 === currentMonth ? <View style={styles.monthDot} /> : null}
                </View>
              ))}
            </View>

            {cropTypes.map((crop) => (
              <View key={crop} style={styles.row}>
                <Text style={styles.cropLabel} numberOfLines={1}>
                  {crop}
                </Text>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <View
                    key={month}
                    style={[
                      styles.cell,
                      { backgroundColor: cellColor(events, crop, month) },
                      month === currentMonth && styles.cellCurrent,
                    ]}
                  />
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      <Text style={styles.todayHint}>Aujourd’hui — {MONTHS_FR[currentMonth - 1]}</Text>
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendSwatch, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const CELL = 22;
const CROP_W = 88;

const styles = StyleSheet.create({
  root: { gap: spacing.md },
  headerRow: { gap: spacing.sm },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.gray[900],
    fontFamily: "PlusJakartaSans_700Bold",
  },
  legend: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  legendSwatch: { width: 10, height: 10, borderRadius: 2 },
  legendText: { fontSize: 10, fontWeight: "700", color: colors.gray[500] },
  empty: { textAlign: "center", color: colors.gray[400], paddingVertical: 40, fontSize: 13 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  cropLabel: {
    width: CROP_W,
    fontSize: 12,
    fontWeight: "700",
    color: colors.gray[900],
    paddingRight: 8,
  },
  headerLabel: {
    fontSize: 10,
    color: colors.gray[500],
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  monthCol: { width: CELL + 4, alignItems: "center" },
  monthLabel: { fontSize: 9, fontWeight: "700", color: colors.gray[400] },
  monthLabelActive: { color: colors.green[700] },
  monthDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.green[700],
    marginTop: 2,
  },
  cell: {
    width: CELL,
    height: 28,
    borderRadius: radii.lg / 2,
    marginHorizontal: 2,
  },
  cellCurrent: {
    borderWidth: 2,
    borderColor: colors.green[700],
  },
  todayHint: {
    fontSize: 11,
    color: colors.gray[400],
    textAlign: "center",
    marginTop: spacing.sm,
  },
});
