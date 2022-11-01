import cookieParser from "cookie-parser";
import * as dotenv from "dotenv";
import express from "express";
import { authorization } from "./middlewares/auth";
import { getUserById } from "./queries/queries";
import { createJWT } from "./utils/jwt-handler";
import { unless } from "./utils/mid-wrapper";
// import cors
import cors from "cors";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cookieParser()); // necessary for cookie manipulation
app.use(express.json()); // necessary for body destructuring
app.use(cors()); // necessary for cross-origin requests

app.use(unless("/login", authorization));

///////////////////////
/////// TO DELETE /////
///////////////////////
app.get("/login", async (req, res) => {
  return res
    .header("Access-Control-Expose-Headers", "Set-Cookie")
    .cookie("token", await createJWT(), {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 2, // TODO make it match with jwt expiration
    })
    .status(200)
    .json({ message: "Logged in successfully.", email: req.body.email });
});
///////////////////////
///// UNTIL HERE //////
///////////////////////

app.get("/me", async (req, res) => {
  const user = await getUserById(req.body.id);
  console.log(user);
  return res
    .status(200)
    .json({ message: "Authenticated call to '/'", id: req.body.id });
});

app.post(
  "/login",
  cors({
    credentials: true,
    origin: [
      "https://my-cms-plum.vercel.app/",
      "http://localhost/",
      "https://cms-api.pbou.dev/",
    ],
  }),
  async (req, res) => {
    const { email, password } = req.body;

    if (email === "123" && password === "123") {
      return res
        .header("Access-Control-Expose-Headers", "Set-Cookie")
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
  }
);

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
