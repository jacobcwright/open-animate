import { Video, Sparkles, Monitor, Film } from 'lucide-react';

export default function AnimatePage() {
  const features = [
    {
      icon: Sparkles,
      title: 'Gemini Video Generation',
      description:
        'Generate video clips with Google Gemini 3.1. Text-to-video and image-to-video with cinematic quality.',
    },
    {
      icon: Film,
      title: 'Quiver Preview',
      description:
        'Real-time motion graphics preview powered by Quiver. See animations update live as you edit.',
    },
    {
      icon: Monitor,
      title: 'Remotion Studio',
      description:
        'Full Remotion Studio in the browser. Compose scenes with @oanim/core presets, render to MP4.',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 mb-6">
          <Video className="w-8 h-8 text-primary" />
        </div>
        <div className="mb-4">
          <span className="text-xs font-medium uppercase tracking-widest text-primary bg-primary/10 px-3 py-1">
            Coming Soon
          </span>
        </div>
        <h1 className="heading-1 mb-3">Animate</h1>
        <p className="body-text max-w-lg mx-auto">
          Create motion graphics and video content directly in the dashboard. AI-powered
          generation, real-time preview, and one-click export.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
        {features.map((feature) => (
          <div key={feature.title} className="bg-card border border-border p-6 card-hover">
            <feature.icon className="w-6 h-6 text-muted-foreground mb-4" />
            <h3 className="text-sm font-medium text-foreground mb-2">{feature.title}</h3>
            <p className="body-small">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
