const notFoundMiddleware = (request, _response, next) => {
  const error = new Error(`Route not found: ${request.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

export default notFoundMiddleware;