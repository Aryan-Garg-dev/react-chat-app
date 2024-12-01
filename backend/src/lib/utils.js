import jwt from "jsonwebtoken";
import "dotenv/config"

const JWT_SECRET = process.env.JWT_SECRET;

export const generateToken = (userId, res)=>{
  const token = jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: '7d'
  });

  res.cookie("token", token, {
    sameSite: "strict",
    maxAge: 7*24*60*60*1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });
}