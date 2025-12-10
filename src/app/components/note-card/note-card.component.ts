import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Note, NoteColor } from '../../models/note.model';

@Component({
  selector: 'app-note-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      [class]="
        'rounded-xl p-5 transition-all duration-200 hover:shadow-lg border border-primary cursor-pointer ' +
        getColorClass(note.color)
      "
      (click)="onClick()"
    >
      <div class="flex justify-between items-start mb-3">
        <h3 class="font-bold text-lg text-primary line-clamp-2">{{ note.title }}</h3>
        <div class="flex space-x-2">
          <button
            (click)="togglePin.emit(note.id); $event.stopPropagation()"
            class="p-1.5 rounded-full transition-colors"
            [style.backgroundColor]="getButtonBgColor()"
            [class.text-yellow-500]="note.pinned"
            [class.text-gray-400]="!note.pinned"
          >
            📌
          </button>
          <button
            (click)="edit.emit(note); $event.stopPropagation()"
            class="p-1.5 rounded-full text-secondary hover:text-blue-500 transition-colors"
            [style.backgroundColor]="getButtonBgColor()"
          >
            ✏️
          </button>
          <button
            (click)="delete.emit(note); $event.stopPropagation()"
            class="p-1.5 rounded-full text-secondary hover:text-red-500 transition-colors"
            [style.backgroundColor]="getButtonBgColor()"
          >
            🗑️
          </button>
        </div>
      </div>

      <p class="text-secondary mb-4 whitespace-pre-line line-clamp-4">{{ note.content }}</p>

      <div class="flex justify-between items-center text-sm">
        <span class="text-secondary">{{ note.updatedAt | date : 'dd.MM.yyyy HH:mm' }}</span>
        <div class="flex space-x-1">
          <span
            *ngFor="let tag of note.tags"
            class="px-2 py-0.5 rounded-full text-secondary"
            [style.backgroundColor]="getTagBgColor()"
          >
            {{ tag }}
          </span>
        </div>
      </div>
    </div>
  `,
})
export class NoteCardComponent {
  @Input() note!: Note;
  @Output() delete = new EventEmitter<Note>();
  @Output() togglePin = new EventEmitter<string>();
  @Output() edit = new EventEmitter<Note>();

  private colorClassMap: Record<NoteColor, string> = {
    blue: 'note-blue',
    green: 'note-green',
    yellow: 'note-yellow',
    pink: 'note-pink',
    purple: 'note-purple',
    gray: 'note-gray',
  };

  getColorClass(color: NoteColor): string {
    return this.colorClassMap[color] || this.colorClassMap.blue;
  }

  getButtonBgColor(): string {
    return getComputedStyle(document.documentElement).getPropertyValue('--color-card').trim();
  }

  getTagBgColor(): string {
    return getComputedStyle(document.documentElement).getPropertyValue('--color-gray-100').trim();
  }

  onClick() {
    this.edit.emit(this.note);
  }
}
