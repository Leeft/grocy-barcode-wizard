"use client";

import { Dispatch, RefObject, SetStateAction, useRef, useState } from "react";
import { WebCamera, WebCameraHandler } from "@shivantra/react-web-camera";
import { fileToBase64 } from "file64";
import { RotateCw, Trash, SwitchCamera, Camera, VideoOff } from "lucide-react";
import clsx from "clsx";
import OneOffSound, { OneOffSoundHandler } from "./one-off-sound";

type CapturedImage = {
  width?: number;
  height?: number;
  dataUrl: string;
};

export function CameraApp() {
  const [images, setImages] = useState<CapturedImage[]>([]);
  const [cameraEnabled, setCameraEnabled] = useState<boolean>(false);
  const shutterHandler = useRef<OneOffSoundHandler>(null);

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

  return (
    <div className="relative py-4">
      <OneOffSound src="/sound/shutter.mp3" ref={shutterHandler} />
      {cameraEnabled ? (
        images.length == 0 ? (
          <CameraUI
            setCameraEnabled={setCameraEnabled}
            setImages={setImages}
            buttonClassCommon={buttonClassCommon}
            shutterHandler={shutterHandler}
          />
        ) : (
          <Images
            images={images}
            setImages={setImages}
            buttonClassCommon={buttonClassCommon}
          />
        )
      ) : (
        <>
          <button
            type="button"
            onClick={() => setCameraEnabled(true)}
            title="Click to enable camera"
            className="rounded-1xl h-auto w-full cursor-pointer border border-slate-500 text-slate-500"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/empty-frame.png" alt="" />
          </button>
        </>
      )}
    </div>
  );
}

function CameraUI({
  buttonClassCommon,
  setImages,
  setCameraEnabled,
  shutterHandler,
}: {
  buttonClassCommon: string;
  setImages: Dispatch<SetStateAction<CapturedImage[]>>;
  setCameraEnabled: Dispatch<SetStateAction<boolean>>;
  shutterHandler: RefObject<OneOffSoundHandler | null>;
}) {
  const cameraHandler = useRef<WebCameraHandler>(null);

  async function handleCapture() {
    shutterHandler.current?.play();
    const file = await cameraHandler.current?.capture();
    if (file) {
      const base64 = await fileToBase64(file);
      setImages((_images) => [
        ..._images,
        {
          dataUrl: base64,
        },
      ]);
    }
  }

  function handleSwitch() {
    cameraHandler.current?.switch();
  }

  return (
    <>
      <div className="absolute top-5 left-5 flex gap-3">
        <button
          className={clsx(buttonClassCommon, "bg-slate-600")}
          onClick={handleCapture}
          title="Take snapshot"
          type="button"
        >
          <Camera size="28" className="relative top-2.5" />
        </button>
        <button
          className={clsx(buttonClassCommon, "bg-blue-600")}
          onClick={handleSwitch}
          title="Switch camera"
          type="button"
        >
          <SwitchCamera size="28" className="relative top-2.5" />
        </button>
        <button
          className={clsx(buttonClassCommon, "bg-amber-800")}
          onClick={() => setCameraEnabled(false)}
          title="Disable camera"
          type="button"
        >
          <VideoOff size="28" className="relative top-2.5" />
        </button>
      </div>
      <div>
        <WebCamera
          ref={cameraHandler}
          videoStyle={{ borderRadius: 0 }}
          className="camera-container"
          videoClassName="camera-video"
          captureMode="back"
          captureType="png"
          getFileName={() => `next-photo-${Date.now()}.jpeg`}
          onError={(err) => console.error(err)}
        />
      </div>
    </>
  );
}

function Images({
  images,
  buttonClassCommon,
  setImages,
}: {
  images: CapturedImage[];
  buttonClassCommon: string;
  setImages: Dispatch<SetStateAction<CapturedImage[]>>;
}) {
  async function handleRotateRight(index: number) {
    images.map((imageInfo, blobIndex) => {
      if (blobIndex === index) {
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
            const imagesCopy = [...images];
            imagesCopy.splice(index, 1, {
              dataUrl: canvas.toDataURL("image/png"),
              width: img.width,
              height: img.height,
            });
            setImages(imagesCopy);
          }
        };
        img.src = imageInfo.dataUrl;
      }
    });
  }

  function handleDelete(index: number) {
    const img = [...images];
    img.splice(index, 1);
    setImages(img);
  }

  return (
    <div className="flex flex-wrap gap-5">
      {images.map((image, ind) => (
        <div key={`captured-image-${ind}-container`} className="relative">
          <div className="absolute top-5 left-5 flex gap-3">
            <button
              className={clsx(buttonClassCommon, "bg-red-600")}
              onClick={() => handleDelete(ind)}
              title="Discard this image"
              type="button"
            >
              <Trash size="28" className="relative top-2.5" />
            </button>
            <button
              onClick={() => handleRotateRight(ind)}
              className={clsx(buttonClassCommon, "bg-amber-600")}
              title="Rotate 90 degrees clockwise"
              type="button"
            >
              <RotateCw size="28" className="relative top-2.5" />
            </button>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={`captured-image-${ind}`}
            src={image.dataUrl}
            alt="Captured image from camera"
          />
          <input type="hidden" name="image" value={image.dataUrl} />
        </div>
      ))}
    </div>
  );
}
