import { Router } from "express";
import {
	createUser,
	getLoggedinUser,
	isLoggedinUser,
	login,
	logout,
	updateUser,
} from "../controllers/userController";

const router = Router();

router.post("/login", login);
router.post("/create", createUser);
router.get("/logout", logout);
router.get("/isLogin", isLoggedinUser);
router.get("/get", getLoggedinUser);
router.post("/update", updateUser);

export default router;
