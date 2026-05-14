import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useSiteStore } from "@/store/useSiteStore";
import { THEME, TEXT_STYLES, CARD_STYLES, LAYOUT_STYLES } from "@/components/theme";

const PIPELINE_STAGES = ["Sense", "Detect", "Redesign", "Execute", "Audit"];

export default function DashboardScreen() {
  const {
    status,
    deviation,
    soilBearingCapacity,
    currentEstimatedCost,
    currentScheduleImpact,
    scenarioStage,
    isSimulating,
    setIsSimulating,
    anomalyDetected,
    aiOptimized,
    triggerGenerativeRedesign,
    resetSimulation,
    injectDisaster,
  } = useSiteStore();

  const isCritical = status === "CRITICAL";
  const activePipelineIndex = PIPELINE_STAGES.findIndex(
    (s) => s.toUpperCase() === scenarioStage || (scenarioStage === "RECALIBRATE" && s === "Redesign")
  );

  return (
    <ScrollView style={LAYOUT_STYLES.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Site Info */}
      <View style={LAYOUT_STYLES.sectionGap}>
        <Text style={[TEXT_STYLES.label, { marginBottom: 8 }]}>
          [ SITE: ALPHA // SECTOR 4 ]
        </Text>
      </View>

      {/* Critical State Card */}
      {isCritical && (
        <View style={[CARD_STYLES.criticalCard, LAYOUT_STYLES.sectionGap]}>
          <View style={LAYOUT_STYLES.row}>
            <MaterialIcons name="warning" size={18} color={THEME.fg} style={{ marginRight: 8 }} />
            <Text style={[TEXT_STYLES.label, { color: THEME.fg }]}>CRITICAL STATE DETECTED</Text>
          </View>
          <Text style={[TEXT_STYLES.value, { marginTop: 12, marginBottom: 4 }]}>
            +{deviation.toFixed(1)}mm
          </Text>
          <Text style={TEXT_STYLES.body}>
            Foundation shift exceeding strict tolerances.
          </Text>
        </View>
      )}

      {!isCritical && (
        <View style={[CARD_STYLES.card, LAYOUT_STYLES.sectionGap]}>
          <View style={LAYOUT_STYLES.row}>
            <MaterialIcons name="check-circle" size={18} color={THEME.muted} style={{ marginRight: 8 }} />
            <Text style={[TEXT_STYLES.label, { color: THEME.muted }]}>SYSTEM NOMINAL</Text>
          </View>
          <Text style={[TEXT_STYLES.value, { marginTop: 12, marginBottom: 4, color: THEME.muted }]}>
            +{deviation.toFixed(1)}mm
          </Text>
          <Text style={TEXT_STYLES.body}>All parameters within tolerance envelope.</Text>
        </View>
      )}

      {/* Pipeline Status */}
      <View style={LAYOUT_STYLES.sectionGap}>
        <Text style={[TEXT_STYLES.label, { marginBottom: 12 }]}>PIPELINE STATUS</Text>
        <View style={styles.pipelineContainer}>
          {PIPELINE_STAGES.map((stage, index) => {
            const isActive = index <= activePipelineIndex;
            const isCurrent = index === activePipelineIndex;
            return (
              <View key={stage} style={styles.pipelineItem}>
                <Text
                  style={[
                    TEXT_STYLES.label,
                    {
                      color: isActive ? THEME.fg : THEME.lightMuted,
                      fontWeight: isCurrent ? "700" : "400",
                    },
                  ]}
                >
                  {stage}
                </Text>
                {isCurrent && <View style={styles.pipelineUnderline} />}
              </View>
            );
          })}
        </View>
      </View>

      {/* Live Project Cost Overrun */}
      <View style={[CARD_STYLES.card, LAYOUT_STYLES.sectionGap]}>
        <Text style={[TEXT_STYLES.label, { marginBottom: 8 }]}>LIVE PROJECT COST OVERRUN</Text>
        <Text style={TEXT_STYLES.value}>₹{currentEstimatedCost.toLocaleString()}</Text>
      </View>

      {/* Metrics Grid */}
      <View style={LAYOUT_STYLES.gridRow}>
        <View style={CARD_STYLES.gridItem}>
          <Text style={[TEXT_STYLES.label, { marginBottom: 8 }]}>SOIL CAPACITY</Text>
          <Text style={TEXT_STYLES.smallValue}>{Math.round(soilBearingCapacity)} kPa</Text>
        </View>
        <View style={CARD_STYLES.gridItem}>
          <Text style={[TEXT_STYLES.label, { marginBottom: 8 }]}>WORKERS ONSITE</Text>
          <Text style={TEXT_STYLES.smallValue}>124</Text>
        </View>
      </View>

      <View style={LAYOUT_STYLES.gridRow}>
        <View style={CARD_STYLES.gridItem}>
          <Text style={[TEXT_STYLES.label, { marginBottom: 8 }]}>CARBON</Text>
          <Text style={TEXT_STYLES.smallValue}>2.4 T</Text>
        </View>
        <View style={CARD_STYLES.gridItem}>
          <Text style={[TEXT_STYLES.label, { marginBottom: 8 }]}>SCHEDULE</Text>
          <Text style={[TEXT_STYLES.smallValue, { color: currentScheduleImpact > 0 ? THEME.critical : THEME.fg }]}>
            {currentScheduleImpact > 0 ? `+${Math.round(currentScheduleImpact)}` : "-4"} DAYS
          </Text>
        </View>
      </View>

      {/* Simulation Controls */}
      <View style={LAYOUT_STYLES.sectionGap}>
        <Text style={[TEXT_STYLES.label, { marginBottom: 12 }]}>SIMULATION CONTROL</Text>
        <TouchableOpacity
          style={[styles.controlBtn, isSimulating && styles.controlBtnActive]}
          onPress={() => setIsSimulating(!isSimulating)}
        >
          <Text style={TEXT_STYLES.button}>
            {isSimulating ? "STOP LIVE SIMULATION" : "START LIVE SIMULATION"}
          </Text>
        </TouchableOpacity>

        {anomalyDetected && !aiOptimized && (
          <TouchableOpacity style={[styles.controlBtn, styles.controlBtnDark]} onPress={triggerGenerativeRedesign}>
            <Text style={[TEXT_STYLES.button, { color: THEME.bg }]}>APPLY AI OPTIMIZATION</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.controlBtn} onPress={injectDisaster}>
          <Text style={TEXT_STYLES.button}>INJECT DISASTER SCENARIO</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.controlBtn, { borderColor: THEME.cardBorder }]} onPress={resetSimulation}>
          <Text style={[TEXT_STYLES.button, { color: THEME.muted }]}>RESET SIMULATION</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 16,
    paddingBottom: 32,
  },
  pipelineContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: THEME.cardBorder,
    paddingBottom: 8,
  },
  pipelineItem: {
    alignItems: "center",
    paddingVertical: 4,
  },
  pipelineUnderline: {
    position: "absolute",
    bottom: -9,
    width: "120%",
    height: 2,
    backgroundColor: THEME.fg,
  },
  controlBtn: {
    borderWidth: 1,
    borderColor: THEME.fg,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 8,
    backgroundColor: THEME.bg,
  },
  controlBtnActive: {
    backgroundColor: THEME.fg,
  },
  controlBtnDark: {
    backgroundColor: THEME.fg,
    borderColor: THEME.fg,
  },
});
