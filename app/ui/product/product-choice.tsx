import ContentToggle from "@/components/content-toggle";
import Image from "next/image";
import React from "react";

export function NewProductTypeChoiceDescription({
  id,
  title,
  children,
}: {
  id: string;
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="text-left text-slate-400 [&_h1]:font-bold [&_h1]:uppercase [&_p]:mt-3 [&_p]:mb-4 [&_p>em]:mr-[0.90]">
      <ContentToggle id={id} title={title}>
        {children}
      </ContentToggle>
    </div>
  );
}

export function NewProductTypeChoiceButton({
  title,
  isSelected,
  setAsSelected,
  numberToSet,
  imageSource,
  imageDescription = "",
  imageWidth,
  imageHeight,
  imageClassName = "m-3 inline",
}: {
  title: string;
  isSelected: boolean;
  setAsSelected: React.Dispatch<React.SetStateAction<number>>;
  numberToSet: number;
  imageSource: string;
  imageDescription?: string;
  imageWidth: number;
  imageHeight?: number;
  imageClassName?: string;
}) {
  return (
    <button
      className={`flex-1 cursor-pointer rounded-lg border text-xs uppercase md:text-lg ${isSelected ? "bg-slate-600" : ""}`}
      onClick={() => setAsSelected(numberToSet)}
    >
      <div>
        <div className="min-h-14">
          <Image
            src={imageSource}
            alt={imageDescription}
            width={imageWidth}
            height={imageHeight}
            className={imageClassName}
          />
        </div>{" "}
        <div className="inline-block min-h-9 w-full text-xs md:text-lg">
          {title}
        </div>
      </div>
    </button>
  );
}
