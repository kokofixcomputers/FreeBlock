import type { Host, Region, Software, Uptime } from '../types';

export type SortKey = 'name' | 'ram' | 'cpu' | 'storage';

export interface Filters {
  query: string;
  minRam: number;
  minCpu: number;
  minStorage: number;
  regions: Region[];
  uptime: Uptime | 'any';
  software: Software[];
  mods: boolean;
  plugins: boolean;
  bedrock: boolean;
  proxy: boolean;
  noAds: boolean;
  noQueue: boolean;
  subdomain: boolean;
  sort: SortKey;
}

export const defaultFilters: Filters = {
  query: '',
  minRam: 0,
  minCpu: 0,
  minStorage: 0,
  regions: [],
  uptime: 'any',
  software: [],
  mods: false,
  plugins: false,
  bedrock: false,
  proxy: false,
  noAds: false,
  noQueue: false,
  subdomain: false,
  sort: 'ram',
};

export const REGION_LABELS: Record<Region, string> = {
  'north-america': 'North America',
  'south-america': 'South America',
  europe: 'Europe',
  asia: 'Asia',
  oceania: 'Oceania',
  africa: 'Africa',
};

export const UPTIME_LABELS: Record<Uptime, string> = {
  '24/7': '24/7',
  'on-demand': 'On-demand',
  limited: 'Credit / time limited',
};

/** Canonical display order; the filter only lists software that some host actually offers. */
export const ALL_SOFTWARE: Software[] = [
  'Vanilla',
  'Paper',
  'Spigot',
  'Purpur',
  'Pufferfish',
  'Folia',
  'Forge',
  'NeoForge',
  'Fabric',
  'Quilt',
  'Legacy Fabric',
  'Sponge',
  'Velocity',
  'BungeeCord',
  'Waterfall',
  'Velocity-CTD',
  'Canvas',
  'Arclight',
  'Mohist',
  'Youer',
  'Magma',
  'DivineMC',
  'Leaf',
  'Leaves',
  'ASPaper',
  'Pluto',
  'LooHP Limbo',
  'NanoLimbo',
  'Bedrock',
];

export const SPEC_VALUE = {
  ram: (h: Host) => h.ramGB,
  cpu: (h: Host) => h.cpuPercent,
  storage: (h: Host) => h.storageGB,
} as const;

export function applyFilters(hosts: Host[], f: Filters): Host[] {
  const q = f.query.trim().toLowerCase();
  const out = hosts.filter((h) => {
    if (q && !`${h.name} ${h.tagline}`.toLowerCase().includes(q)) return false;
    if (f.minRam && (h.ramGB ?? 0) < f.minRam) return false;
    if (f.minCpu && (h.cpuPercent ?? 0) < f.minCpu) return false;
    if (f.minStorage && (h.storageGB ?? 0) < f.minStorage) return false;
    if (f.regions.length && !f.regions.some((r) => h.locations.some((l) => l.region === r))) return false;
    if (f.uptime !== 'any' && h.uptime !== f.uptime) return false;
    if (f.software.length && !f.software.every((s) => h.software.includes(s))) return false;
    if (f.mods && !h.mods) return false;
    if (f.plugins && !h.plugins) return false;
    if (f.bedrock && !h.bedrock) return false;
    if (f.proxy && !h.proxy) return false;
    if (f.noAds && h.ads !== false) return false;
    if (f.noQueue && h.queue) return false;
    if (f.subdomain && !h.subdomain) return false;
    return true;
  });
  return out.sort((a, b) => {
    if (f.sort === 'name') return a.name.localeCompare(b.name);
    const get = SPEC_VALUE[f.sort];
    return (get(b) ?? -1) - (get(a) ?? -1);
  });
}

/** Formats a count that may be 'unlimited'. */
export function fmtCount(n: number | 'unlimited'): string {
  return n === 'unlimited' ? 'Unlimited' : String(n);
}
export function countValue(n: number | 'unlimited' | undefined): number | null {
  return n === undefined ? null : n === 'unlimited' ? Infinity : n;
}

/** Describes renewal requirements; fields are optional when the host doesn't say. */
export function fmtRenewal(r: { perDay?: number; hours?: number } | undefined): string {
  if (!r) return 'Not required';
  if (r.perDay && r.hours) return `${r.perDay}×/day, +${r.hours}h each`;
  return 'Required';
}

export function fmtRam(gb: number | null) {
  return gb == null ? '—' : `${gb} GB`;
}
export function fmtCpu(p: number | null) {
  return p == null ? '—' : `${p}%`;
}
export function fmtStorage(gb: number | null) {
  return gb == null ? 'Not published' : `${gb} GB`;
}
