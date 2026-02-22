import { motion } from 'framer-motion';
import { Check, Clock, Trash2, MoreHorizontal } from 'lucide-react';
import { Reminder } from '@/types/reminder';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format, isPast, isToday, isTomorrow } from 'date-fns';

interface ReminderCardProps {
  reminder: Reminder;
  index: number;
  onComplete: (id: string) => void;
  onSnooze: (id: string, minutes: number) => void;
  onDelete: (id: string) => void;
  onEdit: (reminder: Reminder) => void;
  defaultSnoozeMinutes: number;
}

function formatReminderDate(dateStr: string) {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Invalid date';
    if (isToday(date)) return `Today, ${format(date, 'h:mm a')}`;
    if (isTomorrow(date)) return `Tomorrow, ${format(date, 'h:mm a')}`;
    return format(date, 'dd MMM yyyy, h:mm a');
  } catch {
    return 'Invalid date';
  }
}

const repeatLabels: Record<string, string> = {
  once: '',
  daily: '🔄 Daily',
  weekly: '🔄 Weekly',
};

export function ReminderCard({
  reminder,
  index,
  onComplete,
  onSnooze,
  onDelete,
  onEdit,
  defaultSnoozeMinutes,
}: ReminderCardProps) {
  const isOverdue = isPast(new Date(reminder.dateTime)) && !reminder.completed;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      layout
      className={`group relative rounded-xl border bg-card shadow-sm hover:shadow-md transition-shadow overflow-hidden ${
        reminder.completed ? 'opacity-60' : ''
      }`}
    >
      {/* Priority indicator */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 ${
          reminder.priority === 'high'
            ? 'bg-priority-high'
            : reminder.priority === 'medium'
            ? 'bg-priority-medium'
            : 'bg-priority-low'
        }`}
      />

      <div className="pl-4 pr-3 py-3 flex items-start gap-3">
        {/* Complete button */}
        <button
          onClick={() => onComplete(reminder.id)}
          className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
            reminder.completed
              ? 'bg-accent border-accent'
              : 'border-muted-foreground/40 hover:border-primary'
          }`}
        >
          {reminder.completed && <Check className="w-3 h-3 text-accent-foreground" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => !reminder.completed && onEdit(reminder)}>
          <h3
            className={`text-sm font-semibold text-card-foreground leading-tight ${
              reminder.completed ? 'line-through' : ''
            }`}
          >
            {reminder.title}
          </h3>
          {reminder.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{reminder.description}</p>
          )}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span
              className={`text-xs font-medium ${
                isOverdue ? 'text-destructive' : 'text-muted-foreground'
              }`}
            >
              {isOverdue ? '⚠ Overdue · ' : ''}
              {formatReminderDate(reminder.dateTime)}
            </span>
            {repeatLabels[reminder.repeat] && (
              <span className="text-xs text-muted-foreground">{repeatLabels[reminder.repeat]}</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            {!reminder.completed && (
              <>
                <DropdownMenuItem onClick={() => onSnooze(reminder.id, 5)}>
                  <Clock className="w-4 h-4 mr-2" /> Snooze 5 min
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSnooze(reminder.id, 10)}>
                  <Clock className="w-4 h-4 mr-2" /> Snooze 10 min
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSnooze(reminder.id, 15)}>
                  <Clock className="w-4 h-4 mr-2" /> Snooze 15 min
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onComplete(reminder.id)}>
                  <Check className="w-4 h-4 mr-2" /> Mark complete
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem onClick={() => onDelete(reminder.id)} className="text-destructive focus:text-destructive">
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}
