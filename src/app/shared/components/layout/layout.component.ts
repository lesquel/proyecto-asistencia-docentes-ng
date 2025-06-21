import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

export interface MenuItem {
  label: string;
  route: string;
  icon: string;
}
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    RouterModule,
  ],
  templateUrl: './layout.component.html',
  styles: [
    `
      .animation-delay-2000 {
        animation-delay: 2s;
      }

      .animation-delay-4000 {
        animation-delay: 4s;
      }

      /* Smooth scrollbar */
      ::-webkit-scrollbar {
        width: 6px;
      }

      ::-webkit-scrollbar-track {
        background: transparent;
      }

      ::-webkit-scrollbar-thumb {
        background: linear-gradient(45deg, #6366f1, #8b5cf6);
        border-radius: 3px;
      }

      ::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(45deg, #4f46e5, #7c3aed);
      }
    `,
  ],
})
export class LayoutComponent {
  title = input('Sistema de Asistencia');
  menuItems = input<MenuItem[]>([]);
  public authService: AuthService = inject(AuthService);

  drawerOpen = false;

  toggleDrawer(): void {
    this.drawerOpen = !this.drawerOpen;
  }

  logout(): void {
    this.authService.logout();
  }
}
