import React from 'react';
import { useDynamicTheme } from '@/providers/DynamicThemeProvider';
import { useCustomerQuery } from '@/hooks/useCustomerQuery';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { type TableSession } from '@/core/services/qrScanService';
import {
  Layers,
  Palette,
  TrendingUp,
  Activity,
  Zap,
  ArrowUpRight,
  Database,
  CheckCircle2,
  QrCode,
} from 'lucide-react';

export interface DashboardViewProps {
  onNavigateToShowcase: () => void;
  activeTableSession: TableSession | null;
  onOpenQrScanner: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateToShowcase,
  activeTableSession,
  onOpenQrScanner,
}) => {
  const { themeConfig } = useDynamicTheme();
  const { data: customer, isLoading } = useCustomerQuery();

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/15 via-primary/5 to-background border border-primary/20 p-6 sm:p-8 shadow-xs">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
            <Zap className="h-3.5 w-3.5 fill-primary" /> System Architecture Active
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            EMSA7 Customer Management System
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Built with Clean System Architecture, Camera-based Table QR Scanner, TanStack Query data layer, and dynamic backend primary color engine (<code className="text-primary font-bold">#026F4F</code>).
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button onClick={onOpenQrScanner} className="gap-2 text-xs font-semibold shadow-md">
              <QrCode className="h-4 w-4" /> Open Camera QR Scanner
            </Button>
            <Button onClick={onNavigateToShowcase} variant="outline" className="gap-2 text-xs font-medium">
              Shadcn UI Showcase <ArrowUpRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Decorative Background Blob */}
        <div
          className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ backgroundColor: themeConfig.primaryColor }}
        />
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Active QR Table Session */}
        <Card className="border-primary/30 hover:border-primary/60 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Scanned Table QR</CardTitle>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <QrCode className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {activeTableSession ? (
              <div>
                <div className="text-lg font-bold text-primary flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                  {activeTableSession.tableName}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  ID: <span className="font-mono">{activeTableSession.tableId}</span>
                </p>
              </div>
            ) : (
              <div>
                <div className="text-sm font-bold text-foreground">No Table Scanned</div>
                <button
                  type="button"
                  onClick={onOpenQrScanner}
                  className="text-xs text-primary underline mt-1 font-medium cursor-pointer"
                >
                  Click to scan table QR code
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Metric 2: Primary Color */}
        <Card className="hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Primary Color Token</CardTitle>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Palette className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold flex items-center gap-2">
              <span
                className="h-4 w-4 rounded-full border shadow-xs inline-block"
                style={{ backgroundColor: themeConfig.primaryColor }}
              />
              <span className="font-mono text-base">{themeConfig.primaryColor}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-primary" /> Backend Synced via CSS Var
            </p>
          </CardContent>
        </Card>

        {/* Metric 3: TanStack Query */}
        <Card className="hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">TanStack Query State</CardTitle>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Database className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-foreground">
              {isLoading ? 'Fetching...' : 'Cached & Fresh'}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Activity className="h-3 w-3 text-primary" /> Automatic Stale-Time Cache
            </p>
          </CardContent>
        </Card>

        {/* Metric 4: Customer Balance */}
        <Card className="hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Customer Balance</CardTitle>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-24" />
            ) : (
              <div className="text-xl font-extrabold text-foreground">
                ${customer?.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Enterprise Subscription Account</p>
          </CardContent>
        </Card>
      </div>

      {/* System Architecture Explanation Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <Layers className="h-4 w-4 text-primary" /> Clean System Architecture Principles
              </CardTitle>
              <CardDescription>
                Designed according to clean architecture, high reusability, and backend theme adaptability.
              </CardDescription>
            </div>
            <Badge variant="secondary" className="font-mono text-xs">v1.0.0 Architecture</Badge>
          </div>
        </CardHeader>

        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="rounded-lg border p-4 space-y-2 bg-muted/20">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <div className="h-2 w-2 rounded-full bg-primary" /> 1. Live Camera QR Scanner
            </div>
            <p className="text-xs text-muted-foreground leading-normal">
              Requests browser camera permission on entry (`facingMode: environment`). Features screenshot-matched corner reticles, glowing laser scan beam animation, and demo fallbacks.
            </p>
          </div>

          <div className="rounded-lg border p-4 space-y-2 bg-muted/20">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <div className="h-2 w-2 rounded-full bg-primary" /> 2. Dynamic Theme Engine (#026F4F)
            </div>
            <p className="text-xs text-muted-foreground leading-normal">
              Primary color token (<code className="text-primary font-bold">#026F4F</code>) is injected dynamically into CSS custom variables (`:root --primary`). When the backend API payload changes, the whole app theme updates without code modifications.
            </p>
          </div>

          <div className="rounded-lg border p-4 space-y-2 bg-muted/20">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <div className="h-2 w-2 rounded-full bg-primary" /> 3. Modular Shadcn Components
            </div>
            <p className="text-xs text-muted-foreground leading-normal">
              Radix UI primitives wrapped with Tailwind CSS variance utilities (`cva` & `cn`). Ensures maximum accessibility, customization, and consistent design language across all screens.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
