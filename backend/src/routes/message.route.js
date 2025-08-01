import { Router } from "express";
import { protectedRoute } from "../middlewares/auth.middleware.js";
import { getUsersForSidebar, getMessages, sendMessage } from "../controllers/message.controller.js";

const router = Router();

router.get("/users", protectedRoute, getUsersForSidebar);

router.get("/:id", protectedRoute, getMessages);

router.post("/send/:id", protectedRoute, sendMessage);

export default router;