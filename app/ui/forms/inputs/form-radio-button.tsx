export default function FormRadiobutton({
  id,
  name,
  defaultValue,
  className,
  children,
  defaultChecked = false,
}: {
  id: string;
  name: string;
  defaultValue?: string;
  className?: string;
  children: React.ReactNode;
  defaultChecked?: boolean;
}) {
  return (
    <div className={`inline-flex grow items-center ${className}`}>
      <label className="relative w-8 flex-none cursor-pointer items-center pt-3" htmlFor={id}>
        <input
          name={name}
          defaultValue={defaultValue}
          defaultChecked={defaultChecked}
          type="radio"
          className="peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-slate-300 transition-all checked:border-slate-400"
          id={id}
        />
        <span className="absolute top-5.5 left-2.5 h-3 w-3 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-slate-300 opacity-0 transition-opacity duration-200 peer-checked:opacity-100"></span>
      </label>
      <label className="float-left cursor-pointer pt-1 text-sm text-slate-200" htmlFor={id}>
        {children}
      </label>
    </div>
  );
}
