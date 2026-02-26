'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import {
  CreditCard,
  Key,
  BarChart3,
  Layers,
  Film,
  ArrowRight,
  DollarSign,
  Activity,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getBalance, getUsage, type UsageRecord } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

export default function DashboardPage() {
  const { getToken } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [usage, setUsage] = useState<UsageRecord[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const token = await getToken();
        if (!token) return;
        const [balanceRes, usageRes] = await Promise.all([
          getBalance(token),
          getUsage(token, 7),
        ]);
        setBalance(balanceRes.balance);
        setUsage(usageRes.usage);
        setError(false);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [getToken]);

  const totalSpent7d = usage?.reduce((acc, r) => acc + r.total_cost, 0) ?? 0;
  const totalCalls7d = usage?.reduce((acc, r) => acc + r.count, 0) ?? 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="heading-1">Dashboard</h1>
        <p className="body-text mt-2">
          Overview of your oanim account
        </p>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4 text-sm text-destructive">
            Unable to load account data. The API may be unreachable.
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Credit Balance
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-serif text-foreground">
                {balance !== null ? formatCurrency(balance) : '—'}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Spent (7d)
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-serif text-foreground">
                {formatCurrency(totalSpent7d)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              API Calls (7d)
            </CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-serif text-foreground">
                {totalCalls7d.toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="heading-3 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link href="/dashboard/templates">
            <Card className="card-hover cursor-pointer group">
              <CardContent className="p-4 flex items-center gap-3">
                <Layers className="h-5 w-5 text-chart-1" />
                <span className="text-sm text-foreground flex-1">
                  Browse Templates
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/billing">
            <Card className="card-hover cursor-pointer group">
              <CardContent className="p-4 flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-chart-4" />
                <span className="text-sm text-foreground flex-1">
                  Add Credits
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/api-keys">
            <Card className="card-hover cursor-pointer group">
              <CardContent className="p-4 flex items-center gap-3">
                <Key className="h-5 w-5 text-chart-2" />
                <span className="text-sm text-foreground flex-1">
                  Manage API Keys
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/usage">
            <Card className="card-hover cursor-pointer group">
              <CardContent className="p-4 flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-chart-3" />
                <span className="text-sm text-foreground flex-1">
                  View Usage
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <CardTitle className="heading-2">Getting Started</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 flex items-center justify-center bg-chart-1/15 text-chart-1 text-xs font-mono">
                  1
                </span>
                <span className="text-sm font-medium text-foreground">Install the CLI</span>
              </div>
              <code className="block text-xs font-mono text-muted-foreground bg-background p-3 border border-border">
                npm install -g oanim
              </code>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 flex items-center justify-center bg-chart-2/15 text-chart-2 text-xs font-mono">
                  2
                </span>
                <span className="text-sm font-medium text-foreground">Login</span>
              </div>
              <code className="block text-xs font-mono text-muted-foreground bg-background p-3 border border-border">
                oanim login
              </code>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 flex items-center justify-center bg-chart-3/15 text-chart-3 text-xs font-mono">
                  3
                </span>
                <span className="text-sm font-medium text-foreground">Create a project</span>
              </div>
              <code className="block text-xs font-mono text-muted-foreground bg-background p-3 border border-border">
                oanim init my-video
              </code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
