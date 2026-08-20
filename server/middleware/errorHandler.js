// Centralized error handler. Controllers call next(err) to reach this.
// Never leak raw stack traces / DB error internals to the client.
module.exports = function errorHandler(err, req, res, next) {
  console.error(err);

  const status = err.statusCode || 500;
  const clientMessage =
    status === 500
      ? "Something went wrong on our end. Please try again."
      : err.message || "Request could not be processed.";

  res.status(status).json({ error: clientMessage });
};
