import { AppSettings, BUILT_IN_SOUNDS, BuiltInSound } from '@/types/reminder';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Volume2, Info } from 'lucide-react';
import { useSounds } from '@/hooks/useSounds';

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdate: (partial: Partial<AppSettings>) => void;
}

export function SettingsPanel({
  open,
  onClose,
  settings,
  onUpdate,
}: SettingsPanelProps) {
  const { playBuiltIn } = useSounds();

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">

          {/* Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-semibold">Notifications</Label>
              <p className="text-xs text-muted-foreground">
                Enable reminder alerts
              </p>
            </div>
            <Switch
              checked={settings.notificationsEnabled}
              onCheckedChange={(v) =>
                onUpdate({ notificationsEnabled: v })
              }
            />
          </div>

          {/* Dark Mode */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-semibold">Dark Mode</Label>
              <p className="text-xs text-muted-foreground">
                Switch appearance
              </p>
            </div>
            <Switch
              checked={settings.darkMode}
              onCheckedChange={(v) => onUpdate({ darkMode: v })}
            />
          </div>

          <Separator />

          {/* Default Sound */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">
              Default Ringtone
            </Label>

            <div className="flex items-center gap-2">
              <Select
                value={settings.defaultSound}
                onValueChange={(v) =>
                  onUpdate({ defaultSound: v as BuiltInSound })
                }
              >
                <SelectTrigger className="flex-1 rounded-xl">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {BUILT_IN_SOUNDS.map((sound) => (
                    <SelectItem
                      key={sound.value}
                      value={sound.value}
                    >
                      {sound.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                className="rounded-xl"
                onClick={() =>
                  playBuiltIn(settings.defaultSound, settings.volume)
                }
              >
                <Volume2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Volume */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">
              Volume ({Math.round(settings.volume * 100)}%)
            </Label>

            <Slider
              value={[settings.volume]}
              onValueChange={([v]) => onUpdate({ volume: v })}
              min={0}
              max={1}
              step={0.05}
              className="w-full"
            />
          </div>

          {/* Default Snooze */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">
              Default Snooze
            </Label>

            <Select
              value={String(settings.defaultSnoozeMinutes)}
              onValueChange={(v) =>
                onUpdate({ defaultSnoozeMinutes: Number(v) })
              }
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="5">5 minutes</SelectItem>
                <SelectItem value="10">10 minutes</SelectItem>
                <SelectItem value="15">15 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Done Button */}
          <Button
            className="w-full rounded-xl bg-[#10B981] hover:bg-[#0ea371] text-white font-medium"
            onClick={onClose}
          >
            Done
          </Button>

          <Separator />

          {/* About Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Info className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                About
              </span>
            </div>

            <div className="rounded-2xl bg-muted/40 p-4 space-y-2 text-xs">
              <SettingRow label="App Name" value="Adhivio" />
              <SettingRow label="Version" value="1.5.0" />
              <SettingRow label="Build Date" value="2026" />
              <SettingRow label="Developer" value="ADAL" />
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}

/* Reusable About Row */
function SettingRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}