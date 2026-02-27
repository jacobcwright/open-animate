'use client';

import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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
import { DollarSign, Plus, ExternalLink, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

const CREDIT_AMOUNTS = [5, 10, 25, 50, 100];
const MIN_AMOUNT = 5;
const MAX_AMOUNT = 10_000;
const ENTERPRISE_THRESHOLD = 10_000;

export default function BillingPage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [balance, setBalance] = useState<number | null>(null);
  const [payments, setPayments] = useState<Payment[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<number | null>(null);
  const [error, setError] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [contactOpen, setContactOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const token = await getToken();
        if (!token) return;
        const [balanceRes, historyRes] = await Promise.all([
          getBalance(token),
          getPaymentHistory(token),
        ]);
        setBalance(balanceRes.creditBalanceUsd);
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
      const { checkoutUrl } = await createCheckout(token, amount);
      // Validate checkout URL points to Stripe
      const parsed = new URL(checkoutUrl);
      if (!parsed.hostname.endsWith('.stripe.com')) {
        throw new Error('Invalid checkout URL');
      }
      window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
    } catch {
      toast.error('Failed to create checkout session');
    } finally {
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
            Select an amount or enter a custom value to purchase via Stripe
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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

          <div className="border-t border-border pt-4">
            <p className="text-sm text-muted-foreground mb-3">Or enter a custom amount</p>
            <div className="flex gap-3 items-start">
              <div className="flex-1 max-w-xs">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                  <Input
                    type="number"
                    min={MIN_AMOUNT}
                    max={MAX_AMOUNT}
                    step="1"
                    placeholder="50"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="pl-7 font-mono"
                  />
                </div>
                {customAmount && Number(customAmount) > 0 && Number(customAmount) < MIN_AMOUNT && (
                  <p className="text-xs text-destructive mt-1">Minimum amount is ${MIN_AMOUNT}</p>
                )}
              </div>
              <Button
                className="btn-primary"
                onClick={() => {
                  const amount = Number(customAmount);
                  if (amount > ENTERPRISE_THRESHOLD) {
                    setContactOpen(true);
                    return;
                  }
                  handlePurchase(amount);
                }}
                disabled={
                  purchasing !== null ||
                  !customAmount ||
                  Number(customAmount) < MIN_AMOUNT
                }
              >
                {Number(customAmount) > ENTERPRISE_THRESHOLD ? 'Contact Sales' : 'Purchase'}
              </Button>
            </div>
            {Number(customAmount) >= 50 && Number(customAmount) <= ENTERPRISE_THRESHOLD && (
              <p className="text-xs text-chart-4 mt-2">+10% bonus included</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Enterprise Contact Dialog */}
      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enterprise Credits</DialogTitle>
            <DialogDescription>
              For purchases over ${ENTERPRISE_THRESHOLD.toLocaleString()}, reach out to our team and we&apos;ll set up volume pricing and dedicated support.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Amount needed</label>
              <Input
                value={`$${customAmount}`}
                disabled
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Message</label>
              <textarea
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                placeholder="Tell us about your use case, expected volume, or any questions..."
                rows={4}
                className="flex w-full bg-input border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-border-focus resize-none"
              />
            </div>
            <Button
              className="btn-primary w-full"
              onClick={() => {
                const email = user?.primaryEmailAddress?.emailAddress || '';
                const subject = encodeURIComponent(`Enterprise Credits — $${customAmount}`);
                const body = encodeURIComponent(
                  `Amount: $${customAmount}\nEmail: ${email}\n\n${contactMessage}`
                );
                window.open(
                  `mailto:founders@castari.com?subject=${subject}&body=${body}`,
                  '_blank'
                );
                setContactOpen(false);
                toast.success('Opening email client...');
              }}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Send to founders@castari.com
            </Button>
            <p className="caption text-center">
              Or email us directly at{' '}
              <a href="mailto:founders@castari.com" className="text-primary hover:underline">
                founders@castari.com
              </a>
            </p>
          </div>
        </DialogContent>
      </Dialog>

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
                      {formatDate(payment.createdAt)}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {formatCurrency(payment.amountUsd)}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {formatCurrency(payment.creditsUsd)}
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
