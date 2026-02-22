import { Bell, Plus, Settings, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface AppBarProps {
  onAddClick: () => void;
  onSettingsClick: () => void;
  darkMode: boolean;
  onToggleDark: () => void;
}

export function AppBar({ onAddClick, onSettingsClick, darkMode, onToggleDark }: AppBarProps) {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 app-safe-top"
    >
      <div className="bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Bell className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-bold text-foreground">Reminders</h1>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleDark}
              className="text-muted-foreground hover:text-foreground"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onSettingsClick}
              className="text-muted-foreground hover:text-foreground"
            >
              <Settings className="w-5 h-5" />
            </Button>
            <Button size="sm" onClick={onAddClick} className="ml-1 gap-1.5">
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
