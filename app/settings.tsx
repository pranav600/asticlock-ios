import { View, Text, TouchableOpacity, Switch, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StatusBar } from "expo-status-bar";

const THEMES = [
  { id: "dark", label: "Dark", accent: "#ffffff", bg: "#1a1a1a", card: "#0d0d0d" },
  { id: "amber", label: "Amber", accent: "#f5a623", bg: "#1a1500", card: "#120f00" },
  { id: "neon", label: "Neon", accent: "#39ff14", bg: "#001a00", card: "#001200" },
  { id: "blue", label: "Ocean", accent: "#4fc3f7", bg: "#00101a", card: "#000b12" },
];

export default function SettingsScreen() {
  const router = useRouter();
  const [is24h, setIs24h] = useState(false);
  const [nightMode, setNightMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState("dark");

  const activeTheme = THEMES.find((t) => t.id === selectedTheme)!;

  const handleStart = () => {
    router.push({
      pathname: "/clock",
      params: {
        theme: selectedTheme,
        is24h: is24h ? "1" : "0",
        soundEnabled: soundEnabled ? "1" : "0",
        nightMode: nightMode ? "1" : "0",
      },
    });
  };

  const trackColor = { false: "#2a2a2a", true: activeTheme.accent };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Time Format */}
        <Text style={styles.sectionLabel}>TIME</Text>
        <View style={styles.card}>
          <SettingRow
            label="24-hour format"
            description={is24h ? "Showing 14:30" : "Showing 2:30 PM"}
            control={
              <Switch
                value={is24h}
                onValueChange={setIs24h}
                trackColor={trackColor}
                thumbColor="#fff"
              />
            }
          />
        </View>

        {/* Display */}
        <Text style={styles.sectionLabel}>DISPLAY</Text>
        <View style={styles.card}>
          <SettingRow
            label="Night mode"
            description="Dimmer clock for dark rooms"
            control={
              <Switch
                value={nightMode}
                onValueChange={setNightMode}
                trackColor={trackColor}
                thumbColor="#fff"
              />
            }
          />
          <View style={styles.divider} />
          <SettingRow
            label="Flip sound"
            description="Play click on each flip"
            control={
              <Switch
                value={soundEnabled}
                onValueChange={setSoundEnabled}
                trackColor={trackColor}
                thumbColor="#fff"
              />
            }
          />
        </View>

        {/* Theme */}
        <Text style={styles.sectionLabel}>THEME</Text>
        <View style={styles.card}>
          <View style={styles.themeGrid}>
            {THEMES.map((theme) => {
              const isSelected = selectedTheme === theme.id;
              return (
                <TouchableOpacity
                  key={theme.id}
                  style={[
                    styles.themeChip,
                    isSelected && { borderColor: theme.accent, borderWidth: 2 },
                  ]}
                  onPress={() => setSelectedTheme(theme.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.themeAccentDot, { backgroundColor: theme.accent }]} />
                  <Text style={[styles.themeLabel, isSelected && { color: "#fff" }]}>
                    {theme.label}
                  </Text>
                  {isSelected && (
                    <View style={[styles.selectedBadge, { backgroundColor: theme.accent }]}>
                      <Text style={styles.selectedCheck}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Start Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.startButton, { backgroundColor: activeTheme.accent }]}
          onPress={handleStart}
          activeOpacity={0.85}
        >
          <Text style={[styles.startText, { color: activeTheme.id === "dark" ? "#000" : "#000" }]}>
            Start Clock
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function SettingRow({
  label,
  description,
  control,
}: {
  label: string;
  description?: string;
  control: React.ReactNode;
}) {
  return (
    <View style={rowStyles.row}>
      <View style={rowStyles.labelGroup}>
        <Text style={rowStyles.label}>{label}</Text>
        {description && <Text style={rowStyles.description}>{description}</Text>}
      </View>
      {control}
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  labelGroup: { flex: 1, marginRight: 12 },
  label: { fontSize: 16, color: "#fff", fontWeight: "500" },
  description: { fontSize: 12, color: "#555", marginTop: 2 },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#1a1a1a",
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: { fontSize: 20, color: "#fff", lineHeight: 24 },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: -0.3,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#444",
    letterSpacing: 1.2,
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: "#111",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1e1e1e",
    overflow: "hidden",
  },
  divider: {
    height: 1,
    backgroundColor: "#1e1e1e",
    marginLeft: 16,
  },
  themeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 12,
    gap: 10,
  },
  themeChip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#1a1a1a",
    borderWidth: 1.5,
    borderColor: "#2a2a2a",
    gap: 8,
    position: "relative",
    minWidth: "44%",
  },
  themeAccentDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  themeLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  selectedBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: "auto",
  },
  selectedCheck: { fontSize: 10, color: "#000", fontWeight: "800" },
  footer: {
    padding: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: "#111",
  },
  startButton: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
  },
  startText: {
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
