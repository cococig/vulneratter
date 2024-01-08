import { PrismaClient } from "@prisma/client";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

export const prisma = new PrismaClient();
export const sqlite = (async () => {
	const db = await open({
		filename: "src/models/dev.db",
		driver: sqlite3.Database,
	});
	return db;
})();
