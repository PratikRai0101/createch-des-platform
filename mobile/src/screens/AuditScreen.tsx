import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useState } from "react";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useSiteStore } from "@/store/useSiteStore";
import { THEME, TEXT_STYLES, CARD_STYLES, LAYOUT_STYLES } from "@/components/theme";
import type { EventSeverity, ScenarioEvent } from "@/types";

const TABS = ["ALL", "ANOMALIES", "EXECUTIONS"] as const;

type FilterTab = (typeof TABS)[number];

function severityColor(sev: EventSeverity): string {
  switch (sev) {
    case "critical":
      return "#CC0000";
    case "warning":
      return "#000000";
    case "success":
      return "#000000";
    default:
      return "#666666";
  }
}

function severityDotColor(sev: EventSeverity): string {
  switch (sev) {
    case "critical":
      return "#CC0000";
    case "warning":
      return "#000000";
    case "success":
      return "#000000";
    default:
      return "#666666";
  }
}

export default function AuditScreen() {
  const { scenarioEvents, aiOptimized, anomalyDetected } = useSiteStore();
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");

  const exportAuditTrail = async () => {
    try {
      const payload = {
        exported_at: new Date().toISOString(),
        scenario_state: aiOptimized ? "IMPACT" : anomalyDetected ? "RECALIBRATE" : "SENSE/DETECT",
        total_events: scenarioEvents.length,
        events: scenarioEvents,
      };
      const json = JSON.stringify(payload, null, 2);
      const filename = `des-audit-trail-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.json`;
      const dir = FileSystem.cacheDirectory ?? "";
      const fileUri = dir + filename;
      await FileSystem.writeAsStringAsync(fileUri, json, { encoding: FileSystem.EncodingType.UTF8 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert("Export Ready", `File saved to cache: ${filename}`);
      }
    } catch (err) {
      Alert.alert("Export Failed", String(err));
    }
  };

  const filteredEvents = scenarioEvents.filter((evt) => {
    if (activeTab === "ALL") return true;
    if (activeTab === "ANOMALIES") return evt.severity === "critical" || evt.severity === "warning";
    if (activeTab === "EXECUTIONS") return evt.severity === "success" || evt.stage === "IMPACT";
    return true;
  });

  // Reverse so newest is top
  const displayEvents = [...filteredEvents].reverse();

  return (
    <View style={LAYOUT_STYLES.screen}>
      <View style={LAYOUT_STYLES.spaceBetween}>
        <View>
          <Text style={[TEXT_STYLES.title, { marginTop: 16, marginBottom: 8 }]}>AUDIT TRAIL</Text>
          <Text style={[TEXT_STYLES.body, { marginBottom: 20 }]}>
            Immutable event log and execution history.
          </Text>
        </View>
        <TouchableOpacity style={styles.exportBtn} onPress={exportAuditTrail}>
          <Text style={TEXT_STYLES.caption}>EXPORT</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabRow}>
        {TABS.map((tab) => (
          <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={styles.tabItem}>
            <Text
              style={[
                TEXT_STYLES.label,
                {
                  color: activeTab === tab ? THEME.fg : THEME.lightMuted,
                  fontWeight: activeTab === tab ? "700" : "400",
                },
              ]}
            >
              {tab}
            </Text>
            {activeTab === tab && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {displayEvents.map((evt, index) => (
          <View key={evt.id} style={styles.timelineItem}>
            {/* Timeline connector */}
            <View style={styles.timelineCol}>
              <View style={[styles.dot, { backgroundColor: severityDotColor(evt.severity) }]} />
              {index < displayEvents.length - 1 && (
                <View style={styles.connector} />
              )}
            </View>

            {/* Event Card */}
            <View style={styles.eventCard}>
              <Text style={[TEXT_STYLES.caption, { color: severityColor(evt.severity), marginBottom: 6 }]}>
                {new Date().toISOString().slice(0, 10).replace(/-/g, ".")} :: {evt.ts}
              </Text>

              <View style={[LAYOUT_STYLES.row, { marginBottom: 6 }]}>
                <Text style={[TEXT_STYLES.title, { fontSize: 14, flex: 1 }]}>{evt.title.toUpperCase()}</Text>
                {evt.severity === "warning" && (
                  <View style={styles.manualBadge}>
                    <Text style={TEXT_STYLES.caption}>MANUAL</Text>
                  </View>
                )}
              </View>

              <Text style={[TEXT_STYLES.body, { marginBottom: 8 }]}>{evt.detail}</Text>

              <Text style={[TEXT_STYLES.caption, { color: THEME.lightMuted, fontSize: 9 }]}>
                {evt.id}
              </Text>
            </View>
          </View>
        ))}

        {displayEvents.length === 0 && (
          <Text style={[TEXT_STYLES.body, { textAlign: "center", marginTop: 40 }]}>
            No events match the selected filter.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 100,
  },
  tabRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: THEME.cardBorder,
    marginBottom: 16,
  },
  tabItem: {
    marginRight: 20,
    paddingBottom: 8,
    position: "relative",
  },
  tabUnderline: {
    position: "absolute",
    bottom: -1,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: THEME.fg,
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: 20,
  },
  timelineCol: {
    width: 20,
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connector: {
    width: 1,
    flex: 1,
    backgroundColor: THEME.cardBorder,
    marginTop: 4,
  },
  eventCard: {
    flex: 1,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.cardBorder,
    marginLeft: 12,
  },
  manualBadge: {
    borderWidth: 1,
    borderColor: THEME.cardBorder,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  exportBtn: {
    borderWidth: 1,
    borderColor: THEME.fg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "flex-start",
    marginTop: 16,
  },
});
