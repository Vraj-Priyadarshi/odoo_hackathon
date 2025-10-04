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
    saveUninitialized: true,
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

// Secrets
app.get("/api/secrets", async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      const result = await db.query("SELECT secret FROM users WHERE email = $1", [req.user.email]);
      res.json({ secret: result.rows[0]?.secret || "No secret found" });
    } catch (err) {
      res.status(500).json({ error: "DB error" });
    }
  } else {
    res.status(401).json({ error: "Not authenticated" });
  }
});

// Submit secret
app.post("/api/submit", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Not authenticated" });
  const { secret } = req.body;
  const email = req.user.email;
  try {
    await db.query("UPDATE users SET secret=$1 WHERE email=$2", [secret, email]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Register
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const check = await db.query("SELECT * FROM users WHERE email=$1", [username]);
    if (check.rows.length > 0) return res.json({ message: "already_registered" });

    bcrypt.hash(password, saltRounds, async (err, hash) => {
      if (err) return res.status(500).json({ error: "Hash error" });
      await db.query("INSERT INTO users (email, password) VALUES ($1, $2)", [username, hash]);
      res.json({ message: "registered_successfully" });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
app.post("/api/login", passport.authenticate("local"), (req, res) => {
  res.json({ message: "login_success" });
});

// -------------------- PASSPORT LOCAL STRATEGY --------------------
passport.use(
  "local",
  new Strategy(async (username, password, cb) => {
    try {
      const result = await db.query("SELECT * FROM users WHERE email=$1", [username]);
      if (result.rows.length === 0) return cb(null, false);
      const user = result.rows[0];
      bcrypt.compare(password, user.password, (err, valid) => {
        if (err) return cb(err);
        if (valid) return cb(null, user);
        cb(null, false);
      });
    } catch (err) {
      cb(err);
    }
  })
);

// -------------------- GOOGLE STRATEGY --------------------
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/callback",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        const result = await db.query("SELECT * FROM users WHERE email=$1", [profile.email]);
        if (result.rows.length === 0) {
          await db.query("INSERT INTO users (email, password) VALUES ($1, $2)", [profile.email, "google"]);
        }
        cb(null, { email: profile.email });
      } catch (err) {
        cb(err);
      }
    }
  )
);

app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "http://localhost:5173/login" }),
  (req, res) => {
    res.redirect("http://localhost:5173/secrets");
  }
);

// -------------------- SERIALIZATION --------------------
passport.serializeUser((user, cb) => cb(null, user));
passport.deserializeUser((user, cb) => cb(null, user));

// -------------------- SERVER --------------------
app.listen(port, () => console.log(`✅ Server running on port ${port}`));
