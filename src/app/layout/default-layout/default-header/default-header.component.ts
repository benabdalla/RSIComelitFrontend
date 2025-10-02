import {HttpErrorResponse} from '@angular/common/http';
import {Component, computed, inject, input, OnDestroy, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {NgTemplateOutlet} from '@angular/common';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {Subscription} from 'rxjs';
import {AppConstants} from '../../../common/app-constants';
import {Notification} from '../../../shared/model/notification';
import {User} from '../../../shared/model/user';
import {AuthService} from '../../../shared/service/auth.service';
import {NotificationService} from '../../../shared/service/notification.service';
import {environment} from '../../../../environments/environment';
import {PostDialogComponent} from '../../../component/post-dialog/post-dialog.component';
import {SearchDialogComponent} from '../../../component/search-dialog/search-dialog.component';
import {SnackbarComponent} from '../../../component/snackbar/snackbar.component';

import {
  AvatarComponent,
  BadgeComponent,
  ColorModeService,
  ContainerComponent,
  DropdownComponent,
  DropdownDividerDirective,
  DropdownHeaderDirective,
  DropdownItemDirective,
  DropdownMenuDirective,
  DropdownToggleDirective,
  HeaderComponent,
  HeaderNavComponent,
  HeaderTogglerDirective,
  NavItemComponent,
  NavLinkDirective,
  SidebarToggleDirective
} from '@coreui/angular';

import {IconDirective} from '@coreui/icons-angular';

@Component({
  selector: 'app-default-header',
  templateUrl: './default-header.component.html',
  imports: [ContainerComponent, HeaderTogglerDirective, SidebarToggleDirective, IconDirective, HeaderNavComponent, NavItemComponent, NavLinkDirective, RouterLink, RouterLinkActive, NgTemplateOutlet, DropdownComponent, DropdownToggleDirective, AvatarComponent, DropdownMenuDirective, DropdownHeaderDirective, DropdownItemDirective, BadgeComponent, DropdownDividerDirective]
})
export class DefaultHeaderComponent extends HeaderComponent implements OnInit, OnDestroy {

  readonly #colorModeService = inject(ColorModeService);
  readonly colorMode = this.#colorModeService.colorMode;

  readonly colorModes = [
    { name: 'light', text: 'Light', icon: 'cilSun' },
    { name: 'dark', text: 'Dark', icon: 'cilMoon' },
    { name: 'auto', text: 'Auto', icon: 'cilContrast' }
  ];

  readonly icons = computed(() => {
    const currentMode = this.colorMode();
    return this.colorModes.find(mode => mode.name === currentMode)?.icon ?? 'cilSun';
  });

  sidebarId = input('sidebar1');

  // public newMessages = [
  //   {
  //     id: 0,
  //     from: 'Jessica Williams',
  //     avatar: '7.jpg',
  //     status: 'success',
  //     title: 'Urgent: System Maintenance Tonight',
  //     time: 'Just now',
  //     link: 'apps/email/inbox/message',
  //     message: 'Attention team, we\'ll be conducting critical system maintenance tonight from 10 PM to 2 AM. Plan accordingly...'
  //   },
  //   {
  //     id: 1,
  //     from: 'Richard Johnson',
  //     avatar: '6.jpg',
  //     status: 'warning',
  //     title: 'Project Update: Milestone Achieved',
  //     time: '5 minutes ago',
  //     link: 'apps/email/inbox/message',
  //     message: 'Kudos on hitting sales targets last quarter! Let\'s keep the momentum. New goals, new victories ahead...'
  //   },
  //   {
  //     id: 2,
  //     from: 'Angela Rodriguez',
  //     avatar: '5.jpg',
  //     status: 'danger',
  //     title: 'Social Media Campaign Launch',
  //     time: '1:52 PM',
  //     link: 'apps/email/inbox/message',
  //     message: 'Exciting news! Our new social media campaign goes live tomorrow. Brace yourselves for engagement...'
  //   },
  //   {
  //     id: 3,
  //     from: 'Jane Lewis',
  //     avatar: '4.jpg',
  //     status: 'info',
  //     title: 'Inventory Checkpoint',
  //     time: '4:03 AM',
  //     link: 'apps/email/inbox/message',
  //     message: 'Team, it\'s time for our monthly inventory check. Accurate counts ensure smooth operations. Let\'s nail it...'
  //   },
  //   {
  //     id: 4,
  //     from: 'Ryan Miller',
  //     avatar: '3.jpg',
  //     status: 'info',
  //     title: 'Customer Feedback Results',
  //     time: '3 days ago',
  //     link: 'apps/email/inbox/message',
  //     message: 'Our latest customer feedback is in. Let\'s analyze and discuss improvements for an even better service...'
  //   }
  // ];

  // public newNotifications = [
  //   { id: 0, title: 'New user registered', icon: 'cilUserFollow', color: 'success' },
  //   { id: 1, title: 'User deleted', icon: 'cilUserUnfollow', color: 'danger' },
  //   { id: 2, title: 'Sales report is ready', icon: 'cilChartPie', color: 'info' },
  //   { id: 3, title: 'New client', icon: 'cilBasket', color: 'primary' },
  //   { id: 4, title: 'Server overloaded', icon: 'cilSpeedometer', color: 'warning' }
  // ];

  // public newStatus = [
  //   { id: 0, title: 'CPU Usage', value: 25, color: 'info', details: '348 Processes. 1/4 Cores.' },
  //   { id: 1, title: 'Memory Usage', value: 70, color: 'warning', details: '11444GB/16384MB' },
  //   { id: 2, title: 'SSD 1 Usage', value: 90, color: 'danger', details: '243GB/256GB' }
  // ];

  // public newTasks = [
  //   { id: 0, title: 'Upgrade NPM', value: 0, color: 'info' },
  //   { id: 1, title: 'ReactJS Version', value: 25, color: 'danger' },
  //   { id: 2, title: 'VueJS Version', value: 50, color: 'warning' },
  //   { id: 3, title: 'Add new layouts', value: 75, color: 'info' },
  //   { id: 4, title: 'Angular Version', value: 100, color: 'success' }
  // ];
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
		private matSnackbar: MatSnackBar) {
    super();
  }

	ngOnInit(): void {
		if (this.authService.isUserLoggedIn()) {
			this.isUserLoggedIn = true;
      this.authUser = this.authService.getUserFromLocalStorage();
      console
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

  handleLogout() {
    this.authService.logout();
    window.location.reload();
  }
}
