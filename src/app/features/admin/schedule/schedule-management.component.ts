import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import {
  LayoutComponent,
  type MenuItem,
} from '../../../shared/components/layout/layout.component';
import { TeacherService } from '../../../core/services/teacher.service';
import type { Schedule } from '../../../core/models/user.model';
import { ScheduleFormDialogComponent } from './schedule-form-dialog.component';

@Component({
  selector: 'app-schedule-management',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    LayoutComponent,
  ],
  templateUrl: './schedule-management.component.html',
})
export class ScheduleManagementComponent {
  menuItems: MenuItem[] = [
    { label: 'Dashboard', route: '/admin/dashboard', icon: 'dashboard' },
    { label: 'Docentes', route: '/admin/teachers', icon: 'people' },
    { label: 'Horarios', route: '/admin/schedules', icon: 'schedule' },
    { label: 'Asistencias', route: '/admin/attendance', icon: 'assignment' },
  ];

  displayedColumns: string[] = [
    'teacher',
    'day',
    'time',
    'subject',
    'classroom',
    'actions',
  ];

  allSchedules = computed(() => {
    const teachers = this.teacherService.teachers();
    const schedules: (Schedule & {
      teacherName: string;
      teacherEmployeeId: string;
    })[] = [];

    teachers.forEach((teacher) => {
      teacher.schedules.forEach((schedule) => {
        schedules.push({
          ...schedule,
          teacherName: teacher.name,
          teacherEmployeeId: teacher.employeeId,
        });
      });
    });

    return schedules.sort((a, b) => {
      if (a.dayOfWeek !== b.dayOfWeek) {
        return a.dayOfWeek - b.dayOfWeek;
      }
      return a.startTime.localeCompare(b.startTime);
    });
  });
  private teacherService: TeacherService = inject(TeacherService);
  private dialog: MatDialog = inject(MatDialog);

  openScheduleDialog(schedule?: Schedule & { teacherName?: string }): void {
    const dialogRef = this.dialog.open(ScheduleFormDialogComponent, {
      width: '500px',
    });

    dialogRef.componentInstance.schedule = schedule;
  }

  deleteSchedule(schedule: Schedule): void {
    if (
      confirm(`¿Está seguro de eliminar el horario de ${schedule.subject}?`)
    ) {
      this.teacherService.removeScheduleFromTeacher(
        schedule.teacherId,
        schedule.id
      );
    }
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
}
