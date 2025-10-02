import {HttpErrorResponse} from '@angular/common/http';
import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Subscription} from 'rxjs';
import {AppConstants} from '../../common/app-constants';
import {PostResponse} from '../../shared/model/post-response';
import {AuthService} from '../../shared/service/auth.service';
import {PostService} from '../../shared/service/post.service';
import {environment} from '../../../environments/environment';
import {ConfirmationDialogComponent} from '../confirmation-dialog/confirmation-dialog.component';
import {PostCommentDialogComponent} from '../post-comment-dialog/post-comment-dialog.component';
import {PostDialogComponent} from '../post-dialog/post-dialog.component';
import {PostLikeDialogComponent} from '../post-like-dialog/post-like-dialog.component';
import {PostShareDialogComponent} from '../post-share-dialog/post-share-dialog.component';
import {ShareConfirmDialogComponent} from '../share-confirm-dialog/share-confirm-dialog.component';
import {SnackbarComponent} from '../snackbar/snackbar.component';
import {WaitingDialogComponent} from '../waiting-dialog/waiting-dialog.component';
import {MatIconModule} from '@angular/material/icon';
import {MatChipsModule} from '@angular/material/chips';
import {MatCardModule} from '@angular/material/card';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatMenuModule} from '@angular/material/menu';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {Router, RouterLink} from '@angular/router';

@Component({
	selector: 'app-post',
	templateUrl: './post.component.html',
	styleUrls: ['./post.component.css'],
	standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatSnackBarModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatCardModule,
    MatTooltipModule,
    MatMenuModule,
    RouterLink
  ]
})
export class PostComponent implements OnInit, OnDestroy {
	@Input() postResponse!: PostResponse;
	@Input() isDetailedPost!: boolean;
	@Output() postDeletedEvent = new EventEmitter<PostResponse>();
	authUserId!: number | null;
	defaultProfilePhotoUrl = environment.defaultProfilePhotoUrl;

	private subscriptions: Subscription[] = [];

	constructor(
		private matDialog: MatDialog,
		private matSnackbar: MatSnackBar,
		private authService: AuthService,
		private postService: PostService,
		private router: Router
	) { }

	ngOnInit(): void {
		this.authUserId = this.authService.getAuthUserId();
	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(sub => sub.unsubscribe());
	}

	openLikeDialog(): void {
		this.matDialog.open(PostLikeDialogComponent, {
			data: this.postResponse.post,
			minWidth: '400px',
			maxWidth: '700px'
		});
	}

	openCommentDialog(): void {
		const dialogRef = this.matDialog.open(PostCommentDialogComponent, {
			data: this.postResponse.post,
			autoFocus: false,
			minWidth: '500px',
			maxWidth: '700px'
		});

		dialogRef.componentInstance.updatedCommentCountEvent.subscribe(
			data => this.postResponse.post.commentCount = data
		);
	}

	openShareDialog(): void {
		this.matDialog.open(PostShareDialogComponent, {
			data: this.postResponse.post,
			autoFocus: false,
			minWidth: '500px',
			maxWidth: '700px'
		});
	}

	openShareConfirmDialog(): void {
		this.matDialog.open(ShareConfirmDialogComponent, {
			data: this.postResponse.post,
			autoFocus: false,
			minWidth: '500px',
			maxWidth: '700px'
		});
	}

	openPostEditDialog(): void {
		this.matDialog.open(PostDialogComponent, {
			data: this.postResponse.post,
			autoFocus: false,
			minWidth: '500px',
			maxWidth: '900px'
		});
	}

	openPostDeleteConfirmDialog(): void {
		const dialogRef = this.matDialog.open(ConfirmationDialogComponent, {
			data: 'Do you want to delete this post permanently?',
			autoFocus: false,
			width: '500px'
		});

		dialogRef.afterClosed().subscribe(
			result => {
				if (result) this.deletePost(this.postResponse.post.id, this.postResponse.post.isTypeShare);
			}
		);
	}

	deletePost(postId: number, isTypeShare: boolean): void {
		const dialogRef = this.matDialog.open(WaitingDialogComponent, {
			data: 'Please, wait while we are deleting the post.',
			width: '500px',
			disableClose: true
		});

		this.subscriptions.push(
			this.postService.deletePost(postId, isTypeShare).subscribe({
				next: (response: any) => {
					this.postDeletedEvent.emit(this.postResponse);
					dialogRef.close();
					this.matSnackbar.openFromComponent(SnackbarComponent, {
						data: 'Post deleted successfully.',
						panelClass: ['bg-success'],
						duration: 5000
					});

				},
				error: (errorResponse: HttpErrorResponse) => {
					this.matSnackbar.openFromComponent(SnackbarComponent, {
						data: AppConstants.snackbarErrorContent,
						panelClass: ['bg-danger'],
						duration: 5000
					});
					dialogRef.close();
				}
			})
		);
	}

	likeOrUnlikePost(likedByAuthUser: boolean) {
		if (likedByAuthUser) {
			this.subscriptions.push(
				this.postService.unlikePost(this.postResponse.post.id).subscribe({
					next: (response: any) => {
						this.postResponse.likedByAuthUser = false;
						this.postResponse.post.likeCount--;
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
				this.postService.likePost(this.postResponse.post.id).subscribe({
					next: (response: any) => {
						this.postResponse.likedByAuthUser = true;
						this.postResponse.post.likeCount++;
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
}
