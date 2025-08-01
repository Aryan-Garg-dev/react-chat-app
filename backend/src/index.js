import express from "express"
import authRoutes from "./routes/auth.route.js"
import messageRoutes from "./routes/message.route.js"
import "dotenv/config"
import { connectDB } from "./lib/db.js";
import cors from "cors"
import cookieParser from "cookie-parser"
import { app, server } from "./lib/socket.js";

import path from "path";

const PORT = process.env.PORT || 5050;
const __dirname = path.resolve();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// app.get("/", (req, res)=>{
//     res.send("Welcome to my chat-app");
// })
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if (process.env.NODE_ENV === "production"){
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (req, res)=>{
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  })
}

server.listen(PORT, ()=>{
  console.log(`Server in running on port ${PORT}`);
  console.log(`-> http://localhost:${PORT}/`);
  connectDB();
})