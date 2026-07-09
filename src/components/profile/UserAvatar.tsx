import { Image, StyleSheet, Text, View } from "react-native";
import { colors, radii, shadows } from "@/theme";

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function UserAvatar({
  photoURL,
  displayName,
  size = "sm",
}: {
  photoURL?: string | null;
  displayName?: string | null;
  size?: "sm" | "lg";
}) {
  const dim = size === "lg" ? 80 : 56;

  if (photoURL) {
    return (
      <Image
        source={{ uri: photoURL }}
        style={[styles.photo, { width: dim, height: dim, borderRadius: radii.xl }]}
      />
    );
  }

  return (
    <View
      style={[
        styles.initials,
        { width: dim, height: dim, borderRadius: radii.xl },
        size === "lg" && shadows.elevated,
      ]}
    >
      <Text style={[styles.initialsText, size === "lg" && { fontSize: 28 }]}>
        {getInitials(displayName)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  photo: { backgroundColor: colors.gray[100] },
  initials: {
    backgroundColor: colors.green[700],
    alignItems: "center",
    justifyContent: "center",
  },
  initialsText: {
    color: colors.white,
    fontSize: 22,
    fontWeight: "800",
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
});
