export class NotFoundError extends Error {
  constructor(message: string | undefined, options?: ErrorOptions) {
    // Need to pass `options` as the second parameter to install the "cause" property.
    super(message, options);
  }
}
