import { Router } from "express";
import {
	createArticle,
	deleteArticle,
	getAllArticle,
} from "../controllers/articleController";

const router = Router();

router.post("/create", createArticle);
router.get("/get", getAllArticle);
router.post("/delete", deleteArticle);

export default router;
