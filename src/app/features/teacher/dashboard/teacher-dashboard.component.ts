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
  templateUrl: './teacher-dashboard.component.html',
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
