export function FormField({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative mt-2 rounded-md ${className}`}>{children}</div>
  );
}
