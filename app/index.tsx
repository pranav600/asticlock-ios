import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function IntroScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Brand */}
      <View style={styles.brandContainer}>
        <View style={styles.logoMark}>
          <View style={styles.logoLine} />
        </View>
        <Text style={styles.appName}>Asticlock</Text>
        <Text style={styles.subtitle}>Aesthetic desk clock</Text>
      </View>

      {/* Feature bullets */}
      <View style={styles.features}>
        {["Flip animations", "Custom themes", "12h & 24h modes"].map((f) => (
          <View key={f} style={styles.featureRow}>
            <View style={styles.dot} />
            <Text style={styles.featureText}>{f}</Text>
          </View>
        ))}
      </View>

      {/* CTA */}
      <View style={styles.bottom}>
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={() => router.push("/settings")}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
        <Text style={styles.hint}>Tap to configure your clock</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingHorizontal: 32,
    justifyContent: "space-between",
    paddingTop: 100,
    paddingBottom: 56,
  },
  brandContainer: {
    alignItems: "center",
    gap: 12,
  },
  logoMark: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#2a2a2a",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  logoLine: {
    width: 28,
    height: 2,
    backgroundColor: "#fff",
    borderRadius: 2,
  },
  appName: {
    fontSize: 48,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -1.5,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    letterSpacing: 0.5,
    fontWeight: "400",
  },
  features: {
    gap: 16,
    paddingHorizontal: 8,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#444",
  },
  featureText: {
    fontSize: 15,
    color: "#888",
    fontWeight: "500",
  },
  bottom: {
    gap: 12,
    alignItems: "center",
  },
  button: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#000",
    letterSpacing: 0.3,
  },
  hint: {
    fontSize: 13,
    color: "#444",
  },
});
