import { AuthService } from "@/app/services/auth.service";
import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { Subscription } from "rxjs";

@Component({
	selector: "app-mypage",
	standalone: true,
	imports: [CommonModule, ReactiveFormsModule],
	templateUrl: "./mypage.component.html",
	styleUrl: "./mypage.component.scss",
})
export class MypageComponent implements OnInit, OnDestroy {
	private authService = inject(AuthService);
	private formBuilder = inject(FormBuilder);
	private subscriptions = new Subscription();

	updateForm = this.formBuilder.group({
		username: [""],
		password: [null],
		private: [false],
	});

	ngOnInit(): void {
		this.subscriptions.add(
			this.authService.userData.subscribe((user) => {
				if (user) {
					this.updateForm.controls.username.setValue(user.name);
					this.updateForm.controls.private.setValue(user.private);
				}
			}),
		);
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	onClickUpdate() {
		this.authService.update(
			this.updateForm.value.username,
			this.updateForm.value.private,
			this.updateForm.value.password,
		);
	}
}
