import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useSiteStore } from "@/store/useSiteStore";

export default function Header() {
  const { notifications, dismissNotification } = useSiteStore();
  const unreadCount = notifications.length;

  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.iconBtn}>
        <MaterialIcons name="menu" size={24} color="#000" />
      </TouchableOpacity>

      <Text style={styles.title}>GENESIS</Text>

      <TouchableOpacity style={styles.iconBtn}>
        <MaterialIcons name="notifications-none" size={24} color="#000" />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  title: {
    fontSize: 18,
    fontWeight: "400",
    letterSpacing: 6,
    color: "#000000",
    fontFamily: "Courier",
  },
  badge: {
    position: "absolute",
    top: 4,
    right: 2,
    backgroundColor: "#000",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#FFF",
  },
  badgeText: {
    color: "#FFF",
    fontSize: 9,
    fontWeight: "700",
    fontFamily: "Courier",
  },
});
