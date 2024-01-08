import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit, inject } from "@angular/core";
import { RouterModule } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { FormBuilder, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ArticleService } from "../../services/article.service";
import { DomSanitizer } from "@angular/platform-browser";
import { Subscription } from "rxjs";
import { config } from "@/config/config";
import { Article, User } from "@prisma/client";

@Component({
	selector: "app-home",
	standalone: true,
	imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
	templateUrl: "./home.component.html",
	styleUrl: "./home.component.scss",
})
export class HomeComponent implements OnInit, OnDestroy {
	private authService = inject(AuthService);
	private articleService = inject(ArticleService);
	private formBuilder = inject(FormBuilder);
	private domSanitizer = inject(DomSanitizer);
	private subscriptions = new Subscription();

	isXss = config.vulnerabilities.xss; // XSSを発生させるかどうかの指定
	isImproperAuth = config.vulnerabilities.improperAuth; // 認証・認可不備を発生させるかどうかの指定

	articles = this.articleService.getAll();

	userId?: number;

	postForm = this.formBuilder.group({
		userId: [this.userId],
		content: [""],
	});

	ngOnInit(): void {
		this.subscriptions.add(
			this.authService.userData?.subscribe((user) => {
				if (user) {
					this.userId = user.id;
					this.postForm.controls.userId.setValue(user.id);
				}
			}),
		);
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	// VULNERABLE: XSS
	bypassSecurity(content: string) {
		return this.domSanitizer.bypassSecurityTrustHtml(content);
	}

	async onSubmit() {
		if (this.postForm.value.content) {
			let article: (Article & { user: Omit<User, "password"> }) | false;
			if (this.isImproperAuth) {
				article = await this.articleService.create(
					this.postForm.value.content,
					this.postForm.value.userId,
				);
			} else {
				article = await this.articleService.create(this.postForm.value.content);
			}

			this.postForm.reset();
			this.postForm.controls.userId.setValue(this.userId);
			if (article) (await this.articles).push(article);
		}
	}

	async deleteArticle(id: number) {
		this.articleService.delete(id);
		this.articles = Promise.resolve(
			(await this.articles).filter((article) => article.id !== id),
		);
	}
}
