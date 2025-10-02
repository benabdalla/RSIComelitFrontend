import {HttpErrorResponse} from '@angular/common/http';
import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MAT_DIALOG_DATA, MatDialogContent, MatDialogModule} from '@angular/material/dialog';
import {MatListModule} from '@angular/material/list';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {Subscription} from 'rxjs';
import {AppConstants} from 'src/app/common/app-constants';
import {Post} from '../../shared/model/post';
import {User} from '../../shared/model/user';
import {PostService} from '../../shared/service/post.service';
import {environment} from 'src/environments/environment';
import {SnackbarComponent} from '../snackbar/snackbar.component';

@Component({
	selector: 'app-post-like-dialog',
	templateUrl: './post-like-dialog.component.html',
	styleUrls: ['./post-like-dialog.component.css'],
	standalone: true,
	imports: [CommonModule, MatDialogModule, MatDialogContent, MatListModule, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule]
})
export class PostLikeDialogComponent implements OnInit, OnDestroy {
	likeList: User[] = [];
	resultPage: number = 1;
	resultSize: number = 5;
	hasMoreResult: boolean = false;
	fetchingResult: boolean = false;
	defaultProfilePhotoUrl = environment.defaultProfilePhotoUrl;

	private subscriptions: Subscription[] = [];

	dataPost = inject(MAT_DIALOG_DATA) as Post;
	constructor(
		private postService: PostService,
		private matSnackbar: MatSnackBar) { }

	ngOnInit(): void {
		this.loadLikes(1);
	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(sub => sub.unsubscribe());
	}

	loadLikes(currentPage: number): void {
		if (!this.fetchingResult) {
			if (this.dataPost.likeCount > 0) {
				this.fetchingResult = true;
				this.subscriptions.push(
					this.postService.getPostLikes(this.dataPost.id, currentPage, this.resultSize).subscribe({
							next: (value: User[] | HttpErrorResponse) => {
								if (Array.isArray(value)) {
									const resultList = value as User[];
									resultList.forEach(like => this.likeList.push(like));
									if (currentPage * this.resultSize < this.dataPost.likeCount) {
										this.hasMoreResult = true;
									} else {
										this.hasMoreResult = false;
									}
									this.resultPage++;
								} else {
									this.matSnackbar.openFromComponent(SnackbarComponent, {
										data: AppConstants.snackbarErrorContent,
										panelClass: ['bg-danger'],
										duration: 5000
									});
								}
								this.fetchingResult = false;
							},
							error: (errorResponse: HttpErrorResponse) => {
								this.matSnackbar.openFromComponent(SnackbarComponent, {
									data: AppConstants.snackbarErrorContent,
									panelClass: ['bg-danger'],
									duration: 5000
								});
								this.fetchingResult = false;
							}
						})
				);
			}
		}
	}
}
