import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogRef } from '@angular/material/dialog';
import { AttendanceService } from '../../../core/services/attendance.service';
import { AttendanceJustification } from '../../../core/models/user.model';

@Component({
  selector: 'app-justification-review-dialog',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './justification-review-dialog.component.html',
})
export class JustificationReviewDialogComponent {
  justification?: AttendanceJustification;
  teacherName?: string;

  private attendanceService = inject(AttendanceService);
  dialogRef = inject(MatDialogRef<JustificationReviewDialogComponent>);

  onApprove(): void {
    if (this.justification) {
      this.attendanceService.reviewJustification(this.justification.id, 'approved', 'admin');
      this.dialogRef.close();
    }
  }

  onReject(): void {
    if (this.justification) {
      this.attendanceService.reviewJustification(this.justification.id, 'rejected', 'admin');
      this.dialogRef.close();
    }
  }
}
