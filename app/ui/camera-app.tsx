"use client";

import { useRef, useState } from "react";
import { WebCamera, WebCameraHandler } from "@shivantra/react-web-camera";
import { fileToBase64 } from "file64";
import { RotateCw, Trash, SwitchCamera, Camera } from "lucide-react";
import clsx from "clsx";
import OneOffSound, { OneOffSoundHandler } from "./one-off-sound";

type CapturedImage = {
  width?: number;
  height?: number;
  dataUrl: string;
};

export function CameraApp() {
  const cameraHandler = useRef<WebCameraHandler>(null);
  const shutterHandler = useRef<OneOffSoundHandler>(null);
  const [images, setImages] = useState<CapturedImage[]>([]);

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

  function handleSwitch() {
    cameraHandler.current?.switch();
  }

  function handleDelete(index: number) {
    const img = [...images];
    img.splice(index, 1);
    setImages(img);
  }

  if (!navigator.mediaDevices?.enumerateDevices) {
    return <h1>Camera not available; needs https connection</h1>;
  }

  // navigator.mediaDevices
  //   .enumerateDevices()
  //   .then((devices) => {
  //     devices.forEach((device) => {
  //       console.log(`${device.kind}: ${device.label} id = ${device.deviceId}`);
  //     });
  //   })
  //   .catch((err) => {
  //     console.error(`${err.name}: ${err.message}`);
  //   });

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
    <div className="relative">
      {images.length == 0 && (
        <>
          <OneOffSound src="/sound/shutter.mp3" ref={shutterHandler} />
          <div className="absolute top-5 left-5 flex gap-3">
            <button
              className={clsx(buttonClassCommon, "bg-slate-600")}
              onClick={handleCapture}
              title="Take snapshot"
            >
              <Camera size="28" className="relative top-2.5" />
            </button>
            <button
              className={clsx(buttonClassCommon, "bg-amber-600")}
              onClick={handleSwitch}
              title="Switch camera"
            >
              <SwitchCamera size="28" className="relative top-2.5" />
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
      )}
      <div className="flex flex-wrap gap-5">
        {images.map((image, ind) => (
          <div key={`captured-image-${ind}-container`} className="relative">
            <div className="absolute top-5 left-5 flex gap-3">
              <button
                className={clsx(buttonClassCommon, "bg-red-600")}
                onClick={() => handleDelete(ind)}
                title="Discard this image"
              >
                <Trash size="28" className="relative top-2.5" />
              </button>
              <button
                onClick={() => handleRotateRight(ind)}
                className={clsx(buttonClassCommon, "bg-amber-600")}
                title="Rotate 90 degrees clockwise"
              >
                <RotateCw size="28" className="relative top-2.5" />
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={`captured-image-${ind}`}
              src={image.dataUrl}
              alt="Captured image from camera"
              style={{
                //width: 320 * 2.1,
                //height: aspectRatio(image) * 320 * 2.1,
              }}
            />
            <input type="hidden" name="image" value={image.dataUrl} />
          </div>
        ))}
      </div>
    </div>
  );
}
