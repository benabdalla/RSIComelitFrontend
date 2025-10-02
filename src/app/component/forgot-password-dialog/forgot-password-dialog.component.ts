import {HttpErrorResponse} from '@angular/common/http';
import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {AppConstants} from '../../common/app-constants';
import {SnackbarComponent} from '../snackbar/snackbar.component';
import {AuthService} from '../../shared/service/auth.service';

@Component({
	selector: 'app-forgot-password-dialog',
	templateUrl: './forgot-password-dialog.component.html',
	styleUrls: ['./forgot-password-dialog.component.css'],
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		MatDialogModule,
		MatFormFieldModule,
		MatInputModule,
		MatButtonModule,
		MatIconModule,
		MatProgressSpinnerModule,
		MatSnackBarModule
	]
})
export class ForgotPasswordDialogComponent implements OnInit, OnDestroy {
	forgotPasswordFormGroup!: FormGroup;
	fetchingResult: boolean = false;

	private subscriptions: Subscription[] = [];

	constructor(
    private authService: AuthService,
		private fb: FormBuilder,
		private matSnackbar: MatSnackBar,
		private thisDialogRef: MatDialogRef<ForgotPasswordDialogComponent>,
		private router: Router,
		@Inject(MAT_DIALOG_DATA) public data: any) { }

	// safe getter for template
	get email(): AbstractControl | null {
		return this.forgotPasswordFormGroup ? this.forgotPasswordFormGroup.get('email') : null;
	}

	ngOnInit(): void {
		this.forgotPasswordFormGroup = this.fb.group({
			email: new FormControl('', [Validators.required, Validators.email, Validators.maxLength(64)])
		});
	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(sub => sub.unsubscribe());
	}

	sendForgotPasswordEmail(): void {
		if (this.forgotPasswordFormGroup.valid) {
			if (!this.fetchingResult) {
				this.fetchingResult = true;
				this.subscriptions.push(
          this.authService.forgotPassword(this.email?.value ?? '').subscribe({
						next: (result: any) => {
							localStorage.setItem(AppConstants.messageTypeLabel, AppConstants.successLabel);
							localStorage.setItem(AppConstants.messageHeaderLabel, AppConstants.forgotPasswordSuccessHeader);
							localStorage.setItem(AppConstants.messageDetailLabel, AppConstants.forgotPasswordSuccessDetail);
							localStorage.setItem(AppConstants.toLoginLabel, AppConstants.falseLabel);
							this.fetchingResult = false;
							this.thisDialogRef.close();
							this.router.navigateByUrl('/message');
						},
						error: (errorResponse: HttpErrorResponse) => {
							this.fetchingResult = false;
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
}
