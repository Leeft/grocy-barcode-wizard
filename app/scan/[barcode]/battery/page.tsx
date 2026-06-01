import Barcode from "@/lib/barcode";
import { getBattery } from "@/lib/grocy";
import { redirect } from "next/navigation";
import Battery from "@/ui/battery";

export default async function BatteryPage(props: PageProps<"/scan/[barcode]/battery">) {
  const { barcode } = await props.params;

  const barcodeObject = new Barcode({
    barcode: decodeURIComponent(barcode).trim(),
    name: "",
    scannedAt: new Date(),
  });

  const battery = await getBattery(barcodeObject);

  if (battery === undefined || battery === null || !battery.id) {
    redirect("/scan");
  }

  return (
    <>
      <Battery barcode={barcodeObject} battery={battery} />
    </>
  );
}
