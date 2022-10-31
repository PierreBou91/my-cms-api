import * as dotenv from "dotenv";
import * as jose from "jose";
dotenv.config();

const secret = new TextEncoder().encode(process.env.SECRET);

const createJWT = async (user?: string) => {
  const payload = {
    id: "123", // IMPORTANT/TODO: This has to be fetched from database
  };
  const jwt = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: "HS512", typ: "JWT" })
    .setIssuedAt()
    .setIssuer("https://ourdomain.com")
    .setAudience(user || "") // TODO: double check the audience usage
    .setExpirationTime("2h") // TODO make it match with cookie expiration
    .sign(secret);

  return jwt;
};

const verifyJWT = async (token: string) => {
  return await jose.jwtVerify(token, secret);
};

export { createJWT, verifyJWT };
