import { readFile, writeFile, mkdir, chmod } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { parse, stringify } from 'yaml';

const CONFIG_DIR = join(homedir(), '.oanim');
const CREDENTIALS_FILE = join(CONFIG_DIR, 'credentials.yaml');
const CONFIG_FILE = join(CONFIG_DIR, 'config.yaml');

export interface Credentials {
  token?: string;
  api_key?: string;
}

export interface Config {
  api_url?: string;
}

async function ensureConfigDir(): Promise<void> {
  await mkdir(CONFIG_DIR, { recursive: true, mode: 0o700 });
}

async function readYaml<T>(path: string): Promise<T | null> {
  try {
    const raw = await readFile(path, 'utf-8');
    return (parse(raw) as T) ?? null;
  } catch {
    return null;
  }
}

async function writeYaml(path: string, data: unknown, mode?: number): Promise<void> {
  await ensureConfigDir();
  await writeFile(path, stringify(data), 'utf-8');
  if (mode) await chmod(path, mode);
}

export async function loadCredentials(): Promise<Credentials> {
  return (await readYaml<Credentials>(CREDENTIALS_FILE)) ?? {};
}

export async function saveCredentials(creds: Credentials): Promise<void> {
  const existing = await loadCredentials();
  await writeYaml(CREDENTIALS_FILE, { ...existing, ...creds }, 0o600);
}

export async function clearCredentials(): Promise<void> {
  await writeYaml(CREDENTIALS_FILE, {}, 0o600);
}

export async function loadConfig(): Promise<Config> {
  return (await readYaml<Config>(CONFIG_FILE)) ?? {};
}

export async function saveConfig(cfg: Config): Promise<void> {
  const existing = await loadConfig();
  await writeYaml(CONFIG_FILE, { ...existing, ...cfg });
}

export async function getApiUrl(): Promise<string> {
  if (process.env.ANIMATE_API_URL) return process.env.ANIMATE_API_URL;
  const cfg = await loadConfig();
  return cfg.api_url ?? 'https://api.oanim.dev';
}

/**
 * Resolve platform auth credentials.
 * Chain: ANIMATE_API_KEY env → credentials.yaml api_key → credentials.yaml token → null
 */
export async function getAuth(): Promise<{ type: 'api_key' | 'token'; value: string } | null> {
  const envKey = process.env.ANIMATE_API_KEY;
  if (envKey) return { type: 'api_key', value: envKey };

  const creds = await loadCredentials();
  if (creds.api_key) return { type: 'api_key', value: creds.api_key };
  if (creds.token) return { type: 'token', value: creds.token };

  return null;
}
