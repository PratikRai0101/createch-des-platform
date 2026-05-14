import { View, StyleSheet } from "react-native";

export default function DigitalTwinPreview({ deviation, status, aiOptimized }: { deviation: number; status: string; aiOptimized: boolean }) {
  const color = aiOptimized ? "#000000" : status === "CRITICAL" ? "#CC0000" : "#333333";
  const offset = Math.min(deviation, 50);

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {/* Structural beam */}
        <View style={[styles.beam, { borderColor: color }]} />
        {/* Deviation indicator */}
        <View style={[styles.indicator, { left: `${50 + offset}%`, backgroundColor: color }]} />
        {/* Safe threshold lines */}
        <View style={[styles.threshold, { left: "55%" }]} />
        <View style={[styles.threshold, { left: "45%" }]} />
        {/* Labels */}
        <View style={styles.labelContainer}>
          <View style={styles.labelBox}>
            <View style={[styles.statusDot, { backgroundColor: color }]} />
            <View>
              <View style={styles.labelRow}>
                <View style={styles.labelText} />
                <View style={[styles.labelValue, { width: 40 }]} />
              </View>
              <View style={[styles.labelRow, { marginTop: 4 }]}>
                <View style={styles.labelText} />
                <View style={[styles.labelValue, { width: 60 }]} />
              </View>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.bottomBar}>
        <View style={[styles.barSegment, { backgroundColor: color }]} />
        <View style={styles.barSegment} />
        <View style={styles.barSegment} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 220,
    borderWidth: 1,
    borderColor: "#000000",
    backgroundColor: "#FAFAFA",
    padding: 16,
  },
  grid: {
    flex: 1,
    position: "relative",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    backgroundColor: "#FFFFFF",
  },
  beam: {
    position: "absolute",
    top: "50%",
    left: "10%",
    right: "10%",
    height: 4,
    borderWidth: 1,
    backgroundColor: "#000000",
  },
  indicator: {
    position: "absolute",
    top: "48%",
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  threshold: {
    position: "absolute",
    top: "30%",
    bottom: "30%",
    width: 1,
    backgroundColor: "#E5E5E5",
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#CCCCCC",
  },
  labelContainer: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
  },
  labelBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  labelText: {
    width: 60,
    height: 6,
    backgroundColor: "#E5E5E5",
  },
  labelValue: {
    height: 6,
    backgroundColor: "#CCCCCC",
  },
  bottomBar: {
    flexDirection: "row",
    marginTop: 8,
    height: 4,
  },
  barSegment: {
    flex: 1,
    backgroundColor: "#E5E5E5",
    marginHorizontal: 2,
  },
});
