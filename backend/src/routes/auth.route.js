import { Router } from "express";
import { signup, login, logout, updateProfile, checkAuth } from "../controllers/auth.controller.js"
import { protectedRoute } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

router.put("/update-profile", protectedRoute, updateProfile);

router.get("/check", protectedRoute, checkAuth);
export default router;