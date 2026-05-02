import { FormMetadata } from "@conform-to/react";

export function CaptureSubmitOnEnter({ formId }: { formId: string }) {
  return (
    <button
      form={formId}
      aria-hidden="true"
      className="hide-input"
      onKeyDown={(e) => console.log("onKeydown debug", e.target)}
      onSubmit={(e) => console.log("onSubmit debug", e.target)}
      onClick={(e) => e.preventDefault()}
      tabIndex={-1}
    >
      Suppress submit on enter
    </button>
  );
}
