'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Play, Film, Sparkles, Presentation, TrendingUp, MessageSquare } from 'lucide-react';

const templates = [
  {
    id: 'launch-video',
    title: 'Product Launch',
    description: 'Announce a new product with animated text, transitions, and a CTA',
    category: 'Marketing',
    icon: Sparkles,
    color: 'text-chart-1',
    bgColor: 'bg-chart-1/10',
  },
  {
    id: 'explainer',
    title: 'Explainer',
    description: 'Break down a concept with step-by-step animated sections',
    category: 'Education',
    icon: Presentation,
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/10',
  },
  {
    id: 'logo-reveal',
    title: 'Logo Reveal',
    description: 'Cinematic logo animation with glow effects and transitions',
    category: 'Branding',
    icon: Film,
    color: 'text-chart-3',
    bgColor: 'bg-chart-3/10',
  },
  {
    id: 'meme-caption',
    title: 'Meme / Caption',
    description: 'Top/bottom text overlay on video with animated captions',
    category: 'Social',
    icon: MessageSquare,
    color: 'text-chart-5',
    bgColor: 'bg-chart-5/10',
  },
  {
    id: 'investor-update',
    title: 'Investor Update',
    description: 'Professional metrics dashboard with animated charts and KPIs',
    category: 'Business',
    icon: TrendingUp,
    color: 'text-chart-4',
    bgColor: 'bg-chart-4/10',
  },
  {
    id: 'hello-world',
    title: 'Hello World',
    description: 'Minimal starter template — single scene with animated text',
    category: 'Starter',
    icon: Play,
    color: 'text-foreground',
    bgColor: 'bg-foreground/10',
  },
];

export default function TemplatesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="heading-1">Templates</h1>
        <p className="body-text mt-2">
          Start from a pre-built template or browse examples
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="card-hover group">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div
                  className={`w-10 h-10 flex items-center justify-center ${template.bgColor}`}
                >
                  <template.icon className={`h-5 w-5 ${template.color}`} />
                </div>
                <Badge variant="outline">{template.category}</Badge>
              </div>

              <div>
                <h3 className="text-sm font-medium text-foreground">
                  {template.title}
                </h3>
                <p className="caption mt-1">{template.description}</p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <a
                    href={`https://github.com/jacobcwright/open-animate/tree/main/examples/${template.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Source
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
                <Button size="sm" className="flex-1" asChild>
                  <a
                    href={`https://github.com/jacobcwright/open-animate/tree/main/examples/${template.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Use Template
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CLI usage */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-sm font-medium text-foreground mb-2">
            Use templates via CLI
          </h3>
          <code className="block text-xs font-mono text-muted-foreground bg-background p-3 border border-border">
            oanim init my-video --template launch-video
          </code>
        </CardContent>
      </Card>
    </div>
  );
}
