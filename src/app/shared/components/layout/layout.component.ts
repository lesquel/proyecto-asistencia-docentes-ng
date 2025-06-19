import { Component, inject, Input } from "@angular/core"
import { CommonModule } from "@angular/common"
import { MatToolbarModule } from "@angular/material/toolbar"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { MatSidenavModule } from "@angular/material/sidenav"
import { MatListModule } from "@angular/material/list"
import { RouterModule } from "@angular/router"
import { AuthService } from "../../../core/services/auth.service"

export interface MenuItem {
  label: string
  route: string
  icon: string
}

@Component({
  selector: "app-layout",
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
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav #drawer class="sidenav" fixedInViewport mode="over">
        <mat-toolbar>Menú</mat-toolbar>
        <mat-nav-list>
          <a mat-list-item 
             *ngFor="let item of menuItems" 
             [routerLink]="item.route"
             (click)="drawer.close()">
            <mat-icon matListItemIcon>{{item.icon}}</mat-icon>
            <span matListItemTitle>{{item.label}}</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>
      
      <mat-sidenav-content>
        <mat-toolbar color="primary">
          <button
            type="button"
            aria-label="Toggle sidenav"
            mat-icon-button
            (click)="drawer.toggle()">
            <mat-icon aria-label="Side nav toggle icon">menu</mat-icon>
          </button>
          <span>{{title}}</span>
          <span class="spacer"></span>
          <span class="user-info">{{authService.currentUser()?.name}}</span>
          <button mat-icon-button (click)="logout()">
            <mat-icon>logout</mat-icon>
          </button>
        </mat-toolbar>
        
        <div class="content">
          <ng-content></ng-content>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [
    `
    .sidenav-container {
      height: 100vh;
    }

    .sidenav {
      width: 250px;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .user-info {
      margin-right: 16px;
      font-size: 14px;
    }

    .content {
      padding: 20px;
      min-height: calc(100vh - 64px);
    }

    @media (max-width: 768px) {
      .content {
        padding: 16px;
      }
      
      .user-info {
        display: none;
      }
    }
  `,
  ],
})
export class LayoutComponent {
  @Input() title = "Sistema de Asistencia"
  @Input() menuItems: MenuItem[] = []
  public authService: AuthService = inject(AuthService)

  logout(): void {
    this.authService.logout()
  }
}
