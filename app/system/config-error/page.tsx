import { isEnvironmentConfigured } from "@/lib/utils";
import { redirect } from "next/navigation";

export default function ConfigError() {
  return (
    <>
      <h1 className="mt-3 mb-5 inline-block text-lg font-bold text-slate-400 uppercase">
        Configuration missing
      </h1>
      <p className="mb-8">
        Since you landed here, it appears you have missing environment variable(s). Check and fix the
        configured entries shown. You need to restart the server afterwards.
      </p>
      <div className="flex flex-col gap-5">
        <HaveEnvironment name="GROCY_URL" showValue={true} />
        <HaveEnvironment name="GROCY_API_URL" showValue={true} />
        <HaveEnvironment name="GROCY_API_KEY" />
        <HaveEnvironment name="OPENFOODFACTS_BASE_URL" showValue={true} />
        <HaveEnvironment name="DATABASE_URL" showValue={true} />
      </div>
    </>
  );
}

function HaveEnvironment({ name, showValue }: { name: string; showValue?: boolean }) {
  let value = process.env[name];
  if (!showValue && value !== undefined && value !== null) {
    value = "*** present but masked ***";
  }

  return (
    <div className="my-2 flex">
      <span className="mx-5">
        <code>env.{name}</code>:{" "}
        <span
          className={value !== undefined && value !== null ? "text-status-connected" : "text-status-error"}
        >
          {value ?? "unset/undefined"}
        </span>
      </span>
    </div>
  );
}
