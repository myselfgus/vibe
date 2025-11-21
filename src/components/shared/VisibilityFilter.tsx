import React from 'react';
import { Globe, Lock, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface VisibilityFilterProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const visibilityOptions = [
  { 
    value: 'all', 
    label: 'All', 
    icon: Sparkles,
    color: 'from-violet-500/20 to-purple-500/20',
    activeColor: 'from-violet-500/10 to-purple-500/10'
  },
  { 
    value: 'public', 
    label: 'Public', 
    icon: Globe,
    color: 'from-green-500/20 to-emerald-500/20',
    activeColor: 'from-green-500/10 to-emerald-500/10'
  },
  { 
    value: 'private', 
    label: 'Private', 
    icon: Lock,
    color: 'from-orange-500/20 to-red-500/20',
    activeColor: 'from-orange-500/10 to-red-500/10'
  },
];

export const VisibilityFilter: React.FC<VisibilityFilterProps> = ({
  value,
  onChange,
  className
}) => {
  return (
    <div className={cn(
      "inline-flex items-center rounded-xl bg-card shadow-neomorph-flat p-0.5",
      className
    )}>
      {visibilityOptions.map((option) => {
        const Icon = option.icon;
        const isActive = value === option.value;

        return (
          <motion.button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium prism-transition",
              "outline-none focus-visible:ring-1 focus-visible:ring-accent/30",
              isActive
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground/80",
              !isActive && "hover:bg-muted/30"
            )}
            whileHover={{ scale: isActive ? 1 : 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {isActive && (
              <motion.div
                className={cn(
                  "absolute inset-0 rounded-xl bg-background shadow-metallic iridescent-glow"
                )}
                layoutId="activeBackground"
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 35
                }}
              />
            )}
            <span className="relative flex items-center gap-1.5">
              <Icon className={cn(
                "h-3 w-3 prism-transition",
                isActive && "text-accent"
              )} />
              <span>{option.label}</span>
            </span>
          </motion.button>
        );
      })}
    </div>
  );
};
