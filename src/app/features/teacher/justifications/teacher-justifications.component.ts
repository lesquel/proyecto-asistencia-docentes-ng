import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
   FormBuilder,
   FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import {
  LayoutComponent,
  type MenuItem,
} from '../../../shared/components/layout/layout.component';
import { AuthService } from '../../../core/services/auth.service';
import { AttendanceService } from '../../../core/services/attendance.service';

@Component({
  selector: 'app-justification-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>Nueva Justificación</h2>
    <mat-dialog-content>
      <form [formGroup]="justificationForm" class="justification-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Fecha</mat-label>
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
          <mat-error
            *ngIf="justificationForm.get('date')?.hasError('required')"
          >
            La fecha es requerida
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Motivo de la justificación</mat-label>
          <textarea
            matInput
            formControlName="reason"
            placeholder="Describa el motivo de su inasistencia o tardanza"
            rows="4"
          ></textarea>
          <mat-error
            *ngIf="justificationForm.get('reason')?.hasError('required')"
          >
            El motivo es requerido
          </mat-error>
          <mat-error
            *ngIf="justificationForm.get('reason')?.hasError('minlength')"
          >
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
        [disabled]="justificationForm.invalid"
      >
        Enviar Justificación
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .justification-form {
        display: flex;
        flex-direction: column;
        min-width: 400px;
      }

      .full-width {
        width: 100%;
        margin-bottom: 16px;
      }

      mat-dialog-content {
        padding: 20px;
      }
    `,
  ],
})
export class JustificationFormDialogComponent {
  justificationForm: FormGroup;
  teacherId!: string;

  constructor(
    private fb: FormBuilder,
    private attendanceService: AttendanceService
  ) {
    this.justificationForm = this.fb.group({
      date: ['', Validators.required],
      reason: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  onSubmit(): void {
    if (this.justificationForm.valid) {
      const formValue = this.justificationForm.value;

      this.attendanceService.submitJustification({
        teacherId: this.teacherId,
        date: formValue.date,
        reason: formValue.reason,
      });
    }
  }
}

@Component({
  selector: 'app-teacher-justifications',
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
  template: `
    <app-layout [title]="'Mis Justificaciones'" [menuItems]="menuItems">
      <div class="justifications-container">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Justificaciones de Inasistencias</mat-card-title>
            <mat-card-subtitle
              >Gestionar justificaciones y solicitudes</mat-card-subtitle
            >
          </mat-card-header>

          <mat-card-content>
            <div class="table-actions">
              <button
                mat-raised-button
                color="primary"
                (click)="openJustificationDialog()"
              >
                <mat-icon>add</mat-icon>
                Nueva Justificación
              </button>
            </div>

            <div class="table-container">
              <table
                mat-table
                [dataSource]="teacherJustifications()"
                class="justifications-table"
              >
                <ng-container matColumnDef="date">
                  <th mat-header-cell *matHeaderCellDef>Fecha</th>
                  <td mat-cell *matCellDef="let justification">
                    {{ justification.date | date : 'dd/MM/yyyy' }}
                  </td>
                </ng-container>

                <ng-container matColumnDef="reason">
                  <th mat-header-cell *matHeaderCellDef>Motivo</th>
                  <td mat-cell *matCellDef="let justification">
                    <div class="reason-text">{{ justification.reason }}</div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Estado</th>
                  <td mat-cell *matCellDef="let justification">
                    <mat-chip
                      [color]="getStatusColor(justification.status)"
                      selected
                    >
                      {{ getStatusText(justification.status) }}
                    </mat-chip>
                  </td>
                </ng-container>

                <ng-container matColumnDef="createdAt">
                  <th mat-header-cell *matHeaderCellDef>Enviado</th>
                  <td mat-cell *matCellDef="let justification">
                    {{ justification.createdAt | date : 'dd/MM/yyyy HH:mm' }}
                  </td>
                </ng-container>

                <ng-container matColumnDef="reviewedAt">
                  <th mat-header-cell *matHeaderCellDef>Revisado</th>
                  <td mat-cell *matCellDef="let justification">
                    {{
                      justification.reviewedAt
                        ? (justification.reviewedAt | date : 'dd/MM/yyyy HH:mm')
                        : '-'
                    }}
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr
                  mat-row
                  *matRowDef="let row; columns: displayedColumns"
                ></tr>
              </table>

              <div *ngIf="teacherJustifications().length === 0" class="no-data">
                <mat-icon>description</mat-icon>
                <p>No tienes justificaciones registradas</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </app-layout>
  `,
  styles: [
    `
      .justifications-container {
        max-width: 1200px;
        margin: 0 auto;
      }

      .table-actions {
        margin-bottom: 20px;
        display: flex;
        justify-content: flex-end;
      }

      .table-container {
        overflow-x: auto;
      }

      .justifications-table {
        width: 100%;
      }

      .justifications-table th,
      .justifications-table td {
        padding: 12px 8px;
      }

      .reason-text {
        max-width: 300px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
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
        .table-actions {
          justify-content: center;
        }
      }
    `,
  ],
})
export class TeacherJustificationsComponent {
  menuItems: MenuItem[] = [
    { label: 'Dashboard', route: '/teacher/dashboard', icon: 'dashboard' },
    { label: 'Asistencias', route: '/teacher/attendance', icon: 'assignment' },
    {
      label: 'Justificaciones',
      route: '/teacher/justifications',
      icon: 'description',
    },
  ];

  displayedColumns: string[] = [
    'date',
    'reason',
    'status',
    'createdAt',
    'reviewedAt',
  ];

  currentTeacher = computed(() => {
    const user = this.authService.currentUser();
    return user && user.role === 'teacher' ? user : null;
  });

  teacherJustifications = computed(() => {
    const teacher = this.currentTeacher();
    if (!teacher) return [];
    return this.attendanceService
      .getJustificationsByTeacher(teacher.id)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  });

  constructor(
    private authService: AuthService,
    private attendanceService: AttendanceService,
    private dialog: MatDialog
  ) {}

  openJustificationDialog(): void {
    const teacher = this.currentTeacher();
    if (!teacher) return;

    const dialogRef = this.dialog.open(JustificationFormDialogComponent, {
      width: '500px',
    });

    dialogRef.componentInstance.teacherId = teacher.id;
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      pending: 'Pendiente',
      approved: 'Aprobada',
      rejected: 'Rechazada',
    };
    return statusMap[status] || status;
  }

  getStatusColor(status: string): 'primary' | 'accent' | 'warn' {
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
}
