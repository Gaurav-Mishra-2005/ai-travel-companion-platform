import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";

import {googleAuth, getCurrentUser, register, login} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/google", googleAuth);
router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, getCurrentUser);

export default router;