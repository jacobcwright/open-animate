'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Film } from 'lucide-react';

export default function RendersPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="heading-1">Renders</h1>
        <p className="body-text mt-2">
          View your cloud render history and download outputs
        </p>
      </div>

      <Card>
        <CardContent className="p-12 text-center">
          <Film className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="body-small">No renders yet</p>
          <p className="caption mt-1">
            Cloud renders submitted via <code className="font-mono text-xs">oanim render --cloud</code> will appear here
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
