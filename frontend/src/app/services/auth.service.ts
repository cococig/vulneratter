import { Injectable } from "@angular/core";
import { AbstractHttpClientService } from "./abstractHttpClient.service";
import { User } from "@prisma/client";
import { BehaviorSubject } from "rxjs";

@Injectable({
	providedIn: "root",
})
export class AuthService extends AbstractHttpClientService {
	readonly apiEndpoint = "https://localhost:3001/api/users/";
	private userSubject: BehaviorSubject<Omit<User, "password"> | null> =
		new BehaviorSubject<Omit<User, "password"> | null>(null);
	userData = this.userSubject.asObservable();

	constructor() {
		super();
		this.get(new URL("get", this.apiEndpoint)).then(async (response) => {
			this.userSubject.next(await response.json());
		});
	}

	/**
	 * ログインを行うメソッド。
	 * ログイン後のユーザ情報はuserDataに送られる
	 * @param email ユーザのメールアドレス
	 * @param password ユーザのパスワード
	 * @returns ログインが成功したかどうか
	 */
	async login(email: string, password: string) {
		const response = await this.post(
			new URL("login", this.apiEndpoint),
			JSON.stringify({
				email,
				password,
			}),
		);

		this.userSubject.next(await response.json());

		if (response.ok) return true;
		return false;
	}

	/**
	 * 現在ログイン中かどうかを判定するメソッド。
	 * @returns 現在ログイン中かどうか
	 */
	async isLogin() {
		const response = await this.get(new URL("isLogin", this.apiEndpoint));

		if (response.ok && (await response.json()).login) return true;
		return false;
	}

	/**
	 * 新規登録を行うメソッド。
	 * 新規登録後のユーザ情報はuserDataに送られる。
	 * @param email ユーザのメールアドレス
	 * @param username ユーザ名
	 * @param password ユーザのパスワード
	 * @returns 新規登録が成功したかどうか
	 */
	async signUp(email: string, username: string, password: string) {
		const response = await this.post(
			new URL("create", this.apiEndpoint),
			JSON.stringify({
				email,
				username,
				password,
			}),
		);

		this.userSubject.next(await response.json());

		if (response.ok) return true;
		return false;
	}

	/**
	 * ユーザ情報の更新を行うメソッド。
	 * 更新後のユーザ情報はuserDataに送られる。
	 * @param username ユーザ名
	 * @param isPrivate 鍵アカウントにするかどうか
	 * @param password パスワード（変更がある場合のみ）
	 * @returns 更新が成功したかどうか
	 */
	async update(
		username?: string | null,
		isPrivate?: boolean | null,
		password?: string | null,
	) {
		const response = await this.post(
			new URL("update", this.apiEndpoint),
			JSON.stringify({
				username,
				password,
				isPrivate,
			}),
		);

		this.userSubject.next(await response.json());

		if (response.ok) return true;
		return false;
	}

	/**
	 * ログアウトを行うメソッド。
	 * @returns ログアウトが成功したかどうか
	 */
	async logout() {
		const response = await this.get(new URL("logout", this.apiEndpoint));

		if (response.ok) {
			this.userSubject.next(null);
			return true;
		}
		return false;
	}
}
