export function FormErrors({
  id,
  errors,
  className,
}: {
  id: string;
  errors: string[] | undefined;
  className?: string;
}) {
  if (errors === undefined) {
    return <></>;
  }
  
  return (
    <div id={id} aria-live="polite" aria-atomic="true" className={className}>
      {errors &&
        errors?.map((error: string) => (
          <p className="mt-2 mb-4 text-sm text-red-500" key={error}>
            {error}
          </p>
        ))}
    </div>
  );
}
