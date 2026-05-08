"use client";

import { ActionState } from "@/interfaces";
import { usePathname, useRouter } from "next/navigation";

type Callbacks<T, R = unknown> = {
  onStart?: () => R;
  onEnd?: (reference: R) => void;
  onSuccess?: (result: T) => void;
  onError?: (result: T) => void;
};

export const withCallbacks = <Args extends unknown[], T extends ActionState, R = unknown>(
  fn: (...args: Args) => Promise<T>,
  callbacks: Callbacks<T, R>,
): ((...args: Args) => Promise<T>) => {
  const router = useRouter();
  const pathname = usePathname();

  return async (...args: Args) => {
    const promise = fn(...args);

    const reference = callbacks.onStart?.();

    const result = await promise;

    if (reference) {
      callbacks.onEnd?.(reference);
    }

    if (result?.status === "success") {
      callbacks.onSuccess?.(result);
      // eslint-disable-next-line Can't type this without going to internal react types
      router.replace(pathname as any);
    }

    if (result?.status === "error") {
      callbacks.onError?.(result);
    }

    return promise;
  };
};
