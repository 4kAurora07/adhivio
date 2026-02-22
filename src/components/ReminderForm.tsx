import { useState, useRef, useMemo, useCallback } from 'react';
import { Reminder, Priority, RepeatType, BuiltInSound, BUILT_IN_SOUNDS } from '@/types/reminder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useSounds } from '@/hooks/useSounds';
import { Volume2, Upload, X, CalendarIcon, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { format, isToday, isBefore, startOfDay, setHours, setMinutes } from 'date-fns';
import { cn } from '@/lib/utils';
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
  existingReminders?: Reminder[];
}

function getDefaultDateTime(): Date {
  const now = new Date();
  // Round up to next 5-minute mark + 1 hour
  const minutes = Math.ceil(now.getMinutes() / 5) * 5;
  const d = new Date(now);
  d.setHours(now.getHours() + 1, minutes, 0, 0);
  return d;
}

function generateTimeSlots(selectedDate: Date | undefined): { value: string; label: string; disabled: boolean }[] {
  const slots: { value: string; label: string; disabled: boolean }[] = [];
  const now = new Date();
  const isSelectedToday = selectedDate ? isToday(selectedDate) : false;

  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 5) {
      const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
      const ampm = h < 12 ? 'AM' : 'PM';
      const label = `${hour12}:${String(m).padStart(2, '0')} ${ampm}`;

      let disabled = false;
      if (isSelectedToday) {
        const slotDate = new Date(selectedDate!);
        slotDate.setHours(h, m, 0, 0);
        disabled = slotDate.getTime() <= now.getTime();
      }

      slots.push({ value: timeStr, label, disabled });
    }
  }
  return slots;
}

export function ReminderForm({ open, onClose, onSave, editingReminder, defaultSound, volume, existingReminders = [] }: ReminderFormProps) {
  const { playBuiltIn } = useSounds();
  const fileRef = useRef<HTMLInputElement>(null);

  const defaultDT = editingReminder?.dateTime
    ? new Date(editingReminder.dateTime)
    : getDefaultDateTime();

  const [title, setTitle] = useState(editingReminder?.title ?? '');
  const [description, setDescription] = useState(editingReminder?.description ?? '');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(defaultDT);
  const [selectedHour, setSelectedHour] = useState(String(defaultDT.getHours()).padStart(2, '0'));
  const [selectedMinute, setSelectedMinute] = useState(
    String(Math.floor(defaultDT.getMinutes() / 5) * 5).padStart(2, '0')
  );
  const [repeat, setRepeat] = useState<RepeatType>(editingReminder?.repeat ?? 'once');
  const [priority, setPriority] = useState<Priority>(editingReminder?.priority ?? 'medium');
  const [sound, setSound] = useState<BuiltInSound | 'custom'>(editingReminder?.sound ?? defaultSound);
  const [customSoundData, setCustomSoundData] = useState<string | undefined>(editingReminder?.customSoundData);
  const [dateError, setDateError] = useState('');
  const [calendarOpen, setCalendarOpen] = useState(false);

  const timeValue = `${selectedHour}:${selectedMinute}`;

  const timeSlots = useMemo(() => generateTimeSlots(selectedDate), [selectedDate]);

  const computedDateTime = useMemo(() => {
    if (!selectedDate) return null;
    try {
      const d = new Date(selectedDate);
      d.setHours(parseInt(selectedHour), parseInt(selectedMinute), 0, 0);
      return d;
    } catch {
      return null;
    }
  }, [selectedDate, selectedHour, selectedMinute]);

  const isDateTimeValid = useMemo(() => {
    if (!computedDateTime) return false;
    return computedDateTime.getTime() > Date.now();
  }, [computedDateTime]);

  const handleDateSelect = useCallback((date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
    setDateError('');
    setCalendarOpen(false);

    // If selecting today, ensure time is valid
    if (isToday(date)) {
      const now = new Date();
      const currentH = now.getHours();
      const currentM = Math.ceil(now.getMinutes() / 5) * 5;
      const selH = parseInt(selectedHour);
      const selM = parseInt(selectedMinute);

      if (selH < currentH || (selH === currentH && selM <= currentM)) {
        // Reset to next valid time
        const nextH = currentM >= 55 ? currentH + 1 : currentH;
        const nextM = currentM >= 55 ? 0 : currentM + 5;
        if (nextH < 24) {
          setSelectedHour(String(nextH).padStart(2, '0'));
          setSelectedMinute(String(nextM).padStart(2, '0'));
        } else {
          setDateError('No valid time left today. Please select tomorrow.');
        }
      }
    }
  }, [selectedHour, selectedMinute]);

  const handleTimeChange = useCallback((value: string) => {
    const [h, m] = value.split(':');
    setSelectedHour(h);
    setSelectedMinute(m);
    setDateError('');

    // Validate immediately
    if (selectedDate && isToday(selectedDate)) {
      const now = new Date();
      const testDate = new Date(selectedDate);
      testDate.setHours(parseInt(h), parseInt(m), 0, 0);
      if (testDate.getTime() <= now.getTime()) {
        setDateError('Cannot select a past time');
      }
    }
  }, [selectedDate]);

  const isDuplicate = useMemo(() => {
    if (!title.trim() || !computedDateTime) return false;
    return existingReminders.some(r => {
      if (editingReminder && r.id === editingReminder.id) return false;
      return r.title.toLowerCase() === title.trim().toLowerCase()
        && Math.abs(new Date(r.dateTime).getTime() - computedDateTime.getTime()) < 60000;
    });
  }, [title, computedDateTime, existingReminders, editingReminder]);

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
    if (!computedDateTime) {
      toast.error('Please select a valid date and time');
      return;
    }
    if (computedDateTime.getTime() <= Date.now()) {
      toast.error('Please select a future date and time');
      setDateError('Must be in the future');
      return;
    }
    if (isDuplicate) {
      toast.error('A reminder with this title and time already exists');
      return;
    }

    try {
      onSave({
        title: trimmedTitle,
        description: description.trim().slice(0, 1000) || undefined,
        dateTime: computedDateTime.toISOString(),
        repeat,
        priority,
        sound,
        customSoundData,
      });
      toast.success(editingReminder ? 'Reminder updated' : 'Reminder created');
      onClose();
    } catch {
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
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Team standup call"
              maxLength={200}
              required
            />
            {isDuplicate && (
              <p className="text-xs text-destructive">A similar reminder already exists</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Optional details..."
              rows={2}
              maxLength={1000}
            />
          </div>

          {/* Date Picker */}
          <div className="space-y-1.5">
            <Label>Date *</Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-11",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={(date) => isBefore(date, startOfDay(new Date()))}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Picker */}
          <div className="space-y-1.5">
            <Label>Time *</Label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Select value={timeValue} onValueChange={handleTimeChange}>
                  <SelectTrigger className="pl-9 h-11">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[280px]">
                    {timeSlots.map(slot => (
                      <SelectItem
                        key={slot.value}
                        value={slot.value}
                        disabled={slot.disabled}
                        className={slot.disabled ? 'opacity-40' : ''}
                      >
                        {slot.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {dateError && (
              <p className="text-xs text-destructive flex items-center gap-1">
                ⚠ {dateError}
              </p>
            )}
            {computedDateTime && !dateError && (
              <p className="text-xs text-muted-foreground">
                {isDateTimeValid
                  ? `📅 ${format(computedDateTime, "EEEE, MMM d 'at' h:mm a")}`
                  : '⚠ Selected time is in the past'}
              </p>
            )}
          </div>

          {/* Repeat & Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Repeat</Label>
              <Select value={repeat} onValueChange={(v) => setRepeat(v as RepeatType)}>
                <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
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
                <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">🟢 Low</SelectItem>
                  <SelectItem value="medium">🟡 Medium</SelectItem>
                  <SelectItem value="high">🔴 High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Sound */}
          <div className="space-y-1.5">
            <Label>Notification Sound</Label>
            <div className="flex items-center gap-2">
              <Select value={sound} onValueChange={(v) => setSound(v as BuiltInSound | 'custom')}>
                <SelectTrigger className="flex-1 h-11"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {BUILT_IN_SOUNDS.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                  <SelectItem value="custom">Custom Sound</SelectItem>
                </SelectContent>
              </Select>
              {sound !== 'custom' && (
                <Button type="button" variant="outline" size="icon" className="h-11 w-11" onClick={() => playBuiltIn(sound, volume)}>
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

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1 h-11" onClick={onClose}>Cancel</Button>
            <Button
              type="submit"
              className="flex-1 h-11"
              disabled={!isDateTimeValid || isDuplicate || !title.trim()}
            >
              {editingReminder ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
