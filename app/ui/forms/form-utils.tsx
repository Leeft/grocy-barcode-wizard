import React, { Dispatch, SetStateAction } from "react";
import { inputCommonStyles } from "@/lib/product-form-shared";
import { FieldMetadata, getInputProps } from "@conform-to/react";
import TooltipWrapper from "../tooltip-wrapper";
import clsx from "clsx";

export function FormRow({
  children,
  className,
  comment,
}: {
  className?: string;
  children: React.ReactNode;
  comment?: string;
}) {
  if (comment) {
    // NOOP, just making the variable used
  }
  return <div className={`flex flex-row flex-wrap gap-x-5 ${className}`}>{children}</div>;
}

export function FormContainer({ children, comment }: { children: React.ReactNode; comment?: string }) {
  if (comment) {
    // NOOP, just making the variable used
  }
  return <>{children}</>;
}

export function FormRowGroup({
  children,
  className,
  comment,
}: {
  className?: string;
  children: React.ReactNode;
  comment?: string;
}) {
  if (comment) {
    // NOOP, just making the variable used
  }
  return <div className={className}>{children}</div>;
}

export function FormColumn({
  children,
  className = "flex-auto",
  comment,
}: {
  children?: React.ReactNode;
  className?: string;
  comment?: string;
}) {
  if (comment) {
    // NOOP, just making the variable used
  }
  return <div className={clsx(className)}>{children}</div>;
}

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
    <>
      <label
        htmlFor={htmlFor}
        className={clsx("text-sm", "font-light", "text-form-label", "block", "mt-2", "mb-2", className)}
      >
        {title}
      </label>
      {children && <>&nbsp;&nbsp;{children}</>}
    </>
  );
}

export function FormField({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={clsx("w-full", className)}>{children}</div>;
}

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
    <div id={id} aria-live="polite" aria-atomic="true" className={clsx("w-full", "pt-2", className)}>
      {errors &&
        errors?.map((error: string) => (
          <p className={clsx("text-sm", "text-form-error")} key={error}>
            {error}
          </p>
        ))}
    </div>
  );
}

interface DueDaysInputProps extends React.SelectHTMLAttributes<HTMLInputElement> {
  fieldInfo: FieldMetadata<unknown>;
  placeholder?: string;
  className?: string;
  value?: string;
  setValue?: Dispatch<SetStateAction<string>>;
}

const DueDaysInput: React.FC<DueDaysInputProps> = ({
  fieldInfo,
  placeholder,
  className,
  value,
  setValue,
  ...rest
}) => {
  if (value !== undefined && setValue !== undefined) {
    rest.defaultValue = undefined;
    return (
      <input
        {...getInputProps(fieldInfo, {
          type: "number",
        })}
        className={`${inputCommonStyles} ${className}`}
        placeholder={placeholder}
        min={0}
        max={10000}
        step={1}
        required
        value={value}
        onChange={(e) => setValue(e.currentTarget.value)}
        {...rest}
      />
    );
  } else {
    return (
      <input
        {...getInputProps(fieldInfo, {
          type: "number",
        })}
        className={`${inputCommonStyles} ${className}`}
        placeholder={placeholder}
        min={0}
        max={10000}
        step={1}
        required
        {...rest}
      />
    );
  }
};

export function DueDaysColumn({
  className = "mb-0 w-56",
  labelClassName,
  title,
  fieldInfo,
  placeholder,
  value,
  setValue,
}: {
  className?: string;
  labelClassName?: string;
  title: string;
  fieldInfo: FieldMetadata<unknown>;
  placeholder: string;
  value?: string;
  setValue?: Dispatch<SetStateAction<string>>;
}) {
  return (
    <FormColumn className={className}>
      <FormLabel
        htmlFor={fieldInfo.id}
        className={clsx("block w-full align-bottom text-xs text-wrap", labelClassName)}
        title={title}
      />
      <FormField>
        <DueDaysInput
          fieldInfo={fieldInfo}
          value={value}
          setValue={setValue}
          className="w-full"
          placeholder={placeholder}
        />
      </FormField>
      <FormErrors id={fieldInfo.errorId} errors={fieldInfo.errors} className="w-full" />
    </FormColumn>
  );
}

interface FormCheckBoxProps extends React.SelectHTMLAttributes<HTMLInputElement> {
  fieldInfo: FieldMetadata<unknown>;
  className?: string;
  labelClassName?: string;
  children: React.ReactNode;
}

export const FormCheckbox: React.FC<FormCheckBoxProps> = ({
  fieldInfo,
  className = "mr-2 cursor-pointer",
  labelClassName = "leading-6",
  children,
  ...rest
}) => {
  return (
    <>
      <input
        {...getInputProps(fieldInfo, {
          type: "checkbox",
        })}
        className={className}
        onChange={rest.onChange}
      />
      <label htmlFor={fieldInfo.id} className={`cursor-pointer ` + labelClassName}>
        {children}
      </label>
    </>
  );
};

export function ShouldNotBeFrozenTooltip() {
  return (
    <TooltipWrapper id="not-frozen-tooltip">
      Checking this checkbox will hide or disable some options for you, making it a bit faster to fill out
      this form.
    </TooltipWrapper>
  );
}

export function WeightModeTooltip() {
  return (
    <TooltipWrapper id="weight-mode-tooltip">
      For the units specify the discrete weight, volume or more abstract unit you buy this product at. E.g. if
      you buy it in a 450g package, specify just that. Or your bell peppers might come in a bag of 3 without
      listing the weight, so you specify &ldquo;1 bag&rdquo; as the abstract unit here. We will refine
      required conversions before submitting the data to Grocy.
    </TooltipWrapper>
  );
}

export function PackagingDateTooltip() {
  return (
    <TooltipWrapper id="packaging-date-tooltip">
      When you set or change <em>both</em> the due- and packaging dates the &ldquo;default due days&rdquo;
      will be set to the difference between these two dates.
      <br />
      <br />
      Besides this utility the packaging date input currently has no function other than to calculate this
      date difference for you.
    </TooltipWrapper>
  );
}

export function WeightModeAmountTooltip() {
  return (
    <TooltipWrapper id="weight-mode-amount-tooltip">
      The value you enter here is not directly used for the product itself, but for the conversions that will
      also be set up as required by the product configuration. You&apos;re asked for it now as it is easy to
      read off the packaging during initial data entry, and then you can put the product in storage.
      <br />
      <br />
      Enter the value that matters for repeat purchases. Enter e.g. <code>&ldquo;1&rdquo;</code> for a
      &ldquo;1 litre carton of milk&rdquo;, <code>&ldquo;0.7&rdquo;</code> for &ldquo;70cl bottles of
      wine&rdquo;, or <code>&ldquo;450&rdquo;</code> for bags of frozen vegetables that come in 450 gram bags.
    </TooltipWrapper>
  );
}
