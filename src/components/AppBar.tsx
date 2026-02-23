import { Plus, Settings, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface AppBarProps {
  onAddClick: () => void;
  onSettingsClick: () => void;
  darkMode: boolean;
  onToggleDark: () => void;
}

export function AppBar({
  onAddClick,
  onSettingsClick,
  darkMode,
  onToggleDark,
}: AppBarProps) {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="fixed top-0 left-0 right-0 z-50 app-safe-top"
    >
      <div className="bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-6 h-16 max-w-lg mx-auto">
          
          {/* LOGO */}
          <div className="flex items-center">
            <img
              src="/logo.png"
              alt="Adhivio"
              className="h-8 w-auto object-contain"
            />
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-2">
            
            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleDark}
              className="text-muted-foreground hover:text-foreground"
            >
              {darkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>

            {/* Settings */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onSettingsClick}
              className="text-muted-foreground hover:text-foreground"
            >
              <Settings className="w-5 h-5" />
            </Button>

            {/* Add Button */}
            <Button
              size="sm"
              onClick={onAddClick}
              className="ml-2 gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add
            </Button>

          </div>
        </div>
      </div>
    </motion.header>
  );
}