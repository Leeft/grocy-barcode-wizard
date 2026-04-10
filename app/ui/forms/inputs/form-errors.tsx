export function FormErrors({
  id,
  errors,
}: {
  id: string;
  errors: string[] | undefined;
}) {
  if (errors === undefined) {
    return <></>;
  }
  
  return (
    <div id={id} aria-live="polite" aria-atomic="true">
      {errors &&
        errors?.map((error: string) => (
          <p className="mt-2 text-sm text-red-500" key={error}>
            {error}
          </p>
        ))}
    </div>
  );
}
