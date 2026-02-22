import { useEffect, useRef, useCallback } from 'react';
import { Reminder, AppSettings } from '@/types/reminder';
import { useSounds } from './useSounds';

export function useNotifications(
  reminders: Reminder[],
  settings: AppSettings,
  markNotified: (id: string) => void
) {
  const { playBuiltIn, playCustom } = useSounds();
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const requestPermission = useCallback(async () => {
    try {
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    } catch (e) {
      console.warn('Failed to request notification permission', e);
    }
  }, []);

  useEffect(() => {
    if (settings.notificationsEnabled) {
      requestPermission();
    }
  }, [settings.notificationsEnabled, requestPermission]);

  useEffect(() => {
    if (!settings.notificationsEnabled) return;

    const check = () => {
      const now = Date.now();
      reminders.forEach(r => {
        if (r.completed || r.notified) return;

        const triggerTime = r.snoozedUntil
          ? new Date(r.snoozedUntil).getTime()
          : new Date(r.dateTime).getTime();

        if (now >= triggerTime) {
          try {
            // Show notification
            if ('Notification' in window && Notification.permission === 'granted') {
              const notification = new Notification(r.title, {
                body: r.description || `Reminder: ${r.title}`,
                icon: '/pwa-192x192.png',
                tag: r.id,
              });
              notification.onclick = () => {
                window.focus();
                notification.close();
              };
            }

            // Also try service worker notification for background support
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
              navigator.serviceWorker.controller.postMessage({
                type: 'SHOW_NOTIFICATION',
                payload: {
                  title: r.title,
                  body: r.description || `Reminder: ${r.title}`,
                  tag: r.id,
                },
              });
            }

            // Play sound
            if (r.sound === 'custom' && r.customSoundData) {
              playCustom(r.customSoundData, settings.volume);
            } else if (r.sound !== 'custom') {
              playBuiltIn(r.sound, settings.volume);
            }
          } catch (e) {
            console.warn('Notification error', e);
          }

          markNotified(r.id);
        }
      });
    };

    intervalRef.current = setInterval(check, 5000);
    check();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [reminders, settings, markNotified, playBuiltIn, playCustom]);

  // Register reminders with service worker for background notifications
  useEffect(() => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const pending = reminders
        .filter(r => !r.completed && !r.notified)
        .map(r => ({
          id: r.id,
          title: r.title,
          body: r.description || `Reminder: ${r.title}`,
          triggerTime: r.snoozedUntil
            ? new Date(r.snoozedUntil).getTime()
            : new Date(r.dateTime).getTime(),
        }));

      navigator.serviceWorker.controller.postMessage({
        type: 'REGISTER_REMINDERS',
        payload: pending,
      });
    }
  }, [reminders]);

  return { requestPermission };
}
