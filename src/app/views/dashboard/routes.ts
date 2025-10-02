import { Routes } from '@angular/router';
import '@angular/localize/init';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../../component/all-posts/all-posts.component').then(m => m.AllPostsComponent),
    data: {
      title: $localize`Dashboard`
    }
  }
];

