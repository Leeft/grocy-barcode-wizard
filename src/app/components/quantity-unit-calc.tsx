import { useState } from "react";
import { grocyClient } from "../lib/grocy";

export function QuantityUnitCalculation({
  selectedUnit,
  factor,
  className,
}: {
  selectedUnit: number;
  factor: number;
  className?: string;
}) {
  const [foundConversion, setFoundConversion] = useState<any>(null);

  // async function getConversions(quId: number) {
  //   return await grocyClient.GET("/objects/{entity}", {
  //     params: {
  //       path: { entity: "quantity_unit_conversions" },
  //       query: { "query[]": ["active=1", `from_qu_id=${quId}`] },
  //     },
  //   });
  // }

  //const conversions = await getConversions(selectedUnit);

  return (
    <div className={className}>
      {/* {conversions.error ? (
        <div>There was an error: {conversions.error.error_message}</div>
      ) : (
        <pre>
          <code>{JSON.stringify(conversions.data, undefined, 2)}</code>
        </pre>
      )} */}
    </div>
  );
}
