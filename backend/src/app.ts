import express from "express";
import expressSession from "express-session";
import userRouter from "./routers/userRouter";
import articleRouter from "./routers/articleRouter";
import cors from "cors";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import { prisma } from "./db/client";
import { readFileSync } from "fs";
import { createServer } from "https";

declare module "express-session" {
	interface SessionData {
		userId: number;
	}
}

console.log("Server init start");

const app = express();
const port = 3001;

const mainRouter = express.Router();
mainRouter.use("/users", userRouter);
mainRouter.use("/articles", articleRouter);

app.use(
	cors({
		origin: "https://localhost:4200",
		credentials: true,
		optionsSuccessStatus: 200,
	}),
);
app.use(express.json());
app.use(
	expressSession({
		cookie: {
			maxAge: 7 * 24 * 60 * 60 * 1000, //ms
			sameSite: "none",
			secure: true,
			httpOnly: true,
		},
		secret: "secret value",
		resave: true,
		saveUninitialized: true,
		store: new PrismaSessionStore(prisma, {
			checkPeriod: 2 * 60 * 1000,
			dbRecordIdIsSessionId: true,
			dbRecordIdFunction: undefined,
		}),
	}),
);
app.use("/api", mainRouter);

// SSL関係
const privateKey = readFileSync("ssl/localhost-key.pem", "utf8");
const certificate = readFileSync("ssl/localhost.pem", "utf8");

// 資格情報オブジェクト
const credentials = { key: privateKey, cert: certificate };

const httpsServer = createServer(credentials, app);

httpsServer.listen(port, () =>
	console.log(`Example app listening on port ${port}`),
);
