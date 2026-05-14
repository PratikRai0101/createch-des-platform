import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch } from "react-native";
import { useState } from "react";
import { useSiteStore } from "@/store/useSiteStore";
import { THEME, TEXT_STYLES, CARD_STYLES, LAYOUT_STYLES } from "@/components/theme";
import { api } from "@/api/client";

export default function SettingsScreen() {
  const {
    pipelineConnected,
    isSimulating,
    setIsSimulating,
    resetSimulation,
    injectDisaster,
    triggerGenerativeRedesign,
    anomalyDetected,
    aiOptimized,
    controlMode,
    setControlMode,
  } = useSiteStore();

  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking");
  const [autoMode, setAutoMode] = useState(controlMode === "AUTO");

  const checkBackend = async () => {
    setBackendStatus("checking");
    try {
      await api.health();
      setBackendStatus("online");
    } catch {
      setBackendStatus("offline");
    }
  };

  const toggleControlMode = (value: boolean) => {
    setAutoMode(value);
    setControlMode(value ? "AUTO" : "MANUAL");
  };

  return (
    <ScrollView style={LAYOUT_STYLES.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={[TEXT_STYLES.title, { marginTop: 16, marginBottom: 20 }]}>SYSTEM SETTINGS</Text>

      {/* Connection Status */}
      <View style={[CARD_STYLES.card, LAYOUT_STYLES.sectionGap]}>
        <Text style={[TEXT_STYLES.label, { marginBottom: 12 }]}>BACKEND CONNECTION</Text>
        <View style={LAYOUT_STYLES.spaceBetween}>
          <View style={LAYOUT_STYLES.row}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor:
                    backendStatus === "online"
                      ? "#000000"
                      : backendStatus === "checking"
                      ? "#999999"
                      : "#CC0000",
                },
              ]}
            />
            <Text style={[TEXT_STYLES.body, { marginLeft: 8, color: THEME.fg }]}>
              {backendStatus === "online"
                ? "CONNECTED"
                : backendStatus === "checking"
                ? "CHECKING..."
                : "OFFLINE"}
            </Text>
          </View>
          <TouchableOpacity style={styles.smallBtn} onPress={checkBackend}>
            <Text style={TEXT_STYLES.caption}>TEST</Text>
          </TouchableOpacity>
        </View>

        <View style={LAYOUT_STYLES.divider} />

        <View style={LAYOUT_STYLES.spaceBetween}>
          <View style={LAYOUT_STYLES.row}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: pipelineConnected ? "#000000" : "#CC0000" },
              ]}
            />
            <Text style={[TEXT_STYLES.body, { marginLeft: 8, color: THEME.fg }]}>
              {pipelineConnected ? "PIPELINE SYNC ACTIVE" : "PIPELINE SYNC INACTIVE"}
            </Text>
          </View>
        </View>
      </View>

      {/* Control Mode */}
      <View style={[CARD_STYLES.card, LAYOUT_STYLES.sectionGap]}>
        <Text style={[TEXT_STYLES.label, { marginBottom: 12 }]}>CONTROL MODE</Text>
        <View style={LAYOUT_STYLES.spaceBetween}>
          <Text style={[TEXT_STYLES.body, { color: THEME.fg }]}>
            {autoMode ? "AUTONOMOUS EXECUTION" : "MANUAL OVERRIDE"}
          </Text>
          <Switch
            value={autoMode}
            onValueChange={toggleControlMode}
            trackColor={{ false: "#E5E5E5", true: "#000000" }}
            thumbColor={"#FFFFFF"}
          />
        </View>
      </View>

      {/* Simulation Controls */}
      <Text style={[TEXT_STYLES.label, { marginBottom: 12 }]}>SIMULATION CONTROLS</Text>

      <TouchableOpacity
        style={[styles.controlBtn, isSimulating && styles.controlBtnActive]}
        onPress={() => setIsSimulating(!isSimulating)}
      >
        <Text style={[TEXT_STYLES.button, isSimulating ? { color: THEME.bg } : undefined]}>
          {isSimulating ? "HALT SIMULATION" : "START LIVE SIMULATION"}
        </Text>
      </TouchableOpacity>

      {anomalyDetected && !aiOptimized && (
        <TouchableOpacity style={[styles.controlBtn, { backgroundColor: THEME.fg, borderColor: THEME.fg }]} onPress={triggerGenerativeRedesign}>
          <Text style={[TEXT_STYLES.button, { color: THEME.bg }]}>APPLY AI OPTIMIZATION</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.controlBtn} onPress={injectDisaster}>
        <Text style={TEXT_STYLES.button}>INJECT DISASTER SCENARIO</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.controlBtn, { borderColor: THEME.cardBorder }]} onPress={resetSimulation}>
        <Text style={[TEXT_STYLES.button, { color: THEME.muted }]}>RESET SIMULATION</Text>
      </TouchableOpacity>

      {/* System Info */}
      <View style={[CARD_STYLES.card, { marginTop: 24 }]}>
        <Text style={[TEXT_STYLES.label, { marginBottom: 12 }]}>SYSTEM INFO</Text>
        <View style={LAYOUT_STYLES.spaceBetween}>
          <Text style={TEXT_STYLES.caption}>PLATFORM</Text>
          <Text style={[TEXT_STYLES.caption, { color: THEME.fg }]}>GENESIS MOBILE v1.0.0</Text>
        </View>
        <View style={[LAYOUT_STYLES.spaceBetween, { marginTop: 8 }]}>
          <Text style={TEXT_STYLES.caption}>ENGINE</Text>
          <Text style={[TEXT_STYLES.caption, { color: THEME.fg }]}>CreaTech DES</Text>
        </View>
        <View style={[LAYOUT_STYLES.spaceBetween, { marginTop: 8 }]}>
          <Text style={TEXT_STYLES.caption}>API BASE</Text>
          <Text style={[TEXT_STYLES.caption, { color: THEME.fg }]}>http://127.0.0.1:8000</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 100,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  smallBtn: {
    borderWidth: 1,
    borderColor: THEME.cardBorder,
    paddingHorizontal: 10,
    paddingVertical: 4,
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
});
