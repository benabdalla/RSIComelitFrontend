import {HttpErrorResponse} from '@angular/common/http';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import {MatDialogModule} from '@angular/material/dialog';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {Subscription} from 'rxjs';
import {AppConstants} from '../../common/app-constants';
import {RepeatPasswordMatcher} from '../../common/repeat-password-matcher';
import {ResetPassword} from '../../shared/model/reset-password';
import {AuthService} from '../../shared/service/auth.service';
import {SnackbarComponent} from '../snackbar/snackbar.component';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatCardModule} from '@angular/material/card';


@Component({
    selector: 'app-reset-password',
    templateUrl: './reset-password.component.html',
    styleUrls: ['./reset-password.component.css'],
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        MatProgressBarModule,
        MatDialogModule,
        MatSnackBarModule
    ]
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
	token!: string;
	resetPasswordFormGroup!: FormGroup;
	fetchingResult: boolean = false;
	repeatPasswordMatcher = new RepeatPasswordMatcher();

	private subscriptions: Subscription[] = [];

	constructor(
    private authService: AuthService,
		private router: Router,
		private formBuilder: FormBuilder,
		private matSnackbar: MatSnackBar,
    private activatedRoute: ActivatedRoute) {
  }

	// add null-safe getters for template use
	get password(): AbstractControl | null {
		return this.resetPasswordFormGroup ? this.resetPasswordFormGroup.get('password') : null;
	}

	get passwordRepeat(): AbstractControl | null {
		return this.resetPasswordFormGroup ? this.resetPasswordFormGroup.get('passwordRepeat') : null;
	}

	ngOnInit(): void {
		this.token = this.activatedRoute.snapshot.paramMap.get('token') ?? '';

		this.resetPasswordFormGroup = this.formBuilder.group({
			password: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(32)]),
			passwordRepeat: new FormControl('', [Validators.required])
		}, { validators: this.matchPasswords });
	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(sub => sub.unsubscribe());
	}

	matchPasswords: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
		const group = control as FormGroup;
		const password = group.get('password')?.value;
		const passwordRepeat = group.get('passwordRepeat')?.value;
		return password === passwordRepeat ? null : { passwordMissMatch: true }
	}

	resetPassword(): void {
		if (this.resetPasswordFormGroup.valid) {
			if (!this.fetchingResult) {
				this.fetchingResult = true;
				const resetPassword = new ResetPassword();
				resetPassword.password = this.password?.value;
				resetPassword.passwordRepeat = this.passwordRepeat?.value;

				this.subscriptions.push(
          this.authService.resetPassword(this.token, resetPassword).subscribe({
						next: (result: any) => {
							this.matSnackbar.openFromComponent(SnackbarComponent, {
								data: 'Your password has been changed successfully.',
								duration: 5000
							});
							this.fetchingResult = false;
							this.router.navigateByUrl('/login');
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
