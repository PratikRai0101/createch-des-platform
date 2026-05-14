import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useSiteStore } from "@/store/useSiteStore";
import { THEME, TEXT_STYLES, CARD_STYLES, LAYOUT_STYLES } from "@/components/theme";

export default function MapScreen() {
  const { machineryState } = useSiteStore();

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
});
