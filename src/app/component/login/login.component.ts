import {Component, inject, signal} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {ToastrService} from 'ngx-toastr';
import {Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {AuthService} from '../../shared/service/auth.service';
import {ForgotPasswordDialogComponent} from '../forgot-password-dialog/forgot-password-dialog.component';
import {AuthResponse} from '../../shared/model/AuthResponse';
import {ChatNotificationRealtimeService} from '../../shared/service/chat-notification-realtime.service';

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
})
export class LoginComponent {
  [x: string]: any;

  email = '';
  password = '';
  message: string | null = null;
  isSuccess: boolean = false;

  private router = inject(Router);

  constructor(
    private authService: AuthService,
    private toastr: ToastrService,
    private matDialog: MatDialog,
    private chatService: ChatNotificationRealtimeService
  ) {
  }

  isLogin = signal(true);

  loginData = {
    email: '',
    password: '',
  };

  passwordStrength = signal(0);
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  toggleMode() {
    this.isLogin.set(!this.isLogin());
    this.resetForms();
  }

  resetForms() {
    this.loginData = {email: '', password: ''};
    this.passwordStrength.set(0);
  }

  calculatePasswordStrength(password: string): number {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  }

  getPasswordStrengthColor(): string {
    const strength = this.passwordStrength();
    if (strength < 25) return '#ef4444';
    if (strength < 50) return '#f97316';
    if (strength < 75) return '#eab308';
    return '#22c55e';
  }

  getPasswordStrengthText(): string {
    const strength = this.passwordStrength();
    if (strength < 25) return 'Weak';
    if (strength < 50) return 'Fair';
    if (strength < 75) return 'Good';
    return 'Strong';
  }

  togglePasswordVisibility() {
    this.showPassword.set(!this.showPassword());
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }

  getPasswordInputType() {
    return this.showPassword() ? 'text' : 'password';
  }

  onLogin() {
    this.authService.login(this.loginData).subscribe({
      next: (response: AuthResponse) => {
        let msg = response.message;

        if (msg && msg.includes('introuvable')) msg = 'Email not found';
        if (msg && msg.includes('incorrect')) msg = 'Incorrect password';
        if (msg && msg.includes('réussie')) msg = 'Login successful';
        if (response.token) {
          localStorage.setItem('token', response.token);
          let authUserId = this.authService.getAuthUserId() ?? 0;
          this.chatService.connect(authUserId, response.token)
          this.router.navigate(['/dashboard']);
        } else {
          this.toastr.error(msg, 'Connection failure');
        }
      },
      error: () => {
        this.toastr.error('Connection failed', 'Error');
      },
    });
  }

  openForgotPasswordDialog(e: Event): void {
    e.preventDefault();
    this.matDialog.open(ForgotPasswordDialogComponent, {
      autoFocus: true,
      width: '500px',
    });
  }
}
