import { Injectable } from "@angular/core";
import { AbstractHttpClientService } from "./abstractHttpClient.service";
import { Article, User } from "@prisma/client";
import { config } from "@/config/config";

@Injectable({
	providedIn: "root",
})
export class ArticleService extends AbstractHttpClientService {
	private readonly apiEndpoint = "https://localhost:3001/api/articles/";

	/**
	 * 記事の作成を行うメソッド。
	 * VULNERABLE: 認証・認可不備
	 * @param content 記事の内容
	 * @param userId 記事を作成するユーザのID（脆弱性がない場合は不要）
	 * @returns 記事の作成に成功した場合は作成された記事、そうでない場合はfalse
	 */
	async create(
		content: string,
		userId?: number | null,
	): Promise<(Article & { user: Omit<User, "password"> }) | false> {
		const isImproperAuth = config.vulnerabilities.improperAuth;

		const response = await this.post(
			new URL("create", this.apiEndpoint),
			JSON.stringify({
				userId: isImproperAuth ? userId : undefined,
				content,
			}),
		);
		if (response.ok) return response.json();
		return false;
	}

	/**
	 * 記事の取得を行うメソッド。
	 * @returns 取得した記事のリスト
	 */
	async getAll(): Promise<(Article & { user: Omit<User, "password"> })[]> {
		const response = await this.get(new URL("get", this.apiEndpoint));
		if (response.ok) return response.json();
		return [];
	}

	/**
	 * 記事の削除を行うメソッド。
	 * @param id 削除する記事のID
	 * @returns 削除に成功した場合は削除された記事、そうでない場合はfalse
	 */
	async delete(id: number) {
		const response = await this.post(
			new URL("delete", this.apiEndpoint),
			JSON.stringify({ id }),
		);
		if (response.ok) return response.json();
		return false;
	}
}
