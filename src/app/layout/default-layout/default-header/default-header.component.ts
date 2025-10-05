import {HttpErrorResponse} from '@angular/common/http';
import {Component, computed, inject, input, OnDestroy, OnInit} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {AsyncPipe, DatePipe, NgForOf, NgIf, NgTemplateOutlet} from '@angular/common';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {Subscription} from 'rxjs';
import {AppConstants} from '../../../common/app-constants';
import {Notification} from '../../../shared/model/notification.model';
import {User} from '../../../shared/model/user';
import {AuthService} from '../../../shared/service/auth.service';
import {NotificationService} from '../../../shared/service/notification.service';
import {environment} from '../../../../environments/environment';
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
import {ChatNotificationRealtimeService} from '../../../shared/service/chat-notification-realtime.service';

@Component({
  selector: 'app-default-header',
  templateUrl: './default-header.component.html',
  imports: [ContainerComponent, HeaderTogglerDirective, SidebarToggleDirective, IconDirective, HeaderNavComponent, NavItemComponent, NavLinkDirective, RouterLink, RouterLinkActive, NgTemplateOutlet, DropdownComponent, DropdownToggleDirective, AvatarComponent, DropdownMenuDirective, DropdownHeaderDirective, DropdownItemDirective, BadgeComponent, DropdownDividerDirective, AsyncPipe, NgIf, DatePipe, NgForOf]
})
export class DefaultHeaderComponent extends HeaderComponent implements OnInit, OnDestroy {

  readonly #colorModeService = inject(ColorModeService);
  readonly colorMode = this.#colorModeService.colorMode;

  readonly colorModes = [
    {name: 'light', text: 'Light', icon: 'cilSun'},
    {name: 'dark', text: 'Dark', icon: 'cilMoon'},
    {name: 'auto', text: 'Auto', icon: 'cilContrast'}
  ];

  readonly icons = computed(() => {
    const currentMode = this.colorMode();
    return this.colorModes.find(mode => mode.name === currentMode)?.icon ?? 'cilSun';
  });

  sidebarId = input('sidebar1');

  authUser: User | null = null;
  notifications: Notification[] = [];
  hasUnseenNotification: boolean = false;
  resultPage: number = 1;
  resultSize: number = 5;
  hasMoreNotifications: boolean = false;
  fetchingResult: boolean = false;
  defaultProfilePhotoUrl = environment.defaultProfilePhotoUrl;
  messages$: any
  notifications$: any
  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private chatNotificationRealTimeService: ChatNotificationRealtimeService,
    private matSnackbar: MatSnackBar,
    private router: Router // Ajout de l'injection du Router
  ) {
    super();
    this.messages$ = this.chatNotificationRealTimeService.getCurrentMessageCount();
    this.notifications$ = this.chatNotificationRealTimeService.getCurrentNotificationCount();
  }

  ngOnInit(): void {
    this.authUser = this.authService.getUserFromLocalStorage();
    this.loadNotifications(1);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadNotifications(page: number): void {
    this.fetchingResult = true;
    this.subscriptions.push(
      this.getNotifications(page)
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

  onNotificationsClick(): void {
    this.chatNotificationRealTimeService.initCurrentNotificationCount();
    this.getNotifications(1);
    this.notificationService.markAllSeen().subscribe();
  }

  handleLogout() {
    this.authService.logout();
    window.location.reload();
  }

  onMessageClick(): void {
    this.chatNotificationRealTimeService.initCurrentMessageCount();
    this.router.navigateByUrl("/user/chat");
  }

  private getNotifications(page: number) {
    return this.notificationService.getNotifications(page, this.resultSize).subscribe({
      next: (res: HttpErrorResponse | Notification[]) => {
        this.fetchingResult = false;
        if (Array.isArray(res)) {
          this.notifications = [...res];
          this.chatNotificationRealTimeService.setCurrentNotificationCount(res.length)
          this.hasMoreNotifications = res.length > 0;
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
    });
  }
}
