import {HttpErrorResponse} from '@angular/common/http';
import {Component, EventEmitter, inject, OnDestroy, OnInit, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MAT_DIALOG_DATA, MatDialog, MatDialogModule} from '@angular/material/dialog';
import {MatChipsModule} from '@angular/material/chips';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Subscription} from 'rxjs';
import {AppConstants} from '../../common/app-constants';
import {Comment} from '../../shared/model/comment';
import {CommentResponse} from '../../shared/model/comment-response';
import {Post} from '../../shared/model/post';
import {AuthService} from '../../shared/service/auth.service';
import {CommentService} from '../../shared/service/comment.service';
import {PostService} from '../../shared/service/post.service';
import {environment} from '../../../environments/environment';
import {CommentLikeDialogComponent} from '../comment-like-dialog/comment-like-dialog.component';
import {ConfirmationDialogComponent} from '../confirmation-dialog/confirmation-dialog.component';
import {SnackbarComponent} from '../snackbar/snackbar.component';

@Component({
	selector: 'app-post-comment-dialog',
	templateUrl: './post-comment-dialog.component.html',
	styleUrls: ['./post-comment-dialog.component.css'],
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		FormsModule,
		MatFormFieldModule,
		MatInputModule,
		MatButtonModule,
		MatIconModule,
		MatProgressSpinnerModule,
		MatTooltipModule,
		MatChipsModule
		,MatDialogModule
	]
})
export class PostCommentDialogComponent implements OnInit, OnDestroy {
	@Output() updatedCommentCountEvent = new EventEmitter<number>();
	@Output() newItemEvent = new EventEmitter<string>();
	authUserId!: number | null;
	commentResponseList: CommentResponse[] = [];
	resultPage: number = 1;
	resultSize: number = 5;
	hasMoreResult: boolean = false;
	fetchingResult: boolean = false;
	creatingComment: boolean = false;
	commentFormGroup!: FormGroup;
	defaultProfilePhotoUrl = environment.defaultProfilePhotoUrl;

	private subscriptions: Subscription[] = [];

	// dialog data injected via inject() for standalone component compatibility
	dataPost = inject(MAT_DIALOG_DATA) as Post;

	constructor(
		private authService: AuthService,
		private postService: PostService,
		private commentService: CommentService,
		private formBuilder: FormBuilder,
		private matDialog: MatDialog,
		private matSnackbar: MatSnackBar) { }

	// Return non-null FormControl (initialized in ngOnInit)
	get content(): FormControl { return this.commentFormGroup.get('content')! as FormControl; }

	ngOnInit(): void {
		this.authUserId = this.authService.getAuthUserId();

		this.commentFormGroup = this.formBuilder.group({
			content: new FormControl('', [Validators.required, Validators.maxLength(1024)])
		});

		this.loadComments(1);
	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(sub => sub.unsubscribe());
	}

	loadComments(currentPage: number): void {
		if (!this.fetchingResult) {
			if (this.dataPost.commentCount > 0) {
				this.fetchingResult = true;

				this.subscriptions.push(
					this.postService.getPostComments(this.dataPost.id, currentPage, this.resultSize).subscribe({
						next: (resultList: CommentResponse[] | HttpErrorResponse) => {
							if (Array.isArray(resultList)) {
								resultList.forEach(commentResponse => this.commentResponseList.push(commentResponse));
							} else {
								// error case handled in error handler
							}
							if (currentPage * this.resultSize < this.dataPost.commentCount) {
								this.hasMoreResult = true;
							} else {
								this.hasMoreResult = false;
							}
							this.resultPage++;
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

	createNewComment(): void {
		if (!this.content) return;
		this.creatingComment = true;
		this.subscriptions.push(
			this.postService.createPostComment(this.dataPost.id, this.content.value).subscribe({
					next: (newComment: CommentResponse | HttpErrorResponse) => {
						if (newComment && typeof newComment === 'object' && !('status' in newComment)) {
							const created = newComment as CommentResponse;
							this.commentFormGroup.reset();
							Object.keys(this.commentFormGroup.controls).forEach(key => {
								const control = this.commentFormGroup.get(key);
								if (control) control.setErrors(null);
							});
							this.commentResponseList.unshift(created);
							this.updatedCommentCountEvent.emit(this.commentResponseList.length);
							this.creatingComment = false;
						} else {
							this.matSnackbar.openFromComponent(SnackbarComponent, {
								data: AppConstants.snackbarErrorContent,
								panelClass: ['bg-danger'],
								duration: 5000
							});
							this.creatingComment = false;
						}


				},
				error: (errorResponse: HttpErrorResponse) => {
					this.matSnackbar.openFromComponent(SnackbarComponent, {
						data: AppConstants.snackbarErrorContent,
						panelClass: ['bg-danger'],
						duration: 5000
					});
					this.creatingComment = false;
				}
			})
		);
	}

	openCommentLikeDialog(comment: Comment): void {
		this.matDialog.open(CommentLikeDialogComponent, {
			data: comment,
			minWidth: '500px',
			maxWidth: '700px'
		});
	}

	likeOrUnlikeComment(commentResponse: CommentResponse) {
		if (commentResponse.likedByAuthUser) {
			this.subscriptions.push(
				this.commentService.unlikeComment(commentResponse.comment.id).subscribe({
					next: (response: any) => {
						const targetCommentResponse = this.commentResponseList.find(cR => cR === commentResponse);
						if (targetCommentResponse) {
							targetCommentResponse.likedByAuthUser = false;
							targetCommentResponse.comment.likeCount--;
						}
					},
					error: (errorResponse: HttpErrorResponse) => {
						this.matSnackbar.openFromComponent(SnackbarComponent, {
							data: AppConstants.snackbarErrorContent,
							panelClass: ['bg-danger'],
							duration: 5000
						});
					}
				})
			);
		} else {
			this.subscriptions.push(
				this.commentService.likeComment(commentResponse.comment.id).subscribe({
					next: (response: any) => {
						const targetCommentResponse = this.commentResponseList.find(cR => cR === commentResponse);
						if (targetCommentResponse) {
							targetCommentResponse.likedByAuthUser = true;
							targetCommentResponse.comment.likeCount++;
						}
					},
					error: (errorResponse: HttpErrorResponse) => {
						this.matSnackbar.openFromComponent(SnackbarComponent, {
							data: AppConstants.snackbarErrorContent,
							panelClass: ['bg-danger'],
							duration: 5000
						});
					}
				})
			);
		}
	}

	openCommentDeleteConfirmDialog(commentResponse: CommentResponse): void {
		const dialogRef = this.matDialog.open(ConfirmationDialogComponent, {
			data: 'Do you want to delete this comment permanently?',
			autoFocus: false,
			width: '500px'
		});

		dialogRef.afterClosed().subscribe(
			result => {
				if (result) this.deleteComment(commentResponse);
			}
		);
	}

	private deleteComment(commentResponse: CommentResponse) {
		this.subscriptions.push(
			this.commentService.deleteComment(this.dataPost.id, commentResponse.comment.id).subscribe({
				next: (response: any) => {
					const targetIndex = this.commentResponseList.indexOf(commentResponse);
					this.commentResponseList.splice(targetIndex, 1);
					this.dataPost.commentCount--;

					this.matSnackbar.openFromComponent(SnackbarComponent, {
						data: 'Comment deleted successfully.',
						duration: 5000
					});
				},
				error: (errorResponse: HttpErrorResponse) => {
					this.matSnackbar.openFromComponent(SnackbarComponent, {
						data: AppConstants.snackbarErrorContent,
						panelClass: ['bg-danger'],
						duration: 5000
					});
				}
			})
		);
	}
}
