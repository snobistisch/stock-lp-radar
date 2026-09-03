import { staticDashboardData } from "@/lib/data/static";
import type { DashboardDataProvider } from "@/lib/data/provider";

const staticProvider: DashboardDataProvider = {
  async getDashboardData() {
    return { ...staticDashboardData, generatedAt: new Date().toISOString() };
  },
};

export async function getDashboardData() {
  // Replace this provider when a stable, authenticated upstream is available.
  // The UI consumes one normalized contract and therefore needs no rewrite.
  return staticProvider.getDashboardData();
}
