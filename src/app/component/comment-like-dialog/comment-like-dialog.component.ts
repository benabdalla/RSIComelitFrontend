import {HttpErrorResponse} from '@angular/common/http';
import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogContent} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {CommonModule} from '@angular/common';
import {Subscription} from 'rxjs';
import {AppConstants} from '../../common/app-constants';
import {Comment} from '../../shared/model/comment';
import {User} from '../../shared/model/user';
import {CommentService} from '../../shared/service/comment.service';
import {environment} from '../../../environments/environment';
import {SnackbarComponent} from '../snackbar/snackbar.component';

@Component({
	selector: 'app-comment-like-dialog',
	templateUrl: './comment-like-dialog.component.html',
	styleUrls: ['./comment-like-dialog.component.css'],
	standalone: true,
	imports: [
		CommonModule,
		MatDialogContent,
		MatButtonModule,
		MatSnackBarModule,
		MatProgressSpinnerModule
	]
})
export class CommentLikeDialogComponent implements OnInit, OnDestroy {
	likeList: User[] = [];
	resultPage: number = 1;
	resultSize: number = 1;
	hasMoreResult: boolean = false;
	fetchingResult: boolean = false;
	defaultProfilePhotoUrl = environment.defaultProfilePhotoUrl;

	private subscriptions: Subscription[] = [];

	dataComment = inject(MAT_DIALOG_DATA) as Comment;
	constructor(
		private commentService: CommentService,
		private matSnackbar: MatSnackBar) { }

	ngOnInit(): void {
		this.loadCommentLikes(1);
	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(sub => sub.unsubscribe());
	}

	loadCommentLikes(currentPage: number): void {
		if (this.dataComment.likeCount > 0) {
			this.fetchingResult = true;
			const sub = this.commentService.getCommentLikes(this.dataComment.id, currentPage, this.resultSize)
				.subscribe(
					(result: User[] | HttpErrorResponse) => {
						if (Array.isArray(result)) {
							result.forEach(like => this.likeList.push(like));
							if (currentPage * this.resultSize < this.dataComment.likeCount) {
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
					}
				);
			this.subscriptions.push(sub);
		}
	}
}
