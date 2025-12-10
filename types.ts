
export enum ThemeMode {
  Classic = 'CLASSIC',
  Modern = 'MODERN',
  Nature = 'NATURE',
  Dark = 'DARK',
  Light = 'LIGHT'
}

export interface VerseData {
  reference: string;
  text: string;
  book: string;
  chapter: number;
  verse: number;
  version: string;
  tags?: string[];
}

export interface AIInsight {
  context: string;
  theology: string;
  application: string;
}

export interface PresentationSettings {
  fontSize: number;
  fontMode: 'auto' | 'manual';
  theme: ThemeMode;
  showReference: boolean;
  alignment: 'left' | 'center' | 'right';
}

export interface HistoryItem {
  id: string;
  verse: VerseData;
  timestamp: number;
}

export type BroadcastMessage = 
  | { type: 'STATE_UPDATE'; payload: { verse: VerseData | null; settings: PresentationSettings } }
  | { type: 'REQUEST_STATE' };
