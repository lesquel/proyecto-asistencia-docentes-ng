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
  template: `
    <div
      class="group relative bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 hover:-translate-y-1"
    >
      <div
        class="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      ></div>
      <div class="relative">
        <div
          class="p-6 border-b border-gray-100 group-hover:border-blue-100 transition-colors duration-300"
        >
          <div class="flex items-start gap-4">
            <div
              class="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300"
            >
              <mat-icon class="text-white text-xl">{{
                action().icon
              }}</mat-icon>
            </div>
            <div class="flex-1">
              <h3
                class="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors duration-300"
              >
                {{ action().label }}
              </h3>
              <p class="text-sm text-gray-600 leading-relaxed">
                {{ action().description }}
              </p>
            </div>
          </div>
        </div>
        <div class="p-6">
          <button
            mat-raised-button
            color="primary"
            [routerLink]="[action().route]"
            class="w-full group/btn relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <div
              class="absolute inset-0 bg-white opacity-0 group-hover/btn:opacity-10 transition-opacity duration-300"
            ></div>
            <div class="relative flex items-center justify-center gap-3">
              <mat-icon class="text-lg">{{ action().icon }}</mat-icon>
              <span>{{ action().label }}</span>
              <mat-icon
                class="text-lg transform group-hover/btn:translate-x-1 transition-transform duration-300"
                >arrow_forward</mat-icon
              >
            </div>
          </button>
        </div>
      </div>
    </div>
  `,
})
export class QuickActionsComponent {
  action = input.required<Action>();
}
