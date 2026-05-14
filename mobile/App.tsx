import { useEffect, useRef } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { View, StyleSheet, Platform } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import DashboardScreen from "@/screens/DashboardScreen";
import MapScreen from "@/screens/MapScreen";
import RedesignScreen from "@/screens/RedesignScreen";
import AuditScreen from "@/screens/AuditScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import Header from "@/components/Header";
import { useSiteStore } from "@/store/useSiteStore";
import { SIMULATION } from "@/constants";

const Tab = createBottomTabNavigator();

function AppContent() {
  const { isSimulating, tick, fetchLatestEvents, connectEventStream } = useSiteStore();
  const simInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Simulation ticker
  useEffect(() => {
    if (isSimulating) {
      simInterval.current = setInterval(() => tick(), SIMULATION.TICK_INTERVAL_MS);
    }
    return () => {
      if (simInterval.current) clearInterval(simInterval.current);
    };
  }, [isSimulating, tick]);

  // Polling & SSE
  useEffect(() => {
    fetchLatestEvents();
    pollInterval.current = setInterval(() => fetchLatestEvents(), SIMULATION.POLLING_INTERVAL_MS);
    const disposeStream = connectEventStream();
    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
      disposeStream();
    };
  }, [fetchLatestEvents, connectEventStream]);

  return (
    <View style={styles.container}>
      <Header />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabLabel,
          tabBarActiveTintColor: "#000000",
          tabBarInactiveTintColor: "#999999",
          tabBarItemStyle: styles.tabItem,
        }}
      >
        <Tab.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="dashboard" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Map"
          component={MapScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="map" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Redesign"
          component={RedesignScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="architecture" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Audit"
          component={AuditScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="assignment-turned-in" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="settings" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <StatusBar style="dark" />
        <NavigationContainer>
          <AppContent />
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  tabBar: {
    height: 72,
    paddingBottom: Platform.OS === "ios" ? 20 : 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    backgroundColor: "#FFFFFF",
    elevation: 0,
    shadowOpacity: 0,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  tabItem: {
    paddingVertical: 4,
  },
});
