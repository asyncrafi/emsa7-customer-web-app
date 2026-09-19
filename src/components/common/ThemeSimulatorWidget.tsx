import React, { useState } from 'react';
import { useDynamicTheme } from '@/providers/DynamicThemeProvider';
import { PRESET_PRIMARY_COLORS } from '@/core/config/themeConfig';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Palette, Check, RefreshCw, Sparkles, Layers } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';

export const ThemeSimulatorWidget: React.FC = () => {
  const { themeConfig, updatePrimaryColor, isUpdating } = useDynamicTheme();
  const [customHex, setCustomHex] = useState(themeConfig.primaryColor);
  const [open, setOpen] = useState(false);

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (/^#[0-9A-F]{6}$/i.test(customHex)) {
      updatePrimaryColor(customHex, `Custom Hex (${customHex})`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 border-primary/30 hover:border-primary">
          <Palette className="h-4 w-4 text-primary animate-pulse" />
          <span className="hidden sm:inline font-medium">Backend Primary Color:</span>
          <span
            className="inline-block h-3.5 w-3.5 rounded-full border border-white/50 shadow-xs"
            style={{ backgroundColor: themeConfig.primaryColor }}
          />
          <code className="text-xs font-semibold">{themeConfig.primaryColor}</code>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Dynamic Backend Primary Color Architecture</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Simulates real-time backend primary color payload updates via TanStack Query.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-lg border bg-muted/30 p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-muted-foreground">Active Primary Color:</span>
              <Badge variant="default" className="gap-1.5 font-mono">
                <span
                  className="h-2 w-2 rounded-full bg-white inline-block"
                  style={{ backgroundColor: themeConfig.primaryColor }}
                />
                {themeConfig.primaryColor}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground flex justify-between">
              <span>Theme Preset Name:</span>
              <span className="font-medium text-foreground">{themeConfig.themeName}</span>
            </div>
            <div className="text-xs text-muted-foreground flex justify-between">
              <span>CSS Variable Tuple (--primary):</span>
              <span className="font-mono text-primary font-bold">{themeConfig.primaryHsl}</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground flex items-center gap-1 mb-2">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Preset Backend Primary Colors:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_PRIMARY_COLORS.map((preset) => {
                const isSelected = themeConfig.primaryColor.toLowerCase() === preset.hex.toLowerCase();
                return (
                  <button
                    key={preset.hex}
                    type="button"
                    onClick={() => updatePrimaryColor(preset.hex, preset.name)}
                    disabled={isUpdating}
                    className={`flex items-center gap-2.5 p-2 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary/10 ring-1 ring-primary font-medium'
                        : 'border-border bg-card hover:bg-accent'
                    }`}
                  >
                    <span
                      className="h-4 w-4 rounded-full border shadow-xs shrink-0 flex items-center justify-center text-white"
                      style={{ backgroundColor: preset.hex }}
                    >
                      {isSelected && <Check className="h-2.5 w-2.5" />}
                    </span>
                    <span className="truncate">{preset.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleApplyCustom} className="space-y-2 pt-1 border-t">
            <label className="text-xs font-semibold text-foreground">Custom Hex Input:</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type="text"
                  value={customHex}
                  onChange={(e) => setCustomHex(e.target.value)}
                  placeholder="#026F4F"
                  className="font-mono text-xs pl-8"
                />
                <span
                  className="absolute left-2.5 top-2.5 h-4 w-4 rounded-full border"
                  style={{ backgroundColor: customHex }}
                />
              </div>
              <Button type="submit" size="sm" disabled={isUpdating} className="gap-1 text-xs">
                {isUpdating ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : 'Apply Color'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
