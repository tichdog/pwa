export interface Note {
  id: string;
  title: string;
  content: string;
  color: NoteColor; // Используем тип вместо string
  createdAt: Date;
  updatedAt: Date;
  pinned: boolean;
  tags: string[];
}

export type NoteColor = 'blue' | 'green' | 'yellow' | 'pink' | 'purple' | 'gray';

// Вспомогательная функция для проверки цвета
export function isValidNoteColor(color: string): color is NoteColor {
  const validColors: NoteColor[] = ['blue', 'green', 'yellow', 'pink', 'purple', 'gray'];
  return validColors.includes(color as NoteColor);
}

// Функция для безопасного получения цвета
export function getNoteColor(color: string): NoteColor {
  return isValidNoteColor(color) ? color : 'blue';
}