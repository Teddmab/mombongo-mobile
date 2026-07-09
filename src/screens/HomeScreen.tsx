import { useApp } from "@/context/AppContext";
import { InvestorHomeScreen } from "@/screens/home/InvestorHomeScreen";
import { FarmerHomeScreen } from "@/screens/home/FarmerHomeScreen";
import { AgentHomeScreen } from "@/screens/home/AgentHomeScreen";
import { MerchantHomeScreen } from "@/screens/home/MerchantHomeScreen";

export function HomeScreen() {
  const { role } = useApp();

  if (role === "farmer") return <FarmerHomeScreen />;
  if (role === "agent") return <AgentHomeScreen />;
  if (role === "merchant") return <MerchantHomeScreen />;

  return <InvestorHomeScreen />;
}
