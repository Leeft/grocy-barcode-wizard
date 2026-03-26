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
    <div className={`inline-flex flex-grow items-center ${className}`}>
      <label className="relative flex-none items-center cursor-pointer w-8 pt-3" htmlFor={id}>
        <input
          name={name}
          defaultValue={defaultValue}
          defaultChecked={defaultChecked}
          type="radio"
          className="peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-slate-300 checked:border-slate-400 transition-all"
          id={id}
        />
        <span className="absolute bg-slate-300 w-3 h-3 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity duration-200 top-[22px] left-[10px] transform -translate-x-1/2 -translate-y-1/2"></span>
      </label>
      <label className="text-slate-200 cursor-pointer text-sm float-left pt-1" htmlFor={id}>
        {children}
      </label>
    </div>
  );
}
