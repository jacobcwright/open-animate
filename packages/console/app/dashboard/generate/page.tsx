'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import {
  Loader2,
  Wand2,
  ImageIcon,
  Eraser,
  ArrowUpCircle,
  Video,
  Music,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  IMAGE_GEN_MODELS,
  IMAGE_EDIT_MODELS,
  BG_REMOVAL_MODELS,
  UPSCALE_MODELS,
  VIDEO_MODELS,
  AUDIO_MODELS,
  IMAGE_SIZES,
  formatModelCost,
  type ModelDef,
} from '@/lib/models';
import {
  runModel,
  submitJob,
  getJobStatus,
  getBalance,
} from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { ImageUpload } from './_components/image-upload';
import { ResultDisplay, ResultGrid } from './_components/result-display';

type OperationTab = 'generate' | 'edit' | 'remove-bg' | 'upscale' | 'video' | 'audio';

const TABS: { key: OperationTab; label: string; icon: typeof Wand2 }[] = [
  { key: 'generate', label: 'Image', icon: Wand2 },
  { key: 'edit', label: 'Edit', icon: ImageIcon },
  { key: 'remove-bg', label: 'Remove BG', icon: Eraser },
  { key: 'upscale', label: 'Upscale', icon: ArrowUpCircle },
  { key: 'video', label: 'Video', icon: Video },
  { key: 'audio', label: 'Audio', icon: Music },
];

function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="label mb-1.5 block">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-input border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-border-focus transition-colors"
      >
        {children}
      </select>
    </div>
  );
}

function ModelSelect({
  models,
  value,
  onChange,
}: {
  models: ModelDef[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <SelectField label="Model" value={value} onChange={onChange}>
      {models.map((m) => (
        <option key={m.id} value={m.id}>
          {m.name} — {formatModelCost(m.cost)}
        </option>
      ))}
    </SelectField>
  );
}

function PromptField({
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  rows?: number;
}) {
  return (
    <div>
      <label className="label mb-1.5 block">Prompt</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="flex w-full bg-input border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-border-focus resize-none"
      />
    </div>
  );
}

function EmptyResult({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center h-64 border border-dashed border-border text-muted-foreground text-sm">
      {text}
    </div>
  );
}

function CreditBalance() {
  const { getToken } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    const token = await getToken();
    if (!token) return;
    try {
      const data = await getBalance(token);
      setBalance(data.creditBalanceUsd);
    } catch {
      // Balance is supplementary info
    }
  }, [getToken]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (balance === null) return null;

  return (
    <div className="text-sm text-muted-foreground">
      Credits: <span className="text-foreground font-medium">{formatCurrency(balance)}</span>
    </div>
  );
}

// ============================================================================
// Generate Image Tab
// ============================================================================

function GenerateImageTab() {
  const { getToken } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState(IMAGE_GEN_MODELS[0].id);
  const [imageSize, setImageSize] = useState('landscape_16_9');
  const [numImages, setNumImages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Array<{ url: string; model: string; cost: number }>>([]);

  const selectedModel = IMAGE_GEN_MODELS.find((m) => m.id === model) ?? IMAGE_GEN_MODELS[0];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');

      const res = await runModel(token, model, {
        prompt,
        image_size: imageSize,
        num_images: numImages,
      });

      const rawResult = res.result as Record<string, unknown> | undefined;
      const images = rawResult?.images as Array<{ url: string }> | undefined;
      if (images && images.length > 0) {
        setResults(
          images.map((img) => ({
            url: img.url,
            model: selectedModel.name,
            cost: selectedModel.cost / images.length,
          }))
        );
      } else if (res.url) {
        setResults([{ url: res.url, model: selectedModel.name, cost: selectedModel.cost }]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <ModelSelect models={IMAGE_GEN_MODELS} value={model} onChange={setModel} />
        <PromptField
          value={prompt}
          onChange={setPrompt}
          placeholder="A serene mountain landscape at golden hour..."
        />
        <div className="grid grid-cols-2 gap-4">
          <SelectField label="Image Size" value={imageSize} onChange={setImageSize}>
            {IMAGE_SIZES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </SelectField>
          <SelectField label="Images" value={numImages} onChange={(v) => setNumImages(Number(v))}>
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </SelectField>
        </div>
        <div className="flex items-center justify-between">
          <span className="caption">Est. cost: {formatModelCost(selectedModel.cost)}</span>
          <Button onClick={handleGenerate} disabled={loading || !prompt.trim()} className="btn-primary">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Wand2 className="w-4 h-4 mr-2" />}
            Generate
          </Button>
        </div>
        {error && <p className="text-sm text-status-error">{error}</p>}
      </div>

      <div>{results.length > 0 ? <ResultGrid results={results} type="image" /> : <EmptyResult text="Generated images will appear here" />}</div>
    </div>
  );
}

// ============================================================================
// Edit Image Tab
// ============================================================================

function EditImageTab() {
  const { getToken } = useAuth();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState(IMAGE_EDIT_MODELS[0].id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ url: string; model: string; cost: number } | null>(null);

  const selectedModel = IMAGE_EDIT_MODELS.find((m) => m.id === model) ?? IMAGE_EDIT_MODELS[0];

  const handleEdit = async () => {
    if (!imageUrl || !prompt.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');

      const res = await runModel(token, model, { image_url: imageUrl, prompt, num_images: 1 });
      if (res.url) {
        setResult({ url: res.url, model: selectedModel.name, cost: selectedModel.cost });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Edit failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <ModelSelect models={IMAGE_EDIT_MODELS} value={model} onChange={setModel} />
        <div>
          <label className="label mb-1.5 block">Source Image</label>
          <ImageUpload value={imageUrl} onChange={setImageUrl} />
        </div>
        <PromptField value={prompt} onChange={setPrompt} placeholder="Make the sky more dramatic..." rows={3} />
        <div className="flex items-center justify-between">
          <span className="caption">Est. cost: {formatModelCost(selectedModel.cost)}</span>
          <Button onClick={handleEdit} disabled={loading || !imageUrl || !prompt.trim()} className="btn-primary">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ImageIcon className="w-4 h-4 mr-2" />}
            Edit
          </Button>
        </div>
        {error && <p className="text-sm text-status-error">{error}</p>}
      </div>

      <div>
        {result ? (
          <ResultDisplay url={result.url} type="image" model={result.model} cost={result.cost} />
        ) : (
          <EmptyResult text="Edited image will appear here" />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Remove Background Tab
// ============================================================================

function RemoveBgTab() {
  const { getToken } = useAuth();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [model, setModel] = useState(BG_REMOVAL_MODELS[0].id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ url: string; model: string; cost: number } | null>(null);

  const selectedModel = BG_REMOVAL_MODELS.find((m) => m.id === model) ?? BG_REMOVAL_MODELS[0];

  const handleRemove = async () => {
    if (!imageUrl) return;
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');

      const res = await runModel(token, model, { image_url: imageUrl });
      if (res.url) {
        setResult({ url: res.url, model: selectedModel.name, cost: res.estimatedCostUsd ?? selectedModel.cost });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Background removal failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <ModelSelect models={BG_REMOVAL_MODELS} value={model} onChange={setModel} />
        <div>
          <label className="label mb-1.5 block">Image</label>
          <ImageUpload value={imageUrl} onChange={setImageUrl} />
        </div>
        <div className="flex items-center justify-between">
          <span className="caption">Est. cost: {formatModelCost(selectedModel.cost)}</span>
          <Button onClick={handleRemove} disabled={loading || !imageUrl} className="btn-primary">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Eraser className="w-4 h-4 mr-2" />}
            Remove Background
          </Button>
        </div>
        {error && <p className="text-sm text-status-error">{error}</p>}
      </div>

      <div>
        {result ? (
          <div className="space-y-3">
            <div
              className="border border-border"
              style={{
                backgroundImage:
                  'linear-gradient(45deg, var(--muted) 25%, transparent 25%), linear-gradient(-45deg, var(--muted) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, var(--muted) 75%), linear-gradient(-45deg, transparent 75%, var(--muted) 75%)',
                backgroundSize: '16px 16px',
                backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
              }}
            >
              <img src={result.url} alt="Background removed" className="w-full object-contain max-h-96" />
            </div>
            <ResultDisplay url={result.url} type="image" model={result.model} cost={result.cost} />
          </div>
        ) : (
          <EmptyResult text="Result will appear here" />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Upscale Tab
// ============================================================================

function UpscaleTab() {
  const { getToken } = useAuth();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [model, setModel] = useState(UPSCALE_MODELS[0].id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ url: string; model: string; cost: number } | null>(null);

  const selectedModel = UPSCALE_MODELS.find((m) => m.id === model) ?? UPSCALE_MODELS[0];

  const handleUpscale = async () => {
    if (!imageUrl) return;
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');

      const res = await runModel(token, model, { image_url: imageUrl, scale: 2 });
      if (res.url) {
        setResult({ url: res.url, model: selectedModel.name, cost: res.estimatedCostUsd ?? selectedModel.cost });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upscale failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <ModelSelect models={UPSCALE_MODELS} value={model} onChange={setModel} />
        <div>
          <label className="label mb-1.5 block">Image</label>
          <ImageUpload value={imageUrl} onChange={setImageUrl} />
        </div>
        <div className="flex items-center justify-between">
          <span className="caption">Est. cost: {formatModelCost(selectedModel.cost)}</span>
          <Button onClick={handleUpscale} disabled={loading || !imageUrl} className="btn-primary">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ArrowUpCircle className="w-4 h-4 mr-2" />}
            Upscale
          </Button>
        </div>
        {error && <p className="text-sm text-status-error">{error}</p>}
      </div>

      <div>
        {result ? (
          <ResultDisplay
            url={result.url}
            type="image"
            model={result.model}
            cost={result.cost}
            beforeUrl={imageUrl ?? undefined}
          />
        ) : (
          <EmptyResult text="Upscaled image will appear here" />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Video Tab (queue-based)
// ============================================================================

function VideoTab() {
  const { getToken } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState(VIDEO_MODELS[0].id);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ url: string; model: string; cost: number } | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const selectedModel = VIDEO_MODELS.find((m) => m.id === model) ?? VIDEO_MODELS[0];

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setStatus(null);

    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');

      const submit = await submitJob(token, model, { prompt });
      setLoading(false);
      setPolling(true);
      setStatus('IN_QUEUE');

      pollRef.current = setInterval(async () => {
        try {
          const freshToken = await getToken();
          if (!freshToken) return;

          const statusRes = await getJobStatus(
            freshToken,
            submit.requestId,
            model,
            submit.statusUrl,
            submit.responseUrl
          );
          setStatus(statusRes.status);

          if (statusRes.status === 'COMPLETED' && statusRes.url) {
            if (pollRef.current) clearInterval(pollRef.current);
            setPolling(false);
            setResult({ url: statusRes.url, model: selectedModel.name, cost: selectedModel.cost });
          }
        } catch (e) {
          if (pollRef.current) clearInterval(pollRef.current);
          setPolling(false);
          setError(e instanceof Error ? e.message : 'Polling failed');
        }
      }, 5000);
    } catch (e) {
      setLoading(false);
      setError(e instanceof Error ? e.message : 'Submit failed');
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <ModelSelect models={VIDEO_MODELS} value={model} onChange={setModel} />
        <PromptField
          value={prompt}
          onChange={setPrompt}
          placeholder="A drone shot flying over a misty forest at sunrise..."
        />
        <div className="flex items-center justify-between">
          <span className="caption">Est. cost: {formatModelCost(selectedModel.cost)}</span>
          <Button onClick={handleGenerate} disabled={loading || polling || !prompt.trim()} className="btn-primary">
            {loading || polling ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Video className="w-4 h-4 mr-2" />}
            {polling ? 'Generating...' : 'Generate Video'}
          </Button>
        </div>
        {status && polling && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-3 h-3 animate-spin" />
            {status === 'IN_QUEUE' ? 'Queued — waiting for capacity...' : 'Processing...'}
          </div>
        )}
        {error && <p className="text-sm text-status-error">{error}</p>}
      </div>

      <div>
        {result ? (
          <ResultDisplay url={result.url} type="video" model={result.model} cost={result.cost} />
        ) : (
          <EmptyResult text="Generated video will appear here" />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Audio Tab (queue-based)
// ============================================================================

function AudioTab() {
  const { getToken } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState(10);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ url: string; model: string; cost: number } | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const model = AUDIO_MODELS[0];

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setStatus(null);

    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');

      const submit = await submitJob(token, model.id, { prompt, duration_in_seconds: duration });
      setLoading(false);
      setPolling(true);
      setStatus('IN_QUEUE');

      pollRef.current = setInterval(async () => {
        try {
          const freshToken = await getToken();
          if (!freshToken) return;

          const statusRes = await getJobStatus(
            freshToken,
            submit.requestId,
            model.id,
            submit.statusUrl,
            submit.responseUrl
          );
          setStatus(statusRes.status);

          if (statusRes.status === 'COMPLETED' && statusRes.url) {
            if (pollRef.current) clearInterval(pollRef.current);
            setPolling(false);
            setResult({ url: statusRes.url, model: model.name, cost: model.cost });
          }
        } catch (e) {
          if (pollRef.current) clearInterval(pollRef.current);
          setPolling(false);
          setError(e instanceof Error ? e.message : 'Polling failed');
        }
      }, 5000);
    } catch (e) {
      setLoading(false);
      setError(e instanceof Error ? e.message : 'Submit failed');
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <div>
          <label className="label mb-1.5 block">Model</label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-foreground">{model.name}</span>
            <span className="text-xs font-medium text-muted-foreground">
              {formatModelCost(model.cost)}
            </span>
          </div>
        </div>
        <PromptField
          value={prompt}
          onChange={setPrompt}
          placeholder="Upbeat electronic music with synth pads and a driving beat..."
        />
        <SelectField label="Duration" value={duration} onChange={(v) => setDuration(Number(v))}>
          {[5, 10, 15, 20, 30].map((d) => (
            <option key={d} value={d}>
              {d}s
            </option>
          ))}
        </SelectField>
        <div className="flex items-center justify-between">
          <span className="caption">Est. cost: {formatModelCost(model.cost)}</span>
          <Button onClick={handleGenerate} disabled={loading || polling || !prompt.trim()} className="btn-primary">
            {loading || polling ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Music className="w-4 h-4 mr-2" />}
            {polling ? 'Generating...' : 'Generate Audio'}
          </Button>
        </div>
        {status && polling && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-3 h-3 animate-spin" />
            {status === 'IN_QUEUE' ? 'Queued — waiting for capacity...' : 'Processing...'}
          </div>
        )}
        {error && <p className="text-sm text-status-error">{error}</p>}
      </div>

      <div>
        {result ? (
          <ResultDisplay url={result.url} type="audio" model={result.model} cost={result.cost} />
        ) : (
          <EmptyResult text="Generated audio will appear here" />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Main Page
// ============================================================================

const TAB_COMPONENTS: Record<OperationTab, React.FC> = {
  generate: GenerateImageTab,
  edit: EditImageTab,
  'remove-bg': RemoveBgTab,
  upscale: UpscaleTab,
  video: VideoTab,
  audio: AudioTab,
};

export default function GeneratePage() {
  const [activeTab, setActiveTab] = useState<OperationTab>('generate');
  const ActivePanel = TAB_COMPONENTS[activeTab];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-1">Generate</h1>
          <p className="body-text mt-2">Create images, video, and audio with AI models</p>
        </div>
        <CreditBalance />
      </div>

      {/* Tab toggle — matches usage page pattern */}
      <div className="flex gap-1 border border-border p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${
              activeTab === tab.key
                ? 'bg-accent-primary/15 text-accent-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      <ActivePanel />
    </div>
  );
}
