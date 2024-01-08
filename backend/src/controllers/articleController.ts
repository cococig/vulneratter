import { Article, User } from "@prisma/client";
import { prisma } from "../db/client";
import { config } from "../config/config";

/**
 * 記事を作成する関数。
 * /articles/createにアクセスされた場合に実行される。
 * VULNERABLE: 認証・認可不備
 * @param req 記事の内容（認証不備の場合はユーザIDも追加）
 * @param res 作成された記事
 */
export const createArticle: ControllerFn<
	(Article & { user: Pick<User, "name"> }) | { message: string }
> = async (req, res) => {
	const { body } = req;

	const isImproperAuth = config.vulnerabilities.improperAuth;

	try {
		let userId: number;
		if (isImproperAuth) {
			userId = body.userId;
		} else {
			const sessionUserId = req.session.userId;
			if (sessionUserId == null) throw Error("セッションがありません");
			userId = sessionUserId;
		}

		const article = await prisma.article.create({
			include: {
				user: {
					select: {
						id: true,
						name: true,
					},
				},
			},
			data: {
				userId,
				content: body.content,
			},
		});

		res.status(200).json(article);
	} catch (error) {
		res.status(500).json({ message: "Server error" });
	}
};

/**
 * 全ての記事を取得する関数。
 * 現在のユーザ以外の鍵アカウント記事は除外される。
 * /articles/getにアクセスされた場合に実行される。
 * @param req セッションからユーザ情報を取得
 * @param res 鍵アカウントのものを除いた記事
 */
export const getAllArticle: ControllerFn<
	| (Article & { user: Omit<User, "password" | "private"> })[]
	| { message: string }
> = async (req, res) => {
	const { session } = req;

	try {
		const article = await prisma.article.findMany({
			where: {
				user: {
					NOT: {
						id: {
							not: session.userId,
						},
						private: true,
					},
				},
			},
			include: {
				user: {
					select: {
						id: true,
						email: true,
						name: true,
					},
				},
			},
		});

		res.status(200).json(article);
	} catch (error) {
		res.status(500).json({ message: "Server error" });
	}
};

/**
 * 記事を削除する関数。
 * /articles/deleteにアクセスされた場合に実行される。
 * VULNERABLE: 認証・認可不備
 * @param req 記事のID
 * @param res 削除された記事
 */
export const deleteArticle: ControllerFn = async (req, res) => {
	const { id } = req.body;

	const isImproperAuth = config.vulnerabilities.improperAuth;

	try {
		let article: Article;
		if (isImproperAuth) {
			article = await prisma.article.delete({
				where: {
					id,
				},
			});
		} else {
			const userId = req.session.userId;
			if (userId == null) throw new Error("セッションがありません");
			article = await prisma.article.delete({
				where: {
					id,
					userId,
				},
			});
		}

		res.status(200).json(article);
	} catch (error) {
		res.status(500).json({ message: "Server error" });
	}
};
