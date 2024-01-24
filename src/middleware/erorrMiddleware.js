import { ResponseError } from "../error/responseError.js";

const errorMiddleware = async (err, req, res, next) => {
  if (!err) {
    next();
    return;
  }

  if (err instanceof ResponseError) {
    res
      .status(err.code)
      .json({
        status: err.status,
        message: err.message,
      })
      .end();
  } else {
    res
      .status(500)
      .json({
        status: "error",
        message: err.message,
      })
      .end();
  }
};

export { errorMiddleware };
