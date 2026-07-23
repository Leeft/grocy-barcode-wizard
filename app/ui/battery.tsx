import { Battery as GrocyBattery } from "@/interfaces/grocy";
import { grocyUrl } from "@/lib/grocy";
import Grocy from "@/components/icons/grocy";
import { getBatteryDetails } from "@/lib/grocy";
import { BatteryTrackForm } from "@/forms/actions/battery-track-form";
import Barcode from "@/lib/barcode";
import { differenceInDays } from "@/lib/utils";

export default async function Battery({ barcode, battery }: { barcode: Barcode; battery: GrocyBattery }) {
  if (!battery.id) {
    return (
      <>
        <div className="text-alert">Battery not found</div>
      </>
    );
  }

  const batteryDetails = await getBatteryDetails(battery.id);

  //  last_charged?: string;
  //   charge_cycles_count?: number;
  //   next_estimated_charge_time?: string;

  const estimatedChargeDays = differenceInDays(
    new Date(batteryDetails.next_estimated_charge_time ?? ""),
    new Date(),
  );

  return (
    <>
      <div className={`flex flex-col flex-wrap gap-5`}>
        <h1 className="inline-block text-lg font-bold text-slate-400 uppercase">Battery: {battery.name}</h1>
        <dl className="battery-info">
          <dt>Name</dt>
          <dd>
            <GrocyBatteryLink batteryId={battery.id}>{battery.name}</GrocyBatteryLink>
          </dd>
          <dt>Description</dt>
          <dd>{battery.description}</dd>
          <dt>Used in</dt>
          <dd>{battery.used_in}</dd>
          <dt>Charge interval days</dt>
          <dd>{battery.charge_interval_days}</dd>
          <dt>Charge cycles count</dt>
          <dd>{batteryDetails.charge_cycles_count ? batteryDetails.charge_cycles_count : "?"}</dd>
          <dt>Last charged</dt>
          <dd>
            {batteryDetails.last_charged ? batteryDetails.last_charged : "?"}
            {batteryDetails.last_charged && (
              <>
                &nbsp;&mdash;&nbsp;
                <span className="text-highlight font-bold">
                  {differenceInDays(new Date(), new Date(batteryDetails.last_charged))} days ago
                </span>
              </>
            )}
          </dd>
          <dt>Next estimated charge time</dt>
          <dd>
            {batteryDetails.next_estimated_charge_time ? batteryDetails.next_estimated_charge_time : "?"}
            {batteryDetails.next_estimated_charge_time && (
              <>
                &nbsp;&mdash;&nbsp;
                <span className="">
                  {estimatedChargeDays >= 0 ? (
                    <span className="">in {estimatedChargeDays} days</span>
                  ) : (
                    <span className="text-alert">{Math.abs(estimatedChargeDays)} days ago</span>
                  )}
                </span>
              </>
            )}
          </dd>
        </dl>
      </div>

      <BatteryTrackForm code={barcode.code} battery={battery} />
    </>
  );
}

function GrocyBatteryLink({ batteryId, children }: { batteryId: number; children: React.ReactNode }) {
  let path = `${grocyUrl}/battery/${encodeURIComponent(batteryId)}`;
  path = path.replace(/\/\//g, "/");
  return (
    <div className="static mb-[-16]">
      <a
        href={path}
        target="_bcw_grocy"
        title="Link to the battery in Grocy"
        className="static mb-[-2] inline-flex underline! decoration-dashed underline-offset-3"
      >
        <Grocy className="relative top-0 ml-[-3] w-6 fill-[#4b7daa] stroke-[#467baa] pr-2 pl-0" /> {children}
      </a>
    </div>
  );
}
