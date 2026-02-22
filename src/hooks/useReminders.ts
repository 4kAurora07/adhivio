import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Reminder } from '@/types/reminder';

const STORAGE_KEY = 'reminders_data';

function loadReminders(): Reminder[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveReminders(reminders: Reminder[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
  } catch (e) {
    console.warn('Failed to save reminders to localStorage', e);
  }
}

export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>(loadReminders);

  useEffect(() => {
    saveReminders(reminders);
  }, [reminders]);

  const addReminder = useCallback((data: Omit<Reminder, 'id' | 'completed' | 'notified'>) => {
    const reminder: Reminder = { ...data, id: uuidv4(), completed: false, notified: false };
    setReminders(prev => [reminder, ...prev]);
    return reminder;
  }, []);

  const updateReminder = useCallback((id: string, data: Partial<Reminder>) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
  }, []);

  const deleteReminder = useCallback((id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  }, []);

  const completeReminder = useCallback((id: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, completed: true } : r));
  }, []);

  const snoozeReminder = useCallback((id: string, minutes: number) => {
    const snoozedUntil = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    setReminders(prev => prev.map(r => r.id === id ? { ...r, snoozedUntil, notified: false } : r));
  }, []);

  const markNotified = useCallback((id: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, notified: true } : r));
  }, []);

  const activeReminders = reminders
    .filter(r => !r.completed)
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

  const completedReminders = reminders
    .filter(r => r.completed)
    .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());

  return {
    reminders,
    activeReminders,
    completedReminders,
    addReminder,
    updateReminder,
    deleteReminder,
    completeReminder,
    snoozeReminder,
    markNotified,
  };
}
