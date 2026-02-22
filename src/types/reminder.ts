export type Priority = 'low' | 'medium' | 'high';
export type RepeatType = 'once' | 'daily' | 'weekly';
export type BuiltInSound = 'alarm' | 'beep' | 'soft-tone' | 'bell' | 'digital-alert';

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  dateTime: string; // ISO string
  repeat: RepeatType;
  priority: Priority;
  sound: BuiltInSound | 'custom';
  customSoundData?: string; // base64 audio data
  completed: boolean;
  snoozedUntil?: string; // ISO string
  notified?: boolean;
}

export interface AppSettings {
  notificationsEnabled: boolean;
  defaultSound: BuiltInSound;
  defaultSnoozeMinutes: number;
  darkMode: boolean;
  volume: number;
}

export const DEFAULT_SETTINGS: AppSettings = {
  notificationsEnabled: true,
  defaultSound: 'bell',
  defaultSnoozeMinutes: 5,
  darkMode: false,
  volume: 0.7,
};

export const BUILT_IN_SOUNDS: { value: BuiltInSound; label: string }[] = [
  { value: 'alarm', label: 'Alarm' },
  { value: 'beep', label: 'Beep' },
  { value: 'soft-tone', label: 'Soft Tone' },
  { value: 'bell', label: 'Bell' },
  { value: 'digital-alert', label: 'Digital Alert' },
];
