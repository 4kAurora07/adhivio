import { useState, useCallback } from 'react';
import { AppBar } from '@/components/AppBar';
import { ReminderList } from '@/components/ReminderList';
import { ReminderForm } from '@/components/ReminderForm';
import { SettingsPanel } from '@/components/SettingsPanel';
import { InstallPrompt } from '@/components/InstallPrompt';
import { BottomNav, NavTab } from '@/components/BottomNav';
import { useReminders } from '@/hooks/useReminders';
import { useSettings } from '@/hooks/useSettings';
import { useNotifications } from '@/hooks/useNotifications';
import { Reminder } from '@/types/reminder';

const Index = () => {
  const {
    activeReminders,
    completedReminders,
    addReminder,
    updateReminder,
    deleteReminder,
    completeReminder,
    snoozeReminder,
    markNotified,
  } = useReminders();

  const { settings, updateSettings } = useSettings();
  useNotifications(
    [...activeReminders, ...completedReminders],
    settings,
    markNotified
  );

  const [formOpen, setFormOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [activeTab, setActiveTab] = useState<NavTab>('home');

  const handleAdd = useCallback(() => {
    setEditingReminder(null);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((reminder: Reminder) => {
    setEditingReminder(reminder);
    setFormOpen(true);
  }, []);

  const handleSave = useCallback(
    (data: Omit<Reminder, 'id' | 'completed' | 'notified'>) => {
      if (editingReminder) {
        updateReminder(editingReminder.id, { ...data, notified: false });
      } else {
        addReminder(data);
      }
    },
    [editingReminder, addReminder, updateReminder]
  );

  const handleTabChange = useCallback((tab: NavTab) => {
    if (tab === 'settings') {
      setSettingsOpen(true);
    } else {
      setActiveTab(tab);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <AppBar
        onAddClick={handleAdd}
        onSettingsClick={() => setSettingsOpen(true)}
        darkMode={settings.darkMode}
        onToggleDark={() => updateSettings({ darkMode: !settings.darkMode })}
      />

      <main className="pt-24 pb-24 px-4 max-w-lg mx-auto">
        <div className="pt-4">
          {activeTab === 'home' ? (
            <ReminderList
              activeReminders={activeReminders}
              completedReminders={completedReminders}
              onComplete={completeReminder}
              onSnooze={snoozeReminder}
              onDelete={deleteReminder}
              onEdit={handleEdit}
              defaultSnoozeMinutes={settings.defaultSnoozeMinutes}
            />
          ) : (
            <ReminderList
              activeReminders={[]}
              completedReminders={completedReminders}
              onComplete={completeReminder}
              onSnooze={snoozeReminder}
              onDelete={deleteReminder}
              onEdit={handleEdit}
              defaultSnoozeMinutes={settings.defaultSnoozeMinutes}
            />
          )}
        </div>
      </main>

      <BottomNav
        active={activeTab}
        onChange={handleTabChange}
        completedCount={completedReminders.length}
      />

      {formOpen && (
        <ReminderForm
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onSave={handleSave}
          editingReminder={editingReminder}
          defaultSound={settings.defaultSound}
          volume={settings.volume}
        />
      )}

      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onUpdate={updateSettings}
      />

      <InstallPrompt />
    </div>
  );
};

export default Index;
