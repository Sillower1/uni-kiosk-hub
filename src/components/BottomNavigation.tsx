import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Camera, 
  Megaphone, 
  Map, 
  Calendar, 
  Users, 
  ClipboardList,
  BarChart3 
} from 'lucide-react';

const navigationItems = [
  { id: 'photo', label: 'Hatıra Fotoğrafı', icon: Camera, path: '/photo' },
  { id: 'announcements', label: 'Duyurular', icon: Megaphone, path: '/announcements' },
  { id: 'map', label: 'Harita', icon: Map, path: '/map' },
  { id: 'schedule', label: 'Ders Programı', icon: Calendar, path: '/schedule' },
  { id: 'faculty', label: 'Öğretim Üyeleri', icon: Users, path: '/faculty' },
  { id: 'surveys', label: 'Anketler', icon: ClipboardList, path: '/surveys' },
];

export const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg">
      <div className="grid grid-cols-6 gap-1 p-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 min-h-[4rem]",
                "hover:bg-secondary active:scale-95",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-7 h-7 mb-1" />
              <span className="text-xs font-medium text-center leading-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};