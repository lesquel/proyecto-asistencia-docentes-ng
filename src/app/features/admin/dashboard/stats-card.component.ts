import { Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

interface Stat {
  label: string;
  value: number;
  icon: string;
  iconSecondary: string;
}

@Component({
  selector: 'app-stats-card',
  imports: [MatIcon],
  templateUrl: './stats-card.component.html',
})
export class StatsCardComponent {
  stat = input.required<Stat>();
}
