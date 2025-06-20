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

@Component({
  selector: 'app-schedule-change-request-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>Solicitar Cambio de Horario</h2>
    <mat-dialog-content>
      <div class="current-schedule">
        <h4>Horario Actual:</h4>
        <p>
          <strong>{{ schedule?.subject }}</strong>
        </p>
        <p>
          {{ getDayName(schedule?.dayOfWeek || 0) }} -
          {{ schedule?.startTime }} a {{ schedule?.endTime }}
        </p>
        <p>Aula: {{ schedule?.classroom }}</p>
      </div>

      <form [formGroup]="requestForm" class="request-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Fecha del cambio</mat-label>
          <input
            matInput
            [matDatepicker]="picker"
            formControlName="date"
            placeholder="Seleccionar fecha"
          />
          <mat-datepicker-toggle
            matSuffix
            [for]="picker"
          ></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
          <mat-error *ngIf="requestForm.get('date')?.hasError('required')">
            La fecha es requerida
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Tipo de solicitud</mat-label>
          <mat-select formControlName="requestType">
            <mat-option value="cancel">Cancelar clase</mat-option>
            <mat-option value="reschedule">Reprogramar clase</mat-option>
            <mat-option value="substitute">Solicitar suplente</mat-option>
          </mat-select>
          <mat-error
            *ngIf="requestForm.get('requestType')?.hasError('required')"
          >
            El tipo de solicitud es requerido
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Motivo de la solicitud</mat-label>
          <textarea
            matInput
            formControlName="reason"
            placeholder="Describa el motivo del cambio"
            rows="4"
          ></textarea>
          <mat-error *ngIf="requestForm.get('reason')?.hasError('required')">
            El motivo es requerido
          </mat-error>
          <mat-error *ngIf="requestForm.get('reason')?.hasError('minlength')">
            El motivo debe tener al menos 10 caracteres
          </mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button
        mat-raised-button
        color="primary"
        (click)="onSubmit()"
        [disabled]="requestForm.invalid"
      >
        Enviar Solicitud
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .request-form {
        display: flex;
        flex-direction: column;
        min-width: 400px;
      }

      .full-width {
        width: 100%;
        margin-bottom: 16px;
      }

      .current-schedule {
        background-color: #f5f5f5;
        padding: 16px;
        border-radius: 8px;
        margin-bottom: 20px;
      }

      .current-schedule h4 {
        margin: 0 0 8px 0;
        color: #333;
      }

      .current-schedule p {
        margin: 4px 0;
        color: #666;
      }

      mat-dialog-content {
        padding: 20px;
      }
    `,
  ],
})
export class ScheduleChangeRequestDialogComponent {
  schedule?: Schedule;
  teacherId!: string;
  private fb: FormBuilder = inject(FormBuilder);
  private attendanceService: AttendanceService = inject(AttendanceService);
  private snackBar: MatSnackBar = inject(MatSnackBar);

  requestForm = this.fb.group({
    date: ['', Validators.required],
    requestType: ['', Validators.required],
    reason: ['', [Validators.required, Validators.minLength(10)]],
  });

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

  onSubmit(): void {
    if (this.requestForm.valid && this.schedule) {
      const formValue = this.requestForm.value;

      // Crear una justificación especial para cambios de horario
      const reason = `CAMBIO DE HORARIO - ${formValue?.requestType?.toUpperCase()}: ${
        formValue.reason
      }`;

      this.attendanceService.submitJustification({
        teacherId: this.teacherId,
        date: new Date(formValue.date as string),
        reason: reason,
      });

      this.snackBar.open(
        'Solicitud de cambio enviada correctamente',
        'Cerrar',
        {
          duration: 3000,
          panelClass: ['success-snackbar'],
        }
      );
    }
  }
}

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
  template: `
    <app-layout [title]="'Mis Horarios'" [menuItems]="menuItems">
      <div class="schedule-container">
        <!-- Vista de horarios semanales -->
        <mat-card class="weekly-view-card">
          <mat-card-header>
            <mat-card-title>Horarios Semanales</mat-card-title>
            <mat-card-subtitle
              >Vista general de todos tus horarios - Registra tu asistencia
              aquí</mat-card-subtitle
            >
          </mat-card-header>

          <mat-card-content>
            <div class="weekly-grid">
              <div *ngFor="let day of weekDays" class="day-column">
                <h3 class="day-header" [class.today]="isToday(day.value)">
                  {{ day.name }}
                </h3>
                <div class="day-schedules">
                  <div
                    *ngFor="let schedule of getSchedulesForDay(day.value)"
                    class="schedule-block"
                    [class.today]="isToday(day.value)"
                  >
                    <div class="schedule-content">
                      <h4>{{ schedule.subject }}</h4>
                      <p class="time">
                        <mat-icon>access_time</mat-icon>
                        {{ schedule.startTime }} - {{ schedule.endTime }}
                      </p>
                      <p class="classroom">
                        <mat-icon>room</mat-icon>
                        {{ schedule.classroom }}
                      </p>

                      <!-- Estado de asistencia -->
                      <div
                        class="attendance-status"
                        *ngIf="
                          getAttendanceStatusForSchedule(schedule) as status
                        "
                      >
                        <mat-chip [color]="status.color" selected>
                          <mat-icon>{{ status.icon }}</mat-icon>
                          {{ status.text }}
                        </mat-chip>
                      </div>

                      <!-- Botón de registro de asistencia -->
                      <div
                        class="schedule-actions"
                        *ngIf="isToday(schedule.dayOfWeek)"
                      >
                        <button
                          mat-raised-button
                          color="primary"
                          size="small"
                          (click)="registerAttendance(schedule)"
                          [disabled]="isAttendanceRegistered(schedule)"
                          class="register-btn"
                        >
                          <mat-icon>{{
                            isAttendanceRegistered(schedule)
                              ? 'check_circle'
                              : 'how_to_reg'
                          }}</mat-icon>
                          {{
                            isAttendanceRegistered(schedule)
                              ? 'Registrado'
                              : 'Registrar'
                          }}
                        </button>
                      </div>

                      <!-- Acciones adicionales -->
                      <div class="additional-actions">
                        <button
                          mat-icon-button
                          color="accent"
                          (click)="viewScheduleDetails(schedule)"
                          matTooltip="Ver detalles"
                        >
                          <mat-icon>info</mat-icon>
                        </button>
                        <button
                          mat-icon-button
                          color="primary"
                          (click)="requestScheduleChange(schedule)"
                          matTooltip="Solicitar cambio"
                        >
                          <mat-icon>edit_calendar</mat-icon>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div
                    *ngIf="getSchedulesForDay(day.value).length === 0"
                    class="no-classes"
                  >
                    <mat-icon>event_available</mat-icon>
                    <span>Sin clases</span>
                  </div>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Lista detallada de horarios -->
        <mat-card class="detailed-list-card">
          <mat-card-header>
            <mat-card-title>Lista Detallada de Horarios</mat-card-title>
            <mat-card-subtitle
              >Todos tus horarios con opciones de gestión</mat-card-subtitle
            >
          </mat-card-header>

          <mat-card-content>
            <div class="table-container">
              <table
                mat-table
                [dataSource]="teacherSchedules()"
                class="schedules-table"
              >
                <ng-container matColumnDef="day">
                  <th mat-header-cell *matHeaderCellDef>Día</th>
                  <td mat-cell *matCellDef="let schedule">
                    <mat-chip
                      [color]="
                        isToday(schedule.dayOfWeek) ? 'primary' : 'basic'
                      "
                      [selected]="isToday(schedule.dayOfWeek)"
                    >
                      {{ getDayName(schedule.dayOfWeek) }}
                    </mat-chip>
                  </td>
                </ng-container>

                <ng-container matColumnDef="subject">
                  <th mat-header-cell *matHeaderCellDef>Materia</th>
                  <td mat-cell *matCellDef="let schedule">
                    <strong>{{ schedule.subject }}</strong>
                  </td>
                </ng-container>

                <ng-container matColumnDef="time">
                  <th mat-header-cell *matHeaderCellDef>Horario</th>
                  <td mat-cell *matCellDef="let schedule">
                    <div class="time-display">
                      <mat-icon>access_time</mat-icon>
                      {{ schedule.startTime }} - {{ schedule.endTime }}
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="classroom">
                  <th mat-header-cell *matHeaderCellDef>Aula</th>
                  <td mat-cell *matCellDef="let schedule">
                    <div class="classroom-display">
                      <mat-icon>room</mat-icon>
                      {{ schedule.classroom }}
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="attendance">
                  <th mat-header-cell *matHeaderCellDef>Asistencias</th>
                  <td mat-cell *matCellDef="let schedule">
                    <div class="attendance-stats">
                      <span class="stat"
                        >{{ getAttendanceCount(schedule.id) }} registros</span
                      >
                      <mat-chip
                        color="primary"
                        selected
                        *ngIf="
                          isAttendanceRegistered(schedule) &&
                          isToday(schedule.dayOfWeek)
                        "
                      >
                        Hoy: Presente
                      </mat-chip>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="register">
                  <th mat-header-cell *matHeaderCellDef>Registrar Hoy</th>
                  <td mat-cell *matCellDef="let schedule">
                    <button
                      mat-raised-button
                      color="primary"
                      size="small"
                      (click)="registerAttendance(schedule)"
                      [disabled]="
                        !isToday(schedule.dayOfWeek) ||
                        isAttendanceRegistered(schedule)
                      "
                      *ngIf="isToday(schedule.dayOfWeek)"
                    >
                      <mat-icon>{{
                        isAttendanceRegistered(schedule)
                          ? 'check_circle'
                          : 'how_to_reg'
                      }}</mat-icon>
                      {{
                        isAttendanceRegistered(schedule)
                          ? 'Registrado'
                          : 'Registrar'
                      }}
                    </button>
                    <div
                      *ngIf="getAttendanceStatusForSchedule(schedule) as status"
                      class="attendance-status"
                    >
                      <mat-chip [color]="status.color" selected>
                        <mat-icon>{{ status.icon }}</mat-icon>
                        {{ status.text }}
                      </mat-chip>
                    </div>
                    <span
                      *ngIf="!isToday(schedule.dayOfWeek)"
                      class="not-today"
                    >
                      No es hoy
                    </span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Acciones</th>
                  <td mat-cell *matCellDef="let schedule">
                    <div class="action-buttons">
                      <button
                        mat-icon-button
                        color="primary"
                        (click)="requestScheduleChange(schedule)"
                        matTooltip="Solicitar cambio"
                      >
                        <mat-icon>edit_calendar</mat-icon>
                      </button>
                      <button
                        mat-icon-button
                        color="accent"
                        (click)="viewScheduleDetails(schedule)"
                        matTooltip="Ver detalles"
                      >
                        <mat-icon>info</mat-icon>
                      </button>
                    </div>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr
                  mat-row
                  *matRowDef="let row; columns: displayedColumns"
                ></tr>
              </table>

              <div *ngIf="teacherSchedules().length === 0" class="no-data">
                <mat-icon>schedule</mat-icon>
                <p>No tienes horarios asignados</p>
                <p>Contacta al administrador para que te asigne horarios</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </app-layout>
  `,
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

      .day-header.today {
        background-color: #2196f3;
        color: white;
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
        margin-top: 8px;
      }

      .register-btn {
        width: 100%;
        height: 32px;
        font-size: 12px;
      }

      .additional-actions {
        display: flex;
        justify-content: space-between;
        margin-top: 8px;
      }

      .additional-actions button {
        width: 32px;
        height: 32px;
        line-height: 32px;
      }

      .additional-actions mat-icon {
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
