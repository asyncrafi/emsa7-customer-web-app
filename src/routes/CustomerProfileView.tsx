import React from 'react';
import { useCustomerQuery } from '@/hooks/useCustomerQuery';
import { useDynamicTheme } from '@/providers/DynamicThemeProvider';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  User,
  Mail,
  Phone,
  Shield,
  CreditCard,
  Calendar,
  CheckCircle,
  Lock,
} from 'lucide-react';

export const CustomerProfileView: React.FC = () => {
  const { data: customer, isLoading } = useCustomerQuery();
  const { themeConfig } = useDynamicTheme();

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <Card className="overflow-hidden border-primary/20">
        <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-background border-b border-primary/10" />
        <CardContent className="relative pt-0 pb-6 px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12">
            <div className="flex items-end gap-4">
              <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                <AvatarImage src={customer?.avatarUrl} alt={customer?.name} />
                <AvatarFallback className="text-xl">EM</AvatarFallback>
              </Avatar>
              <div className="space-y-1 mb-1">
                {isLoading ? (
                  <>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl font-bold tracking-tight text-foreground">{customer?.name}</h1>
                      <Badge variant="default" className="text-xs">
                        {customer?.accountType} Customer
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">{customer?.id}</p>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 mb-1">
              <Button size="sm" className="gap-1.5 text-xs">
                <Shield className="h-3.5 w-3.5" /> Security Dashboard
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Info & Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <User className="h-4 w-4 text-primary" /> Customer Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between py-1 border-b">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-primary" /> Email:
                  </span>
                  <span className="font-semibold text-foreground">{customer?.email}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-primary" /> Phone:
                  </span>
                  <span className="font-semibold text-foreground">{customer?.phone}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-primary" /> Member Since:
                  </span>
                  <span className="font-semibold text-foreground">{customer?.joinedDate}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-primary" /> 2FA Status:
                  </span>
                  <Badge variant="secondary" className="text-[10px] py-0 text-primary font-bold">Enabled</Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" /> Billing & Orders
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-xs text-muted-foreground">Account Balance</span>
              <div className="text-2xl font-black text-foreground">
                EGP {customer?.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="flex items-center justify-between text-xs pt-2 border-t">
              <span className="text-muted-foreground">Completed Orders:</span>
              <span className="font-bold text-foreground">{customer?.totalOrders} Orders</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-primary">
              <Shield className="h-4 w-4" /> Dynamic Theme Sync Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Backend Primary:</span>
              <code className="font-bold text-primary">{themeConfig.primaryColor}</code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Theme Preset:</span>
              <span className="font-medium text-foreground">{themeConfig.themeName}</span>
            </div>
            <div className="pt-2 border-t text-[11px] text-muted-foreground leading-relaxed">
              Customer web app UI components automatically apply backend theme color settings via CSS Custom Properties.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">Recent Billing Transactions</CardTitle>
              <CardDescription>Fetched via TanStack Query with client-side caching.</CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">
              TanStack Query Cached
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] uppercase bg-muted/50 text-muted-foreground border-b">
                  <tr>
                    <th className="py-2.5 px-3">Transaction ID</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y border-b">
                  {customer?.transactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-3 font-mono font-semibold text-primary">{txn.id}</td>
                      <td className="py-3 px-3 font-medium text-foreground">{txn.description}</td>
                      <td className="py-3 px-3">
                        <Badge variant="secondary" className="text-[10px] py-0">{txn.category}</Badge>
                      </td>
                      <td className="py-3 px-3 text-muted-foreground">{txn.date}</td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                          <CheckCircle className="h-3 w-3" /> {txn.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-foreground">
                        EGP {txn.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
