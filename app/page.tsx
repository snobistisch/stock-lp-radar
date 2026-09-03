import { Dashboard } from "@/components/dashboard";
import { getDashboardData } from "@/lib/data";

export default async function HomePage() {
  const data = await getDashboardData();
  return <Dashboard initialData={data} />;
}
