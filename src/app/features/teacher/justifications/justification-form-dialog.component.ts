import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AttendanceService } from '../../../core/services/attendance.service';
import { MatDialogRef } from '@angular/material/dialog';

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
  templateUrl: './justification-form-dialog.component.html',
})
export class JustificationFormDialogComponent {
  teacherId!: string;
  private fb = inject(FormBuilder);
  private attendanceService = inject(AttendanceService);
  private dialogRef = inject(MatDialogRef<JustificationFormDialogComponent>);

  justificationForm = this.fb.group({
    date: ['', Validators.required],
    reason: ['', [Validators.required, Validators.minLength(10)]],
  });

  onSubmit(): void {
    if (this.justificationForm.valid) {
      const formValue = this.justificationForm.value;

      this.attendanceService.submitJustification({
        teacherId: this.teacherId,
        date: new Date(formValue.date as string),
        reason: formValue.reason as string,
      });

      this.dialogRef.close();
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
