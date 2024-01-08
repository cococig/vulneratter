import { Component, inject } from "@angular/core";
import { AuthService } from "../../services/auth.service";
import { Router, RouterModule } from "@angular/router";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { CommonModule } from "@angular/common";

@Component({
	selector: "app-login",
	standalone: true,
	imports: [CommonModule, RouterModule, ReactiveFormsModule],
	templateUrl: "./login.component.html",
	styleUrl: "./login.component.scss",
})
export class LoginComponent {
	private authService = inject(AuthService);
	private router = inject(Router);
	private formBuilder = inject(FormBuilder);
	isVisibleFailureLoginMessage = false;

	loginForm = this.formBuilder.group({
		email: ["", Validators.required],
		password: ["", Validators.required],
	});

	async onClickLogin() {
		if (this.loginForm.value.email && this.loginForm.value.password) {
			const result = await this.authService.login(
				this.loginForm.value.email,
				this.loginForm.value.password,
			);
			if (result) {
				this.router.navigate([""]);
			} else {
				this.isVisibleFailureLoginMessage = true;
			}
		}
	}
}
