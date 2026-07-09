import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { bourseTicker } from "@/data/mock";
import { colors, spacing } from "@/theme";

export function BourseTickerBar() {
  const anim = useRef(new Animated.Value(0)).current;
  const [contentWidth, setContentWidth] = useState(0);
  const items = [...bourseTicker, ...bourseTicker];

  useEffect(() => {
    if (contentWidth <= 0) return;
    const half = contentWidth / 2;
    anim.setValue(0);
    const loop = Animated.loop(
      Animated.timing(anim, {
        toValue: 1,
        duration: 40000,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [anim, contentWidth]);

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, contentWidth > 0 ? -contentWidth / 2 : 0],
  });

  return (
    <View style={styles.wrap}>
      <Animated.View
        style={[styles.row, { transform: [{ translateX }] }]}
        onLayout={(e) => setContentWidth(e.nativeEvent.layout.width)}
      >
        {items.map((item, i) => (
          <View key={`${item.symbol}-${i}`} style={styles.item}>
            <Text style={styles.symbol}>{item.symbol}</Text>
            <Text style={styles.price}>{item.price}</Text>
            <Text
              style={[
                styles.change,
                { color: item.change >= 0 ? colors.success : colors.danger },
              ]}
            >
              {item.change >= 0 ? "▲" : "▼"} {Math.abs(item.change)}%
            </Text>
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.tickerBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[800],
    paddingVertical: 10,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["2xl"],
    paddingHorizontal: spacing.lg,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  symbol: {
    color: colors.amber[400],
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  price: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
  change: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
});
