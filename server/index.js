import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import session from "express-session";
import env from "dotenv";
import cors from "cors";
import GoogleStrategy from "passport-google-oauth2";

env.config();

const app = express();
const port = 3000;
const saltRounds = 10;

// -------------------- MIDDLEWARE --------------------
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // set true only if using HTTPS
      httpOnly: true,
      sameSite: "lax", // 'lax' works for dev; 'none' + secure:true for production cross-origin
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(
  cors({
    origin: "http://localhost:5173", // React frontend URL (Vite default)
    credentials: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// -------------------- DATABASE --------------------
const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});
db.connect();

// -------------------- ROUTES --------------------

// Home
app.get("/", (req, res) => {
  res.json({ message: "Backend running successfully" });
});

// Get user session
app.get("/api/user", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.json({ user: null });
  }
});

// Logout
app.get("/api/logout", (req, res) => {
  req.logout((err) => {
    if (err) console.log(err);
    res.json({ success: true });
  });
});



// Register
// app.post("/api/register", async (req, res) => {
//   const { username, password } = req.body;
//   try {
//     const check = await db.query("SELECT * FROM users WHERE email=$1", [username]);
//     if (check.rows.length > 0) return res.json({ message: "already_registered" });

//     bcrypt.hash(password, saltRounds, async (err, hash) => {
//       if (err) return res.status(500).json({ error: "Hash error" });
//       await db.query("INSERT INTO users (email, password) VALUES ($1, $2)", [username, hash]);
//       res.json({ message: "registered_successfully" });
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });
// Register
app.post("/api/register", async (req, res) => {
  const { name, email, password, country } = req.body;

  try {
    const check = await db.query("SELECT * FROM users WHERE email=$1", [email]);
    if (check.rows.length > 0) return res.json({ message: "already_registered" });

    bcrypt.hash(password, saltRounds, async (err, hash) => {
      if (err) return res.status(500).json({ error: "Hash error" });

      await db.query(
        "INSERT INTO users (name, email, password, country) VALUES ($1, $2, $3, $4)",
        [name, email, hash, country]
      );

      res.json({ message: "registered_successfully" });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.post("/api/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    console.log("Login callback", { err, user, info });
    if (err) return next(err);
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.json({ message: "login_success", user });
    });
  })(req, res, next);
});


// -------------------- PASSPORT LOCAL STRATEGY --------------------
passport.use(
  "local",
  new Strategy({ usernameField: "email", passwordField: "password" },async (email, password, cb) => {
    try {
      console.log("🔑 Login attempt:", email);
      const result = await db.query("SELECT * FROM users WHERE email=$1", [email]);
      if (result.rows.length === 0) {
        console.log("No user found");
        return cb(null, false);
      }
      const user = result.rows[0];
      console.log("Stored hash:", user.password);
      bcrypt.compare(password, user.password, (err, valid) => {
        if (err) return cb(err);
        if (valid) {
          console.log("✅ Password match");
          return cb(null, user);
        }else{
          console.log("❌ Password mismatch");
          return cb(null, false);
        }
      });
      
      
      
    } catch (err) {
      cb(err);
    }
  })
);

// -------------------- GOOGLE STRATEGY --------------------
// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: "http://localhost:3000/auth/google/callback",
//       userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
//     },
//     async (accessToken, refreshToken, profile, cb) => {
//       try {
//         const result = await db.query("SELECT * FROM users WHERE email=$1", [profile.email]);
//         if (result.rows.length === 0) {
//           await db.query("INSERT INTO users (email, password) VALUES ($1, $2)", [profile.email, "google"]);
//         }
//         cb(null, { email: profile.email });
//       } catch (err) {
//         cb(err);
//       }
//     }
//   )
// );

// app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// app.get(
//   "/auth/google/callback",
//   passport.authenticate("google", { failureRedirect: "http://localhost:5173/login" }),
//   (req, res) => {
//     res.redirect("http://localhost:5173/secrets");
//   }
// );

// -------------------- SERIALIZATION --------------------
passport.serializeUser((user, cb) => cb(null, user));
passport.deserializeUser((user, cb) => cb(null, user));

// -------------------- SERVER --------------------
app.listen(port, () => console.log(`✅ Server running on port ${port}`));
