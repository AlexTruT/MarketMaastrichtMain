import { getStalls } from "@/lib/data";
import { ScanForm } from "./ScanForm";

export default async function PickerScanPage() {
  const stalls = await getStalls();
  return <ScanForm stalls={stalls} />;
}
