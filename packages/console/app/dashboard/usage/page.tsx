'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getUsage, getUsageRecords, type UsageRecord, type UsageDetailRecord } from '@/lib/api';
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils';

const TIME_RANGES = [
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
] as const;

export default function UsagePage() {
  const { getToken } = useAuth();
  const [range, setRange] = useState(30);
  const [usage, setUsage] = useState<UsageRecord[] | null>(null);
  const [records, setRecords] = useState<UsageDetailRecord[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const token = await getToken();
        if (!token) return;
        const [usageRes, recordsRes] = await Promise.all([
          getUsage(token, range),
          getUsageRecords(token, 20, 0),
        ]);
        setUsage(usageRes.usage);
        setRecords(recordsRes.records);
        setError(false);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [getToken, range]);

  const totalCost = usage?.reduce((acc, r) => acc + r.total_cost, 0) ?? 0;
  const totalCalls = usage?.reduce((acc, r) => acc + r.count, 0) ?? 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-1">Usage</h1>
          <p className="body-text mt-2">Track your API usage and costs</p>
        </div>
        <div className="flex gap-1 border border-border p-1">
          {TIME_RANGES.map((r) => (
            <button
              key={r.days}
              onClick={() => setRange(r.days)}
              className={`px-3 py-1 text-sm transition-colors ${
                range === r.days
                  ? 'bg-accent-primary/15 text-accent-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4 text-sm text-destructive">
            Unable to load usage data. The API may be unreachable.
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Cost ({range}d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-serif text-foreground">
                {formatCurrency(totalCost)}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total API Calls ({range}d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-serif text-foreground">
                {totalCalls.toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Daily Breakdown Chart (simple bar visualization) */}
      {usage && usage.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Daily Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1 h-32">
              {usage.map((day) => {
                const maxCost = Math.max(...usage.map((d) => d.total_cost), 0.01);
                const height = Math.max((day.total_cost / maxCost) * 100, 2);
                return (
                  <div
                    key={day.date}
                    className="flex-1 bg-chart-2 hover:bg-chart-1 transition-colors group relative"
                    style={{ height: `${height}%` }}
                    title={`${formatDate(day.date)}: ${formatCurrency(day.total_cost)} (${day.count} calls)`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between mt-2">
              <span className="caption">{usage[0] && formatDate(usage[0].date)}</span>
              <span className="caption">
                {usage[usage.length - 1] && formatDate(usage[usage.length - 1].date)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent API Calls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Recent API Calls
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : records && records.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Operation</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <Badge variant="outline">{record.operation}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {record.model}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {record.provider}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {formatCurrency(record.estimated_cost_usd)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground text-xs">
                      {formatRelativeTime(record.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-12 text-center">
              <p className="body-small">No API calls yet</p>
              <p className="caption mt-1">
                Usage will appear here after your first API call
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
