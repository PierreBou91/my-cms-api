import express from "express";
import { verifyJWT } from "../utils/jwt-handler";

const authorization = async (
  req: express.Request,
  res: express.Response,
  next: Function
) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Missing JWT." });
  }
  try {
    const data = await verifyJWT(token);
    req.body.id = data.payload.id;
    return next();
  } catch (error: any) {
    return res
      .status(401)
      .json({ message: "Error while verifying JWT", error: error.code });
  }
};

export { authorization };
