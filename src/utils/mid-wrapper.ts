import express from "express";

const unless = function (path: string, middleware: Function) {
  return function (
    req: express.Request,
    res: express.Response,
    next: Function
  ) {
    if (path === req.path) {
      return next();
    } else {
      return middleware(req, res, next);
    }
  };
};

export { unless };
