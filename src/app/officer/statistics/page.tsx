import { OfficerStatisticsView } from "@/components/officer/statistics/OfficerStatisticsView";
import { officerStatisticsService } from "@/services/officer-statistics-service";

export const dynamic = "force-dynamic";

export default async function OfficerStatisticsPage() {
  const statistics = await officerStatisticsService.getStatistics();
  return <OfficerStatisticsView statistics={statistics} />;
}
