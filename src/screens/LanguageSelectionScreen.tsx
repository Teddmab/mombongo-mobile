import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useApp, type Lang } from "@/context/AppContext";
import { useFullScreenInsets } from "@/hooks/useSafeInsets";
import { logoMombongo } from "@/assets/images";
import { colors, radii, shadows, spacing } from "@/theme";

const TAGLINES: Record<Lang, string> = {
  fr: "Pour chaque entrepreneur congolais",
  en: "For every Congolese entrepreneur",
  ln: "Pona bato nyonso ya Kongo",
};

const LANGS: { code: Lang; flag: string; label: string }[] = [
  { code: "fr", flag: "🇫🇷", label: "Français" },
  { code: "en", flag: "🇬🇧", label: "English" },
  { code: "ln", flag: "🌍", label: "Lingala" },
];

const ORDER: Lang[] = ["fr", "en", "ln"];

export function LanguageSelectionScreen() {
  const { setLang } = useApp();
  const router = useRouter();
  const { top, bottom } = useFullScreenInsets();
  const [tagIdx, setTagIdx] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [logoOpacity, scaleAnim]);

  useEffect(() => {
    const id = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      setTagIdx((i) => (i + 1) % 3);
    }, 3000);
    return () => clearInterval(id);
  }, [fadeAnim]);

  const choose = (l: Lang) => {
    setLang(l);
    setTimeout(() => router.push("/auth"), 120);
  };

  return (
    <View
      testID="language-screen"
      style={[
        styles.root,
        { paddingTop: top, paddingBottom: bottom },
      ]}
    >
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      <View style={styles.hero}>
        <Animated.View
          style={[
            styles.logoCard,
            shadows.elevated,
            {
              opacity: logoOpacity,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Image
            source={logoMombongo}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        <Text style={styles.coopLabel}>Coopérative</Text>

        <View style={styles.taglineWrap}>
          <Animated.Text style={[styles.tagline, { opacity: fadeAnim }]}>
            {TAGLINES[ORDER[tagIdx]]}
          </Animated.Text>
        </View>
      </View>

      <View style={styles.langList}>
        {LANGS.map((l, i) => (
          <Pressable
            key={l.code}
            testID={`language-btn-${l.code}`}
            onPress={() => choose(l.code)}
            style={({ pressed }) => [
              styles.langBtn,
              i === 0 ? styles.langBtnPrimary : styles.langBtnSecondary,
              pressed && styles.langBtnPressed,
            ]}
          >
            <Text style={styles.langFlag}>{l.flag}</Text>
            <Text
              style={[
                styles.langLabel,
                i === 0 ? styles.langLabelPrimary : styles.langLabelSecondary,
              ]}
            >
              {l.label}
            </Text>
          </Pressable>
        ))}

        <Text style={styles.version}>v1.0 · Mombongo SARL © 2025</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.green[700],
    paddingHorizontal: spacing["2xl"],
    overflow: "hidden",
  },
  blobTop: {
    position: "absolute",
    top: -96,
    right: -96,
    width: 288,
    height: 288,
    borderRadius: 144,
    backgroundColor: "rgba(45, 115, 73, 0.4)",
  },
  blobBottom: {
    position: "absolute",
    bottom: -128,
    left: -96,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "rgba(244, 161, 27, 0.15)",
  },
  hero: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  logoCard: {
    backgroundColor: colors.white,
    borderRadius: radii["3xl"],
    paddingHorizontal: spacing["2xl"],
    paddingVertical: spacing.lg,
    marginBottom: spacing["2xl"],
  },
  logo: {
    height: 48,
    width: 160,
  },
  coopLabel: {
    color: colors.amber[400],
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2.5,
    textTransform: "uppercase",
    marginTop: spacing.xs,
  },
  taglineWrap: {
    height: 48,
    marginTop: spacing["2xl"],
    justifyContent: "center",
    alignItems: "center",
  },
  tagline: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    maxWidth: 280,
  },
  langList: {
    gap: spacing.md,
    zIndex: 1,
    paddingBottom: spacing.lg,
  },
  langBtn: {
    width: "100%",
    borderRadius: radii.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  langBtnPrimary: {
    backgroundColor: colors.white,
    ...shadows.elevated,
  },
  langBtnSecondary: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  langBtnPressed: {
    transform: [{ scale: 0.98 }],
  },
  langFlag: {
    fontSize: 20,
  },
  langLabel: {
    flex: 1,
    fontSize: 15,
  },
  langLabelPrimary: {
    color: colors.green[700],
    fontWeight: "700",
  },
  langLabelSecondary: {
    color: colors.white,
    fontWeight: "600",
  },
  version: {
    textAlign: "center",
    color: "rgba(255,255,255,0.3)",
    fontSize: 10,
    fontWeight: "500",
    marginTop: spacing["2xl"],
  },
});
