import { Component } from '@angular/core';
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
import { MatSelectModule } from '@angular/material/select';
import {
  LayoutComponent,
  MenuItem,
} from '../../../shared/components/layout/layout.component';
import { TeacherService } from '../../../core/services/teacher.service';
import type { Teacher } from '../../../core/models/user.model';

@Component({
  selector: 'app-teacher-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ teacher ? 'Editar' : 'Agregar' }} Docente</h2>
    <mat-dialog-content>
      <form [formGroup]="teacherForm" class="teacher-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nombre Completo</mat-label>
          <input
            matInput
            formControlName="name"
            placeholder="Nombre completo"
          />
          <mat-error *ngIf="teacherForm.get('name')?.hasError('required')">
            El nombre es requerido
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Correo Electrónico</mat-label>
          <input
            matInput
            type="email"
            formControlName="email"
            placeholder="correo@escuela.com"
          />
          <mat-error *ngIf="teacherForm.get('email')?.hasError('required')">
            El correo es requerido
          </mat-error>
          <mat-error *ngIf="teacherForm.get('email')?.hasError('email')">
            Ingrese un correo válido
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>ID de Empleado</mat-label>
          <input matInput formControlName="employeeId" placeholder="T001" />
          <mat-error
            *ngIf="teacherForm.get('employeeId')?.hasError('required')"
          >
            El ID de empleado es requerido
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Departamento</mat-label>
          <mat-select formControlName="department">
            <mat-option value="Matemáticas">Matemáticas</mat-option>
            <mat-option value="Historia">Historia</mat-option>
            <mat-option value="Ciencias">Ciencias</mat-option>
            <mat-option value="Literatura">Literatura</mat-option>
            <mat-option value="Inglés">Inglés</mat-option>
            <mat-option value="Educación Física">Educación Física</mat-option>
            <mat-option value="Arte">Arte</mat-option>
          </mat-select>
          <mat-error
            *ngIf="teacherForm.get('department')?.hasError('required')"
          >
            El departamento es requerido
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Teléfono</mat-label>
          <input matInput formControlName="phone" placeholder="555-0123" />
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button
        mat-raised-button
        color="primary"
        (click)="onSave()"
        [disabled]="teacherForm.invalid"
      >
        {{ teacher ? 'Actualizar' : 'Guardar' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .teacher-form {
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
export class TeacherFormDialogComponent {
  teacherForm: FormGroup;
  teacher?: Teacher;

  constructor(private fb: FormBuilder, private teacherService: TeacherService) {
    this.teacherForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      employeeId: ['', Validators.required],
      department: ['', Validators.required],
      phone: [''],
    });
  }

  ngOnInit(): void {
    if (this.teacher) {
      this.teacherForm.patchValue({
        name: this.teacher.name,
        email: this.teacher.email,
        employeeId: this.teacher.employeeId,
        department: this.teacher.department,
        phone: this.teacher.phone || '',
      });
    }
  }

  onSave(): void {
    if (this.teacherForm.valid) {
      const formValue = this.teacherForm.value;

      if (this.teacher) {
        this.teacherService.updateTeacher(this.teacher.id, formValue);
      } else {
        this.teacherService.addTeacher({
          ...formValue,
          role: 'teacher' as const,
          schedules: [],
        });
      }
    }
  }
}

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
  template: `
    <app-layout [title]="'Gestión de Docentes'" [menuItems]="menuItems">
      <div class="teacher-management-container">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Lista de Docentes</mat-card-title>
            <mat-card-subtitle
              >Gestionar información de docentes</mat-card-subtitle
            >
          </mat-card-header>

          <mat-card-content>
            <div class="table-actions">
              <button
                mat-raised-button
                color="primary"
                (click)="openTeacherDialog()"
              >
                <mat-icon>add</mat-icon>
                Agregar Docente
              </button>
            </div>

            <div class="table-container">
              <table
                mat-table
                [dataSource]="teacherService.teachers()"
                class="teachers-table"
              >
                <ng-container matColumnDef="employeeId">
                  <th mat-header-cell *matHeaderCellDef>ID Empleado</th>
                  <td mat-cell *matCellDef="let teacher">
                    {{ teacher.employeeId }}
                  </td>
                </ng-container>

                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef>Nombre</th>
                  <td mat-cell *matCellDef="let teacher">{{ teacher.name }}</td>
                </ng-container>

                <ng-container matColumnDef="email">
                  <th mat-header-cell *matHeaderCellDef>Correo</th>
                  <td mat-cell *matCellDef="let teacher">
                    {{ teacher.email }}
                  </td>
                </ng-container>

                <ng-container matColumnDef="department">
                  <th mat-header-cell *matHeaderCellDef>Departamento</th>
                  <td mat-cell *matCellDef="let teacher">
                    {{ teacher.department }}
                  </td>
                </ng-container>

                <ng-container matColumnDef="schedules">
                  <th mat-header-cell *matHeaderCellDef>Horarios</th>
                  <td mat-cell *matCellDef="let teacher">
                    {{ teacher.schedules.length }}
                  </td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Acciones</th>
                  <td mat-cell *matCellDef="let teacher">
                    <button
                      mat-icon-button
                      color="primary"
                      (click)="openTeacherDialog(teacher)"
                    >
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button
                      mat-icon-button
                      color="warn"
                      (click)="deleteTeacher(teacher)"
                    >
                      <mat-icon>delete</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr
                  mat-row
                  *matRowDef="let row; columns: displayedColumns"
                ></tr>
              </table>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </app-layout>
  `,
  styles: [
    `
      .teacher-management-container {
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

      .teachers-table {
        width: 100%;
      }

      .teachers-table th,
      .teachers-table td {
        padding: 12px 8px;
      }

      @media (max-width: 768px) {
        .table-actions {
          justify-content: center;
        }
      }
    `,
  ],
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
