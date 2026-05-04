import { ActionState } from "@/interfaces";
import { toast } from "react-hot-toast";

type CreateToastCallbacksOptions = { loadingMessage?: string; duration?: number };

export const createToastCallbacks = (options: CreateToastCallbacksOptions) => {
  return {
    onStart: () => {
      return toast.loading(options.loadingMessage || "Loading ...", { duration: options.duration ?? 2000 });
    },
    onEnd: (reference: string | number) => {
      toast.dismiss(reference.toString());
    },
    onSuccess: (result: ActionState) => {
      if (result && "message" in result && result.message) {
        toast.success(result.message ?? "success");
      } else {
        toast.success("success[2]");
      }
    },
    onError: (result: ActionState) => {
      if (result && "message" in result && result.message) {
        toast.error(result.message ?? "error");
      } else {
        toast.error("error[2]");
      }
    },
  };
};
