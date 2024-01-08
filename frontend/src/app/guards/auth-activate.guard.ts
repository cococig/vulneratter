import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";

export const authActivateGuard: CanActivateFn = async (route, state) => {
	const authService = inject(AuthService);
	const router = inject(Router);

	const isLogin = await authService.isLogin();

	const disallowPaths = ["login", "signup"];

	// ログイン済みの場合、ログイン画面と新規登録画面には遷移させない
	if (disallowPaths.some((path) => route.url[0]?.path === path)) {
		if (isLogin) {
			router.navigate([""]);
			return false;
		}
		return true;
	}

	// 未ログインの場合、ログイン後画面には遷移させない
	if (isLogin) {
		return true;
	}
	router.navigate(["login"]);
	return false;
};
