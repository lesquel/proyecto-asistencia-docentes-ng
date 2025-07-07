import { Component, input } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

interface Action {
  label: string;
  route: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-quick-actions',
  imports: [MatIcon, RouterLink, MatButton],
  templateUrl: './quick-actions.component.html',
})
export class QuickActionsComponent {
  action = input.required<Action>();
}
