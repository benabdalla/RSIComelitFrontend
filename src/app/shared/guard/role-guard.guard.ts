import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const token = localStorage.getItem('token');

    if (!token) {
      console.warn('❌ No token found, redirecting to login...');
      this.router.navigate(['/login']);
      return false;
    }

    try {
      const decoded: any = jwtDecode(token);
      console.log('✅ Decoded token:', decoded);

      // Check if the token expired
      const now = Math.floor(new Date().getTime() / 1000);
      if (decoded.exp && decoded.exp < now) {
        console.warn('❌ Token expired, redirecting to login...');
        this.router.navigate(['/login']);
        return false;
      }

      // Get role from token
      const role = decoded.role;
      const allowedRoles = route.data['allowedRoles'] as Array<string>;

      console.log('🔑 User role:', role);
      console.log('🎯 Allowed roles for this route:', allowedRoles);

      if (role && allowedRoles.includes(role)) {
        console.log('✅ Access granted');
        return true;
      } else {
        console.warn('❌ Access denied, redirecting to login...');
        this.router.navigate(['/login']);
        return false;
      }
    } catch (e) {
      console.error('❌ Invalid token, redirecting to login...', e);
      this.router.navigate(['/login']);
      return false;
    }
  }
}
