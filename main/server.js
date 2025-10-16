import express from "express";
import connectDb from "../configuration/config.js";
import User from "../usermodel/schema.js";
import cors from "cors";
const app = express();
const port = 3000;

app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173", // your frontend URL
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

connectDb

app.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({
      firstName,
      lastName,

      email,
      password,
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      user: newUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    if (user.password !== password) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: {
        id: user._id,
        email: user.email,
      },
      accessToken: "fakeAccessToken123", 
      refreshToken: "fakeRefreshToken123", 
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});
app.post("/google-login", async (req, res) => {
  const { name, email, picture } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      // create new user if not exists
      user = new User({
        firstName: name,
        lastName: "",
        email,
        password: Math.random().toString(36).slice(-8),
        picture,
      });
      await user.save();
    }

    res.json({
      success: true,
      message: "Google login successful",
      user,
    });
  } catch (err) {
    console.error("Google login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


app.listen(port, () =>
  console.log(`✅ Server running successfully on port ${port}`)
);
