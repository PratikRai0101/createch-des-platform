import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useSiteStore } from "@/store/useSiteStore";
import { THEME, TEXT_STYLES, CARD_STYLES, LAYOUT_STYLES } from "@/components/theme";
import type { SensorNode } from "@/types";

const SENSOR_NODES: SensorNode[] = [
  { id: "S-7A01", type: "Geotech", status: "online", battery: 94 },
  { id: "S-7A02", type: "Geotech", status: "online", battery: 91 },
  { id: "L-2B14", type: "Laser Scan", status: "degraded", battery: 45 },
  { id: "L-2B15", type: "Laser Scan", status: "online", battery: 88 },
  { id: "M-9C22", type: "Material", status: "offline", battery: 0 },
  { id: "M-9C23", type: "Material", status: "online", battery: 99 },
  { id: "V-1A05", type: "Vibration", status: "online", battery: 76 },
  { id: "V-1A06", type: "Vibration", status: "online", battery: 74 },
  { id: "C-4D12", type: "CCTV", status: "online", battery: 100 },
  { id: "C-4D13", type: "CCTV", status: "online", battery: 100 },
];

function SensorStatusIcon({ status }: { status: SensorNode["status"] }) {
  if (status === "online") return <MaterialIcons name="wifi" size={16} color="#000000" />;
  if (status === "degraded") return <MaterialIcons name="error-outline" size={16} color="#000000" />;
  return <MaterialIcons name="wifi-off" size={16} color="#CC0000" />;
}

function BatteryBar({ battery }: { battery: number }) {
  const color = battery > 50 ? "#000000" : battery > 20 ? "#000000" : "#CC0000";
  return (
    <View style={styles.batteryTrack}>
      <View style={[styles.batteryFill, { width: `${battery}%`, backgroundColor: color }]} />
    </View>
  );
}

const MOCK_LOGS = [
  { ts: "14:02:33.401", level: "INFO" as const, msg: "Node-7A connected. Handshake OK." },
  { ts: "14:02:34.112", level: "DATA" as const, msg: 'Payload: { "sbc": 452.1, "dev": 2.3 }' },
  { ts: "14:02:35.805", level: "WARN" as const, msg: "Node-12B latency > 500ms (742ms)." },
  { ts: "14:02:36.002", level: "DATA" as const, msg: 'Payload: { "sbc": 390.4, "dev": 5.1 }' },
  { ts: "14:02:38.541", level: "ERROR" as const, msg: "Node-4C heartbeat timeout. Connection dropped." },
  { ts: "14:02:40.120", level: "INFO" as const, msg: "Generative Engine acknowledged frame 88412." },
];

export default function MapScreen() {
  const { machineryState, activeCommands, executedCommands } = useSiteStore();

  return (
    <ScrollView style={LAYOUT_STYLES.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Sector Title */}
      <Text style={[TEXT_STYLES.title, { marginBottom: 12 }]}>SECTOR 7G OVERVIEW</Text>

      {/* Meta Tags */}
      <View style={[LAYOUT_STYLES.row, { marginBottom: 20 }]}>
        <View style={styles.metaTag}>
          <Text style={TEXT_STYLES.caption}>COORD: 45.9N 12.1W</Text>
        </View>
        <View style={[styles.metaTag, { marginLeft: 8 }]}>
          <Text style={TEXT_STYLES.caption}>SCALE: 1:500</Text>
        </View>
      </View>

      {/* Map Visualization */}
      <View style={[styles.mapContainer, LAYOUT_STYLES.sectionGap]}>
        {/* Grid dots background representation */}
        <View style={styles.gridArea}>
          {/* Zone Alpha Circle */}
          <View style={styles.zoneCircle}>
            <Text style={TEXT_STYLES.caption}>ZONE ALPHA</Text>
            <View style={styles.zoneDot} />
            <View style={[styles.zoneDot, { left: 28, top: 12 }]} />
          </View>

          {/* W-GRP-A label */}
          <View style={styles.mapLabel}>
            <Text style={TEXT_STYLES.caption}>W-GRP-A</Text>
          </View>

          {/* CRN-2 */}
          <View style={styles.craneMarker}>
            <View style={styles.craneSquare} />
            <View style={styles.craneLabel}>
              <Text style={TEXT_STYLES.caption}>CRN-2</Text>
            </View>
          </View>

          {/* EXC-1 */}
          <View style={styles.excavatorMarker}>
            <View style={styles.excavatorSquare} />
            <View style={styles.excavatorLabel}>
              <Text style={TEXT_STYLES.caption}>EXC-1</Text>
            </View>
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={LAYOUT_STYLES.row}>
            <View style={styles.legendBox} />
            <Text style={[TEXT_STYLES.caption, { marginLeft: 6 }]}>HEAVY EQ</Text>
          </View>
          <View style={[LAYOUT_STYLES.row, { marginTop: 6 }]}>
            <View style={styles.legendDot} />
            <Text style={[TEXT_STYLES.caption, { marginLeft: 6 }]}>PERSONNEL</Text>
          </View>
          <View style={[LAYOUT_STYLES.row, { marginTop: 6 }]}>
            <View style={styles.legendDashed} />
            <Text style={[TEXT_STYLES.caption, { marginLeft: 6 }]}>HAZARD BNDRY</Text>
          </View>
        </View>
      </View>

      {/* Active Assets */}
      <Text style={[TEXT_STYLES.label, { marginBottom: 12 }]}>ACTIVE ASSETS</Text>

      {/* EXC-1 Card */}
      <View style={[CARD_STYLES.card, LAYOUT_STYLES.sectionGap]}>
        <View style={LAYOUT_STYLES.spaceBetween}>
          <View>
            <Text style={TEXT_STYLES.title}>EXC-1</Text>
            <Text style={[TEXT_STYLES.caption, { marginTop: 2 }]}>EXCAVATOR CL-A</Text>
          </View>
          <Text style={[TEXT_STYLES.badge, { color: THEME.muted }]}>[ ACTIVE ]</Text>
        </View>

        <View style={LAYOUT_STYLES.divider} />

        <View style={LAYOUT_STYLES.spaceBetween}>
          <View>
            <Text style={[TEXT_STYLES.label, { marginBottom: 4 }]}>OPERATOR</Text>
            <Text style={[TEXT_STYLES.body, { color: THEME.fg }]}>J. MILLER #842</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={[TEXT_STYLES.label, { marginBottom: 4 }]}>TELEMETRY</Text>
            <Text style={[TEXT_STYLES.body, { color: THEME.fg }]}>NOMINAL</Text>
          </View>
        </View>

        <View style={{ marginTop: 12 }}>
          <Text style={[TEXT_STYLES.label, { marginBottom: 4 }]}>CURRENT TASK</Text>
          <Text style={[TEXT_STYLES.body, { color: THEME.fg }]}>TRENCHING S-7G-A</Text>
        </View>

        <TouchableOpacity style={styles.actionBtn}>
          <Text style={TEXT_STYLES.button}>VIEW SCHEMATICS</Text>
        </TouchableOpacity>

        <View style={{ marginTop: 8 }}>
          <Text style={TEXT_STYLES.caption}>
            POS: X{machineryState.excavator.x.toFixed(1)} Y{machineryState.excavator.y.toFixed(1)} Z{machineryState.excavator.z.toFixed(1)}
          </Text>
          <Text style={TEXT_STYLES.caption}>STATUS: {machineryState.excavator.status}</Text>
        </View>
      </View>

      {/* CRN-2 Card */}
      <View style={[CARD_STYLES.card, LAYOUT_STYLES.sectionGap]}>
        <View style={LAYOUT_STYLES.spaceBetween}>
          <View>
            <Text style={TEXT_STYLES.title}>CRN-2</Text>
            <Text style={[TEXT_STYLES.caption, { marginTop: 2 }]}>TOWER CRANE</Text>
          </View>
          <Text style={[TEXT_STYLES.badge, { color: THEME.lightMuted }]}>[ IDLE ]</Text>
        </View>

        <View style={LAYOUT_STYLES.divider} />

        <View style={LAYOUT_STYLES.spaceBetween}>
          <View>
            <Text style={[TEXT_STYLES.label, { marginBottom: 4 }]}>OPERATOR</Text>
            <Text style={[TEXT_STYLES.body, { color: THEME.fg }]}>UNASSIGNED</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={[TEXT_STYLES.label, { marginBottom: 4 }]}>WIND SHEAR</Text>
            <Text style={[TEXT_STYLES.body, { color: THEME.fg }]}>12 KNTS</Text>
          </View>
        </View>

        <View style={{ marginTop: 12 }}>
          <Text style={[TEXT_STYLES.label, { marginBottom: 4 }]}>NEXT SCHEDULED TASK</Text>
          <Text style={[TEXT_STYLES.body, { color: THEME.fg }]}>BEAM LIFT S-7G-B (14:00)</Text>
        </View>

        <TouchableOpacity style={[styles.actionBtn, { borderColor: THEME.cardBorder }]}>
          <Text style={[TEXT_STYLES.button, { color: THEME.muted }]}>MAINTENANCE LOG</Text>
        </TouchableOpacity>

        <View style={{ marginTop: 8 }}>
          <Text style={TEXT_STYLES.caption}>
            POS: X{machineryState.crane.x.toFixed(1)} Y{machineryState.crane.y.toFixed(1)} Z{machineryState.crane.z.toFixed(1)}
          </Text>
          <Text style={TEXT_STYLES.caption}>STATUS: {machineryState.crane.status}</Text>
        </View>
      </View>

      {/* Edge Gateway Terminal */}
      <View style={LAYOUT_STYLES.sectionGap}>
        <Text style={[TEXT_STYLES.label, { marginBottom: 12 }]}>EDGE GATEWAY TERMINAL</Text>
        <View style={[styles.terminalCard, LAYOUT_STYLES.sectionGap]}>
          {/* Terminal Header */}
          <View style={styles.terminalHeader}>
            <View style={LAYOUT_STYLES.row}>
              <View style={[styles.terminalDot, { backgroundColor: "#CC0000" }]} />
              <View style={[styles.terminalDot, { backgroundColor: "#000000", marginLeft: 4 }]} />
              <View style={[styles.terminalDot, { backgroundColor: "#000000", marginLeft: 4 }]} />
            </View>
            <Text style={[TEXT_STYLES.caption, { color: "#666666" }]}>EDGE GATEWAY</Text>
          </View>

          {/* Terminal Logs */}
          <View style={styles.terminalBody}>
            {MOCK_LOGS.map((log, i) => (
              <View key={i} style={styles.terminalRow}>
                <Text style={[TEXT_STYLES.caption, { color: "#666666", width: 90 }]}>[{log.ts}]</Text>
                <Text
                  style={[
                    TEXT_STYLES.caption,
                    {
                      width: 50,
                      color:
                        log.level === "INFO"
                          ? "#000000"
                          : log.level === "DATA"
                          ? "#000000"
                          : log.level === "WARN"
                          ? "#000000"
                          : "#CC0000",
                      fontWeight: "700",
                    },
                  ]}
                >
                  {log.level}
                </Text>
                <Text style={[TEXT_STYLES.caption, { flex: 1, color: "#333333" }]}>{log.msg}</Text>
              </View>
            ))}
          </View>

          {/* Active G-Code Queue */}
          {activeCommands.length > 0 && (
            <View style={styles.commandBlock}>
              <Text style={[TEXT_STYLES.label, { marginBottom: 8, color: "#000000" }]}>ACTIVE G-CODE QUEUE</Text>
              {activeCommands.slice(-5).map((command, idx) => (
                <View key={`${command}-${idx}`} style={styles.commandRow}>
                  <Text style={[TEXT_STYLES.caption, { color: "#000000" }]}>{"  "}{command}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Executed Commands */}
          {executedCommands.length > 0 && (
            <View style={styles.commandBlock}>
              <Text style={[TEXT_STYLES.label, { marginBottom: 8, color: "#666666" }]}>COMMAND HISTORY ({executedCommands.length} EXECUTED)</Text>
              {executedCommands.slice(-5).map((command, idx) => (
                <View key={`${command}-${idx}`} style={styles.commandRow}>
                  <Text style={[TEXT_STYLES.caption, { color: "#666666" }]}>{"  "}{command}</Text>
                </View>
              ))}
            </View>
          )}

          {activeCommands.length === 0 && executedCommands.length === 0 && (
            <View style={styles.commandBlock}>
              <Text style={[TEXT_STYLES.caption, { color: "#999999" }]}>SYSTEM IDLE - AWAITING COMMANDS</Text>
            </View>
          )}
        </View>
      </View>

      {/* Deployed Sensors */}
      <View style={LAYOUT_STYLES.sectionGap}>
        <View style={LAYOUT_STYLES.spaceBetween}>
          <Text style={[TEXT_STYLES.label, { marginBottom: 12 }]}>DEPLOYED SENSORS (ZONE 4)</Text>
          <Text style={TEXT_STYLES.caption}>1,244 ACTIVE NODES</Text>
        </View>

        <View style={LAYOUT_STYLES.row}>
          <View style={LAYOUT_STYLES.row}>
            <View style={[styles.statusDot, { backgroundColor: "#000000" }]} />
            <Text style={[TEXT_STYLES.caption, { marginLeft: 4 }]}>ONLINE (1,244)</Text>
          </View>
          <View style={[LAYOUT_STYLES.row, { marginLeft: 12 }]}>
            <View style={[styles.statusDot, { backgroundColor: "#000000" }]} />
            <Text style={[TEXT_STYLES.caption, { marginLeft: 4 }]}>DEGRADED (12)</Text>
          </View>
          <View style={[LAYOUT_STYLES.row, { marginLeft: 12 }]}>
            <View style={[styles.statusDot, { backgroundColor: "#CC0000" }]} />
            <Text style={[TEXT_STYLES.caption, { marginLeft: 4 }]}>OFFLINE (3)</Text>
          </View>
        </View>

        <View style={styles.sensorGrid}>
          {SENSOR_NODES.map((node) => (
            <View key={node.id} style={styles.sensorCard}>
              <View
                style={[
                  styles.sensorCardInner,
                  node.status === "degraded" && styles.sensorCardDegraded,
                  node.status === "offline" && styles.sensorCardOffline,
                ]}
              >
                <View style={LAYOUT_STYLES.spaceBetween}>
                  <View>
                    <Text style={[TEXT_STYLES.title, { fontSize: 14 }]}>{node.id}</Text>
                    <Text style={[TEXT_STYLES.caption, { marginTop: 2 }]}>{node.type.toUpperCase()} NODE</Text>
                  </View>
                  <SensorStatusIcon status={node.status} />
                </View>

                <View style={[LAYOUT_STYLES.divider, { marginTop: 10 }]} />

                <View style={LAYOUT_STYLES.spaceBetween}>
                  <Text style={TEXT_STYLES.caption}>BATT: {node.battery}%</Text>
                  <BatteryBar battery={node.battery} />
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 16,
    paddingBottom: 32,
  },
  metaTag: {
    borderWidth: 1,
    borderColor: THEME.cardBorder,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  mapContainer: {
    borderWidth: 1,
    borderColor: THEME.cardBorder,
    height: 280,
    position: "relative",
    backgroundColor: THEME.bg,
    overflow: "hidden",
  },
  gridArea: {
    flex: 1,
    position: "relative",
  },
  zoneCircle: {
    position: "absolute",
    left: 40,
    top: 50,
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: THEME.fg,
    alignItems: "center",
    justifyContent: "center",
  },
  zoneDot: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.fg,
    top: 10,
    left: 20,
  },
  mapLabel: {
    position: "absolute",
    right: 60,
    top: 55,
  },
  craneMarker: {
    position: "absolute",
    right: 80,
    top: 90,
    alignItems: "center",
  },
  craneSquare: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: THEME.fg,
  },
  craneLabel: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  excavatorMarker: {
    position: "absolute",
    left: 80,
    bottom: 60,
    alignItems: "center",
  },
  excavatorSquare: {
    width: 24,
    height: 24,
    backgroundColor: THEME.fg,
  },
  excavatorLabel: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  legend: {
    position: "absolute",
    right: 12,
    bottom: 12,
    backgroundColor: THEME.bg,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
    padding: 10,
  },
  legendBox: {
    width: 10,
    height: 10,
    backgroundColor: THEME.fg,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: THEME.fg,
  },
  legendDashed: {
    width: 10,
    height: 1,
    borderTopWidth: 1,
    borderStyle: "dashed",
    borderColor: THEME.fg,
    marginTop: 4,
  },
  actionBtn: {
    borderWidth: 1,
    borderColor: THEME.fg,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 16,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sensorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
    marginHorizontal: -4,
  },
  sensorCard: {
    width: "50%",
    padding: 4,
  },
  sensorCardInner: {
    borderWidth: 1,
    borderColor: THEME.cardBorder,
    padding: 12,
    backgroundColor: THEME.bg,
  },
  sensorCardDegraded: {
    borderColor: "#000000",
    backgroundColor: "#FAFAFA",
  },
  sensorCardOffline: {
    borderColor: "#CC0000",
    backgroundColor: "#FFF5F5",
  },
  batteryTrack: {
    width: 32,
    height: 3,
    backgroundColor: "#E5E5E5",
  },
  batteryFill: {
    height: 3,
  },
  terminalCard: {
    borderWidth: 1,
    borderColor: "#000000",
    backgroundColor: "#FFFFFF",
  },
  terminalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  terminalDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  terminalBody: {
    padding: 12,
    maxHeight: 160,
  },
  terminalRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  commandBlock: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  commandRow: {
    paddingVertical: 2,
  },
});
