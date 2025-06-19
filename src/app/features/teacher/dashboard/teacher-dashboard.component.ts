import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { RouterModule } from '@angular/router';
import {
  LayoutComponent,
  type MenuItem,
} from '../../../shared/components/layout/layout.component';
import { AuthService } from '../../../core/services/auth.service';
import { TeacherService } from '../../../core/services/teacher.service';
import { AttendanceService } from '../../../core/services/attendance.service';
import type { Schedule } from '../../../core/models/user.model';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    RouterModule,
    LayoutComponent,
  ],
  template: `
    <app-layout [title]="'Panel del Docente'" [menuItems]="menuItems">
      <div class="teacher-dashboard-container">
        <div class="welcome-section">
          <h1>Bienvenido, {{ currentTeacher()?.name }}</h1>
          <p>
            {{ currentTeacher()?.department }} -
            {{ currentTeacher()?.employeeId }}
          </p>
        </div>

        <div class="stats-grid">
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
                  <h2>{{ monthlyAttendances() }}</h2>
                  <p>Asistencias Este Mes</p>
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

        <div class="content-grid">
          <mat-card class="schedule-card">
            <mat-card-header>
              <mat-card-title>Horarios de Hoy</mat-card-title>
              <mat-card-subtitle
                >{{ getDayName(today.getDay()) }},
                {{ today.toLocaleDateString() }}</mat-card-subtitle
              >
            </mat-card-header>
            <mat-card-content>
              <div *ngIf="todaySchedules().length === 0" class="no-schedules">
                <mat-icon>event_available</mat-icon>
                <p>No tienes clases programadas para hoy</p>
              </div>
              <div
                *ngFor="let schedule of todaySchedules()"
                class="schedule-item"
              >
                <div class="schedule-info">
                  <h3>{{ schedule.subject }}</h3>
                  <p>{{ schedule.startTime }} - {{ schedule.endTime }}</p>
                  <p>Aula: {{ schedule.classroom }}</p>
                </div>
                <div class="schedule-actions">
                  <button
                    mat-raised-button
                    color="primary"
                    (click)="checkIn(schedule)"
                    [disabled]="hasCheckedIn(schedule)"
                  >
                    <mat-icon>login</mat-icon>
                    {{
                      hasCheckedIn(schedule)
                        ? 'Registrado'
                        : 'Registrar Entrada'
                    }}
                  </button>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="actions-card">
            <mat-card-header>
              <mat-card-title>Acciones Rápidas</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="action-buttons">
                <button
                  mat-raised-button
                  color="primary"
                  routerLink="/teacher/attendance"
                >
                  <mat-icon>assignment</mat-icon>
                  Ver Asistencias
                </button>
                <button
                  mat-raised-button
                  color="accent"
                  routerLink="/teacher/justifications"
                >
                  <mat-icon>description</mat-icon>
                  Justificaciones
                </button>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </app-layout>
  `,
  styles: [
    `
      .teacher-dashboard-container {
        max-width: 1200px;
        margin: 0 auto;
      }

      .welcome-section {
        text-align: center;
        margin-bottom: 32px;
      }

      .welcome-section h1 {
        margin: 0;
        color: #333;
      }

      .welcome-section p {
        margin: 8px 0 0 0;
        color: #666;
        font-size: 16px;
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

      .stat-icon.schedules {
        color: #2196f3;
      }
      .stat-icon.attendance {
        color: #4caf50;
      }
      .stat-icon.pending {
        color: #ff9800;
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

      .content-grid {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 20px;
      }

      .schedule-card,
      .actions-card {
        min-height: 300px;
      }

      .no-schedules {
        text-align: center;
        padding: 40px 20px;
        color: #666;
      }

      .no-schedules mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: 16px;
      }

      .schedule-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        margin-bottom: 12px;
      }

      .schedule-info h3 {
        margin: 0 0 4px 0;
        color: #333;
      }

      .schedule-info p {
        margin: 2px 0;
        color: #666;
        font-size: 14px;
      }

      .schedule-actions button {
        min-width: 160px;
      }

      .action-buttons {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .action-buttons button {
        width: 100%;
        height: 48px;
      }

      .action-buttons button mat-icon {
        margin-right: 8px;
      }

      @media (max-width: 768px) {
        .stats-grid {
          grid-template-columns: 1fr;
        }

        .content-grid {
          grid-template-columns: 1fr;
        }

        .schedule-item {
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
        }

        .schedule-actions {
          width: 100%;
        }

        .schedule-actions button {
          width: 100%;
        }
      }
    `,
  ],
})
export class TeacherDashboardComponent {
  menuItems: MenuItem[] = [
    { label: 'Dashboard', route: '/teacher/dashboard', icon: 'dashboard' },
    { label: 'Asistencias', route: '/teacher/attendance', icon: 'assignment' },
    {
      label: 'Justificaciones',
      route: '/teacher/justifications',
      icon: 'description',
    },
  ];

  today = new Date();

  currentTeacher = computed(() => {
    const user = this.authService.currentUser();
    if (user && user.role === 'teacher') {
      return this.teacherService.getTeacherById(user.id);
    }
    return null;
  });

  totalSchedules = computed(() => this.currentTeacher()?.schedules.length || 0);

  monthlyAttendances = computed(() => {
    const teacher = this.currentTeacher();
    if (!teacher) return 0;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return this.attendanceService
      .getAttendancesByTeacher(teacher.id)
      .filter((a) => a.date >= startOfMonth && a.status === 'present').length;
  });

  pendingJustifications = computed(() => {
    const teacher = this.currentTeacher();
    if (!teacher) return 0;

    return this.attendanceService
      .getJustificationsByTeacher(teacher.id)
      .filter((j) => j.status === 'pending').length;
  });

  todaySchedules = computed(() => {
    const teacher = this.currentTeacher();
    if (!teacher) return [];

    const todayDayOfWeek = this.today.getDay();
    return teacher.schedules.filter((s) => s.dayOfWeek === todayDayOfWeek);
  });

  constructor(
    private authService: AuthService,
    private teacherService: TeacherService,
    private attendanceService: AttendanceService
  ) {}

  getDayName(dayOfWeek: number): string {
    const days = [
      'Domingo',
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
    ];
    return days[dayOfWeek];
  }

  checkIn(schedule: Schedule): void {
    const teacher = this.currentTeacher();
    if (teacher) {
      this.attendanceService.checkIn(teacher.id, schedule.id);
    }
  }

  hasCheckedIn(schedule: Schedule): boolean {
    const teacher = this.currentTeacher();
    if (!teacher) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = this.attendanceService
      .attendances()
      .find(
        (a) =>
          a.teacherId === teacher.id &&
          a.scheduleId === schedule.id &&
          a.date.getTime() === today.getTime() &&
          a.checkIn
      );

    return !!attendance;
  }
}
