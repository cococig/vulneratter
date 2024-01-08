import { Routes } from "@angular/router";
import { HomeComponent } from "./pages/home/home.component";
import { LoginComponent } from "./pages/login/login.component";
import { authActivateGuard } from "./guards/auth-activate.guard";
import { SignupComponent } from "./pages/signup/signup.component";
import { MypageComponent } from "./pages/mypage/mypage.component";

export const routes: Routes = [
	{
		path: "",
		canActivate: [authActivateGuard],
		children: [
			{
				path: "",
				component: HomeComponent,
			},
			{
				path: "mypage",
				component: MypageComponent,
			},
		],
	},
	{
		path: "login",
		component: LoginComponent,
		canActivate: [authActivateGuard],
	},
	{
		path: "signup",
		component: SignupComponent,
		canActivate: [authActivateGuard],
	},
];
