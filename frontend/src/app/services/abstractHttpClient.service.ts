export abstract class AbstractHttpClientService {
	protected readonly contentTypeHeader: HeadersInit = {
		"Content-Type": "application/json",
	};
	protected readonly includeCredentials: RequestCredentials = "include";

	/**
	 * HeadersInitオブジェクトに`Content-Type: application/json`を追加する
	 * @param header HeadersInitオブジェクト
	 * @returns `Content-Type: application/json`が追加されたHeadersInitオブジェクト
	 */
	private mergeHeadersContentTypeJson(header?: HeadersInit) {
		return {
			...this.contentTypeHeader,
			...header,
		};
	}

	/**
	 * fetchメソッドのラッパー。GETリクエストのレスポンスを返す。
	 * @param url リクエスト先のURL
	 * @param requestInit `method`を除いたRequestInitオブジェクト
	 * @param isContentTypeJson Content-Typeが`application/json`かどうか
	 * @param useCredentials credentialsをincludeするかどうか
	 * @returns レスポンスのPromise
	 */
	protected get(
		url: string | URL | Request,
		requestInit?: Omit<RequestInit, "method">,
		isContentTypeJson = true,
		useCredentials = true,
	) {
		let headers = requestInit?.headers;
		if (isContentTypeJson) {
			headers = this.mergeHeadersContentTypeJson(headers);
		}

		return fetch(url, {
			method: "GET",
			headers,
			credentials: useCredentials
				? this.includeCredentials
				: requestInit?.credentials,
			...requestInit,
		});
	}

	/**
	 * fetchメソッドのラッパー。POSTリクエストのレスポンスを返す。
	 * @param url リクエスト先のURL
	 * @param body POSTリクエストのbody
	 * @param requestInit `method`,`body`を除いたRequestInitオブジェクト
	 * @param isContentTypeJson Content-Typeが`application/json`かどうか
	 * @param useCredentials credentialsをincludeするかどうか
	 * @returns レスポンスのPromise
	 */
	protected post(
		url: string | URL | Request,
		body?: BodyInit,
		requestInit?: Omit<RequestInit, "method" | "body">,
		isContentTypeJson = true,
		useCredentials = true,
	) {
		let headers = requestInit?.headers;
		if (isContentTypeJson) {
			headers = this.mergeHeadersContentTypeJson(headers);
		}

		return fetch(url, {
			method: "POST",
			body,
			headers,
			credentials: useCredentials
				? this.includeCredentials
				: requestInit?.credentials,
			...requestInit,
		});
	}
}
