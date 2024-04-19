class ApiError extends Error {
  readonly status: number;
  readonly message: string;

  constructor(status: number, message: string) {
    super();

    this.status = status;
    this.message = message;
  }

  static badRequest(message: string) {
    return new ApiError(400, message);
  }

  static unauthorized(message: string) {
    return new ApiError(401, message);
  }

  static forbidden(message: string) {
    return new ApiError(403, message);
  }

  static notFound(message: string) {
    return new ApiError(404, message);
  }

  static conflict(message: string) {
    return new ApiError(409, message);
  }

  static internal(message: string) {
    return new ApiError(500, message);
  }

  static badGateway(message: string) {
    return new ApiError(502, message);
  }

  static serviceUnavailable(message: string) {
    return new ApiError(503, message);
  }

  static gatewayTimeout(message: string) {
    return new ApiError(504, message);
  }
}

export default ApiError;
