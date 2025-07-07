import {
  ChangeDetectionStrategy,
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
import { MatDialog } from '@angular/material/dialog';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './teacher-schedule.component.html',
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

  isAttendanceRegistered(schedule: Schedule): boolean {
    const teacher = this.currentTeacher();
    if (!teacher) return false;

    return this.attendanceService.hasAttendanceToday(teacher.id, schedule.id);
  }

  registerAttendance(schedule: Schedule): void {
    const teacher = this.currentTeacher();
    if (!teacher) {
      this.snackBar.open(
        '❌ Error: No se pudo identificar al profesor',
        'Cerrar',
        {
          duration: 3000,
          panelClass: ['error-snackbar'],
        }
      );
      return;
    }

    const success = this.attendanceService.markPresent(teacher.id, schedule.id);

    if (success) {
      this.snackBar.open(
        `✅ Asistencia registrada para ${schedule.subject}`,
        'Cerrar',
        {
          duration: 4000,
          panelClass: ['success-snackbar'],
        }
      );
    } else {
      this.snackBar.open(
        `ℹ️ Ya tienes registrada la asistencia para ${schedule.subject}`,
        'Cerrar',
        {
          duration: 3000,
        }
      );
    }
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

  viewScheduleDetails(schedule: Schedule): void {
    const teacher = this.currentTeacher();
    if (!teacher) return;

    const attendanceCount = this.getAttendanceCount(schedule.id);
    const hasToday = this.isAttendanceRegistered(schedule);

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

  getAttendanceStatusForSchedule(
    schedule: Schedule
  ): { text: string; color: string; icon: string } | null {
    const teacher = this.currentTeacher();
    if (!teacher) return null;

    const status = this.attendanceService.getTodayAttendanceStatus(
      teacher.id,
      schedule.id
    );

    if (!status.hasCheckIn) return null;

    if (status.hasCheckOut) {
      return {
        text: 'Completado',
        color: 'primary',
        icon: 'check_circle',
      };
    }

    return {
      text: 'Presente',
      color: 'accent',
      icon: 'schedule',
    };
  }
}
