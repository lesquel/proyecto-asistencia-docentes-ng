import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Schedule } from '../../../core/models/user.model';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AttendanceService } from '../../../core/services/attendance.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';

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
  templateUrl: './schedule-change-request-dialog.component.html',
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
