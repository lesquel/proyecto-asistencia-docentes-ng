import { Component, computed, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTab, MatTabsModule } from '@angular/material/tabs';
import { MatCard, MatCardModule } from '@angular/material/card';
import {
  MatFormFieldModule,
} from '@angular/material/form-field';
import {
  MatDatepickerModule,
} from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatChip } from '@angular/material/chips';
import { TeacherService } from '../../../core/services/teacher.service';
import { MenuItem } from '../../../shared/components/layout/layout.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AttendanceService } from '../../../core/services/attendance.service';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-attendance-record-tab',
  standalone: true,
  imports: [
    MatCardModule,
    MatTabsModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatDatepickerModule,
    CommonModule,
    MatSelectModule,
    MatChip,
    MatTableModule,
  ],
  template: `
    <mat-card class="mt-4">
      <mat-card-header>
        <mat-card-title>Asistencias Registradas</mat-card-title>
        <mat-card-subtitle
          >Monitoreo de asistencias de todos los docentes</mat-card-subtitle
        >
      </mat-card-header>

      <mat-card-content>
        <div class="flex items-center gap-4 mb-5 flex-wrap md:flex-nowrap">
          <mat-form-field appearance="outline">
            <mat-label>Filtrar por fecha</mat-label>
            <input
              matInput
              [matDatepicker]="picker1"
              (dateChange)="onAttendanceDateChange($event)"
              placeholder="Seleccionar fecha"
            />
            <mat-datepicker-toggle
              matSuffix
              [for]="picker1"
            ></mat-datepicker-toggle>
            <mat-datepicker #picker1></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Filtrar por docente</mat-label>
            <mat-select (selectionChange)="onTeacherFilterChange($event.value)">
              <mat-option value="">Todos los docentes</mat-option>
              <mat-option
                *ngFor="let teacher of teacherService.teachers()"
                [value]="teacher.id"
              >
                {{ teacher.name }} - {{ teacher.employeeId }}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <button
            mat-button
            (click)="clearAttendanceFilters()"
            class="flex items-center gap-2"
          >
            <mat-icon>clear</mat-icon>
            Limpiar Filtros
          </button>
        </div>

        <div class="overflow-x-auto">
          <table mat-table [dataSource]="filteredAttendances()" class="w-full">
            <ng-container matColumnDef="teacher">
              <th mat-header-cell *matHeaderCellDef class="py-3 px-2">
                Docente
              </th>
              <td mat-cell *matCellDef="let attendance" class="py-3 px-2">
                <div>
                  <div class="font-semibold">
                    {{ getTeacherName(attendance.teacherId) }}
                  </div>
                  <div class="text-sm text-gray-600">
                    {{ getTeacherEmployeeId(attendance.teacherId) }}
                  </div>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef class="py-3 px-2">Fecha</th>
              <td mat-cell *matCellDef="let attendance" class="py-3 px-2">
                {{ attendance.date | date : 'dd/MM/yyyy' }}
              </td>
            </ng-container>

            <ng-container matColumnDef="subject">
              <th mat-header-cell *matHeaderCellDef class="py-3 px-2">
                Materia
              </th>
              <td mat-cell *matCellDef="let attendance" class="py-3 px-2">
                {{ getScheduleInfo(attendance.scheduleId)?.subject || 'N/A' }}
              </td>
            </ng-container>

            <ng-container matColumnDef="time">
              <th mat-header-cell *matHeaderCellDef class="py-3 px-2">
                Horario
              </th>
              <td mat-cell *matCellDef="let attendance" class="py-3 px-2">
                {{ getScheduleInfo(attendance.scheduleId)?.startTime }}
                -
                {{ getScheduleInfo(attendance.scheduleId)?.endTime }}
              </td>
            </ng-container>

            <ng-container matColumnDef="checkIn">
              <th mat-header-cell *matHeaderCellDef class="py-3 px-2">
                Entrada
              </th>
              <td mat-cell *matCellDef="let attendance" class="py-3 px-2">
                {{
                  attendance.checkIn
                    ? (attendance.checkIn | date : 'HH:mm')
                    : '-'
                }}
              </td>
            </ng-container>

            <ng-container matColumnDef="checkOut">
              <th mat-header-cell *matHeaderCellDef class="py-3 px-2">
                Salida
              </th>
              <td mat-cell *matCellDef="let attendance" class="py-3 px-2">
                {{
                  attendance.checkOut
                    ? (attendance.checkOut | date : 'HH:mm')
                    : '-'
                }}
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef class="py-3 px-2">
                Estado
              </th>
              <td mat-cell *matCellDef="let attendance" class="py-3 px-2">
                <mat-chip [color]="getStatusColor(attendance.status)" selected>
                  {{ getStatusText(attendance.status) }}
                </mat-chip>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="attendanceColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: attendanceColumns"></tr>
          </table>

          <div
            *ngIf="filteredAttendances().length === 0"
            class="text-center py-10 px-5 text-gray-600"
          >
            <mat-icon class="text-5xl w-12 h-12 mb-4 mx-auto"
              >event_busy</mat-icon
            >
            <p>No se encontraron registros de asistencia</p>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
})
export class AttendanceRecordTabComponent {
  public teacherService: TeacherService = inject(TeacherService);
  private attendanceService: AttendanceService = inject(AttendanceService);
  selectedAttendanceDate = signal<Date | null>(null);
  selectedTeacherId = signal<string>('');

  attendanceColumns: string[] = [
    'teacher',
    'date',
    'subject',
    'time',
    'checkIn',
    'checkOut',
    'status',
  ];

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
}
