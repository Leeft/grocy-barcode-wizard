import clsx from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export function Button({ children, className, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      className={clsx(
        "flex",
        "h-10",
        "px-4",
        "items-center",
        "rounded-lg",
        "text-sm",

        "bg-form-input-background",
        "cursor-pointer",

        "border",
        "border-form-input-border",
        "focus:border-form-focused",

        "focus:border-2",
        "focus-visible:form-focused",

        "aria-disabled:cursor-default",
        "aria-disabled:opacity-50",

        "outline-none",
        className,
      )}
    >
      {children}
    </button>
  );
}
