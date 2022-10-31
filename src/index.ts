import cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';
import express from "express";
import * as jose from 'jose';
dotenv.config()

const app = express();
const port = process.env.PORT || 3000;
const secret = new TextEncoder().encode(process.env.SECRET);

const exJWT = "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1cm46ZXhhbXBsZTpjbGFpbSI6dHJ1ZSwiaWF0IjoxNjY3MjE5NzM1LCJpc3MiOiJodHRwczovL291cmRvbWFpbi5jb20iLCJhdWQiOiIiLCJleHAiOjE2NjcyMjY5MzV9.1OVFJmo4hjwejFal6kppkJvEW5NS2kmdZ9h8cpMRJWRQ4dT5VFYea_7TrX5Id05dyHasSE9Aj0XOm1QO8jJ5bg"

const expJWT = "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1cm46ZXhhbXBsZTpjbGFpbSI6dHJ1ZSwiaWF0IjoxNjY3MjIwMzcxLCJpc3MiOiJodHRwczovL291cmRvbWFpbi5jb20iLCJhdWQiOiIiLCJleHAiOjE2NjcyMjAzNzJ9.x0azVQqwBHjdEHZgZYw5GGB7Yf2a56mjxBrM8w45uBgUgQ104z3TQfNS0J4iJlFyXHoTS5s1FoFSlAaVyx1kuA"

const unsignedJWT = "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1cm46ZXhhbXBsZTpjbGFpbSI6dHJ1ZSwiaWF0IjoxNjY3MjE5NzM1LCJpc3MiOiJodHRwczovL291cmRvbWFpbi5jb20iLCJhdWQiOiIiLCJleHAiOjE2NjcyMjY5MzV9.1OVFJmo4hjwejFal6kppkJvEW5NS2kmdZ9h8cpMRJWRQ4dT5VFYea_7TrX5Id05dyHasSE9Aj0XOm1QO8jJ5bgeee"

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
        "urn:example:claim": true,
    };
    const jwt = await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: 'HS512', typ: 'JWT' })
      .setIssuedAt()
      .setIssuer('https://ourdomain.com')
      .setAudience(user || "")
      .setExpirationTime('2h')
      .sign(secret);

    return jwt;
  }

const authorization = async (req: express.Request, res: express.Response, next: Function) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).send("Unauthorized");
  }
  try {
    const data = await jose.jwtVerify(token, secret);
    // here can be extracted some info from token and stored in req
    return next();
  } catch (error: any) {
    return res.status(401).send(error.code);
  }
}

app.use(cookieParser());
app.use(unless("/login", authorization));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/login", async (req, res) => {
  return res
  .cookie("token", await createJWT(), {
    httpOnly: true,
  })
  .status(200)
  .json({ message: "Logged in successfully 😊 👌" });
});

// app.get("/register", async (req, res) => {
//   res.cookie("token", await createJWT());
//   res.send("Hello register!");
// });

app.get("/logout", async (req, res) => {
  return res
  .clearCookie("token")
  .status(200)
  .json({ message: "Logged out successfully 😊 👌" });
});

app.listen(3000, () => {
  console.log(`Server is running on port ${port}`);
});
