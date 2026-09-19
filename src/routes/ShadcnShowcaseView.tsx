import React, { useState } from 'react';
import { useDynamicTheme } from '@/providers/DynamicThemeProvider';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Sparkles,
  CheckCircle2,
  Info,
  Mail,
  Lock,
  Send,
  Component,
  Palette,
  Layers,
} from 'lucide-react';

export const ShadcnShowcaseView: React.FC = () => {
  const { themeConfig } = useDynamicTheme();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <div className="flex items-center gap-2">
            <Component className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Shadcn UI Component Showcase</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            All components automatically respond to the active backend primary color (<code className="text-primary font-bold">{themeConfig.primaryColor}</code>).
          </p>
        </div>
        <Badge variant="default" className="w-fit gap-1.5 py-1 px-3">
          <Palette className="h-3.5 w-3.5" />
          Primary Palette: {themeConfig.themeName}
        </Badge>
      </div>

      {/* 1. Buttons Showcase */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">Button Variants & Sizes</CardTitle>
          <CardDescription>
            Shadcn UI buttons powered by `class-variance-authority` (cva) and primary HSL CSS custom variables.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="default">Primary Default (#026F4F)</Button>
            <Button variant="secondary">Secondary Variant</Button>
            <Button variant="outline">Outline Variant</Button>
            <Button variant="ghost">Ghost Variant</Button>
            <Button variant="destructive">Destructive Variant</Button>
            <Button variant="link">Link Variant</Button>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button size="sm">Small Size</Button>
            <Button size="default">Default Size</Button>
            <Button size="lg">Large Size</Button>
            <Button size="default" className="gap-2">
              <Send className="h-4 w-4" /> With Icon
            </Button>
            <Button size="default" disabled>Disabled State</Button>
          </div>
        </CardContent>
      </Card>

      {/* 2. Badges & Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">Badges & Tags</CardTitle>
          <CardDescription>Status indicators, metadata pills, and category tags.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Badge variant="default">Primary Badge</Badge>
          <Badge variant="secondary">Secondary Badge</Badge>
          <Badge variant="outline">Outline Badge</Badge>
          <Badge variant="destructive">Destructive Badge</Badge>
          <Badge variant="default" className="gap-1">
            <CheckCircle2 className="h-3 w-3" /> System Operational
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="h-3 w-3" /> Dynamic Theme
          </Badge>
        </CardContent>
      </Card>

      {/* 3. Tabs & Input Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Tab Navigation Component</CardTitle>
            <CardDescription>Interactive tabs powered by Radix UI primitives.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="account" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="password">Password</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="account" className="p-4 rounded-lg border bg-muted/20 space-y-2 mt-3">
                <p className="text-xs text-foreground font-semibold">Account Information</p>
                <p className="text-xs text-muted-foreground">Manage your account details and customer preferences.</p>
              </TabsContent>
              <TabsContent value="password" className="p-4 rounded-lg border bg-muted/20 space-y-2 mt-3">
                <p className="text-xs text-foreground font-semibold">Password & Security</p>
                <p className="text-xs text-muted-foreground">Update your multi-factor authentication and passwords.</p>
              </TabsContent>
              <TabsContent value="settings" className="p-4 rounded-lg border bg-muted/20 space-y-2 mt-3">
                <p className="text-xs text-foreground font-semibold">System Settings</p>
                <p className="text-xs text-muted-foreground">Configure notifications and backend webhook endpoints.</p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Input Fields & Forms</CardTitle>
            <CardDescription>Form controls with focused primary ring highlights.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Email Address</label>
              <div className="relative">
                <Input type="email" placeholder="customer@emsa7.com" className="pl-9 text-xs" />
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Security Passcode</label>
              <div className="relative">
                <Input type="password" placeholder="••••••••••••" className="pl-9 text-xs" />
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. Dialog Modal, Avatars & Skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Dialog Modal Window</CardTitle>
            <CardDescription>Accessible overlay modal dialog powered by Radix UI.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Click the button below to test launching an accessible dialog modal.
            </p>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Layers className="h-4 w-4" /> Open Dialog Modal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>EMSA7 Dialog Modal Title</DialogTitle>
                  <DialogDescription>
                    This modal dialog uses full dynamic theme color styling, backdrop blur, and Radix accessibility hooks.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 text-xs text-muted-foreground space-y-2">
                  <div className="p-3 rounded-lg border bg-primary/10 text-primary font-medium flex items-center gap-2">
                    <Info className="h-4 w-4" /> Active Backend Primary: {themeConfig.primaryColor}
                  </div>
                  <p>All action buttons in this modal reflect the primary color scheme dynamically.</p>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button onClick={() => setDialogOpen(false)}>Confirm Action</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Avatars & Skeleton Loaders</CardTitle>
            <CardDescription>Loading states and user profile avatar indicators.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-10 w-10 border-2 border-primary">
                <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" alt="Avatar" />
                <AvatarFallback>EM</AvatarFallback>
              </Avatar>
              <Avatar className="h-10 w-10 border-2 border-primary">
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs font-bold text-foreground">Aminul Islam</p>
                <p className="text-[11px] text-muted-foreground">Customer System Administrator</p>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t">
              <p className="text-xs font-semibold text-muted-foreground">Skeleton Loading Fallbacks:</p>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
