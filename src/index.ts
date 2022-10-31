import cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';
import express from "express";
import * as jose from 'jose';
dotenv.config()

const app = express();
const port = process.env.PORT || 3000;
const secret = new TextEncoder().encode(process.env.SECRET);

app.use(cookieParser()); // necessary for cookie manipulation
app.use(express.json()); // necessary for body destructuring

var unless = function(path : string, middleware : Function) {
  return function(req:express.Request, res:express.Response, next:Function) {
      if (path === req.path) {
          return next();
      } else {
          return middleware(req, res, next);
      }
  };
};

const createJWT = async (user?: string) => {
    const payload = {
        "email": "123", // IMPORTANT/TODO: This has to be fetched from database
    };
    const jwt = await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: 'HS512', typ: 'JWT' })
      .setIssuedAt()
      .setIssuer('https://ourdomain.com')
      .setAudience(user || "")
      .setExpirationTime('2h') // TODO make it match with cookie expiration
      .sign(secret);

    return jwt;
  }

const authorization = async (req: express.Request, res: express.Response, next: Function) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Missing JWT." });
  }
  try {
    const data = await jose.jwtVerify(token, secret);
    req.body.email = data.payload.email;
    return next();
  } catch (error: any) {
    return res.status(401).json({ message: "Error while verifying JWT", error: error.code });
  }
}

app.use(unless("/login", authorization));

app.get("/me", (req, res) => {
  return res.status(200).json({ message: "Authenticated call to '/'", email: req.body.email });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (email === "123" && password === "123") {
    return res
    .cookie("token", await createJWT(), {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 2, // TODO make it match with jwt expiration
    })
    .status(200)
    .json({ message: "Logged in successfully.", email: req.body.email });
  }
  
  return res.status(401).json({ message: "Invalid credentials." });
});

app.get("/logout", async (req, res) => {
  return res
  .clearCookie("token")
  .status(200)
  .json({ message: "Logged out successfully." });
});

// app.get("/register", async (req, res) => {
//   res.cookie("token", await createJWT());
//   res.send("Hello register!");
// });

app.listen(3000, () => {
  console.log(`Server is running on port ${port}`);
});
