import express from "express";
import connectDb from "../configuration/config.js";
import User from "../usermodel/schema.js";
import cors from "cors";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
const JWT_SECRET = "mySuperSecretKey";
const app = express();
const port = 3000;

import { sendMail } from "./mailsend.js";

import { getEmailTemplate, generateOTP } from "./resetmail.js";
app.use(cookieParser());
app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

connectDb

const verifyToken = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // attach user data (id, email) from token
    next();
  } catch (err) {
    console.error("Invalid token:", err);
    return res.status(403).json({ success: false, message: "Invalid or expired token" });
  }
};
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
app.post("/subscription", async (req, res) => {
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

    const token = jwt.sign({
      id: user._id, email: user.email
    },
      JWT_SECRET,
      { expiresIn: "2h" })
    
      res.cookie("token" , token , {
        httpOnly : true ,
        secure : false,
        sameSite : "lax"
      })

    res.status(200).json({
  success: true,
  message: "Login successful",
  token, 
  user: { id: user._id, email: user.email },
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
app.put("/resetPass", async (req, res) => {
  const { email } = req.body;
  try {
    const otp = generateOTP();
    const user = await User.findOneAndUpdate(
      { email },
      { otp, otpExpiry: new Date(Date.now() + 1 * 60 * 1000) },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    await sendMail({ to: email, subject: "Password Reset Request", html: getEmailTemplate(otp) });

    setTimeout(async () => {
      await User.updateOne({ email, otp }, { $set: { otp: null, otpExpiry: null } });
    }, 60 * 1000);

    res.json({ success: true, message: "Reset email sent" });
  } catch (err) {
    console.error("Error in resetPass:", err);
    res.status(500).json({ success: false, message: "Failed to send mail" });
  }
});

app.post("/verifyupdate", async (req, res) => {
  const { email, password, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (user.otpExpiry && user.otpExpiry < new Date()) {
      user.otp = null;
      user.otpExpiry = null;
      await user.save();
      return res.status(400).json({ success: false, message: "OTP has expired" });
    }

    if (user.otp !== otp) return res.status(400).json({ success: false, message: "Invalid OTP" });

    const hashedPassword = await password
    user.password = hashedPassword;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error("Error in verifyupdate:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
app.post('/subscribe', verifyToken, async (req, res) => {
  try{
    const {plan} = req.body

  const user  = await  User.findById(req.user.id)

  if(user.subscription !== "free"){
   return res.status(400).json({
   success : false ,
   message: `you have alread subscribe the ${user.subscription} plan `
   })

  

  }
 user.subscription = plan
   await user.save()
     res.status(200).json({
      success: true,
      message: `Your subscription has been updated to ${plan} plan.`,
      subscription: user.subscription,
    });
  res.send('POST request to the homepage')
  }
  catch(error){
    console.log("subscription error" , error)
    res.status(500).json({
      success : false , 
      message : `internal server error`
  })
  }
  
})


app.listen(port, () =>
  console.log(`✅ Server running successfully on port ${port}`)
);
