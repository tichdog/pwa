import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="min-h-screen bg-gradient-primary">
      <header class="bg-header border-b border-primary shadow-sm">
        <div class="container mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <h1 class="text-2xl font-bold text-primary">Notes</h1>
            </div>
            <button
              class="p-2 rounded-full hover:opacity-80 transition-opacity"
              (click)="toggleTheme()"
              [style.backgroundColor]="isDarkTheme ? '#4b5563' : '#f3f4f6'"
            >
              <span class="text-xl">
                {{ isDarkTheme ? '☀️' : '🌙' }}
              </span>
            </button>
          </div>
        </div>
      </header>

      <main class="container mx-auto px-4 py-8">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
})
export class App implements OnInit {
  isDarkTheme = false;

  ngOnInit() {
    this.initializeTheme();
  }

  private initializeTheme() {
    const savedTheme = localStorage.getItem('notes-theme');

    if (savedTheme) {
      this.isDarkTheme = savedTheme === 'dark';
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.isDarkTheme = prefersDark;
    }

    this.applyTheme();
  }

  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
    this.applyTheme();
    localStorage.setItem('notes-theme', this.isDarkTheme ? 'dark' : 'light');
  }

  private applyTheme() {
    if (this.isDarkTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}
