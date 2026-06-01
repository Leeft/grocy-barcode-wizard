"use client";

import React, { Dispatch, SetStateAction, use, useContext, useRef, useState } from "react";
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
import { deleteProductPhoto, GetProductPhoto } from "@/lib/product-db";
import { GetUser } from "@/lib/user-db";
import { UserContext } from "@/providers/user-context";
import ReactCrop, { convertToPixelCrop, PixelCrop, type Crop } from "react-image-crop";

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
  crop: Crop;
  cropEnabled: boolean;
  setCameraIsEnabled: Dispatch<SetStateAction<boolean>>;
  setType: Dispatch<SetStateAction<string>>;
  setName: Dispatch<SetStateAction<string>>;
  setData: Dispatch<SetStateAction<string>>;
  setCrop: Dispatch<SetStateAction<Crop>>;
  setCropEnabled: Dispatch<SetStateAction<boolean>>;
  data: string;
  type: string;
  name: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function CameraApp({ photo: _photo }: { photo?: any }) {
  const [photo /*, setPhoto*/] = useState<GetProductPhoto | undefined>(_photo ?? undefined);

  const user = use(useContext(UserContext) as Promise<GetUser>);

  const imageRef = useRef<HTMLImageElement>(null);
  const cameraAppRef = useRef<HTMLDivElement>(null);
  const cameraHandler = useRef<WebCameraHandler>(null);
  const shutterHandler = useRef<OneOffSoundHandler>(null);

  const [cameraIsEnabled, setCameraIsEnabled] = useState<boolean>(
    user.settings?.openCameraByDefault ?? false,
  );

  // eslint-disable-next-line react-hooks/purity
  const [lastSaved, setLastSaved] = useState<number>(photo?.lastChanged ?? Math.floor(Date.now() / 1000));
  const [photoId, setPhotoId] = useState<number | undefined>(photo !== undefined ? photo.id : undefined);
  const [enableCropping, setCropping] = useState<boolean>(false);
  const [data, setData] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [crop, setCrop] = useState<Crop>({ unit: "%", x: 0, y: 0, width: 100, height: 100 });

  const haveImage: boolean = data !== "" || (photoId !== undefined && photoId > 0);
  const commonArguments: CommonButtonArguments = {
    cameraHandler: cameraHandler,
    imageRef: imageRef,
    appRef: cameraAppRef,
    shutterHandler: shutterHandler,
    crop: crop,
    cropEnabled: enableCropping,
    setCameraIsEnabled: setCameraIsEnabled,
    setType: setType,
    setName: setName,
    setData: setData,
    setCrop: setCrop,
    setCropEnabled: setCropping,
    data: data ? data : `/api/image/${photoId}`,
    type: type,
    name: name,
  };

  return (
    <div className="relative py-4">
      <input type="hidden" name="imageData" value={data} />
      <input type="hidden" name="imageType" value={type} />
      <input type="hidden" name="imageName" value={name} />

      <OneOffSound src="/sound/shutter.mp3" ref={shutterHandler} />
      <div className="flex flex-wrap gap-5" ref={cameraAppRef as React.RefObject<HTMLDivElement | null>}>
        <Toolbar>
          <ButtonEnableCamera
            args={commonArguments}
            enabled={cameraIsEnabled || data || photoId ? true : false}
            disabled={enableCropping}
          />

          <ButtonDisableCamera
            args={commonArguments}
            enabled={cameraIsEnabled && !data && !photoId}
            disabled={enableCropping}
          />

          <ButtonSnapshot
            args={commonArguments}
            enabled={cameraIsEnabled && !data && !photoId}
            setLastSaved={setLastSaved}
            disabled={enableCropping}
          />

          <ButtonSwitch
            args={commonArguments}
            enabled={cameraIsEnabled && !data && !photoId}
            disabled={enableCropping}
          />

          <ButtonUpload args={commonArguments} disabled={enableCropping} />

          {haveImage && (
            <>
              <ButtonRotateImageCounterclockwise args={commonArguments} disabled={enableCropping} />
              <ButtonRotateImageClockwise args={commonArguments} disabled={enableCropping} />
            </>
          )}

          {haveImage && (
            <div className="flex flex-col gap-y-3">
              <ButtonToggleCrop args={commonArguments} />
              <ButtonConfirmCrop args={commonArguments} />
            </div>
          )}

          <ButtonDeleteImage
            enabled={haveImage}
            args={commonArguments}
            photoId={photoId}
            setPhotoId={setPhotoId}
            disabled={enableCropping}
          />
        </Toolbar>
        <div className="relative">
          {(() => {
            if (data !== undefined && data !== "") {
              return <BackgroundCapturedImage args={commonArguments} />;
            } else if (photoId !== undefined && photoId > 0) {
              return <BackgroundSavedImage args={commonArguments} photoId={photoId} lastSaved={lastSaved} />;
            } else if (cameraIsEnabled && cameraHandler) {
              return <BackgroundWebcam cameraHandler={cameraHandler} />;
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
        htmlFor={name}
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
              args.setName(file.name);
              args.setType(file.type);
              const reader = new FileReader();
              reader.addEventListener("load", () => {
                if (reader.result) {
                  args.setData(reader.result.toString());
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
  setLastSaved,
  disabled = false,
}: {
  args: CommonButtonArguments;
  enabled: boolean;
  setLastSaved: Dispatch<SetStateAction<number>>;
  disabled?: boolean;
}) {
  if (args.cameraHandler === null || enabled === false) return <></>;

  async function handleCapture() {
    scrollIntoView(args.appRef);
    const file = await args.cameraHandler.current?.capture();
    if (file) {
      args.shutterHandler.current?.play();
      setLastSaved(Math.floor(Date.now() / 1000));
      const base64 = await fileToBase64(file);
      args.setData(base64);
      args.setName(file.name);
      args.setType(file.type);
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

  async function applyCrop() {
    const image = args.imageRef!.current;
    if (!image || !args.crop) {
      console.log("image", image, "crop", args.crop);
      throw new Error("Crop canvas does not exist");
    }

    setBusy(true);

    const sourceImage = new Image();
    sourceImage.onload = () => {
      const target = document.createElement("canvas");
      const ctx = target.getContext("2d");
      if (ctx !== null) {
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        target.width = args.crop.width * scaleX;
        target.height = args.crop.height * scaleY;
        // console.log(
        //   `original is ${image.naturalWidth} x ${image.naturalHeight}, crop is ${args.crop.width} x ${args.crop.height} => ${target.width} x${target.height} `,
        // );
        const pixelCrop = convertToPixelCrop(args.crop, args.crop.width, args.crop.height);
        cropToCanvas(sourceImage, target, pixelCrop, scaleX, scaleY);
        args.setData(target.toDataURL("image/jpeg", 0.85));
        args.setType("image/jpeg");
        args.setCropEnabled(false);
        args.setCrop({ unit: "%", x: 0, y: 0, width: 100, height: 100 });
        scrollIntoView(args.appRef);
      }
      setBusy(false);
    };
    sourceImage.src = args.data;
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

  if (args.data === undefined || args.data === "") return <></>;

  async function handleRotateLeft() {
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
        args.setData(canvas.toDataURL("image/png"));
        args.setType("image/png");
        scrollIntoView(args.appRef);
      }
      setBusy(false);
    };
    img.src = args.data;
  }

  return (
    <button
      onClick={() => handleRotateLeft()}
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

  if (args.data === undefined || args.data === "") return <></>;

  async function handleRotateLeft(data: string) {
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
        args.setData(canvas.toDataURL("image/png"));
        args.setType("image/png");
        scrollIntoView(args.appRef);
      }
      setBusy(false);
    };
    img.src = data;
  }

  return (
    <button
      onClick={() => handleRotateLeft(args.data)}
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
  if (busy)
    return <LoaderCircle size="28" className={`${reverse ? "spinner-ccw" : "spinner"} relative top-2.5`} />;
  return <>{children}</>;
}

function ButtonDeleteImage({
  args,
  photoId,
  setPhotoId,
  enabled = false,
  disabled = false,
}: {
  args: CommonButtonArguments;
  photoId: number | undefined;
  setPhotoId: Dispatch<SetStateAction<number | undefined>>;
  enabled?: boolean;
  disabled?: boolean;
}) {
  if ((args.data === undefined || args.data === "") && !photoId) return <></>;
  if (!enabled) return <></>;

  async function handleDelete(id: number | undefined) {
    if (id === undefined) {
      args.setData("");
      return;
    }

    if (await deleteProductPhoto(id)) {
      args.setData("");
      setPhotoId(undefined);
      scrollIntoView(args.appRef);
    }
  }

  return (
    <button
      className={clsx(buttonClassCommon, "bg-discard-image")}
      onClick={() => handleDelete(photoId)}
      disabled={disabled}
      title={`${photoId !== undefined ? "Delete" : "Discard"} this image`}
      type="button"
    >
      <Trash size="28" className="relative top-2.5" />
    </button>
  );
}

function BackgroundWebcam({ cameraHandler }: { cameraHandler: React.RefObject<WebCameraHandler | null> }) {
  return (
    <WebCamera
      ref={cameraHandler}
      videoStyle={{ borderRadius: 0 }}
      className="camera-container -z-40"
      videoClassName="camera-video"
      captureMode="back"
      captureType="png"
      getFileName={() => `next-photo-${Date.now()}.jpeg`}
      onError={(err) => console.error(err)}
    />
  );
}

function BackgroundCapturedImage({ args }: { args: CommonButtonArguments }) {
  if (args.data === undefined || args.data === "") return <></>;

  return (
    <div key={`captured-image-container`} className="relative">
      {args.cropEnabled ? (
        <>
          {/* eslint-disable-next-line react-hooks/refs */}
          <ReactCrop className="mx-3 sm:mx-0" crop={args.crop} onChange={(c) => args.setCrop(c)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              // eslint-disable-next-line react-hooks/refs
              ref={args.imageRef}
              key={`captured-image`}
              // eslint-disable-next-line react-hooks/refs
              src={args.data}
              alt="Captured image from camera"
            />
          </ReactCrop>
        </>
      ) : (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            // eslint-disable-next-line react-hooks/refs
            ref={args.imageRef}
            key={`captured-image`}
            // eslint-disable-next-line react-hooks/refs
            src={args.data}
            alt="Captured image from camera"
          />
        </>
      )}
      {/* <p>
        Image size is {args.data.length} ({args.imageRef?.current?.width} x {args.imageRef?.current?.height})
      </p>
      <p>Crop is {JSON.stringify(args.crop, null, 2)}</p> */}
    </div>
  );
}

function BackgroundSavedImage({
  args,
  photoId,
  lastSaved,
}: {
  args: CommonButtonArguments;
  photoId: number;
  lastSaved: number;
}) {
  return (
    <div key={`captured-image-${photoId}-container`} className="relative">
      {args.cropEnabled ? (
        <>
          <ReactCrop className="mx-3 sm:mx-0" crop={args.crop} onChange={(c) => args.setCrop(c)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={args.imageRef}
              key={`captured-image-${photoId}`}
              alt={`BackgroundSavedImage of the product ${photoId}`}
              src={`/api/image/${photoId}?ts=${lastSaved}`}
            />
          </ReactCrop>
        </>
      ) : (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            // eslint-disable-next-line react-hooks/refs
            ref={args.imageRef}
            key={`captured-image-${photoId}`}
            alt={`BackgroundSavedImage of the product ${photoId}`}
            src={`/api/image/${photoId}?ts=${lastSaved}`}
          />
        </>
      )}
      {/* <p>
        Image size is {args.data.length} ({args.imageRef?.current?.width} x {args.imageRef?.current?.height})
      </p>
      <p>Crop is {JSON.stringify(args.crop, null, 2)}</p> */}
    </div>
  );
}
