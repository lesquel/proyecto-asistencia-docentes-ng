import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Schedule } from "../../../core/models/user.model";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { AttendanceService } from "../../../core/services/attendance.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { CommonModule } from "@angular/common";
import { MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";
import { MatButtonModule } from "@angular/material/button";

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