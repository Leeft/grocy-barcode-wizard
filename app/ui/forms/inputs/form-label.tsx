import clsx from "clsx";

export function FormLabel({
  htmlFor,
  className = "text-sm",
  children,
  title,
}: {
  htmlFor: string;
  className?: string;
  title: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <span className="">
      <label
        htmlFor={htmlFor}
        className={clsx(`mb-2 block text-sm font-medium text-slate-400`,className)}
      >
        {title}
      </label>
      {children && <>&nbsp;&nbsp;{children}</>}
    </span>
  );
}
