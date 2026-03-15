export function BarcodeInfoRow({
  heading,
  description,
  className,
}: {
  heading: string;
  description?: string;
  className?: string;
}) {
  if (description === undefined) {
    description = "";
  }

  return (
    <div className="px-1 py-1 pr-10 sm:grid sm:grid-cols-[140_1_600] sm:gap-1 sm:px-0">
      <dt className="ml-1 sm:ml-3 lg:ml-6 text-sm/6 font-medium text-gray-100 w-auto">{heading}</dt>
      <dd className="ml-2 text-sm/6 text-gray-400 sm:col-span-2 mt-0 sm:ml-1 w-auto sm:w-sm md:w-lg lg:w-xl xl:w-2xl">
        <div className={className !== undefined ? className : ""}>{description}</div>
      </dd>
    </div>
  );
}
