import { Home, CheckCircle2, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

export type NavTab = 'home' | 'completed' | 'settings';

interface BottomNavProps {
  active: NavTab;
  onChange: (tab: NavTab) => void;
  completedCount: number;
}

const tabs = [
  { id: 'home' as NavTab, label: 'Home', icon: Home },
  { id: 'completed' as NavTab, label: 'Completed', icon: CheckCircle2 },
  { id: 'settings' as NavTab, label: 'Settings', icon: Settings },
];

export function BottomNav({ active, onChange, completedCount }: BottomNavProps) {
  return (
    <motion.nav
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-0 left-0 right-0 z-50 app-safe-bottom"
    >
      <div className="bg-background/80 backdrop-blur-xl border-t border-border">
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {tabs.map((tab) => {
            const isActive = active === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={`relative flex flex-col items-center gap-0.5 py-2 px-4 transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <div className="relative">
                  <tab.icon className="w-5 h-5" />
                  {tab.id === 'completed' && completedCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center px-1">
                      {completedCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium">{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -top-px left-2 right-2 h-0.5 rounded-full bg-primary"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}
