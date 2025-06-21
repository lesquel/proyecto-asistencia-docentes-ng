import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.component.html',
  styles: [
    `
      .animation-delay-2000 {
        animation-delay: 2s;
      }

      .animation-delay-4000 {
        animation-delay: 4s;
      }

      /* Custom input autofill styles */
      input:-webkit-autofill,
      input:-webkit-autofill:hover,
      input:-webkit-autofill:focus {
        -webkit-box-shadow: 0 0 0px 1000px rgba(255, 255, 255, 0.1) inset !important;
        -webkit-text-fill-color: white !important;
        border: 1px solid rgba(255, 255, 255, 0.2) !important;
      }

      /* Smooth transitions for all interactive elements */
      * {
        transition-property: all;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      }

      /* Enhanced focus styles */
      input:focus {
        transform: translateY(-1px);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      }

      /* Button ripple effect */
      button:active {
        transform: scale(0.98);
      }
    `,
  ],
})
export class LoginComponent {
  loading = signal(false);
  errorMessage = signal('');
  hidePassword = signal(true);
  private fb: FormBuilder = inject(FormBuilder);
  private authService: AuthService = inject(AuthService);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  togglePasswordVisibility(): void {
    this.hidePassword.set(!this.hidePassword());
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.valid) {
      this.loading.set(true);
      this.errorMessage.set('');

      const { email, password } = this.loginForm.value;

      try {
        const success = await this.authService.login(
          email as string,
          password as string
        );
        if (!success) {
          this.errorMessage.set(
            'Credenciales inválidas. Por favor, intente nuevamente.'
          );
        }
      } catch (error) {
        this.errorMessage.set(
          'Error al iniciar sesión. Por favor, intente nuevamente.'
        );
      } finally {
        this.loading.set(false);
      }
    }
  }
}
