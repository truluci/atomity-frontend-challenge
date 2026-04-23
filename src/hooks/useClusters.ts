import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { productsToProviders, type DummyProduct } from "@/lib/mappers";
import type { Provider } from "@/lib/types";

interface ProductsResponse {
  products: DummyProduct[];
  total: number;
  skip: number;
  limit: number;
}

export function useClusters() {
  return useQuery<Provider[]>({
    queryKey: ["clusters"],
    queryFn: async () => {
      const data = await apiFetch<ProductsResponse>("/products?limit=24&select=title,price,stock,rating,weight");
      return productsToProviders(data.products);
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}
