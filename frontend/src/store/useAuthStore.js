import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client"

const BE_URL = import.meta.env.VITE_LOCAL_BE_URL;
const BASE_URL = import.meta.env.MODE === "development" ? BE_URL : "/";

export const useAuthStore = create((set, get)=>({
  authUser: null,
  socket: null,

  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,

  onlineUsers: [],

  checkAuth: async ()=>{
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data })
      get().connectSocket();
    } catch(error){
      set({ authUser: null });
      console.log("Error:", error);
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data)=>{
    set({ isSigningUp: true })
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      get().connectSocket();
      toast.success("Account created successfully");
    } catch(error){
      toast("Error:", error.response.message);
    } finally {
      set({ isSigningUp: false })
    }
  }, 

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      get().connectSocket();
      toast.success("Logged in successfully");
    } catch (error) {
      toast.error("Error: ", error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async ()=>{
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      get().disconnectSocket();
      toast.success("Logged out successfully")   
    } catch(error){
      console.log(error);
      toast.error("Something went wrong!!!");
    }
  },

  updateProfile: async (data)=>{
    set({ isUpdatingProfile: true })
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
    } catch(_error){
      toast.error("Something went wrong!!!");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
  
  connectSocket: ()=>{
    const { authUser } = get();
    if (!authUser || get().socket?.connected ) return;
    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      }
    });
    socket.connect();
    set({ socket });

    socket.on("getOnlineUsers", (userIds)=>{
      set({ onlineUsers: userIds });
    })
  },

  disconnectSocket: ()=>{
    if (get().socket?.connected) get().socket.disconnect();
  }
}))