import Image from 'next/image';

export function NewProductTypeChoiceDescription({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-slate-400 [&>*]:mt-3 [&>*]:mb-4 [&>h1]:font-bold [&>h1]:uppercase [&>p>em]:mr-[0.90]">
      {children}
    </div>
  );
}

export function NewProductTypeChoiceButton({
  title,
  isSelected,
  setAsSelected,
  imageSource,
  imageDescription = "",
  imageWidth,
  imageHeight,
  imageClassName = "m-3 inline",
}: {
  title: string;
  isSelected: boolean;
  setAsSelected: Function;
  imageSource: string;
  imageDescription?: string;
  imageWidth: number;
  imageHeight?: number;
  imageClassName?: string;
}) {
  return (
    <button
      className={`flex-1 pd-5 m-1 border-1 text-lg cursor-pointer uppercase ${isSelected ? "bg-slate-600" : ""}`}
      onClick={() => {
        setAsSelected();
      }}
    >
      <div>
        <Image
          src={imageSource}
          alt={imageDescription}
          width={imageWidth}
          height={imageHeight}
          className={imageClassName}
        />{" "}
        {title}
      </div>
    </button>
  );
}
