"use client";

import React, { Dispatch, RefObject, SetStateAction, useRef, useState } from "react";
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
} from "lucide-react";
import clsx from "clsx";
import OneOffSound, { OneOffSoundHandler } from "./one-off-sound";
import { GetProductPhoto } from "@/lib/product-db";

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
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function CameraApp({ photo: _photo }: { photo?: any }) {
  const [photo /*, setPhoto*/] = useState<GetProductPhoto | undefined>(_photo ?? undefined);
  // const [image, setImage] = useState<string | undefined>(undefined);

  const cameraHandler = useRef<WebCameraHandler>(null);
  const shutterHandler = useRef<OneOffSoundHandler>(null);

  const [cameraIsEnabled, setCameraIsEnabled] = useState<boolean>(false);

  const [photoId, setPhotoId] = useState<number | undefined>(photo !== undefined ? photo.id : undefined);
  const [data, setData] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [name, setName] = useState<string>("");

  return (
    <div className="relative py-4">
      <input type="hidden" name="imageData" value={data} />
      <input type="hidden" name="imageType" value={type} />
      <input type="hidden" name="imageName" value={name} />

      <OneOffSound src="/sound/shutter.mp3" ref={shutterHandler} />
      <div className="flex flex-wrap gap-5">
        <Toolbar>
          <ButtonEnableCamera
            enabled={cameraIsEnabled || data || photoId ? true : false}
            cameraHandler={cameraHandler}
            setEnabled={setCameraIsEnabled}
          />
          <ButtonDisableCamera
            enabled={cameraIsEnabled && !data && !photoId}
            cameraHandler={cameraHandler}
            setEnabled={setCameraIsEnabled}
          />
          <ButtonSnapshot
            enabled={cameraIsEnabled && !data && !photoId}
            setData={setData}
            setType={setType}
            setName={setName}
            cameraHandler={cameraHandler}
            shutterHandler={shutterHandler}
          />
          <ButtonSwitch enabled={cameraIsEnabled && !data && !photoId} cameraHandler={cameraHandler} />
          <ButtonUpload setData={setData} setType={setType} setName={setName} />
          {(data !== "" || (photoId !== undefined && photoId > 0)) && (
            <>
              <ButtonRotateImageCounterclockwise data={data ? data : `/api/image/${photoId}`} setData={setData} setType={setType} />
              <ButtonRotateImageClockwise
                data={data ? data : `/api/image/${photoId}`}
                setData={setData}
                setType={setType}
              />
            </>
          )}
          <ButtonDeleteImage photoId={photoId} data={data} setData={setData} setPhotoId={setPhotoId} />
        </Toolbar>
        <div className="relative">
          {(() => {
            if (data !== undefined && data !== "") {
              return <BackgroundCapturedImage data={data} />;
            } else if (photoId !== undefined && photoId > 0) {
              return <BackgroundSavedImage photoId={photoId} />;
            } else if (cameraIsEnabled && cameraHandler) {
              return <BackgroundWebcam cameraHandler={cameraHandler} />;
            } else {
              return <BackgroundCameraInactive setCameraIsEnabled={setCameraIsEnabled} />;
            }
          })()}
        </div>
      </div>
    </div>
  );
}

function Toolbar({ children }: { children: React.ReactNode }) {
  return <div className="absolute top-8 left-5 z-10 flex gap-3">{children}</div>;
}

function BackgroundCameraInactive({
  setCameraIsEnabled,
}: {
  setCameraIsEnabled: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <button
      type="button"
      onClick={() => setCameraIsEnabled(true)}
      title="Click to enable camera"
      className="rounded-1xl h-auto w-full cursor-pointer border border-slate-500 text-slate-500"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/empty-frame.png" alt="" />
    </button>
  );
}

function ButtonEnableCamera({
  cameraHandler,
  enabled,
  setEnabled,
}: {
  cameraHandler: React.RefObject<WebCameraHandler | null>;
  enabled: boolean;
  setEnabled: Dispatch<SetStateAction<boolean>>;
}) {
  if (cameraHandler !== undefined && enabled === true) return <></>;

  return (
    <button
      className={clsx(buttonClassCommon, "bg-red-800")}
      onClick={() => setEnabled(true)}
      title="Enable camera"
      type="button"
    >
      <Video size="28" className="relative top-2.5" />
    </button>
  );
}

function ButtonDisableCamera({
  cameraHandler,
  enabled,
  setEnabled,
}: {
  cameraHandler: React.RefObject<WebCameraHandler | null>;
  enabled: boolean;
  setEnabled: Dispatch<SetStateAction<boolean>>;
}) {
  if (cameraHandler === undefined || enabled === false) return <></>;

  return (
    <button
      className={clsx(buttonClassCommon, "bg-green-800")}
      onClick={() => setEnabled(false)}
      title="Disable camera"
      type="button"
    >
      <VideoOff size="28" className="relative top-2.5" />
    </button>
  );
}

function ButtonUpload({
  id,
  name = "file",
  setData,
  setType,
  setName,
}: {
  id?: string;
  name?: string;
  setData: Dispatch<SetStateAction<string>>;
  setType: Dispatch<SetStateAction<string>>;
  setName: Dispatch<SetStateAction<string>>;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        title="Click to select file for upload"
        className={clsx("block", buttonClassCommon, "bg-cyan-500!", "hover:bg-cyan-500!")}
      >
        <ImageUp size="28" className="relative top-2.5" />
      </label>
      <input
        id={id ?? name}
        name={name}
        type="file"
        accept=".jpg,.jpeg,.png"
        className="w-0 p-0 opacity-0"
        onChange={(event) => {
          if (event.target.files !== null && event.target.files[0] !== undefined) {
            // TODO: if other image exists, delete it from database
            const file = event.target.files[0];
            setName(file.name);
            setType(file.type);
            //setData(URL.createObjectURL(event.target.files[0]));
            const reader = new FileReader();
            reader.addEventListener("load", () => {
              if (reader.result) {
                setData(reader.result.toString());
              }
            });
            if (file) {
              reader.readAsDataURL(file);
            }
          }
        }}
      />
    </div>
  );
}

function ButtonSnapshot({
  enabled,
  setData,
  setType,
  setName,
  cameraHandler,
  shutterHandler,
}: {
  enabled: boolean;
  setData: Dispatch<SetStateAction<string>>;
  setType: Dispatch<SetStateAction<string>>;
  setName: Dispatch<SetStateAction<string>>;
  cameraHandler: React.RefObject<WebCameraHandler | null>;
  shutterHandler: RefObject<OneOffSoundHandler | null>;
}) {
  if (cameraHandler === null || enabled === false) return <></>;

  async function handleCapture() {
    const file = await cameraHandler.current?.capture();
    if (file) {
      shutterHandler.current?.play();
      const base64 = await fileToBase64(file);
      setData(base64);
      setName(file.name);
      setType(file.type);
    }
  }

  return (
    <button
      className={clsx(buttonClassCommon, "bg-yellow-600")}
      onClick={handleCapture}
      title="Take snapshot"
      type="button"
    >
      <Camera size="28" className="relative top-2.5" />
    </button>
  );
}

function ButtonSwitch({
  cameraHandler,
  enabled,
}: {
  cameraHandler: React.RefObject<WebCameraHandler | null>;
  enabled: boolean;
}) {
  if (cameraHandler === null || enabled === false) return <></>;

  function handleSwitch() {
    cameraHandler.current?.switch();
  }

  return (
    <button
      className={clsx(buttonClassCommon, "bg-blue-600")}
      onClick={handleSwitch}
      title="Switch camera"
      type="button"
    >
      <SwitchCamera size="28" className="relative top-2.5" />
    </button>
  );
}

function ButtonRotateImageCounterclockwise({
  data,
  setData,
  setType,
}: {
  data: string | undefined;
  setData: Dispatch<SetStateAction<string>>;
  setType: Dispatch<SetStateAction<string>>;
}) {
  const [busy, setBusy] = useState<boolean>(false);

  if (data === undefined || data === "") return <></>;

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
        ctx.rotate((-90 * Math.PI) / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        setData(canvas.toDataURL("image/png"));
        setType("image/png");
      }
      setBusy(false);
    };
    img.src = data;
  }

  return (
    <div>
      <button
        onClick={() => handleRotateLeft(data)}
        className={clsx(buttonClassCommon, "bg-amber-600")}
        title="Rotate 90 degrees counterclockwise"
        type="button"
      >
        <LoaderIfBusy busy={busy} reverse={true}>
          <RotateCcw size="28" className="relative top-2.5" />
        </LoaderIfBusy>
      </button>
    </div>
  );
}

function ButtonRotateImageClockwise({
  data,
  setData,
  setType,
}: {
  data: string | undefined;
  setData: Dispatch<SetStateAction<string>>;
  setType: Dispatch<SetStateAction<string>>;
}) {
  const [busy, setBusy] = useState<boolean>(false);

  if (data === undefined || data === "") return <></>;

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
        setData(canvas.toDataURL("image/png"));
        setType("image/png");
      }
      setBusy(false);
    };
    img.src = data;
  }

  return (
    <div>
      <button
        onClick={() => handleRotateLeft(data)}
        className={clsx(buttonClassCommon, "bg-amber-600")}
        title="Rotate 90 degrees clockwise"
        type="button"
      >
        <LoaderIfBusy busy={busy}>
          <RotateCw size="28" className="relative top-2.5" />
        </LoaderIfBusy>
      </button>
    </div>
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
  photoId,
  data,
  setData,
  setPhotoId,
}: {
  photoId: number | undefined;
  data: string | undefined;
  setData: Dispatch<SetStateAction<string>>;
  setPhotoId: Dispatch<SetStateAction<number | undefined>>;
}) {
  if ((data === undefined || data === "") && !photoId) return <></>;

  async function handleDelete(id: number | undefined) {
    if (id === undefined) {
      setData("");
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (apiUrl === undefined) {
      throw new Error("Can't delete photo; NEXT_PUBLIC_API_URL not set");
    }

    const request = new Request(`${apiUrl}/image/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    const response = await fetch(request, {
      body: JSON.stringify({ id: id }),
      referrer: "",
    });

    if (response.status === 200) {
      setData("");
      setPhotoId(undefined);
    }
  }

  return (
    <button
      className={clsx(buttonClassCommon, "bg-red-600")}
      onClick={() => handleDelete(photoId)}
      title={`${photoId !== undefined ? "Delete" : "Discard"} this image`}
      type="button"
    >
      <Trash size="28" className="relative top-2.5" />
    </button>
  );
}

function BackgroundWebcam({ cameraHandler }: { cameraHandler: RefObject<WebCameraHandler | null> }) {
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

function BackgroundCapturedImage({ data }: { data: string | undefined }) {
  if (data === undefined || data === "") return <></>;
  return (
    <div key={`captured-image-container`} className="relative">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img key={`captured-image`} src={data} alt="Captured image from camera" />
    </div>
  );
}

function BackgroundSavedImage({ photoId }: { photoId: number }) {
  return (
    <div key={`captured-image-${photoId}-container`} className="relative">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={`captured-image-${photoId}`}
        //className="my-5 max-w-full rounded-xl md:max-h-100 md:max-w-100"
        alt={`BackgroundSavedImage of the product ${photoId}`}
        src={`/api/image/${photoId}?ts=${Math.floor(Date.now()/1000)}`}
      />
    </div>
  );
}
