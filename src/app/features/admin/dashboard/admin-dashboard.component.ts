import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import {
  LayoutComponent,
  MenuItem,
} from '../../../shared/components/layout/layout.component';
import { TeacherService } from '../../../core/services/teacher.service';
import { AttendanceService } from '../../../core/services/attendance.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    RouterModule,
    LayoutComponent,
  ],
  template: `
    <app-layout [title]="'Panel de Administración'" [menuItems]="menuItems">
      <div class="dashboard-container">
        <h1>Bienvenido al Panel de Administración</h1>

        <div class="stats-grid">
          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-content">
                <mat-icon class="stat-icon teachers">people</mat-icon>
                <div class="stat-info">
                  <h2>{{ totalTeachers() }}</h2>
                  <p>Docentes Registrados</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-content">
                <mat-icon class="stat-icon schedules">schedule</mat-icon>
                <div class="stat-info">
                  <h2>{{ totalSchedules() }}</h2>
                  <p>Horarios Asignados</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-content">
                <mat-icon class="stat-icon attendance">check_circle</mat-icon>
                <div class="stat-info">
                  <h2>{{ todayAttendances() }}</h2>
                  <p>Asistencias Hoy</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-content">
                <mat-icon class="stat-icon pending">pending</mat-icon>
                <div class="stat-info">
                  <h2>{{ pendingJustifications() }}</h2>
                  <p>Justificaciones Pendientes</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="actions-grid">
          <mat-card class="action-card">
            <mat-card-header>
              <mat-card-title>Gestión de Docentes</mat-card-title>
              <mat-card-subtitle
                >Administrar información de docentes</mat-card-subtitle
              >
            </mat-card-header>
            <mat-card-actions>
              <button
                mat-raised-button
                color="primary"
                routerLink="/admin/teachers"
              >
                <mat-icon>people</mat-icon>
                Gestionar Docentes
              </button>
            </mat-card-actions>
          </mat-card>

          <mat-card class="action-card">
            <mat-card-header>
              <mat-card-title>Horarios</mat-card-title>
              <mat-card-subtitle>Crear y asignar horarios</mat-card-subtitle>
            </mat-card-header>
            <mat-card-actions>
              <button
                mat-raised-button
                color="primary"
                routerLink="/admin/schedules"
              >
                <mat-icon>schedule</mat-icon>
                Gestionar Horarios
              </button>
            </mat-card-actions>
          </mat-card>

          <mat-card class="action-card">
            <mat-card-header>
              <mat-card-title>Asistencias</mat-card-title>
              <mat-card-subtitle
                >Revisar registros de asistencia</mat-card-subtitle
              >
            </mat-card-header>
            <mat-card-actions>
              <button
                mat-raised-button
                color="primary"
                routerLink="/admin/attendance"
              >
                <mat-icon>assignment</mat-icon>
                Ver Asistencias
              </button>
            </mat-card-actions>
          </mat-card>
        </div>
      </div>
    </app-layout>
  `,
  styles: [
    `
      .dashboard-container {
        max-width: 1200px;
        margin: 0 auto;
      }

      h1 {
        text-align: center;
        margin-bottom: 32px;
        color: #333;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        margin-bottom: 32px;
      }

      .stat-card {
        height: 120px;
      }

      .stat-content {
        display: flex;
        align-items: center;
        height: 100%;
      }

      .stat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-right: 16px;
      }

      .stat-icon.teachers {
        color: #4caf50;
      }
      .stat-icon.schedules {
        color: #2196f3;
      }
      .stat-icon.attendance {
        color: #ff9800;
      }
      .stat-icon.pending {
        color: #f44336;
      }

      .stat-info h2 {
        margin: 0;
        font-size: 32px;
        font-weight: bold;
        color: #333;
      }

      .stat-info p {
        margin: 4px 0 0 0;
        color: #666;
        font-size: 14px;
      }

      .actions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
      }

      .action-card {
        min-height: 150px;
      }

      mat-card-actions {
        padding: 16px;
      }

      mat-card-actions button {
        width: 100%;
      }

      mat-card-actions button mat-icon {
        margin-right: 8px;
      }

      @media (max-width: 768px) {
        .stats-grid {
          grid-template-columns: 1fr;
        }

        .actions-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class AdminDashboardComponent {
  menuItems: MenuItem[] = [
    { label: 'Dashboard', route: '/admin/dashboard', icon: 'dashboard' },
    { label: 'Docentes', route: '/admin/teachers', icon: 'people' },
    { label: 'Horarios', route: '/admin/schedules', icon: 'schedule' },
    { label: 'Asistencias', route: '/admin/attendance', icon: 'assignment' },
  ];

  totalTeachers = computed(() => this.teacherService.teachers().length);
  totalSchedules = computed(() =>
    this.teacherService
      .teachers()
      .reduce((total, teacher) => total + teacher.schedules.length, 0)
  );
  todayAttendances = computed(() => {
    const today = new Date();
    return this.attendanceService.getAttendancesByDate(today).length;
  });
  pendingJustifications = computed(
    () => this.attendanceService.getPendingJustifications().length
  );

  constructor(
    private teacherService: TeacherService,
    private attendanceService: AttendanceService
  ) {}
}
