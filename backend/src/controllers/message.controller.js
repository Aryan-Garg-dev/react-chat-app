import cloudinary from "../lib/cloudinary.js";
import { getRecieverId, io } from "../lib/socket.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

export const getUsersForSidebar = async (req, res)=>{
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
    return res.status(200).json(filteredUsers);
  } catch(error){
    console.log("Error in getUsersForSidebar:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export const getMessages = async (req, res)=>{
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, recieverId: userToChatId },
        { senderId: userToChatId, recieverId: myId }
      ]
    });

    res.status(200).json(messages);
  } catch(error){
    console.log("Error in getMessages:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export const sendMessage = async (req, res)=>{
  try {
    const { text, image } = req.body;
    const { id: recieverId } = req.params;
    const senderId = req.user._id;

    let imageURL;
    if (image){
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageURL = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      recieverId,
      text,
      image: imageURL
    });

    await newMessage.save();

    // Realtime Messaging functionality
    const recieverSocketId = getRecieverId(recieverId);
    if (recieverSocketId) {
      io.to(recieverSocketId).emit("newMessage", newMessage);
    }

    return res.status(201).json(newMessage);
  } catch(error){
    console.log("Error in sendMessage:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
}