import { useApp } from "@/context/AppContext";
import { InvestorMarketScreen } from "@/screens/market/InvestorMarketScreen";
import { FarmerMarketScreen } from "@/screens/market/FarmerMarketScreen";
import { AgentMarketScreen } from "@/screens/market/AgentMarketScreen";
import { MerchantMarketScreen } from "@/screens/market/MerchantMarketScreen";

export function MarketScreen() {
  const { role } = useApp();

  if (role === "farmer") return <FarmerMarketScreen />;
  if (role === "agent") return <AgentMarketScreen />;
  if (role === "merchant") return <MerchantMarketScreen />;

  return <InvestorMarketScreen />;
}
