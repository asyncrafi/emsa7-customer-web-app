import React from 'react';
import { ThemeSimulatorWidget } from './ThemeSimulatorWidget';
import { Shield, LayoutDashboard, User, Component, QrCode } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type TableSession } from '@/core/services/qrScanService';

export interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeTableSession: TableSession | null;
  onOpenQrScanner: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  activeTableSession,
  onOpenQrScanner,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md transition-transform hover:scale-105">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-foreground">EMSA7</span>
              {activeTableSession ? (
                <Badge variant="default" className="text-[10px] px-2 py-0.5 gap-1 font-bold">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                  {activeTableSession.tableName}
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 uppercase tracking-wide">
                  Customer App
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground hidden sm:block">Clean Architecture & System Design</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border/50">
          <Button
            variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('dashboard')}
            className="gap-1.5 text-xs h-8"
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            Dashboard
          </Button>
          <Button
            variant={activeTab === 'components' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('components')}
            className="gap-1.5 text-xs h-8"
          >
            <Component className="h-3.5 w-3.5" />
            Shadcn UI Showcase
          </Button>
          <Button
            variant={activeTab === 'profile' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('profile')}
            className="gap-1.5 text-xs h-8"
          >
            <User className="h-3.5 w-3.5" />
            Customer Profile
          </Button>
        </nav>

        {/* Right Action: QR Scanner & Backend Theme Simulator */}
        <div className="flex items-center gap-2">
          <Button
            onClick={onOpenQrScanner}
            size="sm"
            className="gap-1.5 text-xs font-semibold shadow-xs"
          >
            <QrCode className="h-4 w-4" />
            <span className="hidden sm:inline">Rescan Table QR</span>
          </Button>

          <ThemeSimulatorWidget />
        </div>
      </div>
    </header>
  );
};
