import { Injectable, signal, computed } from '@angular/core';
import { Note, NoteColor } from '../models/note.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class NoteService {
  private readonly STORAGE_KEY = 'notes_app_data';
  
  // Основной список заметок
  private notesSignal = signal<Note[]>(this.loadNotes());
  
  // Публичный computed сигнал для доступа
  notes = computed(() => this.notesSignal());
  
  // Сигнал для поиска
  private searchQuerySignal = signal<string>('');
  
  // Фильтрованные заметки
  filteredNotes = computed(() => {
    const query = this.searchQuerySignal().toLowerCase().trim();
    const notes = this.notesSignal();
    
    if (!query) {
      return notes;
    }
    
    return notes.filter(note => 
      note.title.toLowerCase().includes(query) || 
      note.content.toLowerCase().includes(query)
    );
  });

  constructor() {
    if (this.notesSignal().length === 0) {
      this.addSampleNotes();
    }
  }

  private loadNotes(): Note[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveNotes() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.notesSignal()));
  }

  private addSampleNotes() {
    const sampleNotes: Note[] = [
      {
        id: uuidv4(),
        title: 'Добро пожаловать!',
        content: 'Это ваша первая заметка. Нажмите на нее, чтобы редактировать.',
        color: 'blue',
        createdAt: new Date(),
        updatedAt: new Date(),
        pinned: true,
        tags: ['приветствие']
      },
      {
        id: uuidv4(),
        title: 'Идеи для проекта',
        content: '• Добавить темную тему\n• Реализовать поиск\n• Добавить категории',
        color: 'green',
        createdAt: new Date(),
        updatedAt: new Date(),
        pinned: false,
        tags: ['работа', 'идеи']
      },
      {
        id: uuidv4(),
        title: 'Покупки',
        content: 'Молоко, Хлеб, Яйца, Фрукты',
        color: 'yellow',
        createdAt: new Date(),
        updatedAt: new Date(),
        pinned: false,
        tags: ['покупки']
      }
    ];

    this.notesSignal.set(sampleNotes);
    this.saveNotes();
  }

  // Методы для работы с заметками
  addNote(title: string, content: string, color: NoteColor = 'blue') {
    const newNote: Note = {
      id: uuidv4(),
      title,
      content,
      color,
      createdAt: new Date(),
      updatedAt: new Date(),
      pinned: false,
      tags: []
    };

    this.notesSignal.update(notes => [...notes, newNote]);
    this.saveNotes();
  }

  updateNote(id: string, updates: Partial<Note>) {
    this.notesSignal.update(notes => 
      notes.map(note => 
        note.id === id 
          ? { ...note, ...updates, updatedAt: new Date() }
          : note
      )
    );
    this.saveNotes();
  }

  deleteNote(id: string) {
    this.notesSignal.update(notes => notes.filter(note => note.id !== id));
    this.saveNotes();
  }

  togglePin(id: string) {
    this.notesSignal.update(notes => 
      notes.map(note => 
        note.id === id 
          ? { ...note, pinned: !note.pinned }
          : note
      )
    );
    this.saveNotes();
  }

  getNote(id: string): Note | undefined {
    return this.notesSignal().find(note => note.id === id);
  }

  // Методы для поиска
  setSearchQuery(query: string) {
    this.searchQuerySignal.set(query);
  }

  clearSearch() {
    this.searchQuerySignal.set('');
  }

  get isSearching() {
    return computed(() => this.searchQuerySignal().trim().length > 0);
  }

  // Получить закрепленные и обычные заметки
  get pinnedNotes() {
    return computed(() => this.filteredNotes().filter(note => note.pinned));
  }

  get otherNotes() {
    return computed(() => this.filteredNotes().filter(note => !note.pinned));
  }
}