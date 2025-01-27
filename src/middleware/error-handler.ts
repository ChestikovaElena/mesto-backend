import { ErrorRequestHandler } from "express";
import { constants } from "http2";
import { SERVER_ERROR } from "../constants";

// eslint-disable-next-line no-unused-vars
const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || constants.HTTP_STATUS_INTERNAL_SERVER_ERROR;
  const message = statusCode === constants.HTTP_STATUS_INTERNAL_SERVER_ERROR
    ? SERVER_ERROR
    : err.message;

  res.status(statusCode).send({ message });
};

export default errorHandler;
