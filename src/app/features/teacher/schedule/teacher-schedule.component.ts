import {
  Component,
  computed,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  type FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  LayoutComponent,
  type MenuItem,
} from '../../../shared/components/layout/layout.component';
import { AuthService } from '../../../core/services/auth.service';
import { TeacherService } from '../../../core/services/teacher.service';
import { AttendanceService } from '../../../core/services/attendance.service';
import type { Schedule } from '../../../core/models/user.model';
import { ScheduleChangeRequestDialogComponent } from './schedule-change-request-dialog.component';

@Component({
  selector: 'app-teacher-schedule',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSnackBarModule,
    LayoutComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './teacher-schedule.component.html',
  styles: [
    `
      .schedule-container {
        max-width: 1200px;
        margin: 0 auto;
      }

      .weekly-view-card {
        margin-bottom: 24px;
      }

      .weekly-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 16px;
        margin-bottom: 20px;
      }

      .day-column {
        min-height: 200px;
      }

      .day-header {
        text-align: center;
        margin: 0 0 12px 0;
        padding: 8px;
        background-color: #f5f5f5;
        border-radius: 4px;
        font-size: 14px;
        font-weight: 500;
        color: #333;
      }

      .day-schedules {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .schedule-block {
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 12px;
        transition: all 0.2s ease;
      }

      .schedule-block:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transform: translateY(-1px);
      }

      .schedule-block.today {
        border-color: #2196f3;
        background-color: #f3f8ff;
      }

      .schedule-content h4 {
        margin: 0 0 8px 0;
        font-size: 14px;
        color: #333;
      }

      .schedule-content p {
        margin: 4px 0;
        font-size: 12px;
        color: #666;
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .schedule-content p mat-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
      }

      .schedule-actions {
        display: flex;
        justify-content: space-between;
        margin-top: 8px;
      }

      .schedule-actions button {
        width: 32px;
        height: 32px;
        line-height: 32px;
      }

      .schedule-actions mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }

      .no-classes {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 20px;
        color: #999;
        font-size: 12px;
      }

      .no-classes mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
        margin-bottom: 4px;
      }

      .table-container {
        overflow-x: auto;
      }

      .schedules-table {
        width: 100%;
      }

      .schedules-table th,
      .schedules-table td {
        padding: 12px 8px;
      }

      .time-display,
      .classroom-display {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .time-display mat-icon,
      .classroom-display mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
        color: #666;
      }

      .attendance-stats {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .attendance-stats .stat {
        font-size: 12px;
        color: #666;
      }

      .action-buttons {
        display: flex;
        gap: 4px;
      }

      .no-data {
        text-align: center;
        padding: 40px 20px;
        color: #666;
      }

      .no-data mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: 16px;
      }

      @media (max-width: 768px) {
        .weekly-grid {
          grid-template-columns: 1fr;
        }

        .day-column {
          min-height: auto;
        }
      }

      .attendance-status {
        margin-top: 8px;
      }

      .attendance-status mat-chip {
        font-size: 12px;
      }

      .attendance-status mat-chip mat-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
      }

      .not-today {
        color: #999;
        font-size: 12px;
      }

      .schedule-block .attendance-status {
        margin-top: 8px;
      }

      .schedule-block .attendance-status mat-chip {
        font-size: 11px;
        height: 24px;
      }
    `,
  ],
})
export class TeacherScheduleComponent {
  private authService: AuthService = inject(AuthService);
  private teacherService: TeacherService = inject(TeacherService);
  private attendanceService: AttendanceService = inject(AttendanceService);
  private dialog: MatDialog = inject(MatDialog);
  private snackBar: MatSnackBar = inject(MatSnackBar);

  menuItems: MenuItem[] = [
    { label: 'Dashboard', route: '/teacher/dashboard', icon: 'dashboard' },
    { label: 'Asistencias', route: '/teacher/attendance', icon: 'assignment' },
    {
        label: 'Justificaciones',
        route: '/teacher/justifications',
        icon: 'description',
    },
    { label: 'Horarios', route: '/teacher/schedule', icon: 'schedule' },
  ];

  displayedColumns: string[] = [
    'day',
    'subject',
    'time',
    'classroom',
    'attendance',
    'register',
    'actions',
  ];

  weekDays = [
    { name: 'Lunes', value: 1 },
    { name: 'Martes', value: 2 },
    { name: 'Miércoles', value: 3 },
    { name: 'Jueves', value: 4 },
    { name: 'Viernes', value: 5 },
    { name: 'Sábado', value: 6 },
    { name: 'Domingo', value: 0 },
  ];

  currentTeacher = computed(() => {
    const user = this.authService.currentUser();
    if (user && user.role === 'teacher') {
      return this.teacherService.getTeacherById(user.id);
    }
    return null;
  });

  teacherSchedules = computed(() => {
    const teacher = this.currentTeacher();
    if (!teacher) return [];
    return teacher.schedules.sort((a, b) => {
      if (a.dayOfWeek !== b.dayOfWeek) {
        return a.dayOfWeek - b.dayOfWeek;
      }
      return a.startTime.localeCompare(b.startTime);
    });
  });

  getSchedulesForDay(dayOfWeek: number): Schedule[] {
    const teacher = this.currentTeacher();
    if (!teacher) return [];
    return teacher.schedules
      .filter((s) => s.dayOfWeek === dayOfWeek)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  isToday(dayOfWeek: number): boolean {
    return new Date().getDay() === dayOfWeek;
  }

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

  getAttendanceCount(scheduleId: string): number {
    const teacher = this.currentTeacher();
    if (!teacher) return 0;
    return this.attendanceService
      .getAttendancesByTeacher(teacher.id)
      .filter((a) => a.scheduleId === scheduleId).length;
  }

  hasAttendanceToday(schedule: Schedule): boolean {
    const teacher = this.currentTeacher();
    if (!teacher) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.attendanceService
      .attendances()
      .some(
        (a) =>
          a.teacherId === teacher.id &&
          a.scheduleId === schedule.id &&
          a.date.getTime() === today.getTime() &&
          a.checkIn
      );
  }

  requestScheduleChange(schedule: Schedule): void {
    const teacher = this.currentTeacher();
    if (!teacher) return;

    const dialogRef = this.dialog.open(ScheduleChangeRequestDialogComponent, {
      width: '500px',
    });

    dialogRef.componentInstance.schedule = schedule;
    dialogRef.componentInstance.teacherId = teacher.id;
  }

  checkAttendanceForSchedule(schedule: Schedule): void {
    // Navegar a la vista de asistencias con filtro por horario
    this.snackBar.open(
      `Mostrando asistencias para ${schedule.subject}`,
      'Cerrar',
      {
        duration: 2000,
      }
    );
    // Aquí podrías implementar navegación con parámetros
  }

  viewScheduleDetails(schedule: Schedule): void {
    const teacher = this.currentTeacher();
    if (!teacher) return;

    const attendanceCount = this.getAttendanceCount(schedule.id);
    const hasToday = this.hasAttendanceToday(schedule);

    this.snackBar.open(
      `${schedule.subject} - ${attendanceCount} asistencias registradas${
        hasToday ? ' (Presente hoy)' : ''
      }`,
      'Cerrar',
      {
        duration: 4000,
      }
    );
  }

  registerAttendance(schedule: Schedule): void {
    const teacher = this.currentTeacher();
    if (teacher) {
      try {
        this.attendanceService.checkIn(teacher.id, schedule.id);
        this.snackBar.open(
          `Asistencia registrada para ${schedule.subject}`,
          'Cerrar',
          {
            duration: 3000,
            panelClass: ['success-snackbar'],
          }
        );
      } catch (error) {
        this.snackBar.open('Error al registrar la asistencia', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });
      }
    }
  }

  canRegisterAttendance(schedule: Schedule): boolean {
    const teacher = this.currentTeacher();
    if (!teacher) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Solo permitir registro si es el día correcto
    if (today.getDay() !== schedule.dayOfWeek) return false;

    // Verificar si ya se registró asistencia hoy
    const hasAttendance = this.attendanceService
      .attendances()
      .some(
        (a) =>
          a.teacherId === teacher.id &&
          a.scheduleId === schedule.id &&
          a.date.getTime() === today.getTime() &&
          a.checkIn
      );

    return !hasAttendance;
  }

  getAttendanceStatusForSchedule(
    schedule: Schedule
  ): { text: string; color: string; icon: string } | null {
    const teacher = this.currentTeacher();
    if (!teacher) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = this.attendanceService
      .attendances()
      .find(
        (a) =>
          a.teacherId === teacher.id &&
          a.scheduleId === schedule.id &&
          a.date.getTime() === today.getTime()
      );

    if (!attendance) return null;

    if (attendance.checkOut) {
      return {
        text: 'Completado',
        color: 'primary',
        icon: 'check_circle',
      };
    }

    if (attendance.checkIn) {
      return {
        text: 'Presente',
        color: 'accent',
        icon: 'schedule',
      };
    }

    return null;
  }
}
