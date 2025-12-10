import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NoteService } from '../../services/note.service';
import { Note, NoteColor } from '../../models/note.model';
import { NoteCardComponent } from '../note-card/note-card.component';

@Component({
  selector: 'app-note-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NoteCardComponent],
  template: `
    <div class="max-w-6xl mx-auto">
      <!-- Поиск и новая заметка -->
      <div class="mb-8 flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <div class="relative">
            <input
              type="text"
              [ngModel]="searchQuery()"
              (ngModelChange)="onSearch($event)"
              placeholder="Поиск заметок..."
              class="w-full px-4 py-3 pl-12 bg-card text-primary rounded-xl border border-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            />
            <span class="absolute left-4 top-3.5 text-secondary">🔍</span>
            <button
              *ngIf="searchQuery().trim()"
              (click)="clearSearch()"
              class="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400"
              type="button"
            >
              ✕
            </button>
          </div>
        </div>
        <button
          (click)="openEditor()"
          class="px-6 py-3 bg-linear-to-r from-green-500 to-green-800 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <span>+</span>
          <span>Новая заметка</span>
        </button>
      </div>

      <!-- Сообщение если нет заметок -->
      <div
        *ngIf="noteService.filteredNotes().length === 0 && !noteService.isSearching()"
        class="text-center py-20"
      >
        <div class="text-secondary text-6xl mb-4">📝</div>
        <h3 class="text-xl font-medium text-primary mb-2">Нет заметок</h3>
        <p class="text-secondary">Создайте свою первую заметку!</p>
      </div>

      <!-- Сообщение если поиск не дал результатов -->
      <div
        *ngIf="noteService.filteredNotes().length === 0 && noteService.isSearching()"
        class="text-center py-20"
      >
        <div class="text-secondary text-6xl mb-4">🔍</div>
        <h3 class="text-xl font-medium text-primary mb-2">Ничего не найдено</h3>
        <p class="text-secondary">Попробуйте другой запрос</p>
        <button
          (click)="clearSearch()"
          class="mt-4 px-4 py-2 text-blue-500 hover:text-blue-600"
          type="button"
        >
          Очистить поиск
        </button>
      </div>

      <!-- Статистика поиска -->
      <div
        *ngIf="noteService.isSearching() && noteService.filteredNotes().length > 0"
        class="mb-4 text-sm text-secondary"
      >
        Найдено заметок: {{ noteService.filteredNotes().length }}
        <button
          (click)="clearSearch()"
          class="ml-4 text-blue-500 hover:text-blue-600"
          type="button"
        >
          Очистить поиск
        </button>
      </div>

      <!-- Заметки -->
      <div *ngIf="noteService.filteredNotes().length > 0" class="mb-6">
        <!-- Закрепленные заметки -->
        <div *ngIf="noteService.pinnedNotes().length > 0">
          <h2 class="text-lg font-semibold text-primary mb-4">
            Закрепленные ({{ noteService.pinnedNotes().length }})
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <app-note-card
              *ngFor="let note of noteService.pinnedNotes()"
              [note]="note"
              (delete)="openDeleteModal(note)"
              (togglePin)="onTogglePin(note.id)"
              (edit)="onEditNote(note)"
            ></app-note-card>
          </div>
        </div>

        <!-- Остальные заметки -->
        <div *ngIf="noteService.otherNotes().length > 0">
          <h2 class="text-lg font-semibold text-primary mb-4">
            Все заметки ({{ noteService.otherNotes().length }})
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <app-note-card
              *ngFor="let note of noteService.otherNotes()"
              [note]="note"
              (delete)="openDeleteModal(note)"
              (togglePin)="onTogglePin(note.id)"
              (edit)="onEditNote(note)"
            ></app-note-card>
          </div>
        </div>
      </div>

      <!-- Редактор заметки -->
      <div
        *ngIf="showEditor"
        class="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50"
      >
        <div
          [class]="
            'rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden ' +
            getModalColorClass(selectedColor)
          "
        >
          <div class="p-6 border-b border-primary">
            <div class="flex justify-between items-center">
              <h3 class="text-xl font-bold text-primary">
                {{ editingNote ? 'Редактировать заметку' : 'Новая заметка' }}
              </h3>
              <button
                (click)="closeEditor()"
                class="text-secondary hover:text-primary text-2xl transition-colors"
                type="button"
              >
                ×
              </button>
            </div>
          </div>

          <div class="p-6 overflow-y-auto" style="max-height: calc(90vh - 200px)">
            <input
              type="text"
              [(ngModel)]="editorTitle"
              placeholder="Заголовок"
              class="w-full text-2xl font-bold mb-4 p-2 focus:outline-none bg-transparent text-primary placeholder:text-secondary"
            />

            <textarea
              [(ngModel)]="editorContent"
              placeholder="Начните писать здесь..."
              class="w-full min-h-[300px] p-2 focus:outline-none resize-none bg-transparent text-primary placeholder:text-secondary"
            ></textarea>

            <!-- Цвета -->
            <div class="mt-6">
              <h4 class="font-medium text-primary mb-3">Цвет заметки</h4>
              <div class="flex gap-3">
                <button
                  *ngFor="let color of colors"
                  [class]="
                    'w-10 h-10 rounded-full border-2 transition-all duration-200 ' +
                    getColorButtonClass(color)
                  "
                  [class.ring-2]="selectedColor === color"
                  [class.ring-offset-2]="selectedColor === color"
                  [class.ring-blue-500]="selectedColor === color"
                  [class.border-white]="selectedColor === color"
                  [class.dark:border-gray-800]="selectedColor === color"
                  (click)="selectedColor = color"
                  type="button"
                ></button>
              </div>
            </div>
          </div>

          <div class="p-6 border-t border-primary flex justify-end space-x-3">
            <button
              (click)="closeEditor()"
              class="px-5 py-2.5 border border-primary rounded-lg hover:opacity-80 transition-colors text-primary"
              type="button"
            >
              Отмена
            </button>
            <button
              (click)="saveNote()"
              [disabled]="!editorTitle.trim()"
              [class]="
                'px-5 py-2.5 rounded-lg text-white font-medium transition-colors ' +
                (editorTitle.trim()
                  ? 'bg-blue-500 hover:bg-blue-600'
                  : 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed')
              "
              type="button"
            >
              Сохранить
            </button>
          </div>
        </div>
      </div>

      <!-- Модалка подтверждения удаления -->
      <div
        *ngIf="showDeleteModal"
        class="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50"
      >
        <div
          class="bg-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-primary"
        >
          <div class="p-6 border-b border-primary">
            <div class="flex items-center space-x-3 mb-4">
              <div
                class="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center"
              >
                <span class="text-red-500 dark:text-red-300 text-xl">⚠️</span>
              </div>
              <h3 class="text-xl font-bold text-primary">
                {{ deleteModalTitle }}
              </h3>
            </div>
            <p class="text-secondary">
              {{ deleteModalMessage }}
            </p>
          </div>

          <div class="p-6 flex justify-end space-x-3">
            <button
              (click)="closeDeleteModal()"
              class="px-5 py-2.5 border border-primary rounded-lg hover:opacity-80 transition-colors text-primary"
              type="button"
            >
              Отмена
            </button>
            <button
              (click)="confirmDelete()"
              class="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
              type="button"
            >
              Удалить
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class NoteListComponent {
  noteService = inject(NoteService);

  // Сигналы для поиска
  searchQuery = signal('');

  // Сигналы для редактора
  showEditor = false;
  editingNote: Note | null = null;
  editorTitle = '';
  editorContent = '';
  selectedColor: NoteColor = 'blue';

  // Сигналы для модалки удаления
  showDeleteModal = false;
  noteToDelete: Note | null = null;
  deleteModalTitle = '';
  deleteModalMessage = '';

  colors: NoteColor[] = ['blue', 'green', 'yellow', 'pink', 'purple', 'gray'];

  private colorButtonClassMap: Record<NoteColor, string> = {
    blue: 'bg-blue-500 hover:bg-blue-600 border-blue-400',
    green: 'bg-green-500 hover:bg-green-600 border-green-400',
    yellow: 'bg-yellow-500 hover:bg-yellow-600 border-yellow-400',
    pink: 'bg-pink-500 hover:bg-pink-600 border-pink-400',
    purple: 'bg-purple-500 hover:bg-purple-600 border-purple-400',
    gray: 'bg-gray-500 hover:bg-gray-600 border-gray-400',
  };

  private modalColorClassMap: Record<NoteColor, string> = {
    blue: 'bg-card border-4 border-blue-500',
    green: 'bg-card border-4 border-green-500',
    yellow: 'bg-card border-4 border-yellow-500',
    pink: 'bg-card border-4 border-pink-500',
    purple: 'bg-card border-4 border-purple-500',
    gray: 'bg-card border-4 border-gray-500',
  };

  // Методы для поиска
  onSearch(query: string) {
    this.searchQuery.set(query);
    this.noteService.setSearchQuery(query);
  }

  clearSearch() {
    this.searchQuery.set('');
    this.noteService.clearSearch();
  }

  // Методы для модалки удаления
  openDeleteModal(note: Note) {
    this.noteToDelete = note;
    this.deleteModalTitle = `Удалить "${note.title}"?`;
    this.deleteModalMessage = 'Эта заметка будет удалена навсегда. Вы не сможете восстановить ее.';
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.noteToDelete = null;
  }

  confirmDelete() {
    if (this.noteToDelete) {
      this.noteService.deleteNote(this.noteToDelete.id);
      this.closeDeleteModal();
    }
  }

  // Методы для заметок
  onTogglePin(id: string) {
    this.noteService.togglePin(id);
  }

  onEditNote(note: Note) {
    this.editingNote = note;
    this.editorTitle = note.title;
    this.editorContent = note.content;
    this.selectedColor = note.color;
    this.showEditor = true;
  }

  openEditor() {
    this.editingNote = null;
    this.editorTitle = '';
    this.editorContent = '';
    this.selectedColor = 'blue';
    this.showEditor = true;
  }

  // Вспомогательные методы для цветов
  getColorButtonClass(color: NoteColor): string {
    return this.colorButtonClassMap[color] || this.colorButtonClassMap.blue;
  }

  getModalColorClass(color: NoteColor): string {
    return this.modalColorClassMap[color] || this.modalColorClassMap.blue;
  }

  // Методы для редактора
  saveNote() {
    if (!this.editorTitle.trim()) return;

    if (this.editingNote) {
      this.noteService.updateNote(this.editingNote.id, {
        title: this.editorTitle,
        content: this.editorContent,
        color: this.selectedColor,
      });
    } else {
      this.noteService.addNote(this.editorTitle, this.editorContent, this.selectedColor);
    }

    this.closeEditor();
  }

  closeEditor() {
    this.showEditor = false;
    this.editingNote = null;
    this.editorTitle = '';
    this.editorContent = '';
    this.selectedColor = 'blue';
  }
}
