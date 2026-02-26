'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
import { getApiKeys, createApiKey, deleteApiKey, type ApiKey } from '@/lib/api';
import { formatRelativeTime, formatDate } from '@/lib/utils';
import { Key, Plus, Copy, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function ApiKeysPage() {
  const { getToken } = useAuth();
  const [keys, setKeys] = useState<ApiKey[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [revealedSecret, setRevealedSecret] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadKeys();
  }, [getToken]);

  const [error, setError] = useState(false);

  async function loadKeys() {
    try {
      const token = await getToken();
      if (!token) return;
      const res = await getApiKeys(token);
      setKeys(res.api_keys);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!newKeyName.trim()) return;
    setCreating(true);
    try {
      const token = await getToken();
      if (!token) return;
      const res = await createApiKey(token, newKeyName.trim());
      setRevealedSecret(res.secret);
      setKeys((prev) => [...(prev ?? []), res.key]);
      setNewKeyName('');
      toast.success('API key created');
    } catch {
      toast.error('Failed to create API key');
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(keyId: string) {
    setDeletingId(keyId);
    setConfirmDeleteId(null);
    try {
      const token = await getToken();
      if (!token) return;
      await deleteApiKey(token, keyId);
      setKeys((prev) => prev?.filter((k) => k.id !== keyId) ?? null);
      toast.success('API key revoked');
    } catch {
      toast.error('Failed to revoke API key');
    } finally {
      setDeletingId(null);
    }
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="heading-1">API Keys</h1>
        <p className="body-text mt-2">
          Manage your API keys for CLI and programmatic access
        </p>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4 text-sm text-destructive">
            Unable to load API keys. The API may be unreachable.
          </CardContent>
        </Card>
      )}

      {/* Create Key */}
      <Card>
        <CardHeader>
          <CardTitle className="heading-3">Create New Key</CardTitle>
          <CardDescription>
            API keys use the <code className="font-mono text-xs">anim_</code> prefix.
            Keys are shown once at creation — store them securely.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="Key name (e.g. production, development)"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              className="max-w-sm"
            />
            <Button
              onClick={handleCreate}
              disabled={creating || !newKeyName.trim()}
            >
              <Plus className="h-4 w-4" />
              Create
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Secret Reveal Dialog */}
      <Dialog
        open={!!revealedSecret}
        onOpenChange={() => setRevealedSecret(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API Key Created</DialogTitle>
            <DialogDescription>
              Copy your API key now. You won&apos;t be able to see it again.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 bg-background p-3 border border-border">
            <code className="flex-1 text-xs font-mono text-foreground break-all">
              {revealedSecret}
            </code>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => copyToClipboard(revealedSecret!)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2 text-status-warning text-xs">
            <AlertTriangle className="h-3 w-3" />
            Store this key securely. It will not be shown again.
          </div>
        </DialogContent>
      </Dialog>

      {/* Keys List */}
      <Card>
        <CardHeader>
          <CardTitle className="heading-3">Your Keys</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : keys && keys.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Prefix</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium">
                      {key.name || 'Unnamed'}
                    </TableCell>
                    <TableCell>
                      <code className="text-xs font-mono text-muted-foreground">
                        {key.prefix}...
                      </code>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(new Date(key.created_at))}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {key.last_used_at
                        ? formatRelativeTime(new Date(key.last_used_at))
                        : 'Never'}
                    </TableCell>
                    <TableCell className="text-right">
                      {confirmDeleteId === key.id ? (
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(key.id)}
                            disabled={deletingId === key.id}
                          >
                            Revoke
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setConfirmDeleteId(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setConfirmDeleteId(key.id)}
                          disabled={deletingId === key.id}
                          className="text-destructive hover:text-destructive"
                          aria-label={`Revoke key ${key.name || key.prefix}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-12 text-center">
              <Key className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="body-small">No API keys yet</p>
              <p className="caption mt-1">
                Create a key above to get started
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
