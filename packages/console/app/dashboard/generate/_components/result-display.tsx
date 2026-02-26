'use client';

import { Download, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { formatModelCost } from '@/lib/models';

type ResultType = 'image' | 'video' | 'audio';

interface ResultDisplayProps {
  url: string;
  type: ResultType;
  model: string;
  cost: number;
  beforeUrl?: string;
  className?: string;
}

export function ResultDisplay({
  url,
  type,
  model,
  cost,
  beforeUrl,
  className,
}: ResultDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `generate-${Date.now()}.${type === 'video' ? 'mp4' : type === 'audio' ? 'mp3' : 'png'}`;
    a.target = '_blank';
    a.click();
  };

  return (
    <div className={cn('space-y-3', className)}>
      {type === 'image' && beforeUrl ? (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="caption mb-1">Before</p>
            <img src={beforeUrl} alt="Before" className="w-full border border-border object-contain max-h-64" />
          </div>
          <div>
            <p className="caption mb-1">After</p>
            <img src={url} alt="After" className="w-full border border-border object-contain max-h-64" />
          </div>
        </div>
      ) : type === 'image' ? (
        <img src={url} alt="Generated" className="w-full border border-border object-contain max-h-96" />
      ) : type === 'video' ? (
        <video src={url} controls className="w-full border border-border max-h-96" />
      ) : (
        <audio src={url} controls className="w-full" />
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="caption">{model}</span>
          <span className="text-xs font-medium text-primary bg-primary/10 px-1.5 py-0.5">
            {formatModelCost(cost)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={handleCopy} title="Copy URL">
            {copied ? <Check className="w-4 h-4 text-status-success" /> : <Copy className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={handleDownload} title="Download">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ResultGrid({
  results,
  type,
  className,
}: {
  results: Array<{ url: string; model: string; cost: number }>;
  type: ResultType;
  className?: string;
}) {
  if (results.length === 0) return null;

  if (results.length === 1) {
    return (
      <ResultDisplay
        url={results[0].url}
        type={type}
        model={results[0].model}
        cost={results[0].cost}
        className={className}
      />
    );
  }

  return (
    <div className={cn('grid grid-cols-2 gap-4', className)}>
      {results.map((r, i) => (
        <ResultDisplay key={i} url={r.url} type={type} model={r.model} cost={r.cost} />
      ))}
    </div>
  );
}
