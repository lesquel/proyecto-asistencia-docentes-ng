import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Schedule } from '../../../core/models/user.model';
import { TeacherService } from '../../../core/services/teacher.service';

@Component({
  selector: 'app-schedule-form-dialog',
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
  templateUrl: './schedule-form-dialog.component.html',
})
export class ScheduleFormDialogComponent {
  schedule?: Schedule & { teacherName?: string };

  private fb = inject(FormBuilder);
  private teacherService = inject(TeacherService);
  private dialogRef = inject(MatDialogRef<ScheduleFormDialogComponent>);
  teachers = this.teacherService.teachers();

  scheduleForm = this.fb.group({
    teacherId: ['', Validators.required],
    dayOfWeek: ['', Validators.required],
    startTime: ['', Validators.required],
    endTime: ['', Validators.required],
    subject: ['', Validators.required],
    classroom: ['', Validators.required],
  });

  ngOnInit(): void {
    if (this.schedule) {
      this.scheduleForm.patchValue({
        teacherId: this.schedule.teacherId,
        dayOfWeek: String(this.schedule.dayOfWeek),
        startTime: this.schedule.startTime,
        endTime: this.schedule.endTime,
        subject: this.schedule.subject,
        classroom: this.schedule.classroom,
      });
    }
  }

  onSave(): void {
    if (this.scheduleForm.valid) {
      const formValue = this.scheduleForm.value;

      if (
        formValue.teacherId &&
        formValue.dayOfWeek &&
        formValue.startTime &&
        formValue.endTime &&
        formValue.subject &&
        formValue.classroom
      ) {
        if (this.schedule) {
          const teacher = this.teacherService.getTeacherById(formValue.teacherId);
          if (teacher) {
            const updatedSchedules = teacher.schedules.map((s) =>
              s.id === this.schedule!.id
                ? { ...s, ...formValue, teacherId: formValue.teacherId as string }
                : s
            );
            this.teacherService.updateTeacher(teacher.id, {
              schedules: updatedSchedules as Schedule[],
            });
          }
        } else {
          this.teacherService.addScheduleToTeacher(formValue.teacherId, {
            dayOfWeek: parseInt(formValue.dayOfWeek),
            startTime: formValue.startTime,
            endTime: formValue.endTime,
            subject: formValue.subject,
            classroom: formValue.classroom,
          });
        }

        this.close(); // cerrar después de guardar
      }
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
