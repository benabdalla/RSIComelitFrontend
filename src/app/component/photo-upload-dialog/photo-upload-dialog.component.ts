import {HttpErrorResponse} from '@angular/common/http';
import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {Subscription} from 'rxjs';
import {AppConstants} from '../../common/app-constants';
import {User} from '../../shared/model/user';
import {AuthService} from '../../shared/service/auth.service';
import {UserService} from '../../shared/service/user.service';
import {environment} from '../../../environments/environment';
import {SnackbarComponent} from '../snackbar/snackbar.component';

@Component({
	selector: 'app-photo-upload-dialog',
	templateUrl: './photo-upload-dialog.component.html',
	styleUrls: ['./photo-upload-dialog.component.css'],
	standalone: true,
	imports: [CommonModule, MatDialogModule, MatSnackBarModule, MatIconModule, MatButtonModule]
})
export class PhotoUploadDialogComponent implements OnInit {
	photoPreviewUrl: string | null = null;
	photo?: File;
	defaultProfilePhotoUrl: string = environment.defaultProfilePhotoUrl;
	defaultCoverPhotoUrl: string = environment.defaultCoverPhotoUrl;

	private subscriptions: Subscription[] = [];

	data = inject(MAT_DIALOG_DATA) as any;
	constructor(
		private authService: AuthService,
		private userService: UserService,
		private thisDialogRef: MatDialogRef<PhotoUploadDialogComponent>,
		private matSnackbar: MatSnackBar) { }

	ngOnInit(): void {
		if (this.data.uploadType === 'profilePhoto') {
			this.photoPreviewUrl = this.data.authUser.profilePhoto ? this.data.authUser.profilePhoto : this.defaultProfilePhotoUrl;
		} else if (this.data.uploadType === 'coverPhoto') {
			this.photoPreviewUrl = this.data.authUser.coverPhoto ? this.data.authUser.coverPhoto : this.defaultCoverPhotoUrl;
		}
	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(sub => sub.unsubscribe());
	}

	previewPhoto(e: any): void {
		if (e.target && e.target.files && e.target.files.length > 0) {
			const file: File = e.target.files[0];
			this.photo = file;
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = (ev: any) => {
				this.photoPreviewUrl = ev.target.result;
			}
		}
	}

	savePhoto(): void {
		if (this.photo) {
			const isProfile = this.data.uploadType === 'profilePhoto';
			const updateFn = isProfile
				? this.userService.updateProfilePhoto.bind(this.userService)
				: this.userService.updateCoverPhoto.bind(this.userService);

			this.subscriptions.push(
				updateFn(this.photo).subscribe({
					next: (updatedUser: User | HttpErrorResponse) => {
						// Check for a valid User object (e.g., has firstName)
						if (updatedUser && typeof updatedUser === 'object' && 'firstName' in updatedUser) {
							const u = updatedUser as User;
							this.authService.storeAuthUserInCache(u);
							this.photoPreviewUrl = null;
							this.matSnackbar.openFromComponent(SnackbarComponent, {
								data: isProfile
									? 'Profile photo updated successfully.'
									: 'Cover photo updated successfully.',
								duration: 5000
							});
							this.thisDialogRef.close({ updatedUser: u });
						} else {
							// Error: show error snackbar
							this.matSnackbar.openFromComponent(SnackbarComponent, {
								data: AppConstants.snackbarErrorContent,
								panelClass: ['bg-danger'],
								duration: 5000
							});
						}
					},
					error: () => {
						this.matSnackbar.openFromComponent(SnackbarComponent, {
							data: AppConstants.snackbarErrorContent,
							panelClass: ['bg-danger'],
							duration: 5000
						});
					}
				})
			);
		} else {
			this.matSnackbar.openFromComponent(SnackbarComponent, {
				data: 'Please, first upload a photo to save.',
				panelClass: ['bg-danger'],
				duration: 5000
			});
		}
	};
}
