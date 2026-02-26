'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getBalance, getPaymentHistory, createCheckout, type Payment } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { DollarSign, Plus, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const CREDIT_AMOUNTS = [5, 10, 25, 50, 100];

export default function BillingPage() {
  const { getToken } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [payments, setPayments] = useState<Payment[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<number | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const token = await getToken();
        if (!token) return;
        const [balanceRes, historyRes] = await Promise.all([
          getBalance(token),
          getPaymentHistory(token),
        ]);
        setBalance(balanceRes.balance);
        setPayments(historyRes.payments);
        setError(false);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [getToken]);

  async function handlePurchase(amount: number) {
    if (amount < 5) return;
    setPurchasing(amount);
    try {
      const token = await getToken();
      if (!token) return;
      const { url } = await createCheckout(token, amount);
      // Validate checkout URL points to Stripe
      const parsed = new URL(url);
      if (!parsed.hostname.endsWith('.stripe.com')) {
        throw new Error('Invalid checkout URL');
      }
      window.location.href = url;
    } catch {
      toast.error('Failed to create checkout session');
      setPurchasing(null);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="heading-1">Billing</h1>
        <p className="body-text mt-2">Manage your credits and payment history</p>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4 text-sm text-destructive">
            Unable to load billing data. The API may be unreachable.
          </CardContent>
        </Card>
      )}

      {/* Balance Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-chart-4/15">
              <DollarSign className="h-5 w-5 text-chart-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Credit Balance
              </CardTitle>
              {loading ? (
                <Skeleton className="h-8 w-32 mt-1" />
              ) : (
                <div className="text-3xl font-serif text-foreground">
                  {balance !== null ? formatCurrency(balance) : '—'}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="body-small mb-1">
            Credits are used for media generation, cloud rendering, and AI asset operations.
          </p>
          <p className="caption">
            New accounts start with $5.00 in free credits. Purchases of $50+ get a 10% bonus.
          </p>
        </CardContent>
      </Card>

      {/* Add Credits */}
      <Card>
        <CardHeader>
          <CardTitle className="heading-3">Add Credits</CardTitle>
          <CardDescription>
            Select an amount to purchase via Stripe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {CREDIT_AMOUNTS.map((amount) => (
              <Button
                key={amount}
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-1"
                onClick={() => handlePurchase(amount)}
                disabled={purchasing !== null}
              >
                <span className="text-lg font-serif text-foreground">
                  ${amount}
                </span>
                {amount >= 50 && (
                  <span className="text-[10px] text-chart-4">+10% bonus</span>
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="heading-3">Payment History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : payments && payments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="text-sm">
                      {formatDate(payment.created_at)}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {formatCurrency(payment.amount_usd)}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {formatCurrency(payment.credits_usd)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          payment.status === 'completed'
                            ? 'success'
                            : payment.status === 'failed'
                              ? 'destructive'
                              : 'warning'
                        }
                      >
                        {payment.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-12 text-center">
              <p className="body-small">No payments yet</p>
              <p className="caption mt-1">
                Your payment history will appear here
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
