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
import {MatSnackBar} from '@angular/material/snack-bar';
import {Subscription} from 'rxjs';
import {AppConstants} from '../../common/app-constants';
import {Country} from '../../shared/model/country';
import {UpdateUserInfo} from '../../shared/model/update-user-info';
import {User} from '../../shared/model/user';
import {AuthService} from '../../shared/service/auth.service';
import {CountryService} from '../../shared/service/country.service';
import {UserService} from '../../shared/service/user.service';
import {SnackbarComponent} from '../snackbar/snackbar.component';
import {RepeatPasswordMatcher} from '../../common/repeat-password-matcher';
import {UpdateUserEmail} from '../../shared/model/update-user-email';
import {Router} from '@angular/router';
import {UpdateUserPassword} from '../../shared/model/update-user-password';
import moment from 'moment';
import {TextFieldModule} from '@angular/cdk/text-field';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatNativeDateModule} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatSelectModule} from '@angular/material/select';
import {MatTabsModule} from '@angular/material/tabs';
import {MatRadioModule} from '@angular/material/radio';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TextFieldModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTabsModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatRadioModule,
    MatCardModule,
    MatProgressBarModule
  ],
})
export class SettingsComponent implements OnInit, OnDestroy {
  authUser: User | null = null;
  authUserId: number = 0;
  submittingForm: boolean = false;
  countryList: Country[] = [];
  updateInfoFormGroup!: FormGroup;
  updateEmailFormGroup!: FormGroup;
  updatePasswordFormGroup!: FormGroup;
  repeatPasswordMatcher = new RepeatPasswordMatcher();

  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private countryService: CountryService,
    private formBuilder: FormBuilder,
    private matSnackbar: MatSnackBar,
    private router: Router) {
  }

  get updateInfoFirstName() {
    return this.updateInfoFormGroup.get('firstName')
  }

  get updateInfoLastName() {
    return this.updateInfoFormGroup.get('lastName')
  }

  get updateInfoIntro() {
    return this.updateInfoFormGroup.get('intro')
  }

  get updateInfoGender() {
    return this.updateInfoFormGroup.get('gender')
  }

  get updateInfoHometown() {
    return this.updateInfoFormGroup.get('hometown')
  }

  get updateInfoCurrentCity() {
    return this.updateInfoFormGroup.get('currentCity')
  }

  get updateInfoEduInstitution() {
    return this.updateInfoFormGroup.get('eduInstitution')
  }

  get updateInfoWorkplace() {
    return this.updateInfoFormGroup.get('workplace')
  }

  get updateInfoCountryName() {
    return this.updateInfoFormGroup.get('countryName')
  }

  get updateInfoBirthDate() {
    return this.updateInfoFormGroup.get('birthDate')
  }

  get updateEmailNewEmail() {
    return this.updateEmailFormGroup.get('email')
  }

  get updateEmailPassword() {
    return this.updateEmailFormGroup.get('password')
  }

  get updatePasswordNewPassword() {
    return this.updatePasswordFormGroup.get('password')
  }

  get updatePasswordPasswordRepeat() {
    return this.updatePasswordFormGroup.get('passwordRepeat')
  }

  get updatePasswordOldPassword() {
    return this.updatePasswordFormGroup.get('oldPassword')
  }

  matchPasswords: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const group = control as FormGroup;
    const password = group.get('password')?.value;
    const passwordRepeat = group.get('passwordRepeat')?.value;
    return password === passwordRepeat ? null : {passwordMissMatch: true}
  }

  ngOnInit(): void {
    if (!this.authService.isUserLoggedIn()) {
      this.router.navigateByUrl('/login');
    } else {
      this.authUser = this.authService.getAuthUserFromToken();

      this.countryService.getCountryList().subscribe(
        (value: Country[] | HttpErrorResponse) => {
          if (Array.isArray(value)) {
            this.countryList = value;
          } else {
            // handle error if needed
          }
        }
      );

      this.updateInfoFormGroup = this.formBuilder.group({
        firstName: new FormControl(this.authUser?.firstName ?? '', [Validators.required, Validators.maxLength(64)]),
        lastName: new FormControl(this.authUser?.lastName ?? '', [Validators.required, Validators.maxLength(64)]),
        intro: new FormControl(this.authUser?.intro ?? '', [Validators.maxLength(100)]),
        hometown: new FormControl(this.authUser?.hometown ?? '', [Validators.maxLength(128)]),
        currentCity: new FormControl(this.authUser?.currentCity, [Validators.maxLength(128)]),
        eduInstitution: new FormControl(this.authUser?.eduInstitution, [Validators.maxLength(128)]),
        workplace: new FormControl(this.authUser?.workplace, [Validators.maxLength(128)]),
        gender: [this.authUser?.gender],
        countryName: [this.authUser?.country ? this.authUser.country.name : null],
        birthDate: [this.authUser?.birthDate]
      });

      this.updateEmailFormGroup = this.formBuilder.group({
        email: new FormControl(this.authUser?.email ?? '', [Validators.required, Validators.email, Validators.maxLength(64)]),
        password: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(32)])
      });

      this.updatePasswordFormGroup = this.formBuilder.group({
        password: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(32)]),
        passwordRepeat: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(32)]),
        oldPassword: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(32)])
      }, {validators: this.matchPasswords});
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  handleUpdateInfo(): void {
    this.submittingForm = true;
    const updateUserInfo = new UpdateUserInfo();
    updateUserInfo.firstName = this.updateInfoFirstName?.value;
    updateUserInfo.lastName = this.updateInfoLastName?.value;
    updateUserInfo.intro = this.updateInfoIntro?.value;
    updateUserInfo.gender = this.updateInfoGender?.value;
    updateUserInfo.hometown = this.updateInfoHometown?.value;
    updateUserInfo.currentCity = this.updateInfoCurrentCity?.value;
    updateUserInfo.eduInstitution = this.updateInfoEduInstitution?.value;
    updateUserInfo.workplace = this.updateInfoWorkplace?.value;
    updateUserInfo.countryName = this.updateInfoCountryName?.value;
    updateUserInfo.birthDate = moment(this.updateInfoBirthDate?.value).format('YYYY-MM-DD HH:mm:ss').toString();

    this.subscriptions.push(
      this.userService.updateUserInfo(updateUserInfo).subscribe({
        // use a loose incoming type and narrow at runtime
        next: (res: any) => {
          // if the backend returned an HttpErrorResponse-like object here, handle it as an error
          if (res instanceof HttpErrorResponse) {
            const validationErrors = res?.error?.validationErrors;
            if (validationErrors != null) {
              Object.keys(validationErrors).forEach(key => {
                const formControl = this.updateInfoFormGroup.get(key);
                if (formControl) {
                  formControl.setErrors({serverError: validationErrors[key]});
                }
              });
            } else {
              this.matSnackbar.openFromComponent(SnackbarComponent, {
                data: AppConstants.snackbarErrorContent,
                panelClass: ['bg-danger'],
                duration: 5000
              });
            }
            this.submittingForm = false;
            return;
          }

          // treat as successful User response
          const updatedUser = res as User;
          this.authService.storeAuthUserInCache(updatedUser);
          this.matSnackbar.openFromComponent(SnackbarComponent, {
            data: 'Your account has been updated successfully.',
            panelClass: ['bg-success'],
            duration: 5000
          });
          this.submittingForm = false;
          this.router.navigateByUrl('/user/edit-profile');
        },
        error: (errorResponse) => {
          const validationErrors = errorResponse?.error?.validationErrors;
          if (validationErrors != null) {
            Object.keys(validationErrors).forEach(key => {
              const formControl = this.updateInfoFormGroup.get(key);
              if (formControl) {
                formControl.setErrors({
                  serverError: validationErrors[key]
                });
              }
            });
          } else {
            this.matSnackbar.openFromComponent(SnackbarComponent, {
              data: AppConstants.snackbarErrorContent,
              panelClass: ['bg-danger'],
              duration: 5000
            });
          }
          this.submittingForm = false;
        }
      })
    );
  }

  handleUpdateEmail(): void {
    this.submittingForm = true;
    const updateUserEmail = new UpdateUserEmail();
    updateUserEmail.email = this.updateEmailFormGroup.get('email')?.value;
    updateUserEmail.password = this.updateEmailFormGroup.get('password')?.value;

    this.subscriptions.push(
      this.userService.updateUserEmail(updateUserEmail).subscribe({
        next: (result: any) => {
          localStorage.setItem(AppConstants.messageTypeLabel, AppConstants.successLabel);
          localStorage.setItem(AppConstants.messageHeaderLabel, AppConstants.emailChangeSuccessHeader);
          localStorage.setItem(AppConstants.messageDetailLabel, AppConstants.emailChangeSuccessDetail);
          localStorage.setItem(AppConstants.toLoginLabel, AppConstants.trueLabel);
          this.authService.logout();
          this.submittingForm = false;
          this.router.navigateByUrl('/user/message');
        },
        error: (errorResponse: HttpErrorResponse) => {
          const validationErrors = errorResponse.error.validationErrors;
          if (validationErrors != null) {
            Object.keys(validationErrors).forEach(key => {
              const formControl = this.updateInfoFormGroup.get(key);
              if (formControl) {
                formControl.setErrors({
                  serverError: validationErrors[key]
                });
              }
            });
          } else {
            this.matSnackbar.openFromComponent(SnackbarComponent, {
              data: AppConstants.snackbarErrorContent,
              panelClass: ['bg-danger'],
              duration: 5000
            });
          }
          this.submittingForm = false;
        }
      })
    );
  }

  handleUpdatePassword(): void {
    this.submittingForm = true;
    const updateUserPassword = new UpdateUserPassword();
    updateUserPassword.password = this.updatePasswordFormGroup.get('password')?.value;
    updateUserPassword.passwordRepeat = this.updatePasswordFormGroup.get('passwordRepeat')?.value;
    updateUserPassword.oldPassword = this.updatePasswordFormGroup.get('oldPassword')?.value;

    this.subscriptions.push(
      this.userService.updateUserPassword(updateUserPassword).subscribe({
        next: (result: any) => {
          localStorage.setItem(AppConstants.messageTypeLabel, AppConstants.successLabel);
          localStorage.setItem(AppConstants.messageHeaderLabel, AppConstants.passwordChangeSuccessHeader);
          localStorage.setItem(AppConstants.messageDetailLabel, AppConstants.passwordChangeSuccessDetail);
          localStorage.setItem(AppConstants.toLoginLabel, AppConstants.trueLabel);
          this.authService.logout();
          this.submittingForm = false;
          this.router.navigateByUrl('/user/message');
        },
        error: (errorResponse: HttpErrorResponse) => {
          const validationErrors = errorResponse.error.validationErrors;
          if (validationErrors != null) {
            Object.keys(validationErrors).forEach(key => {
              const formControl = this.updateInfoFormGroup.get(key);
              if (formControl) {
                formControl.setErrors({
                  serverError: validationErrors[key]
                });
              }
            });
          } else {
            this.matSnackbar.openFromComponent(SnackbarComponent, {
              data: AppConstants.snackbarErrorContent,
              panelClass: ['bg-danger'],
              duration: 5000
            });
          }
          this.submittingForm = false;
        }
      })
    );
  }
}
