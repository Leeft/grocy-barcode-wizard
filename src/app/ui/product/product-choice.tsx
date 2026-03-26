import ContentToggle from "@/app/components/content-toggle";
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
    <div className="text-slate-400 text-left [&_p]:mt-3 [&_p]:mb-4 [&_h1]:font-bold [&_h1]:uppercase [&_p>em]:mr-[0.90]">
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
      className={`flex-1 rounded-lg border-1 text-xs md:text-lg cursor-pointer uppercase ${isSelected ? "bg-slate-600" : ""}`}
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
        <div className="text-xs md:text-lg w-full min-h-9 inline-block">{title}</div>
      </div>
    </button>
  );
}
