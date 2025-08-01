import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import cloudinary from '../lib/cloudinary.js';

export const signup = async (req, res)=>{
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password){
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6){
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "email already exists" });
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log(hashedPassword);

    const newUser = new User({
      fullName, 
      email,
      password: hashedPassword
    });

    if (newUser){
      generateToken(newUser.id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      })
    } else {
      res.status(400).json({ message: "Invalid User data" });
    }
  } catch(error){
    console.log("Error in signup controller:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export const login = async (req, res)=>{
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user){
      return res.status(400).json({ message: "Invalid Credentials" });
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) return res.status(400).json({
      message: "Invalid Credentials"
    })

    generateToken(user._id, res);

    return res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic
    })
  } catch(error){
    console.log("Error in login controller:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export const logout = (req, res)=>{
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "Logged out successfully" });
  } catch(error){
    console.log("Error in logout controller");
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export const updateProfile = async (req, res)=>{
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) return res.json(400).json({
      message: "Profile Pic is required"
    });

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(userId, {
      profilePic: uploadResponse.secure_url
    }, { new: true }).select("-password");

    return res.status(200).json(updatedUser);
  } catch(error){
    console.log("Error in update profile:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export const checkAuth = (req, res)=>{
  try {
    return res.status(200).json(req.user);
  } catch(error){
    console.log("Error in checkAuth controller:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}