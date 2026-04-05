import React from "react";

export function BarcodeInfoRow({
  heading,
  description,
  className,
  children,
}: {
  heading: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  if (description === undefined) {
    description = "";
  }

  if (className === undefined) {
    className = "";
  }

  return (
    <div className="px-1 py-1 pr-10 sm:grid sm:grid-cols-[140_1_600] sm:gap-1 sm:px-0">
      <dt className="ml-1 w-auto text-sm/6 font-medium text-gray-100 sm:ml-3 lg:ml-6">
        {heading}
      </dt>
      <dd className="mt-0 ml-2 w-auto text-sm/6 text-gray-400 sm:col-span-2 sm:ml-1 sm:w-sm md:w-lg lg:w-xl xl:w-2xl">
        <div className={className}>
          {description}
          {children}
        </div>
      </dd>
    </div>
  );
}
