import {HttpErrorResponse} from '@angular/common/http';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {MatBadgeModule} from '@angular/material/badge';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {Subscription} from 'rxjs';
import {AppConstants} from '../../common/app-constants';
import {Notification} from '../../shared/model/notification';
import {User} from '../../shared/model/user';
import {AuthService} from '../../shared/service/auth.service';
import {NotificationService} from '../../shared/service/notification.service';
import {environment} from '../../../environments/environment';
import {PostDialogComponent} from '../post-dialog/post-dialog.component';
import {SearchDialogComponent} from '../search-dialog/search-dialog.component';
import {SnackbarComponent} from '../snackbar/snackbar.component';

@Component({
	selector: 'app-header',
	templateUrl: './header.component.html',
	styleUrls: ['./header.component.css'],
	standalone: true,
	imports: [
		CommonModule,
		RouterModule,
		MatToolbarModule,
		MatButtonModule,
		MatIconModule,
		MatMenuModule,
		MatBadgeModule,
		MatProgressSpinnerModule
	]
})
export class HeaderComponent implements OnInit, OnDestroy {
	authUser: User | null = null;
	isUserLoggedIn: boolean = false;
	isProfilePage: boolean = false;
	notifications: Notification[] = [];
	hasUnseenNotification: boolean = false;
	resultPage: number = 1;
	resultSize: number = 5;
	hasMoreNotifications: boolean = false;
	fetchingResult: boolean = false;
	fetchingNotifications: boolean = false;
	defaultProfilePhotoUrl = environment.defaultProfilePhotoUrl;
  showFab: boolean = true;

	private subscriptions: Subscription[] = [];

	constructor(
		private authService: AuthService,
		private notificationService: NotificationService,
		private matDialog: MatDialog,
		private matSnackbar: MatSnackBar) { }

	ngOnInit(): void {
		if (this.authService.isUserLoggedIn()) {
			this.isUserLoggedIn = true;
      this.authUser = this.authService.getAuthUserFromToken();
		} else {
			this.isUserLoggedIn = false;
		}

		if (this.isUserLoggedIn) {
			this.loadNotifications(1);
		}

		this.authService.logoutSubject.subscribe(loggedOut => {
			if (loggedOut) {
				this.isUserLoggedIn = false;
				this.authUser = null;
			}
		});

		this.authService.loginSubject.subscribe(loggedInUser => {
			if (loggedInUser) {
				this.authUser = loggedInUser;
				this.isUserLoggedIn = true;
			}
		});
	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(sub => sub.unsubscribe());
	}

	openPostDialog(): void {
      this.showFab = false;
		this.matDialog.open(PostDialogComponent, {
			data: null,
			autoFocus: false,
			minWidth: '500px',
			maxWidth: '700px'
		});
	}

	openSearchDialog(): void {
		this.matDialog.open(SearchDialogComponent, {
			autoFocus: true,
			width: '500px'
		});
	}

	loadNotifications(page: number): void {
		this.fetchingResult = true;

		this.subscriptions.push(
			this.notificationService.getNotifications(page,  this.resultSize).subscribe({
				next: (res: HttpErrorResponse | Notification[]) => {
					this.fetchingResult = false;

					if (Array.isArray(res)) {
						res.forEach(n => {
							this.notifications.push(n);
							if (!n.isSeen) this.hasUnseenNotification = true;
						});

						if (res.length > 0) {
							this.hasMoreNotifications = true;
						} else {
							this.hasMoreNotifications = false;
						}

						this.resultPage++;
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
					this.fetchingResult = false;
				}
			})
		);
	}

	handleUnseenNotifications(): void {
		if (this.hasUnseenNotification) {
			this.subscriptions.push(
				this.notificationService.markAllSeen().subscribe({
					next: (response: any) => {
						this.hasUnseenNotification = false;
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
