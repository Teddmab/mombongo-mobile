/** Aligné sur mombongo-web `isDevMode()` — mock data + auth sans Firebase */
export function isDevMode(): boolean {
  return process.env.EXPO_PUBLIC_DEV_MODE === "true" || __DEV__;
}
