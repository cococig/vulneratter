import { Component, inject } from "@angular/core";
import { AuthService } from "../../services/auth.service";
import { Router, RouterModule } from "@angular/router";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { CommonModule } from "@angular/common";

@Component({
	selector: "app-signup",
	standalone: true,
	imports: [CommonModule, RouterModule, ReactiveFormsModule],
	templateUrl: "./signup.component.html",
	styleUrl: "./signup.component.scss",
})
export class SignupComponent {
	private authService = inject(AuthService);
	private router = inject(Router);
	private formBuilder = inject(FormBuilder);

	signupForm = this.formBuilder.group({
		email: ["", Validators.required],
		username: ["", Validators.required],
		password: ["", Validators.required],
	});

	async onClickSignUp() {
		if (
			this.signupForm.value.email &&
			this.signupForm.value.username &&
			this.signupForm.value.password
		) {
			const result = await this.authService.signUp(
				this.signupForm.value.email,
				this.signupForm.value.username,
				this.signupForm.value.password,
			);

			if (result) this.router.navigate([""]);
		}
	}
}
