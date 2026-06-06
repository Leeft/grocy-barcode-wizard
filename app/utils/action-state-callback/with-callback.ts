"use client";

import { ActionState } from "@/interfaces";
import { Route } from "next";
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
  redirectTo?: string,
): ((...args: Args) => Promise<T>) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const router = useRouter();
  // eslint-disable-next-line react-hooks/rules-of-hooks
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
      if (redirectTo !== undefined) {
        router.replace(redirectTo as Route<string>);
      } else {
        router.replace(pathname as Route<string>);
      }
    }

    if (result?.status === "error") {
      callbacks.onError?.(result);
    }

    return promise;
  };
};
