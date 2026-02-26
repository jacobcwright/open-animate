'use client';

import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Mail, Calendar } from 'lucide-react';

export default function SettingsPage() {
  const { user, isLoaded } = useUser();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="heading-1">Settings</h1>
        <p className="body-text mt-2">Manage your account</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="heading-3">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isLoaded ? (
            <div className="space-y-3">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-5 w-64" />
              <Skeleton className="h-5 w-36" />
            </div>
          ) : user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground w-20">Name</span>
                <span className="text-sm text-foreground">
                  {user.fullName || user.username || 'Not set'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground w-20">Email</span>
                <span className="text-sm text-foreground">
                  {user.primaryEmailAddress?.emailAddress}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground w-20">Joined</span>
                <span className="text-sm text-foreground">
                  {user.createdAt
                    ? new Intl.DateTimeFormat('en-US', {
                        month: 'long',
                        year: 'numeric',
                      }).format(new Date(user.createdAt))
                    : 'Unknown'}
                </span>
              </div>
            </div>
          ) : (
            <p className="body-small">Not signed in</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="heading-3">Plan</CardTitle>
          <CardDescription>Your current oanim plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Badge variant="success">Free</Badge>
            <span className="text-sm text-muted-foreground">
              $5.00 starter credits included
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
