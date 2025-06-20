import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  inject,
} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Teacher } from '../../../core/models/user.model';
import { TeacherService } from '../../../core/services/teacher.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-teacher-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './teacher-form-dialog.component.html',
})
export class TeacherFormDialogComponent {
  private fb = inject(FormBuilder);
  private teacherService = inject(TeacherService);
  private dialogRef = inject(MatDialogRef<TeacherFormDialogComponent>);

  constructor(@Inject(MAT_DIALOG_DATA) public teacher?: Teacher) {}

  teacherForm = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    employeeId: ['', Validators.required],
    department: ['', Validators.required],
    phone: [''],
  });

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
      const formValue = this.teacherForm.value as Omit<Teacher, 'id' | 'createdAt'>;

      if (this.teacher) {
        this.teacherService.updateTeacher(this.teacher.id, formValue);
      } else {
        this.teacherService.addTeacher({
          ...formValue,
          role: 'teacher',
          schedules: [],
        });
      }

      this.close(); // Cierra el diálogo correctamente
    }
  }

  close(): void {
    this.dialogRef.close();   
  }
}
