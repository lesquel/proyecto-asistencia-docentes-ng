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
  template: `
    <div
      class="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-green-200"
    >
      <div
        class="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      ></div>
      <div class="relative p-6">
        <div class="flex items-center justify-between mb-4">
          <div
            class="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300"
          >
            <mat-icon class="text-white text-2xl">{{ stat().icon }}</mat-icon>
          </div>
          <div
            class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center opacity-20 group-hover:opacity-40 transition-opacity duration-300"
          >
            <mat-icon class="text-green-600">{{ stat().iconSecondary }}</mat-icon>
          </div>
        </div>
        <div>
          <h2
            class="text-3xl font-bold text-gray-900 mb-1 group-hover:text-green-700 transition-colors duration-300"
          >
            {{ stat().value }}
          </h2>
          <p
            class="text-sm font-medium text-gray-500 group-hover:text-green-600 transition-colors duration-300"
          >
            {{ stat().label }}
          </p>
        </div>
      </div>
    </div>
  `,
})
export class StatsCardComponent {
  stat = input.required<Stat>();
}
