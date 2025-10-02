import {HttpErrorResponse} from '@angular/common/http';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {JwtHelperService} from '@auth0/angular-jwt';
import {Subscription} from 'rxjs';
import {AppConstants} from '../../common/app-constants';
import {UserService} from '../../shared/service/user.service';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatProgressBarModule} from '@angular/material/progress-bar';

@Component({
    selector: 'app-verify-email',
    templateUrl: './verify-email.component.html',
    styleUrls: ['./verify-email.component.css'],
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatProgressSpinnerModule,
        MatProgressBarModule,
        MatSnackBarModule
    ]
})
export class VerifyEmailComponent implements OnInit, OnDestroy {
    // allow null until assigned
    token: string | null = null;
    private jwtService = new JwtHelperService();
    private subscriptions: Subscription[] = [];

    constructor(
        private userService: UserService,
        private router: Router,
        private route: ActivatedRoute) { }

    ngOnInit(): void {
        const tokenFromRoute = this.route.snapshot.paramMap.get('token');
        this.token = tokenFromRoute;

        if (tokenFromRoute) {
            // tokenFromRoute is a string here (not null)
            if (!this.jwtService.isTokenExpired(tokenFromRoute)) {
                this.subscriptions.push(
                    this.userService.verifyEmail(tokenFromRoute).subscribe(
                        (response) => {
                            localStorage.setItem(AppConstants.messageTypeLabel, AppConstants.successLabel);
                            localStorage.setItem(AppConstants.messageHeaderLabel, AppConstants.emailVerifySuccessHeader);
                            localStorage.setItem(AppConstants.messageDetailLabel, AppConstants.emailVerifySuccessDetail);
                            this.router.navigateByUrl('/message');
                        },
                        (errorResponse: HttpErrorResponse) => {
                            localStorage.setItem(AppConstants.messageTypeLabel, AppConstants.errorLabel);
                            localStorage.setItem(AppConstants.messageHeaderLabel, AppConstants.tokenErrorHeader);
                            localStorage.setItem(AppConstants.messageDetailLabel, AppConstants.tokenErrorDetail);
                            this.router.navigateByUrl('user/message');
                        }
                    )
                );
            } else {
                localStorage.setItem(AppConstants.messageTypeLabel, AppConstants.errorLabel);
                localStorage.setItem(AppConstants.messageHeaderLabel, AppConstants.tokenErrorHeader);
                localStorage.setItem(AppConstants.messageDetailLabel, AppConstants.tokenErrorDetail);
                this.router.navigateByUrl('/message');
            }
        } else {
            this.router.navigateByUrl('/');
        }
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }
}
