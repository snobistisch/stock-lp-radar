import type { DashboardData } from "@/lib/types";

export interface DashboardDataProvider {
  getDashboardData(): Promise<DashboardData>;
}
