import { useLocalSearchParams } from "expo-router";
import { ProductDetailScreen } from "@/screens/ProductDetailScreen";

export default function ProductDetailRoute() {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  return <ProductDetailScreen productId={productId} />;
}
