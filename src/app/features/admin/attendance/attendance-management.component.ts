import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
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
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog } from '@angular/material/dialog';
import {
  LayoutComponent,
  type MenuItem,
} from '../../../shared/components/layout/layout.component';
import { TeacherService } from '../../../core/services/teacher.service';
import { AttendanceService } from '../../../core/services/attendance.service';
import type { AttendanceJustification } from '../../../core/models/user.model';
import { JustificationReviewDialogComponent } from './justification-review-dialog.component';
import { AttendanceRecordTabComponent } from './attendance-record-tab.component';

@Component({
  selector: 'app-attendance-management',
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
    MatSelectModule,
    MatTabsModule,
    LayoutComponent,
    AttendanceRecordTabComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './attendance-management.component.html',
})
export class AttendanceManagementComponent {
  public teacherService: TeacherService = inject(TeacherService);
  private attendanceService: AttendanceService = inject(AttendanceService);
  private dialog: MatDialog = inject(MatDialog);
  
  menuItems: MenuItem[] = [
    { label: 'Dashboard', route: '/admin/dashboard', icon: 'dashboard' },
    { label: 'Docentes', route: '/admin/teachers', icon: 'people' },
    { label: 'Horarios', route: '/admin/schedules', icon: 'schedule' },
    { label: 'Asistencias', route: '/admin/attendance', icon: 'assignment' },
  ];

  attendanceColumns: string[] = [
    'teacher',
    'date',
    'subject',
    'time',
    'checkIn',
    'checkOut',
    'status',
  ];
  
  justificationColumns: string[] = [
    'teacher',
    'date',
    'reason',
    'createdAt',
    'status',
    'actions',
  ];

  selectedAttendanceDate = signal<Date | null>(null);
  selectedTeacherId = signal<string>('');

  allAttendances = computed(() => {
    return this.attendanceService
      .attendances()
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  });

  filteredAttendances = computed(() => {
    let attendances = this.allAttendances();

    const filterDate = this.selectedAttendanceDate();
    if (filterDate) {
      const targetDate = new Date(filterDate);
      targetDate.setHours(0, 0, 0, 0);
      attendances = attendances.filter((a) => {
        const attendanceDate = new Date(a.date);
        attendanceDate.setHours(0, 0, 0, 0);
        return attendanceDate.getTime() === targetDate.getTime();
      });
    }

    const teacherId = this.selectedTeacherId();
    if (teacherId) {
      attendances = attendances.filter((a) => a.teacherId === teacherId);
    }

    return attendances;
  });

  pendingJustifications = computed(() => {
    return this.attendanceService
      .justifications()
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  });

  onAttendanceDateChange(event: any): void {
    this.selectedAttendanceDate.set(event.value);
  }

  onTeacherFilterChange(teacherId: string): void {
    this.selectedTeacherId.set(teacherId);
  }

  clearAttendanceFilters(): void {
    this.selectedAttendanceDate.set(null);
    this.selectedTeacherId.set('');
  }

  getTeacherName(teacherId: string): string {
    const teacher = this.teacherService.getTeacherById(teacherId);
    return teacher?.name || 'Docente no encontrado';
  }

  getTeacherEmployeeId(teacherId: string): string {
    const teacher = this.teacherService.getTeacherById(teacherId);
    return teacher?.employeeId || 'N/A';
  }

  getScheduleInfo(scheduleId: string) {
    const teachers = this.teacherService.teachers();
    for (const teacher of teachers) {
      const schedule = teacher.schedules.find((s) => s.id === scheduleId);
      if (schedule) return schedule;
    }
    return null;
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

  getJustificationStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      pending: 'Pendiente',
      approved: 'Aprobada',
      rejected: 'Rechazada',
    };
    return statusMap[status] || status;
  }

  getJustificationStatusColor(status: string): 'primary' | 'accent' | 'warn' {
    switch (status) {
      case 'approved':
        return 'primary';
      case 'pending':
        return 'accent';
      case 'rejected':
        return 'warn';
      default:
        return 'accent';
    }
  }

  reviewJustification(justification: AttendanceJustification): void {
    const teacher = this.teacherService.getTeacherById(justification.teacherId);

    const dialogRef = this.dialog.open(JustificationReviewDialogComponent, {
      width: '500px',
    });

    dialogRef.componentInstance.justification = justification;
    dialogRef.componentInstance.teacherName =
      teacher?.name || 'Docente no encontrado';
  }
}