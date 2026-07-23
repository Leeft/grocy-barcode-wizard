"use client";

import React, { Dispatch, SetStateAction, SyntheticEvent, use, useContext, useRef, useState } from "react";
import { WebCamera, WebCameraHandler } from "@shivantra/react-web-camera";
import { fileToBase64 } from "file64";
import {
  RotateCcw,
  RotateCw,
  Trash,
  SwitchCamera,
  Camera,
  Video,
  VideoOff,
  ImageUp,
  LoaderCircle,
  Crop as CropIcon,
  Check,
} from "lucide-react";
import clsx from "clsx";
import { OneOffSound, OneOffSoundHandler } from "./one-off-sound";
import { deleteProductPhoto } from "@/lib/product-db";
import { GetUser } from "@/lib/user-db";
import { UserContext } from "@/providers/user-context";
import ReactCrop, { convertToPixelCrop, PixelCrop, type Crop } from "react-image-crop";
import { AnyProductPhoto, GrocyPicture, UnsavedPhoto } from "@/interfaces";
import { ProductPhoto } from "@/generated/prisma/client";
import { apiKey, baseUrl } from "@/lib/grocy";

const buttonClassCommon = clsx(
  "flex-row",
  "relative",
  "flex",
  "h-12",
  "w-12",
  "cursor-pointer",
  "justify-center",
  "rounded-4xl",
  "align-middle",
  "disabled:opacity-40",
  "disabled:cursor-default",
);

type CommonButtonArguments = {
  cameraHandler: React.RefObject<WebCameraHandler | null>;
  imageRef: React.RefObject<HTMLImageElement | null>;
  appRef: React.RefObject<HTMLDivElement | null>;
  shutterHandler: React.RefObject<OneOffSoundHandler | null>;
  crop: Crop | undefined;
  cropEnabled: boolean;
  photo: AnyProductPhoto | undefined;
  setPhoto: Dispatch<SetStateAction<AnyProductPhoto | undefined>>;
  setCameraIsEnabled: Dispatch<SetStateAction<boolean>>;
  setCrop: Dispatch<SetStateAction<Crop>>;
  setCropEnabled: Dispatch<SetStateAction<boolean>>;
  date: Date;
};

function isGrocyPhoto(photo: AnyProductPhoto | undefined): photo is GrocyPicture {
  return photo !== undefined && (photo as GrocyPicture).fileName !== undefined;
}

function isDatabasePhoto(photo: AnyProductPhoto | undefined): photo is ProductPhoto {
  return photo !== undefined && (photo as ProductPhoto).id !== undefined;
}

function isUnsavedPhoto(photo: AnyProductPhoto | undefined): photo is UnsavedPhoto {
  return (
    photo !== undefined &&
    (photo as UnsavedPhoto).type !== undefined &&
    (photo as UnsavedPhoto).name !== undefined &&
    (photo as UnsavedPhoto).data !== undefined
  );
}

export function CameraApp({ photo: existingPhoto, date: date }: { photo?: AnyProductPhoto; date: Date }) {
  const [photo, setPhoto] = useState<AnyProductPhoto | undefined>(existingPhoto);

  const user = use(useContext(UserContext) as Promise<GetUser>);

  const imageRef = useRef<HTMLImageElement>(null);
  const cameraAppRef = useRef<HTMLDivElement>(null);
  const cameraHandler = useRef<WebCameraHandler>(null);
  const shutterHandler = useRef<OneOffSoundHandler>(null);

  const [cameraIsEnabled, setCameraIsEnabled] = useState<boolean>(
    user.settings?.openCameraByDefault ?? false,
  );

  const [enableCropping, setCropping] = useState<boolean>(false);
  const [crop, setCrop] = useState<Crop>({ unit: "%", x: 20, y: 20, width: 60, height: 60 });

  const commonArguments: CommonButtonArguments = {
    cameraHandler: cameraHandler,
    imageRef: imageRef,
    appRef: cameraAppRef,
    shutterHandler: shutterHandler,
    crop: crop,
    cropEnabled: enableCropping,
    setCameraIsEnabled: setCameraIsEnabled,
    setPhoto: setPhoto,
    setCrop: setCrop,
    setCropEnabled: setCropping,
    photo: photo,
    date: date,
  };

  const dateRef = useRef(date);
  const photoRef = useRef(photo);
  const cropRef = useRef(crop);
  const setCropRef = useRef(setCrop);
  const setPhotoRef = useRef(setPhoto);
  const cropEnabledRef = useRef(enableCropping);

  return (
    <div className="relative py-4 select-none">
      <input type="hidden" name="imageData" value={isUnsavedPhoto(photo) ? photo.data : ""} />
      <input type="hidden" name="imageType" value={isUnsavedPhoto(photo) ? photo.type : ""} />
      <input type="hidden" name="imageName" value={isUnsavedPhoto(photo) ? photo.name : ""} />

      <OneOffSound src="/sound/shutter.mp3" ref={shutterHandler} />

      <div className="flex flex-wrap gap-5" ref={cameraAppRef as React.RefObject<HTMLDivElement | null>}>
        <Toolbar>
          <ButtonEnableCamera
            args={commonArguments}
            enabled={cameraIsEnabled || photo !== undefined}
            disabled={enableCropping}
          />

          <ButtonDisableCamera args={commonArguments} enabled={cameraIsEnabled} disabled={enableCropping} />

          <ButtonSnapshot args={commonArguments} enabled={cameraIsEnabled} disabled={enableCropping} />

          <ButtonSwitch args={commonArguments} enabled={cameraIsEnabled} disabled={enableCropping} />

          <ButtonUpload args={commonArguments} disabled={enableCropping} />

          {photo && (
            <>
              <ButtonRotateImageCounterclockwise args={commonArguments} disabled={enableCropping} />
              <ButtonRotateImageClockwise args={commonArguments} disabled={enableCropping} />
            </>
          )}

          {photo && (
            <div className="flex flex-col gap-y-3">
              <ButtonToggleCrop args={commonArguments} />
              <ButtonConfirmCrop args={commonArguments} />
            </div>
          )}

          <ButtonDeleteImage
            enabled={photo !== undefined}
            args={commonArguments}
            setPhoto={setPhoto}
            disabled={enableCropping}
          />
        </Toolbar>
        <div className="relative">
          {(() => {
            if (cameraIsEnabled && cameraHandler && photo === undefined) {
              return <BackgroundWebcam cameraHandler={cameraHandler} dateRef={dateRef} />;
            } else if (isUnsavedPhoto(photo)) {
              return (
                <BackgroundCapturedImage
                  photo={photoRef}
                  crop={cropRef}
                  cropEnabled={cropEnabledRef}
                  setCrop={setCropRef}
                  setPhoto={setPhotoRef}
                  image={imageRef}
                />
              );
            } else if (isDatabasePhoto(photo) || isGrocyPhoto(photo)) {
              return (
                <BackgroundDatabaseImage
                  photo={photoRef}
                  crop={cropRef}
                  cropEnabled={cropEnabledRef}
                  setCrop={setCropRef}
                  setPhoto={setPhotoRef}
                  image={imageRef}
                />
              );
            } else if (isDatabasePhoto(photo) || isGrocyPhoto(photo)) {
              return (
                <BackgroundGrocyImage
                  photo={photoRef}
                  crop={cropRef}
                  cropEnabled={cropEnabledRef}
                  setCrop={setCropRef}
                  setPhoto={setPhotoRef}
                />
              );
            } else {
              return <BackgroundCameraInactive ref={cameraAppRef} setCameraIsEnabled={setCameraIsEnabled} />;
            }
          })()}
        </div>
      </div>
    </div>
  );
}

export async function cropToCanvas(
  source: HTMLImageElement,
  target: HTMLCanvasElement,
  crop: PixelCrop,
  scaleX: number,
  scaleY: number,
) {
  const ctx = target.getContext("2d");
  if (!ctx) {
    throw new Error("No 2d context");
  }

  const cropX = crop.x * scaleX;
  const cropY = crop.y * scaleY;
  const cropWidth = crop.width * scaleX;
  const cropHeight = crop.height * scaleY;

  ctx.drawImage(source, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
}

function Toolbar({ children }: { children: React.ReactNode }) {
  return <div className="absolute top-8 left-5 z-10 flex gap-3">{children}</div>;
}

function scrollIntoView(cameraAppRef: React.RefObject<unknown>) {
  // @ts-expect-error TS being TS as usual
  cameraAppRef.current!.scrollIntoView({
    behavior: "smooth",
    block: "end",
    inline: "center",
  });
}

function BackgroundCameraInactive({
  ref,
  setCameraIsEnabled,
}: {
  ref: React.RefObject<unknown>;
  setCameraIsEnabled: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        setCameraIsEnabled(true);
        scrollIntoView(ref);
      }}
      title="Click to enable camera"
      className="rounded-1xl h-auto w-full cursor-pointer border border-slate-500 text-slate-500"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/empty-frame.png" alt="" />
    </button>
  );
}

function ButtonEnableCamera({
  args,
  enabled,
  disabled = false,
}: {
  args: CommonButtonArguments;
  enabled: boolean;
  disabled?: boolean;
}) {
  if (args.cameraHandler !== undefined && enabled === true) return <></>;

  return (
    <button
      className={clsx(buttonClassCommon, "bg-enable-camera")}
      onClick={() => {
        args.setCameraIsEnabled(true);
        scrollIntoView(args.appRef);
      }}
      disabled={disabled}
      title="Enable camera"
      type="button"
    >
      <Video size="28" className="relative top-2.5" />
    </button>
  );
}

function ButtonDisableCamera({
  args,
  enabled,
  disabled = false,
}: {
  args: CommonButtonArguments;
  enabled: boolean;
  disabled?: boolean;
}) {
  if (args.cameraHandler === undefined || enabled === false) return <></>;

  return (
    <button
      className={clsx(buttonClassCommon, "bg-disable-camera")}
      onClick={() => {
        args.setCameraIsEnabled(false);
        scrollIntoView(args.appRef);
        if (args.cameraHandler !== null) {
          args.cameraHandler.current?.stop();
        }
      }}
      disabled={disabled}
      title="Disable camera"
      type="button"
    >
      <VideoOff size="28" className="relative top-2.5" />
    </button>
  );
}

function ButtonUpload({
  args,
  id,
  name = "file",
  disabled = false,
}: {
  args: CommonButtonArguments;
  id?: string;
  name?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={id ?? name}
        title="Click to select file for upload"
        className={clsx(
          "block",
          buttonClassCommon,
          "bg-upload-file!",
          "hover:bg-upload-file!",
          disabled ? "cursor-none opacity-40" : "",
        )}
      >
        <ImageUp size="28" className="relative top-2.5" />
      </label>
      <input
        id={id ?? name}
        name={name}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        className="w-0 p-0 opacity-0 disabled:cursor-default disabled:opacity-40"
        disabled={disabled}
        onChange={(event) => {
          if (event.target.files !== null && event.target.files[0] !== undefined) {
            const file = event.target.files[0];
            if (file) {
              const reader = new FileReader();
              reader.addEventListener("load", () => {
                if (reader.result) {
                  args.setPhoto({
                    name: file.name,
                    type: file.type,
                    data: reader.result.toString(),
                  });
                  console.log(`Loaded image of ${reader.result.toString().length} bytes`);
                  scrollIntoView(args.appRef);
                }
              });
              reader.readAsDataURL(file);
            }
          }
        }}
      />
    </div>
  );
}

function ButtonSnapshot({
  args,
  enabled,
  disabled = false,
}: {
  args: CommonButtonArguments;
  enabled: boolean;
  disabled?: boolean;
}) {
  if (args.cameraHandler === null || enabled === false) return <></>;

  async function handleCapture() {
    scrollIntoView(args.appRef);
    const file = await args.cameraHandler.current?.capture();
    if (file) {
      args.shutterHandler.current?.play();
      const base64 = await fileToBase64(file);
      args.setPhoto({
        name: file.name,
        type: file.type,
        data: base64,
      });
    }
  }

  return (
    <button
      className={clsx(buttonClassCommon, "bg-take-snapshot")}
      onClick={handleCapture}
      disabled={disabled}
      title="Take snapshot"
      type="button"
    >
      <Camera size="28" className="relative top-2.5" />
    </button>
  );
}

function ButtonSwitch({
  args,
  enabled,
  disabled = false,
}: {
  args: CommonButtonArguments;
  enabled: boolean;
  disabled?: boolean;
}) {
  if (args.cameraHandler === null || enabled === false) return <></>;

  return (
    <button
      className={clsx(buttonClassCommon, "bg-switch-camera")}
      disabled={disabled}
      title="Switch camera"
      type="button"
      onClick={() => {
        args.cameraHandler.current?.switch();
        scrollIntoView(args.appRef);
      }}
    >
      <SwitchCamera size="28" className="relative top-2.5" />
    </button>
  );
}

function ButtonToggleCrop({ args, disabled = false }: { args: CommonButtonArguments; disabled?: boolean }) {
  return (
    <button
      className={clsx(buttonClassCommon, "bg-toggle-cropping")}
      onClick={() => args.setCropEnabled(!args.cropEnabled)}
      disabled={disabled}
      title="Toggle cropping"
      type="button"
    >
      <CropIcon size="28" className="relative top-2.5" />
    </button>
  );
}

function ButtonConfirmCrop({ args, disabled }: { args: CommonButtonArguments; disabled?: boolean }) {
  const [busy, setBusy] = useState<boolean>(false);

  if (!args.cropEnabled) return <></>;
  if (args.crop === undefined) return <></>;
  const crop = args.crop as Crop;

  let filename = `missing-image-name=${args.date.getTime()}.jpg`;
  if (isUnsavedPhoto(args.photo)) {
    filename = args.photo.name;
  } else if (isDatabasePhoto(args.photo)) {
    filename = args.photo.filename;
  }

  async function applyCrop() {
    const image = args.imageRef!.current;
    if (!image || !crop) {
      //console.log("image", image, "crop", args.crop);
      throw new Error("Crop canvas does not exist");
    }

    setBusy(true);

    const sourceImage = new Image();
    sourceImage.onload = () => {
      const target = document.createElement("canvas");
      const ctx = target.getContext("2d");
      if (ctx !== null) {
        const width = image.naturalWidth;
        const height = image.naturalHeight;
        target.width = (crop.width / 100) * width;
        target.height = (crop.height / 100) * height;
        // console.log(
        //   `original is ${image.naturalWidth} x ${image.naturalHeight}, crop is ${crop.width} x ${crop.height} => ${target.width} x ${target.height} `,
        // );

        const pixelCrop = convertToPixelCrop(crop, width, height);
        // console.log(`pixel crop is`, pixelCrop);
        cropToCanvas(sourceImage, target, pixelCrop, 1, 1);

        filename.replace(/[.](png|webp|gif|bmp|jpeg)$/i, ".jpg");
        args.setPhoto({
          name: filename,
          type: "image/jpeg",
          data: target.toDataURL("image/jpeg", 0.85),
        });

        args.setCropEnabled(false);
        args.setCrop({ unit: "%", x: 20, y: 20, width: 60, height: 60 });
        scrollIntoView(args.appRef);
      }
      setBusy(false);
    };

    if (isUnsavedPhoto(args.photo)) {
      sourceImage.src = args.photo.data;
    } else if (isDatabasePhoto(args.photo)) {
      console.log("image is", args.photo);
      sourceImage.src = `data:${args.photo.filetype};base64,` + args.photo.data.toBase64();
    } else {
      throw new Error("not yet implemented");
    }
  }

  return (
    <button
      className={clsx(buttonClassCommon, "bg-confirm-crop")}
      onClick={() => applyCrop()}
      disabled={disabled}
      title="Confirm crop"
      type="button"
    >
      <LoaderIfBusy busy={busy} reverse={false}>
        <Check size="28" className="relative top-2.5" />
      </LoaderIfBusy>
    </button>
  );
}

function ButtonRotateImageCounterclockwise({
  args,
  disabled = false,
}: {
  args: CommonButtonArguments;
  disabled?: boolean;
}) {
  const [busy, setBusy] = useState<boolean>(false);

  if (!isUnsavedPhoto(args.photo) && !isDatabasePhoto(args.photo)) return <></>;

  let filename = `missing-image-name=${args.date.getTime()}.png`;
  if (isUnsavedPhoto(args.photo)) {
    filename = args.photo.name;
  } else if (isDatabasePhoto(args.photo)) {
    filename = args.photo.filename;
  }

  async function handleRotateCounterClockwise(photo: AnyProductPhoto) {
    if (!isUnsavedPhoto(photo) && !isDatabasePhoto(photo)) return;
    setBusy(true);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = img.height;
      canvas.height = img.width;
      if (ctx !== null) {
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((-90 * Math.PI) / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        args.setPhoto({
          name: filename,
          type: "image/png",
          data: canvas.toDataURL("image/png"),
        });
        scrollIntoView(args.appRef);
      }
      setBusy(false);
    };
    if (isUnsavedPhoto(photo)) {
      img.src = photo.data;
    } else if (isDatabasePhoto(photo)) {
      console.log("image is", args.photo);
      img.src = `data:${photo.filetype};base64,` + photo.data.toBase64();
    } else {
      throw new Error("not yet implemented");
    }
  }

  return (
    <button
      onClick={() => handleRotateCounterClockwise(args.photo!)}
      className={clsx(buttonClassCommon, "bg-rotate-image")}
      disabled={disabled}
      title="Rotate 90 degrees counterclockwise"
      type="button"
    >
      <LoaderIfBusy busy={busy} reverse={true}>
        <RotateCcw size="28" className="relative top-2.5" />
      </LoaderIfBusy>
    </button>
  );
}

function ButtonRotateImageClockwise({
  args,
  disabled = false,
}: {
  args: CommonButtonArguments;
  disabled?: boolean;
}) {
  const [busy, setBusy] = useState<boolean>(false);

  if (!isUnsavedPhoto(args.photo) && !isDatabasePhoto(args.photo)) return <></>;

  let filename = `missing-image-name=${args.date.getTime()}.png`;
  if (isUnsavedPhoto(args.photo)) {
    filename = args.photo.name;
  } else if (isDatabasePhoto(args.photo)) {
    filename = args.photo.filename;
  }

  async function handleRotateClockwise(photo: AnyProductPhoto) {
    if (photo === undefined) return;
    setBusy(true);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = img.height;
      canvas.height = img.width;
      if (ctx !== null) {
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((90 * Math.PI) / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        args.setPhoto({
          name: filename,
          type: "image/png",
          data: canvas.toDataURL("image/png"),
        });
        scrollIntoView(args.appRef);
      }
      setBusy(false);
    };
    if (isUnsavedPhoto(photo)) {
      img.src = photo.data;
    } else if (isDatabasePhoto(photo)) {
      img.src = `data:${photo.filetype};base64,` + photo.data.toBase64();
    } else {
      throw new Error("not yet implemented");
    }
  }

  return (
    <button
      onClick={() => handleRotateClockwise(args.photo!)}
      className={clsx(buttonClassCommon, "bg-rotate-image")}
      disabled={disabled}
      title="Rotate 90 degrees clockwise"
      type="button"
    >
      <LoaderIfBusy busy={busy}>
        <RotateCw size="28" className="relative top-2.5" />
      </LoaderIfBusy>
    </button>
  );
}

function LoaderIfBusy({
  busy,
  reverse = false,
  children,
}: {
  busy: boolean;
  reverse?: boolean;
  children: React.ReactNode;
}) {
  if (busy) {
    return <LoaderCircle size="28" className={`${reverse ? "spinner-ccw" : "spinner"} relative top-2.5`} />;
  }
  return <>{children}</>;
}

function ButtonDeleteImage({
  args,
  setPhoto,
  enabled = false,
  disabled = false,
}: {
  args: CommonButtonArguments;
  setPhoto: Dispatch<SetStateAction<AnyProductPhoto | undefined>>;
  enabled?: boolean;
  disabled?: boolean;
}) {
  if (args.photo === undefined || !enabled) return <></>;

  async function handleDelete(photo: AnyProductPhoto) {
    if (photo === undefined) {
      return;
    }

    if (isUnsavedPhoto(photo)) {
      setPhoto(undefined);
      scrollIntoView(args.appRef);
      return;
    }

    if (isDatabasePhoto(photo) && (await deleteProductPhoto(photo.id))) {
      args.setPhoto(undefined);
      setPhoto(undefined);
      scrollIntoView(args.appRef);
      return;
    }

    if (isGrocyPhoto(photo)) {
      const response = await fetch(
        new Request(`${baseUrl}files/${photo.type}/${btoa(photo.fileName)}`, {
          method: "DELETE",
          headers: new Headers({
            "Content-Type": "application/octet-stream",
            Accept: "application/json",
            "GROCY-API-KEY": apiKey!,
          }),
        }),
      );
      if (response.status === 204) {
        console.log("deleted picture OK");
        args.setPhoto(undefined);
        scrollIntoView(args.appRef);
      } else {
        console.error(
          "Error deleting picture from grocy:",
          response.status,
          response.statusText,
          await response.text(),
        );
      }
    }
  }

  return (
    <button
      className={clsx(buttonClassCommon, "bg-discard-image")}
      onClick={() => handleDelete(args.photo!)}
      disabled={disabled}
      title={`${isUnsavedPhoto(args.photo) ? "Discard" : "Delete"} this image`}
      type="button"
    >
      <Trash size="28" className="relative top-2.5" />
    </button>
  );
}

function BackgroundWebcam({
  cameraHandler,
  dateRef,
}: {
  cameraHandler: React.RefObject<WebCameraHandler | null>;
  dateRef: React.RefObject<Date>;
}) {
  return (
    <WebCamera
      ref={cameraHandler}
      videoStyle={{ borderRadius: 0 }}
      className="camera-container -z-40"
      videoClassName="camera-video"
      captureMode="back"
      captureType="png"
      getFileName={() => `next-photo-${dateRef.current.getTime()}.jpeg`}
      onError={(err) => console.error(err)}
    />
  );
}

function BackgroundCapturedImage({
  photo,
  image,
  crop,
  cropEnabled,
  setCrop,
  setPhoto,
}: {
  photo: React.RefObject<AnyProductPhoto | undefined>;
  crop: React.RefObject<Crop>;
  image: React.RefObject<HTMLImageElement | null>;
  cropEnabled: React.RefObject<boolean>;
  setCrop: React.RefObject<Dispatch<SetStateAction<Crop>>>;
  setPhoto: React.RefObject<Dispatch<SetStateAction<AnyProductPhoto | undefined>>>;
}) {
  if (!isUnsavedPhoto(photo.current)) return <></>;

  function onImageLoad(e: SyntheticEvent<HTMLImageElement>) {
    const { naturalWidth: width, naturalHeight: height } = e.currentTarget;
    if (photo.current !== undefined) {
      const _photo = { ...photo.current };
      _photo.width = width;
      _photo.height = height;
      setPhoto.current(_photo);
    }
  }

  return (
    <div key={`captured-image-container`} className="relative">
      {cropEnabled.current ? (
        <>
          <ReactCrop
            className="mx-3 sm:mx-0"
            crop={crop.current}
            onChange={(crop, percentCrop) => setCrop.current(percentCrop)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={image}
              key={`captured-image`}
              src={photo.current.data}
              alt="Captured image from camera"
              onLoad={onImageLoad}
            />
          </ReactCrop>
        </>
      ) : (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={image}
            key={`captured-image`}
            src={photo.current.data}
            alt="Captured image from camera"
            onLoad={onImageLoad}
          />
        </>
      )}
      {false && photo.current !== undefined && (
        <>
          <p>
            Image size is {photo.current!.width} x {photo.current!.height}
          </p>
          <p>Crop is {JSON.stringify(crop.current, null, 2)}</p>
        </>
      )}
    </div>
  );
}

function BackgroundDatabaseImage({
  photo,
  image,
  crop,
  cropEnabled,
  setCrop,
  setPhoto,
}: {
  photo: React.RefObject<AnyProductPhoto | undefined>;
  crop: React.RefObject<Crop>;
  image: React.RefObject<HTMLImageElement | null>;
  cropEnabled: React.RefObject<boolean>;
  setCrop: React.RefObject<Dispatch<SetStateAction<Crop>>>;
  setPhoto: React.RefObject<Dispatch<SetStateAction<AnyProductPhoto | undefined>>>;
}) {
  if (!isDatabasePhoto(photo.current)) return <></>;

  function onImageLoad(e: SyntheticEvent<HTMLImageElement>) {
    const { naturalWidth: width, naturalHeight: height } = e.currentTarget;
    if (photo.current !== undefined) {
      const _photo = { ...photo.current };
      _photo.width = width;
      _photo.height = height;
      setPhoto.current(_photo);
    }
  }

  return (
    <div key={`captured-image-${photo.current.id}-container`} className="relative">
      {cropEnabled.current ? (
        <>
          <ReactCrop
            className="mx-3 sm:mx-0"
            crop={crop.current}
            onChange={(crop, percentCrop) => setCrop.current(percentCrop)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={image}
              key={`captured-image-${photo.current.id}`}
              alt={`BackgroundSavedImage of the product ${photo.current.id}`}
              src={`/api/image/${photo.current.id}?ts=${photo.current.lastChanged}`}
              onLoad={onImageLoad}
            />
          </ReactCrop>
        </>
      ) : (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={image}
            key={`captured-image-${photo.current.id}`}
            alt={`BackgroundSavedImage of the product ${photo.current.id}`}
            src={`/api/image/${photo.current.id}?ts=${photo.current.lastChanged}`}
            onLoad={onImageLoad}
          />
        </>
      )}
      {false && photo.current !== undefined && (
        <>
          <p>
            Image size is {photo.current!.width} x {photo.current!.height}
          </p>
          <p>Crop is {JSON.stringify(crop.current, null, 2)}</p>
        </>
      )}
    </div>
  );
}

function BackgroundGrocyImage({
  photo,
  crop,
  cropEnabled,
  setCrop,
  setPhoto,
}: {
  photo: React.RefObject<AnyProductPhoto | undefined>;
  crop: React.RefObject<Crop>;
  cropEnabled: React.RefObject<boolean>;
  setCrop: React.RefObject<Dispatch<SetStateAction<Crop>>>;
  setPhoto: React.RefObject<Dispatch<SetStateAction<AnyProductPhoto | undefined>>>;
}) {
  if (!isGrocyPhoto(photo.current)) return <></>;

  function onImageLoad(e: SyntheticEvent<HTMLImageElement>) {
    const { naturalWidth: width, naturalHeight: height } = e.currentTarget;
    if (photo.current !== undefined) {
      const _photo = { ...photo.current };
      _photo.width = width;
      _photo.height = height;
      setPhoto.current(_photo);
    }
  }

  return (
    <div key={`grocy-image-container`} className="relative">
      {cropEnabled.current ? (
        <>
          <ReactCrop
            className="mx-3 sm:mx-0"
            crop={crop.current}
            onChange={(crop, percentCrop) => setCrop.current(percentCrop)}
          />
        </>
      ) : (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="my-5 max-w-full rounded-xl md:max-h-100 md:max-w-100"
            alt="Photo of the product as currently saved in Grocy"
            src={baseUrl + "/files/productpictures/" + btoa(photo.current.fileName)}
            onLoad={onImageLoad}
          />
        </>
      )}
    </div>
  );
}
