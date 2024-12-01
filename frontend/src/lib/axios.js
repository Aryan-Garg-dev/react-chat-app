import axios from "axios";

const BE_URL = import.meta.env.VITE_LOCAL_BE_URL;

export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" ? BE_URL + "/api" : "/api",
  withCredentials: true
});