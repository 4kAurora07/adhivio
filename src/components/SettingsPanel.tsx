import { AppSettings, BUILT_IN_SOUNDS, BuiltInSound } from '@/types/reminder';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSounds } from '@/hooks/useSounds';
import { Volume2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdate: (partial: Partial<AppSettings>) => void;
}

export function SettingsPanel({ open, onClose, settings, onUpdate }: SettingsPanelProps) {
  const { playBuiltIn } = useSounds();

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Notifications</Label>
              <p className="text-xs text-muted-foreground">Enable reminder alerts</p>
            </div>
            <Switch checked={settings.notificationsEnabled} onCheckedChange={v => onUpdate({ notificationsEnabled: v })} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Dark Mode</Label>
              <p className="text-xs text-muted-foreground">Switch appearance</p>
            </div>
            <Switch checked={settings.darkMode} onCheckedChange={v => onUpdate({ darkMode: v })} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Default Ringtone</Label>
            <div className="flex items-center gap-2">
              <Select value={settings.defaultSound} onValueChange={v => onUpdate({ defaultSound: v as BuiltInSound })}>
                <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {BUILT_IN_SOUNDS.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={() => playBuiltIn(settings.defaultSound, settings.volume)}>
                <Volume2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Volume ({Math.round(settings.volume * 100)}%)</Label>
            <Slider
              value={[settings.volume]}
              onValueChange={([v]) => onUpdate({ volume: v })}
              min={0}
              max={1}
              step={0.05}
              className="w-full"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Default Snooze</Label>
            <Select value={String(settings.defaultSnoozeMinutes)} onValueChange={v => onUpdate({ defaultSnoozeMinutes: Number(v) })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 minutes</SelectItem>
                <SelectItem value="10">10 minutes</SelectItem>
                <SelectItem value="15">15 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" className="w-full" onClick={onClose}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
