import {
  Briefcase,
  Laptop,
  TrendingUp,
  Building,
  Utensils,
  Car,
  Zap,
  Film,
  HeartPulse,
  GraduationCap,
  Home,
  Circle,
  ShoppingBag,
  Plane,
  Gift,
  type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  briefcase: Briefcase,
  laptop: Laptop,
  'trending-up': TrendingUp,
  building: Building,
  utensils: Utensils,
  car: Car,
  zap: Zap,
  film: Film,
  'heart-pulse': HeartPulse,
  'graduation-cap': GraduationCap,
  home: Home,
  circle: Circle,
  'shopping-bag': ShoppingBag,
  plane: Plane,
  gift: Gift,
};

export function CategoryIcon({ icon, className }: { icon: string; className?: string }) {
  const Icon = iconMap[icon] || Circle;
  return <Icon className={className} />;
}

export const categoryIcons = Object.keys(iconMap);

export const categoryColors = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#ec4899',
];
