import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Camera, 
  Megaphone, 
  Map, 
  Calendar, 
  Users, 
  ClipboardList,
  BarChart3,
  Home
} from 'lucide-react';

const navigationItems = [
  { id: 'photo', label: 'Hatıra Fotoğrafı', icon: Camera, path: '/photo' },
  { id: 'announcements', label: 'Duyurular', icon: Megaphone, path: '/announcements' },
  { id: 'map', label: 'Harita', icon: Map, path: '/map' },
  { id: 'schedule', label: 'Ders Programı', icon: Calendar, path: '/schedule' },
  { id: 'faculty', label: 'Öğretim Üyeleri', icon: Users, path: '/faculty' },
  { id: 'surveys', label: 'Anketler', icon: ClipboardList, path: '/surveys' },
];

const homeItem = { id: 'home', label: 'Ana Sayfa', icon: Home, path: '/' };

export const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg">
      <div className="flex items-center p-2 gap-2">
        {/* Left side navigation items */}
        <div className="flex-1 grid grid-cols-3 gap-1">
          {navigationItems.slice(0, 3).map((item) => {
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
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium text-center leading-tight">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Center home button */}
        <div className="px-4">
          <button
            onClick={() => navigate(homeItem.path)}
            className={cn(
              "flex flex-col items-center justify-center p-4 rounded-full transition-all duration-200 min-h-[5rem] min-w-[5rem]",
              "bg-gradient-to-br from-primary to-primary-hover text-primary-foreground shadow-lg hover:shadow-xl active:scale-95",
              "border-2 border-white/20",
              location.pathname === homeItem.path && "ring-4 ring-primary/30"
            )}
          >
            <Home className="w-8 h-8 mb-1" />
            <span className="text-xs font-bold text-center leading-tight">
              {homeItem.label}
            </span>
          </button>
        </div>

        {/* Right side navigation items */}
        <div className="flex-1 grid grid-cols-3 gap-1">
          {navigationItems.slice(3, 6).map((item) => {
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
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium text-center leading-tight">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};