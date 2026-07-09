import { useApp } from "@/context/AppContext";
import { InvestorBourseScreen } from "@/screens/bourse/InvestorBourseScreen";
import { FarmerBourseScreen } from "@/screens/bourse/FarmerBourseScreen";
import { AgentBourseScreen } from "@/screens/bourse/AgentBourseScreen";
import { MerchantBourseScreen } from "@/screens/bourse/MerchantBourseScreen";

export function BourseScreen() {
  const { role } = useApp();

  if (role === "farmer") return <FarmerBourseScreen />;
  if (role === "agent") return <AgentBourseScreen />;
  if (role === "merchant") return <MerchantBourseScreen />;

  return <InvestorBourseScreen />;
}
