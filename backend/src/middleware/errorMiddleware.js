const errorMiddleware = (error, _request, response, _next) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal Server Error';

  if (error.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    message = 'Each image must be 5 MB or smaller.';
  } else if (error.code === 'LIMIT_FILE_COUNT' || error.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    message = 'Upload no more than 8 images using the "images" field.';
  }

  response.status(statusCode).json({
    success: false,
    message,
  });
};

export default errorMiddleware;