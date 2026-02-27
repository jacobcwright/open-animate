'use client';

import { useCallback, useRef, useState } from 'react';
import { Upload, X, Link as LinkIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ImageUploadProps {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  className?: string;
}

export function ImageUpload({ value, onChange, className }: ImageUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => onChange(reader.result as string);
      reader.readAsDataURL(file);
    },
    [onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUrlInput('');
      setShowUrlInput(false);
    }
  };

  if (value) {
    return (
      <div className={cn('relative group', className)}>
        <img
          src={value}
          alt="Upload preview"
          className="w-full max-h-64 object-contain bg-muted border border-border"
        />
        <button
          onClick={() => onChange(null)}
          className="absolute top-2 right-2 p-1 bg-background/80 border border-border text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex flex-col items-center justify-center gap-2 border border-dashed p-8 cursor-pointer transition-colors',
          dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-border-strong'
        )}
      >
        <Upload className="w-6 h-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Drop an image or click to upload</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>

      {showUrlInput ? (
        <div className="flex gap-2">
          <Input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/image.png"
            onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
            className="flex-1"
          />
          <Button variant="outline" size="sm" onClick={handleUrlSubmit} disabled={!urlInput.trim()}>
            Load
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowUrlInput(false);
              setUrlInput('');
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <button
          onClick={() => setShowUrlInput(true)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <LinkIcon className="w-3 h-3" />
          Paste image URL
        </button>
      )}
    </div>
  );
}
