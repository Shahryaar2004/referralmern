import express from "express";
import connectDb from "../configuration/config.js";
import User from "../usermodel/schema.js";

const app = express();
const port = 3000;
xz 
app.use(express.json());

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
app.get('/login',  async (req, res) => {
  try{
  const {email , password} = req.body
  const user  = await User.findOne({email , password})
  if(user){
        if (user) return res.status(200).json({ success: true, message: "logged in  succesfully" });

  }
  else{
res.status(401).json({ success: false, message: "invalid cradentails" });
  }
  } catch(err){
    console.log(err)
  }
})
app.listen(port, () =>
  console.log(`✅ Server running successfully on port ${port}`)
);
