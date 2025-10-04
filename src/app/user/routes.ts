import {Routes} from '@angular/router';
import {RoleGuard} from '../shared/guard/role-guard.guard';
import {ProfileComponent} from '../component/profile/profile.component';
import {PostDetailComponent} from '../component/post-detail/post-detail.component';

export const routes: Routes = [
  {
    path: 'add-user', // ✅ use lowercase + no spaces
    loadComponent: () =>
      import('./add-user/add-user.component').then((m) => m.AddUserComponent),
    canActivate: [RoleGuard],
    data: {allowedRoles: ['admin'], title: 'Create User'},
  },
  {
    path: 'user-list',
    loadComponent: () =>
      import('./user-list/user-list.component').then(
        (m) => m.UserListComponent
      ),
    data: {allowedRoles: ['admin'], title: 'List User'},
  },

  {
    path: 'add-post', // ✅ use lowercase + no spaces
    loadComponent: () =>
      import('../component/create-post/create-post.component').then(
        (m) => m.CreatePostComponent
      ),
    data: {allowedRoles: ['ROLE_USER', 'admin'], title: 'Create post'},
  },

  {
    path: 'list-post', // ✅ use lowercase + no spaces
    loadComponent: () =>
      import('../component/all-posts/all-posts.component').then(
        (m) => m.AllPostsComponent
      ),
    data: {allowedRoles: ['ROLE_USER', 'admin'], title: 'List post'},
  },


  {
    path: 'edit-profile',
    loadComponent: () =>
      import('../component/profile/profile.component').then(
        (m) => m.ProfileComponent
      ),
    data: {allowedRoles: ['ROLE_USER', 'admin'], title: 'Edit Profile'},
  },

  {
    path: 'timeline',
    loadComponent: () =>
      import('../component/timeline/timeline.component').then(
        (m) => m.TimelineComponent
      ),
    data: {allowedRoles: ['ROLE_USER', 'admin'], title: 'Timeline'},
  },
  {
    path: 'timeline/tags/:tagName',
    loadComponent: () =>
      import('../component/timeline/timeline.component').then(
        (m) => m.TimelineComponent
      ),
    data: {allowedRoles: ['ROLE_USER', 'admin'], title: 'Timeline'},
  },

  {
    path: 'settings',
    loadComponent: () =>
      import('../component/settings/settings.component').then(
        (m) => m.SettingsComponent
      ),
    data: {allowedRoles: ['ROLE_USER', 'admin'], title: 'Settings'},
  },
  {
    path: 'posts/tags/:tagName',
    loadComponent: () =>
      import('../component/timeline/timeline.component').then(
        (m) => m.TimelineComponent
      ),
    data: {allowedRoles: ['ROLE_USER', 'admin'], title: 'Settings'},
  },

  {
    path: 'conges',
    loadComponent: () =>
      import('../component/conge-requests/conge-requests.component').then(
        (m) => m.CongeRequestsComponent
      ),
    data: {allowedRoles: ['ROLE_USER', 'admin'], title: 'Settings'},
  },
  {
    path: 'chat',
    loadComponent: () =>
      import('../component/chat/chat.component').then(
        (m) => m.ChatComponent
      ),
    data: {title: 'Login Page', data: {allowedRoles: ['ROLE_USER', 'admin']}},
  },
      {
  path: 'absences',
    loadComponent: () => import('./../absence-list-component/absence-list-component.component').then(
      (m) => m.AbsenceListComponent
    ),
    data: {allowedRoles: ['admin'], title: 'Absences List'},
  },
  {
    path: 'absences-notifications',
    loadComponent: () => import('./../absence-list-component/absence-notification/absence-notification.component').then(
      (m) => m.AbsenceNotificationComponent
    ),
    data: {allowedRoles: ['ROLE_USER'], title: 'Absences Notifications'},
  },


  {path: 'profile', component: ProfileComponent},
  {path: 'users/:userId', component: ProfileComponent},
  {path: 'posts/:postId', component: PostDetailComponent},
];
