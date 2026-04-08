import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState, useRef } from "react";
import { StatusBar } from "expo-status-bar";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from "react-native-reanimated";

// ─── Theme map ───────────────────────────────────────────────────────────────
const THEMES: Record<string, { accent: string; cardBg: string; splitLine: string }> = {
  dark:  { accent: "#ffffff", cardBg: "#161616", splitLine: "#000" },
  amber: { accent: "#f5a623", cardBg: "#1a1200", splitLine: "#000" },
  neon:  { accent: "#39ff14", cardBg: "#001400", splitLine: "#000" },
  blue:  { accent: "#4fc3f7", cardBg: "#001220", splitLine: "#000" },
};

// ─── Single half of a flip card ───────────────────────────────────────────────
function CardHalf({
  value,
  isTop,
  cardWidth,
  cardHeight,
  borderRadius,
  fontSize,
  accent,
  cardBg,
}: any) {
  const halfH = cardHeight / 2;
  return (
    <View
      style={[
        styles.halfClip,
        {
          width: cardWidth,
          height: halfH,
          top: isTop ? 0 : halfH,
          borderTopLeftRadius: isTop ? borderRadius : 0,
          borderTopRightRadius: isTop ? borderRadius : 0,
          borderBottomLeftRadius: isTop ? 0 : borderRadius,
          borderBottomRightRadius: isTop ? 0 : borderRadius,
          backgroundColor: cardBg,
        },
      ]}
    >
      <View style={[styles.textWrapper, { height: cardHeight, top: isTop ? 0 : -halfH }]}>
        <Text
          style={[styles.digit, { fontSize, color: accent }]}
          adjustsFontSizeToFit
          numberOfLines={1}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

// ─── Animated Flip Card ───────────────────────────────────────────────────────
function FlipCard({
  value,
  label,
  pad = true,
  cardWidth,
  cardHeight,
  accent,
  cardBg,
  splitLine,
  nightMode,
}: any) {
  const raw = pad && typeof value === "number" ? String(value).padStart(2, "0") : String(value);
  const [current, setCurrent] = useState(raw);
  const next = raw; // derive; avoids double render

  const rotation = useSharedValue(0);
  const dimOpacity = nightMode ? 0.55 : 1;

  useEffect(() => {
    if (raw !== current) {
      rotation.value = 0;
      rotation.value = withTiming(180, { duration: 440, easing: Easing.inOut(Easing.quad) }, (ok) => {
        if (ok) runOnJS(setCurrent)(raw);
      });
    } else {
      rotation.value = 0;
    }
  }, [raw, current]);

  const fontSize = Math.min(cardHeight * 0.78, cardWidth * 0.62);
  const borderRadius = Math.min(cardWidth * 0.14, 36);

  const flapTopStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1200 }, { rotateX: `-${rotation.value}deg` }],
    zIndex: rotation.value < 90 ? 20 : 0,
    opacity: rotation.value < 90 ? 1 : 0,
  }));

  const flapBottomStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1200 }, { rotateX: `${180 - rotation.value}deg` }],
    zIndex: rotation.value >= 90 ? 20 : 0,
    opacity: rotation.value >= 90 ? 1 : 0,
  }));

  return (
    <View style={{ opacity: dimOpacity }}>
      <View
        style={[
          styles.card,
          {
            width: cardWidth,
            height: cardHeight,
            borderRadius,
            backgroundColor: cardBg,
            shadowColor: accent,
          },
        ]}
      >
        {/* Static back layers */}
        <CardHalf value={next}    isTop={true}  {...{ cardWidth, cardHeight, borderRadius, fontSize, accent, cardBg }} />
        <CardHalf value={current} isTop={false} {...{ cardWidth, cardHeight, borderRadius, fontSize, accent, cardBg }} />

        {/* Animated flap: top (current falls away) */}
        <Animated.View style={[styles.flapAbsolute, flapTopStyle]}>
          <CardHalf value={current} isTop={true} {...{ cardWidth, cardHeight, borderRadius, fontSize, accent, cardBg }} />
        </Animated.View>

        {/* Animated flap: bottom (next flips in) */}
        <Animated.View style={[styles.flapAbsolute, flapBottomStyle]}>
          <CardHalf value={next} isTop={false} {...{ cardWidth, cardHeight, borderRadius, fontSize, accent, cardBg }} />
        </Animated.View>

        {/* Center seam */}
        <View style={[styles.seam, { backgroundColor: splitLine, zIndex: 25 }]} />

        {/* AM/PM label */}
        {label != null && (
          <Text style={[styles.ampm, { color: accent, opacity: 0.6, zIndex: 30 }]}>{label}</Text>
        )}
      </View>
    </View>
  );
}

// ─── Clock Screen ─────────────────────────────────────────────────────────────
export default function ClockScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    theme: string;
    is24h: string;
    soundEnabled: string;
    nightMode: string;
  }>();

  const theme     = THEMES[params.theme ?? "dark"] ?? THEMES.dark;
  const is24h     = params.is24h === "1";
  const nightMode = params.nightMode === "1";

  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const hrs24   = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();
  const isPM    = hrs24 >= 12;
  const hours   = is24h ? hrs24 : (hrs24 % 12 || 12);
  const periodLabel = is24h ? null : (isPM ? "PM" : "AM");

  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const isRow = isLandscape || Math.min(width, height) > 600;

  let cardW: number, cardH: number, gap: number;
  const ratio = 1.05;

  if (isRow) {
    gap = width * 0.03;
    cardH = Math.min(height * 0.58, 580);
    cardW = cardH * ratio;
    if (cardW * 3 + gap * 2 > width * 0.91) {
      cardW = (width * 0.91 - gap * 2) / 3;
      cardH = cardW / ratio;
    }
  } else {
    gap = height * 0.025;
    cardW = Math.min(width * 0.85, 420);
    cardH = cardW / ratio;
    if (cardH * 3 + gap * 2 > height * 0.82) {
      cardH = (height * 0.82 - gap * 2) / 3;
      cardW = cardH * ratio;
    }
  }
  cardW = Math.max(90, cardW);
  cardH = Math.max(70, cardH);

  const common = { cardWidth: cardW, cardHeight: cardH, accent: theme.accent, cardBg: theme.cardBg, splitLine: theme.splitLine, nightMode };

  return (
    <View style={[styles.screen, nightMode && { backgroundColor: "#060606" }]}>
      <StatusBar style="light" />

      {/* Back button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
        <Text style={[styles.backIcon, { color: theme.accent, opacity: 0.6 }]}>← Settings</Text>
      </TouchableOpacity>

      {/* Clock */}
      <View style={[styles.clockWrap, { flexDirection: isRow ? "row" : "column", gap }]}>
        <FlipCard value={hours}   label={periodLabel} pad={!is24h} {...common} />
        <FlipCard value={minutes} pad {...common} />
        <FlipCard value={seconds} pad {...common} />
      </View>

      {/* Date footer */}
      <Text style={[styles.dateText, { color: theme.accent, opacity: 0.35 }]}>
        {time.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
      </Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  backBtn: {
    position: "absolute",
    top: Platform.OS === "ios" ? 56 : 36,
    left: 24,
    zIndex: 99,
  },
  backIcon: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  clockWrap: {
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    overflow: "visible",
    elevation: 12,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },
  halfClip: {
    position: "absolute",
    left: 0,
    overflow: "hidden",
  },
  textWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  digit: {
    fontWeight: "900",
    // @ts-ignore — web only
    fontVariant: ["tabular-nums"],
    letterSpacing: -2,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  flapAbsolute: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backfaceVisibility: "hidden",
  },
  seam: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    height: 5,
    marginTop: -2.5,
  },
  ampm: {
    position: "absolute",
    top: 10,
    left: 12,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.8,
    zIndex: 30,
  },
  dateText: {
    position: "absolute",
    bottom: 48,
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});
