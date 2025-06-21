import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import {
  LayoutComponent,
  type MenuItem,
} from '../../../shared/components/layout/layout.component';
import { AuthService } from '../../../core/services/auth.service';
import { TeacherService } from '../../../core/services/teacher.service';
import { AttendanceService } from '../../../core/services/attendance.service';
import type { Attendance } from '../../../core/models/user.model';

@Component({
  selector: 'app-teacher-attendance',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    LayoutComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './teacher-attendance.component.html',
})
export class TeacherAttendanceComponent {
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
    'date',
    'subject',
    'time',
    'checkIn',
    'checkOut',
    'status',
    'actions',
  ];
  selectedDate = signal<Date | null>(null);

  currentTeacher = computed(() => {
    const user = this.authService.currentUser();
    if (user && user.role === 'teacher') {
      return this.teacherService.getTeacherById(user.id);
    }
    return null;
  });

  teacherAttendances = computed(() => {
    const teacher = this.currentTeacher();
    if (!teacher) return [];
    return this.attendanceService
      .getAttendancesByTeacher(teacher.id)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  });

  filteredAttendances = computed(() => {
    const attendances = this.teacherAttendances();
    const filterDate = this.selectedDate();

    if (!filterDate) return attendances;

    const targetDate = new Date(filterDate);
    targetDate.setHours(0, 0, 0, 0);

    return attendances.filter((a) => {
      const attendanceDate = new Date(a.date);
      attendanceDate.setHours(0, 0, 0, 0);
      return attendanceDate.getTime() === targetDate.getTime();
    });
  });

  private authService = inject(AuthService);
  private teacherService = inject(TeacherService);
  private attendanceService = inject(AttendanceService);

  onDateChange(event: any): void {
    this.selectedDate.set(event.value);
  }

  clearDateFilter(): void {
    this.selectedDate.set(null);
  }

  getScheduleInfo(scheduleId: string) {
    const teacher = this.currentTeacher();
    if (!teacher) return null;
    return teacher.schedules.find((s) => s.id === scheduleId);
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      present: 'Presente',
      absent: 'Ausente',
      late: 'Tardanza',
      justified: 'Justificado',
    };
    return statusMap[status] || status;
  }

  getStatusColor(status: string): 'primary' | 'accent' | 'warn' {
    switch (status) {
      case 'present':
        return 'primary';
      case 'justified':
        return 'accent';
      default:
        return 'warn';
    }
  }

  canCheckOut(attendance: Attendance): boolean {
    return !!attendance.checkIn && !attendance.checkOut;
  }

  checkOut(attendance: Attendance): void {
    const teacher = this.currentTeacher();
    if (teacher) {
      this.attendanceService.checkOut(teacher.id, attendance.scheduleId);
    }
  }
}
