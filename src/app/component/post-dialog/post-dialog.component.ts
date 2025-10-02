import {HttpErrorResponse} from '@angular/common/http';
import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatChipsModule} from '@angular/material/chips';
import {MatTooltipModule} from '@angular/material/tooltip';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {AppConstants} from '../../common/app-constants';
import {Post} from '../../shared/model/post';
import {PostService} from '../../shared/service/post.service';
import {ConfirmationDialogComponent} from '../confirmation-dialog/confirmation-dialog.component';
import {SnackbarComponent} from '../snackbar/snackbar.component';
import {TagDialogComponent} from '../tag-dialog/tag-dialog.component';

@Component({
	selector: 'app-post-dialog',
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		MatFormFieldModule,
		MatInputModule,
		MatProgressSpinnerModule,
		MatIconModule,
		MatButtonModule,
		MatChipsModule,
		MatDialogModule,
		MatTooltipModule
	],
	templateUrl: './post-dialog.component.html',
	styleUrls: ['./post-dialog.component.css']
})
export class PostDialogComponent implements OnInit, OnDestroy {
	postFormGroup!: FormGroup;
	postPhoto!: File;
	postPhotoPreviewUrl!: string;
	postTags: any[] = [];
	creatingPost: boolean = false;

	private subscriptions: Subscription[] = [];

	// dialog data injected via inject() for standalone component compatibility
	dataPost = inject(MAT_DIALOG_DATA) as Post;

	constructor(
		private postService: PostService,
		private formBuilder: FormBuilder,
		private router: Router,
		private matDialog: MatDialog,
		private matDialogRef: MatDialogRef<PostDialogComponent>,
		private matSnackbar: MatSnackBar) { }

	// Return the 'content' FormControl and assert it exists (initialized in ngOnInit)
	get content(): FormControl { return this.postFormGroup.get('content')! as FormControl; }

	ngOnInit(): void {
		this.postFormGroup = this.formBuilder.group({
			content: new FormControl(((this.dataPost && this.dataPost.content) ? this.dataPost.content : ''), [Validators.maxLength(4096)])
		});

		if (this.dataPost) {
			if (this.dataPost.postPhoto) {
				this.postPhotoPreviewUrl = this.dataPost.postPhoto;
			}

			this.populateWithPostTags();
		}
	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(sub => sub.unsubscribe());
	}

	previewPostPhoto(event: any): void {
		if (event.target.files) {
			this.postPhoto = event.target.files[0];
			const reader = new FileReader();
			reader.readAsDataURL(this.postPhoto);
			reader.onload = (e: any) => {
				this.postPhotoPreviewUrl = e.target.result;
			}
		}
	}

	openPostPhotoDeleteConfirmDialog(): void {
		const dialogRef = this.matDialog.open(ConfirmationDialogComponent, {
			data: 'Do you want to delete this photo?',
			width: '500px',
			autoFocus: false
		});

		dialogRef.afterClosed().subscribe(
			result => {
				if (result) {
					this.deletePostPhoto();
				}
			}
		);
	}

	openAddTagDialog(e: Event): void {
		e.preventDefault();

		const dialogRef = this.matDialog.open(TagDialogComponent, {
			width: '500px',
			autoFocus: true
		});

		dialogRef.afterClosed().subscribe(
			result => {
				if (result) {
					const tagIndex = this.postTags.findIndex(tN => tN === result.tagName);
					if (tagIndex >= 0) {
						this.postTags[tagIndex].action = 'add'
					} else {
						this.postTags.push({
							tagName: result.tagName,
							action: 'add'
						})
					}
				}
				console.log(this.postTags)
			}
		);
	}

	removeTag(tagName: string): void {
		const tagIndex = this.postTags.findIndex(tN => tN === tagName);
		if (this.postTags[tagIndex].action === 'saved') {
			this.postTags[tagIndex].action = 'remove';
		} else {
			this.postTags.splice(tagIndex, 1);
		}
		console.log(this.postTags)
	}

	handlePostSubmit(): void {
		if (this.content.value.length <= 0 && !this.postPhoto) {
			this.matSnackbar.openFromComponent(SnackbarComponent, {
				data: 'Post cannot be empty.',
				panelClass: ['bg-danger'],
				duration: 5000
			});
			return;
		}

		if (this.dataPost) {
			this.updatePost();
		} else {
			this.createNewPost();
		}
	}

	private createNewPost(): void {
		if (!this.creatingPost) {
			this.creatingPost = true;
			this.subscriptions.push(
				this.postService.createNewPost(this.content.value, this.postPhoto, this.postTags).subscribe({
					next: (value: Post | HttpErrorResponse) => {
						if (value && typeof value === 'object' && 'id' in value) {
							const createdPost = value as Post;
							this.matDialogRef.close();
							this.matSnackbar.openFromComponent(SnackbarComponent, {
								data: 'Post created successfully.',
								duration: 5000
							});
							this.creatingPost = false;
							this.router.navigateByUrl(`user/posts/${createdPost.id}`).then(() => {
								window.location.reload();
							});
						} else {
							this.matSnackbar.openFromComponent(SnackbarComponent, {
								data: AppConstants.snackbarErrorContent,
								panelClass: ['bg-danger'],
								duration: 5000
							});
							this.creatingPost = false;
						}
					},
					error: (errorResponse: HttpErrorResponse) => {
						this.matSnackbar.openFromComponent(SnackbarComponent, {
							data: AppConstants.snackbarErrorContent,
							panelClass: ['bg-danger'],
							duration: 5000
						});
						this.creatingPost = false;
					}
				})
			);
		}
	}

	private updatePost(): void {
		this.subscriptions.push(
			this.postService.updatePost(this.dataPost.id, this.content.value, this.postPhoto, this.postTags).subscribe({
				next: (value: Post | HttpErrorResponse) => {
					if (value && typeof value === 'object' && 'id' in value) {
						const createdPost = value as Post;
						this.matDialogRef.close();
						this.matSnackbar.openFromComponent(SnackbarComponent, {
							data: 'Post updated successfully.',
							duration: 5000
						});
						this.router.navigateByUrl(`user/posts/${createdPost.id}`);
					} else {
						this.matSnackbar.openFromComponent(SnackbarComponent, {
							data: AppConstants.snackbarErrorContent,
							panelClass: ['bg-danger'],
							duration: 5000
						});
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

	private deletePostPhoto(): void {
		this.subscriptions.push(
			this.postService.deletePostPhoto(this.dataPost.id).subscribe({
				next: (value: any | HttpErrorResponse) => {
					if (value && !(value instanceof HttpErrorResponse)) {
						this.postPhotoPreviewUrl = '';
						this.matSnackbar.openFromComponent(SnackbarComponent, {
							data: 'Photo deleted successfully.',
							duration: 5000
						});
					} else {
						this.matSnackbar.openFromComponent(SnackbarComponent, {
							data: AppConstants.snackbarErrorContent,
							panelClass: ['bg-danger'],
							duration: 5000
						});
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

	private populateWithPostTags(): void {
		this.dataPost.postTags.forEach(tag => {
			this.postTags.push({
				tagName: tag.name,
				action: 'saved'
			});
		});
	}
}
