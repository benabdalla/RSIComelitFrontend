import {HttpErrorResponse} from '@angular/common/http';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {PostComponent} from '../post/post.component';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {AppConstants} from '../../common/app-constants';
import {PostResponse} from '../../shared/model/post-response';
import {AuthService} from '../../shared/service/auth.service';
import {PostService} from '../../shared/service/post.service';

@Component({
	selector: 'app-post-detail',
	templateUrl: './post-detail.component.html',
	styleUrls: ['./post-detail.component.css'],
	standalone: true,
	imports: [CommonModule, MatProgressSpinnerModule, PostComponent]
})
export class PostDetailComponent implements OnInit, OnDestroy {
	postId!: number;
	postResponse!: PostResponse;
	fetchingResult: boolean = false;

	private subscriptions: Subscription[] = [];

	constructor(
		private authService: AuthService,
		private router: Router,
		private postService: PostService,
		private activatedRoute: ActivatedRoute,
		private matSnackbar: MatSnackBar) { }

	ngOnInit(): void {
			this.fetchingResult = true;
			this.postId = Number(this.activatedRoute.snapshot.paramMap.get('postId'));

			this.subscriptions.push(
				this.postService.getPostById(this.postId).subscribe({
					next: (resp: PostResponse | HttpErrorResponse) => {
						// service may return an HttpErrorResponse in some error flows
						if (resp && typeof resp === 'object' && 'post' in resp) {
							this.postResponse = resp as PostResponse;
							this.fetchingResult = false;
						} else {
							// treat as not-found / error
							localStorage.setItem(AppConstants.messageTypeLabel, AppConstants.errorLabel);
							localStorage.setItem(AppConstants.messageHeaderLabel, AppConstants.notFoundErrorHeader);
							localStorage.setItem(AppConstants.messageDetailLabel, AppConstants.notFoundErrorDetail);
							localStorage.setItem(AppConstants.toLoginLabel, AppConstants.falseLabel);
							this.fetchingResult = false;
							// this.router.navigateByUrl('/message');
						}
					},
					error: (errorResponse: HttpErrorResponse) => {
						localStorage.setItem(AppConstants.messageTypeLabel, AppConstants.errorLabel);
						localStorage.setItem(AppConstants.messageHeaderLabel, AppConstants.notFoundErrorHeader);
						localStorage.setItem(AppConstants.messageDetailLabel, AppConstants.notFoundErrorDetail);
						localStorage.setItem(AppConstants.toLoginLabel, AppConstants.falseLabel);
						this.fetchingResult = false;
						// this.router.navigateByUrl('/message');
					}
				})
			);

	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(sub => sub.unsubscribe());
	}

}
