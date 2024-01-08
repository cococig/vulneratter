import { Component, OnDestroy, OnInit, inject } from "@angular/core";
import {
	Event,
	NavigationEnd,
	Router,
	RouterEvent,
	RouterModule,
} from "@angular/router";
import { Subscription, filter } from "rxjs";
import { AuthService } from "../../../services/auth.service";
import { CommonModule } from "@angular/common";
import { User } from "@prisma/client";

@Component({
	selector: "app-header",
	standalone: true,
	imports: [CommonModule, RouterModule],
	templateUrl: "./header.component.html",
	styleUrl: "./header.component.scss",
})
export class HeaderComponent implements OnInit, OnDestroy {
	private authService = inject(AuthService);
	private router = inject(Router);
	private subscriptions = new Subscription();
	userData: Omit<User, "password"> | null = null;

	visibleLogout = false;

	ngOnInit(): void {
		this.subscriptions.add(
			this.router.events
				.pipe(
					filter(
						(event: Event | RouterEvent): event is RouterEvent =>
							event instanceof NavigationEnd,
					),
				)
				.subscribe((event: RouterEvent) => {
					if (event.url !== "/login") this.visibleLogout = true;
				}),
		);
		this.subscriptions.add(
			this.authService.userData.subscribe((user) => {
				this.userData = user;
			}),
		);
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	async logout() {
		const result = await this.authService.logout();
		if (result) this.router.navigate(["login"]);
		this.visibleLogout = false;
	}
}
