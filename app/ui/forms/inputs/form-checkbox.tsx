import { ChangeEventHandler } from "react";

export function FormCheckbox({
  id,
  ariaDescribedBy,
  onChange,
  checked,
}: {
  id: string;
  ariaDescribedBy: string;
  onChange?: ChangeEventHandler;
  checked: boolean;
}): React.ReactNode {
  return (
    <input
      id={id}
      name={id}
      type="checkbox"
      // className="peer block w-30 rounded-md my-[9.5] py-[6] px-2 border-3 border-[#cccccc] text-base font-bold outline-3 outline-[#cecece] focus:outline-blue-400 placeholder:text-gray-500 border-0! border-transparent"
      className="mr-3"
      aria-describedby={ariaDescribedBy}
      defaultValue="true"
      onChange={onChange}
      defaultChecked={checked}
    />
  );
}
