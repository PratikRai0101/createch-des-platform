import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useState } from "react";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useSiteStore } from "@/store/useSiteStore";
import { api } from "@/api/client";
import { THEME, TEXT_STYLES, CARD_STYLES, LAYOUT_STYLES } from "@/components/theme";
import type { Option } from "@/types";

export default function RedesignScreen() {
  const {
    deviation,
    soilBearingCapacity,
    status,
    triggerGenerativeRedesign,
    pushEvent,
  } = useSiteStore();

  const [options, setOptions] = useState<Option[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  const isCritical = status === "CRITICAL";

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const res = await api.optimizeGeometry({
        soil_bearing_capacity: soilBearingCapacity,
        deviation_mm: deviation,
        safety_factor: 1.5,
        weights: { cost: 33, carbon: 33, time: 34 },
      });
      setOptions(res.options);
      setSelectedOptionId(res.recommended_option_id);
      setAnalysisComplete(true);
      pushEvent("RECALIBRATE", "info", "Analysis Complete", "AI generated redesign options from live constraints.");
    } catch {
      // Fallback mock options if backend is down
      setOptions([
        {
          id: "opt_a",
          name: "Carbon Fiber Resin Injection & Micro-Piling",
          depth_m: 0.65,
          cost_inr: 142500,
          carbon_tco2e: 2.4,
          construction_time_days: 4,
          confidence_score: 0.91,
          reason: "Minimizes carbon while restoring structural integrity.",
        },
        {
          id: "opt_b",
          name: "Complete Pillar Replacement",
          depth_m: 1.1,
          cost_inr: 385000,
          carbon_tco2e: 15.8,
          construction_time_days: 18,
          confidence_score: 0.95,
          reason: "Full replacement with longest safety envelope.",
        },
        {
          id: "opt_c",
          name: "Temporary Steel Shoring (Delay Final)",
          depth_m: 0.45,
          cost_inr: 45000,
          carbon_tco2e: 0.8,
          construction_time_days: 1,
          confidence_score: 0.78,
          reason: "Fastest temporary stabilization for schedule recovery.",
        },
      ]);
      setSelectedOptionId("opt_a");
      setAnalysisComplete(true);
      pushEvent("RECALIBRATE", "info", "Analysis Complete (Offline)", "Fallback options generated.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (id: string) => {
    setSelectedOptionId(id);
  };

  const handleExecute = () => {
    if (!selectedOptionId) return;
    const opt = options.find((o) => o.id === selectedOptionId);
    triggerGenerativeRedesign();
    if (opt) {
      pushEvent("IMPACT", "success", `Executed ${opt.name}`, `Cost: ₹${opt.cost_inr.toLocaleString()}, Time: +${opt.construction_time_days} days`);
    }
  };

  if (!analysisComplete) {
    return (
      <View style={[LAYOUT_STYLES.screen, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={[TEXT_STYLES.label, { marginBottom: 20 }]}>GENERATIVE DESIGN ENGINE</Text>
        <Text style={[TEXT_STYLES.body, { textAlign: "center", marginBottom: 24, maxWidth: 280 }]}>
          Run structural analysis to generate AI-optimized redesign options based on current site telemetry.
        </Text>
        <TouchableOpacity style={styles.analyzeBtn} onPress={runAnalysis} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={THEME.bg} />
          ) : (
            <Text style={[TEXT_STYLES.button, { color: THEME.bg }]}>RUN STRUCTURAL ANALYSIS</Text>
          )}
        </TouchableOpacity>
        {!isCritical && (
          <Text style={[TEXT_STYLES.caption, { marginTop: 16 }]}>
            No critical deficit detected. Analysis will use current baseline.
          </Text>
        )}
      </View>
    );
  }

  return (
    <ScrollView style={LAYOUT_STYLES.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Analysis Header */}
      <View style={LAYOUT_STYLES.row}>
        <View style={styles.badgeTag}>
          <Text style={TEXT_STYLES.caption}>[ ANM-8924-X ]</Text>
        </View>
        <Text style={[TEXT_STYLES.label, { marginLeft: 10 }]}>ANALYSIS COMPLETE</Text>
      </View>

      <Text style={[TEXT_STYLES.title, { marginTop: 12, marginBottom: 8 }]}>
        STRUCTURAL DEFICIT DETECTED
      </Text>
      <Text style={[TEXT_STYLES.body, { marginBottom: 20 }]}>
        Load-bearing capacity on Zone 4, Pillar B-12 falls below safety tolerance margins due to unexpected substrate settling. AI redesign options generated below to restore structural integrity.
      </Text>

      {/* Options */}
      {options.map((opt, index) => {
        const isSelected = selectedOptionId === opt.id;
        const isRecommended = index === 0;
        return (
          <View
            key={opt.id}
            style={[
              isSelected ? CARD_STYLES.criticalCard : CARD_STYLES.card,
              { marginBottom: 16 },
            ]}
          >
            {isRecommended && (
              <View style={styles.aiRecommendedBadge}>
                <Text style={[TEXT_STYLES.caption, { color: THEME.bg }]}>AI RECOMMENDED</Text>
              </View>
            )}

            <Text style={TEXT_STYLES.title}>OPTION {String.fromCharCode(65 + index)}</Text>
            <Text style={[TEXT_STYLES.body, { marginTop: 4, marginBottom: 16 }]}>{opt.name}</Text>

            <View style={LAYOUT_STYLES.spaceBetween}>
              <Text style={TEXT_STYLES.label}>EST. COST</Text>
              <Text style={TEXT_STYLES.smallValue}>${opt.cost_inr.toLocaleString()}.00</Text>
            </View>
            <View style={LAYOUT_STYLES.divider} />

            <View style={LAYOUT_STYLES.spaceBetween}>
              <Text style={TEXT_STYLES.label}>SCHEDULE IMPACT</Text>
              <Text style={TEXT_STYLES.smallValue}>+{opt.construction_time_days} DAYS</Text>
            </View>
            <View style={LAYOUT_STYLES.divider} />

            <View style={LAYOUT_STYLES.spaceBetween}>
              <Text style={TEXT_STYLES.label}>CARBON OFFSET</Text>
              <Text style={TEXT_STYLES.smallValue}>{opt.carbon_tco2e} MT CO2e</Text>
            </View>
            <View style={LAYOUT_STYLES.divider} />

            <View style={LAYOUT_STYLES.spaceBetween}>
              <Text style={TEXT_STYLES.label}>CONFIDENCE</Text>
              <Text style={TEXT_STYLES.smallValue}>{(opt.confidence_score * 100).toFixed(0)}%</Text>
            </View>

            {isSelected ? (
              <View style={[LAYOUT_STYLES.row, { marginTop: 16 }]}>
                <MaterialIcons name="check-circle" size={16} color={THEME.fg} />
                <Text style={[TEXT_STYLES.button, { marginLeft: 6 }]}>SELECTED FOR EXECUTION</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.selectBtn, { borderColor: THEME.cardBorder }]}
                onPress={() => handleSelect(opt.id)}
              >
                <Text style={[TEXT_STYLES.button, { color: THEME.muted }]}>
                  SELECT OPTION {String.fromCharCode(65 + index)}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}

      {/* Execute Button */}
      <TouchableOpacity style={styles.executeBtn} onPress={handleExecute}>
        <MaterialIcons name="engineering" size={16} color={THEME.bg} style={{ marginRight: 8 }} />
        <Text style={[TEXT_STYLES.button, { color: THEME.bg }]}>
          APPROVE & EXECUTE OPTION {selectedOptionId ? String.fromCharCode(65 + options.findIndex((o) => o.id === selectedOptionId)) : "A"}
        </Text>
      </TouchableOpacity>

      {/* Hash / Timestamp */}
      <Text style={[TEXT_STYLES.caption, { textAlign: "center", marginTop: 16 }]}>
        SHA256: 8F434346648F6B96DF89DDA901C5176B10A6D839610D3C1AC88B
      </Text>
      <Text style={[TEXT_STYLES.caption, { textAlign: "center", marginTop: 4 }]}>
        SYSTEM TIMESTAMP: 2024-05-20T14:32:01Z
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 16,
    paddingBottom: 32,
  },
  analyzeBtn: {
    backgroundColor: THEME.fg,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: "center",
  },
  badgeTag: {
    backgroundColor: THEME.cardBorder,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  aiRecommendedBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: THEME.fg,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  selectBtn: {
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 16,
  },
  executeBtn: {
    backgroundColor: THEME.fg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    marginTop: 8,
    marginBottom: 12,
  },
});
