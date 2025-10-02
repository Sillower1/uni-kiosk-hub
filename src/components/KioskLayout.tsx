import { ReactNode } from 'react';
import { BottomNavigation } from './BottomNavigation';
import OnScreenKeyboard from './OnScreenKeyboard';

interface KioskLayoutProps {
  children: ReactNode;
}

export const KioskLayout = ({ children }: KioskLayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main Content Area */}
      <main className="flex-1 pb-20 overflow-hidden">
        {children}
      </main>
      
      {/* Global On-Screen Keyboard */}
      <OnScreenKeyboard />

      {/* Bottom Navigation - Always visible */}
      <BottomNavigation />
    </div>
  );
};