import { prisma } from "../db/client";
import { config } from "../config/config";
import bcrypt from "bcrypt";

/**
 * ハッシュ化されたパスワードを生成する関数。
 * @param rawPassword 生の（非ハッシュ化）パスワード
 * @returns ハッシュ化されたパスワード
 */
const createHashedPassword = async (rawPassword: string): Promise<string> => {
	return await bcrypt.hash(rawPassword, 10);
};

/**
 * ログイン処理を行う関数。
 * /users/loginにアクセスされた場合に実行される。
 * VULNERABLE: パスワードの非ハッシュ化
 * @param req ユーザのemailとpassword
 * @param res ユーザのidとname
 */
export const login: ControllerFn<
	{ id: number; name: string } | { message: string }
> = async (req, res) => {
	const { email, password } = req.body;

	// パスワードの非ハッシュ化を発生させるかどうかの指定
	const isRawPassword = config.vulnerabilities.rawPassword;

	try {
		const user = await prisma.user.findUniqueOrThrow({
			select: {
				id: true,
				name: true,
				password: true,
			},
			where: {
				email,
			},
		});

		// パスワードの照合
		if (isRawPassword) {
			if (password !== user.password) {
				res.status(404).json({ message: "パスワードが間違っています" });
				return;
			}
		} else {
			const result = await bcrypt.compare(password, user.password);
			console.log(password);
			console.log(user.password);
			console.log(result);
			if (result === false) {
				res.status(404).json({ message: "パスワードが間違っています" });
				return;
			}
		}

		req.session.userId = user.id;
		res.status(200).json({ id: user.id, name: user.name });
	} catch (error) {
		res.status(500).json({ message: "Server error" });
	}
};

/**
 * ユーザがログイン済みかどうかを判定する関数。
 * /users/isLoginにアクセスされた場合に実行される。
 * @param req セッションからユーザ情報を取得
 * @param res ユーザがログイン済みの場合はtrue, 未ログインの場合はfalse
 */
export const isLoggedinUser: ControllerFn<
	{ login: boolean } | { message: string }
> = async (req, res) => {
	const { session } = req;

	try {
		if (session.userId) {
			res.status(200).json({ login: true });
		} else {
			res.status(200).json({ login: false });
		}
	} catch (error) {
		res.status(500).json({ message: "Server error" });
	}
};

/**
 * 現在ログイン済みのユーザ情報を返す関数。
 * /users/getにアクセスされた場合に実行される。
 * @param req セッションからユーザ情報を取得
 * @param res パスワードを除いたユーザ情報
 */
export const getLoggedinUser: ControllerFn = async (req, res) => {
	const { session } = req;
	try {
		if (session.userId) {
			const userData = await prisma.user.findUnique({
				select: {
					id: true,
					email: true,
					name: true,
					private: true,
				},
				where: {
					id: session.userId,
				},
			});
			res.status(200).json(userData);
		} else {
			res.status(200).json({});
		}
	} catch (error) {
		res.status(500).json({ message: "Server error" });
	}
};

/**
 * ユーザを作成する関数。
 * /users/createにアクセスされた場合に実行される。
 * VULNERABLE: パスワードの非ハッシュ化
 * @param req 新規作成するユーザのメールアドレス、ユーザ名、パスワード
 * @param res ユーザ作成が成功したかどうかのメッセージ
 */
export const createUser: ControllerFn<
	{ id: number; name: string } | { message: string }
> = async (req, res) => {
	const { email, username, password } = req.body;

	let processedPassword: string;

	const isRawPassword = config.vulnerabilities.rawPassword;

	if (isRawPassword) {
		processedPassword = password;
	} else {
		processedPassword = await createHashedPassword(password);
	}

	try {
		const user = await prisma.user.create({
			select: {
				id: true,
				name: true,
			},
			data: {
				email,
				name: username,
				password: processedPassword,
			},
		});

		req.session.userId = user.id;
		res.status(200).json({ id: user.id, name: user.name });
	} catch (error) {
		res.status(500).json({ message: "Server error" });
	}
};

/**
 * ユーザを更新する関数。
 * /users/updateにアクセスされた場合に実行される。
 * VULNERABLE: パスワードの非ハッシュ化
 * @param req 更新するユーザのメールアドレス、ユーザ名、パスワード
 * @param res 更新されたユーザ
 */
export const updateUser: ControllerFn = async (req, res) => {
	const { session } = req;
	const { username, password, isPrivate } = req.body;

	const isRawPassword = config.vulnerabilities.rawPassword;

	try {
		let processedPassword: string | undefined;
		if (password) {
			if (isRawPassword) {
				processedPassword = password;
			} else {
				processedPassword = await createHashedPassword(password);
			}
		}

		const result = await prisma.user.update({
			where: {
				id: session.userId,
			},
			select: {
				id: true,
				email: true,
				name: true,
				private: true,
			},
			data: {
				name: username,
				password: processedPassword,
				private: isPrivate,
			},
		});

		res.status(200).json(result);
	} catch (error) {
		res.status(500).json({ message: "Server error" });
	}
};

/**
 * ユーザをログアウトさせる関数。
 * /users/logoutにアクセスされた場合に実行される。
 * @param req セッションからユーザ情報を取得
 * @param res 正常にログアウトできた場合はtrue, 失敗した場合はfalse
 */
export const logout: ControllerFn<boolean | { message: string }> = async (
	req,
	res,
) => {
	const { session } = req;

	try {
		const userId = session.userId;

		const user = await prisma.user.findUnique({
			where: {
				id: userId,
			},
		});

		if (user) {
			session.destroy((err) => {
				if (err) {
					console.error(err);
					res.status(500).send(false);
				} else {
					res.clearCookie("connect.sid");
					res.status(200).send(true);
				}
			});
		}
	} catch (error) {
		res.status(500).json({ message: "Server error" });
	}
};
