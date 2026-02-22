import { useState, useRef } from 'react';
import { Reminder, Priority, RepeatType, BuiltInSound, BUILT_IN_SOUNDS } from '@/types/reminder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSounds } from '@/hooks/useSounds';
import { Volume2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ReminderFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<Reminder, 'id' | 'completed' | 'notified'>) => void;
  editingReminder?: Reminder | null;
  defaultSound: BuiltInSound;
  volume: number;
}

export function ReminderForm({ open, onClose, onSave, editingReminder, defaultSound, volume }: ReminderFormProps) {
  const { playBuiltIn } = useSounds();
  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(editingReminder?.title ?? '');
  const [description, setDescription] = useState(editingReminder?.description ?? '');
  const [dateTime, setDateTime] = useState(
    editingReminder?.dateTime
      ? new Date(editingReminder.dateTime).toISOString().slice(0, 16)
      : new Date(Date.now() + 3600000).toISOString().slice(0, 16)
  );
  const [repeat, setRepeat] = useState<RepeatType>(editingReminder?.repeat ?? 'once');
  const [priority, setPriority] = useState<Priority>(editingReminder?.priority ?? 'medium');
  const [sound, setSound] = useState<BuiltInSound | 'custom'>(editingReminder?.sound ?? defaultSound);
  const [customSoundData, setCustomSoundData] = useState<string | undefined>(editingReminder?.customSoundData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      toast.error('Please enter a title');
      return;
    }
    if (trimmedTitle.length > 200) {
      toast.error('Title must be less than 200 characters');
      return;
    }
    if (!dateTime) {
      toast.error('Please select a date and time');
      return;
    }

    const parsedDate = new Date(dateTime);
    if (isNaN(parsedDate.getTime())) {
      toast.error('Invalid date/time');
      return;
    }

    try {
      onSave({
        title: trimmedTitle,
        description: description.trim().slice(0, 1000) || undefined,
        dateTime: parsedDate.toISOString(),
        repeat,
        priority,
        sound,
        customSoundData,
      });
      toast.success(editingReminder ? 'Reminder updated' : 'Reminder created');
      onClose();
    } catch (err) {
      toast.error('Failed to save reminder');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Sound file must be under 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCustomSoundData(reader.result as string);
      setSound('custom');
    };
    reader.onerror = () => toast.error('Failed to read file');
    reader.readAsDataURL(file);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingReminder ? 'Edit Reminder' : 'New Reminder'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Team standup call" maxLength={200} required />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional details..." rows={2} maxLength={1000} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="datetime">Date & Time *</Label>
            <Input id="datetime" type="datetime-local" value={dateTime} onChange={e => setDateTime(e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Repeat</Label>
              <Select value={repeat} onValueChange={(v) => setRepeat(v as RepeatType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="once">Once</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">🟢 Low</SelectItem>
                  <SelectItem value="medium">🟡 Medium</SelectItem>
                  <SelectItem value="high">🔴 High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Notification Sound</Label>
            <div className="flex items-center gap-2">
              <Select value={sound} onValueChange={(v) => setSound(v as BuiltInSound | 'custom')}>
                <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {BUILT_IN_SOUNDS.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                  <SelectItem value="custom">Custom Sound</SelectItem>
                </SelectContent>
              </Select>
              {sound !== 'custom' && (
                <Button type="button" variant="outline" size="icon" onClick={() => playBuiltIn(sound, volume)}>
                  <Volume2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {sound === 'custom' && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  Upload Sound
                </Button>
                {customSoundData && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => setCustomSoundData(undefined)} className="h-7 w-7">
                    <X className="w-3.5 h-3.5" />
                  </Button>
                )}
                {customSoundData && <span className="text-xs text-muted-foreground">Sound loaded ✓</span>}
              </div>
              <input ref={fileRef} type="file" accept="audio/mp3,audio/wav,audio/*" className="hidden" onChange={handleFileUpload} />
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1">
              {editingReminder ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
