import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import {
  LayoutComponent,
  MenuItem,
} from '../../../shared/components/layout/layout.component';
import { TeacherService } from '../../../core/services/teacher.service';
import type { Teacher } from '../../../core/models/user.model';
import { TeacherFormDialogComponent } from './teacher-form-dialog.component';

@Component({
  selector: 'app-teacher-management',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    LayoutComponent,
  ],
  templateUrl: './teacher-management.component.html',
})
export class TeacherManagementComponent {
  menuItems: MenuItem[] = [
    { label: 'Dashboard', route: '/admin/dashboard', icon: 'dashboard' },
    { label: 'Docentes', route: '/admin/teachers', icon: 'people' },
    { label: 'Horarios', route: '/admin/schedules', icon: 'schedule' },
    { label: 'Asistencias', route: '/admin/attendance', icon: 'assignment' },
  ];

  displayedColumns: string[] = [
    'employeeId',
    'name',
    'email',
    'department',
    'schedules',
    'actions',
  ];

  constructor(
    public teacherService: TeacherService,
    private dialog: MatDialog
  ) {}

  openTeacherDialog(teacher?: Teacher): void {
    const dialogRef = this.dialog.open(TeacherFormDialogComponent, {
      width: '500px',
      data: teacher,
    });

    dialogRef.componentInstance.teacher = teacher;
  }

  deleteTeacher(teacher: Teacher): void {
    if (confirm(`¿Está seguro de eliminar al docente ${teacher.name}?`)) {
      this.teacherService.deleteTeacher(teacher.id);
    }
  }
}
