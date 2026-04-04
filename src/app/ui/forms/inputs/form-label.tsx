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
    <span className="inline-flex">
      <label
        htmlFor={htmlFor}
        className={`mb-2 block text-sm font-medium text-slate-400 ${className}`}
      >
        {title}
      </label>
      {children && <>&nbsp;&nbsp;{children}</>}
    </span>
  );
}
