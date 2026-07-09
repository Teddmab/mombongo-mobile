import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StackHeader } from "@/components/shell/StackHeader";
import { useApp } from "@/context/AppContext";
import { AgentFinancementContent } from "@/screens/financement/AgentFinancementScreen";
import { FarmerFinancementContent } from "@/screens/financement/FarmerFinancementScreen";
import { InvestorFinancementContent } from "@/screens/financement/InvestorFinancementScreen";
import { MerchantFinancementContent } from "@/screens/financement/MerchantFinancementScreen";
import { colors } from "@/theme";

export function FinancementScreen() {
  const { role } = useApp();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: colors.appBackground }} testID="financing-screen">
      <StackHeader title="Financement" />
      {role === "farmer" ? (
        <FarmerFinancementContent bottomInset={insets.bottom} />
      ) : role === "agent" ? (
        <AgentFinancementContent bottomInset={insets.bottom} />
      ) : role === "merchant" ? (
        <MerchantFinancementContent bottomInset={insets.bottom} />
      ) : (
        <InvestorFinancementContent bottomInset={insets.bottom} />
      )}
    </View>
  );
}
