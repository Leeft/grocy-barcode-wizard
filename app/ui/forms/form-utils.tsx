import { dueDaysInputCommonStyles } from "@/lib/product-form-shared";
import { FieldMetadata, getInputProps } from "@conform-to/react";
import TooltipWrapper from "../tooltip-wrapper";
import clsx from "clsx";

export function FormRow({
  children,
  className,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex flex-row flex-wrap gap-x-5 ${className}`}>
      {children}
    </div>
  );
}

export function FormColumn({
  children,
  className = "mb-4 flex-auto",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

interface DueDaysInputProps extends React.SelectHTMLAttributes<HTMLInputElement> {
  fieldInfo: FieldMetadata<unknown>;
  placeholder?: string;
  className?: string;
}

const DueDaysInput: React.FC<DueDaysInputProps> = ({
  fieldInfo,
  placeholder,
  className,
  ...rest
}) => {
  return (
    <input
      {...getInputProps(fieldInfo, {
        type: "number",
      })}
      className={`${dueDaysInputCommonStyles} ${className}`}
      placeholder={placeholder}
      min={0}
      max={10000}
      step={1}
      required
      {...rest}
    />
  );
};

export function DueDaysColumn({
  className = "mb-0 w-56",
  labelClassName,
  title,
  fieldInfo,
  placeholder,
}: {
  className?: string;
  labelClassName?: string;
  title: string;
  fieldInfo: FieldMetadata<unknown>;
  placeholder: string;
}) {
  return (
    <FormColumn className={className}>
      <FormLabel
        htmlFor={fieldInfo.name}
        className={clsx(
          "block w-full align-bottom text-xs text-wrap",
          labelClassName,
        )}
        title={title}
      />
      <FormField>
        <DueDaysInput
          fieldInfo={fieldInfo}
          className="w-full"
          placeholder={placeholder}
        />
      </FormField>
      <FormErrors
        id={fieldInfo.errorId}
        errors={fieldInfo.errors}
        className="w-full"
      />
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
      <label
        htmlFor={fieldInfo.id}
        className={`cursor-pointer ` + labelClassName}
      >
        {children}
      </label>
    </>
  );
};

export function ShouldNotBeFrozenTooltip() {
  return (
    <TooltipWrapper id="not-frozen-tooltip">
      Checking this checkbox will hide or disable some options for you, making
      it a bit faster to fill out this form.
    </TooltipWrapper>
  );
}

export function WeightModeTooltip() {
  return (
    <TooltipWrapper id="weight-mode-tooltip">
      For the units specify the discrete weight, volume or more abstract unit
      you buy this product at. E.g. if you buy it in a 450g package, specify
      just that. Or your bell peppers might come in a bag of 3 without listing
      the weight, so you specify &ldquo;1 bag&rdquo; as the abstract unit here.
      We will refine required conversions before submitting the data to Grocy.
    </TooltipWrapper>
  );
}

export function PackagingDateTooltip() {
  return (
    <TooltipWrapper id="packaging-date-tooltip">
      When you set or change <em>both</em> the due- and packaging dates the
      &ldquo;default due days&rdquo; will be set to the difference between these
      two dates.
      <br />
      <br />
      Besides this utility the packaging date input currently has no function
      other than to calculate this date difference for you.
    </TooltipWrapper>
  );
}
