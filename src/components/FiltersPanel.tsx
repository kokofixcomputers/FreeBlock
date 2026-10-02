import { useState } from 'react';
import type { Region, Software } from '../types';
import {
  REGION_LABELS, UPTIME_LABELS, defaultFilters,
  type Filters, type SortKey,
} from '../lib/filter';

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
  regions: Region[];
  availableSoftware: Software[];
  count: number;
}

function toggle<T>(list: T[], v: T): T[] {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
}

const SOFTWARE_PREVIEW = 10;

export function FiltersPanel({ filters: f, onChange, regions, availableSoftware, count }: Props) {
  const [showAllSoftware, setShowAllSoftware] = useState(false);
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => onChange({ ...f, [k]: v });

  return (
    <aside className="filters">
      <div className="filters-head">
        <h2>Filters <span className="count">{count}</span></h2>
        <button className="link" onClick={() => onChange(defaultFilters)}>Reset</button>
      </div>

      <input
        className="search"
        placeholder="Search hosts…"
        value={f.query}
        onChange={(e) => set('query', e.target.value)}
      />

      <label className="field">
        <span>Sort by</span>
        <select value={f.sort} onChange={(e) => set('sort', e.target.value as SortKey)}>
          <option value="ram">Most RAM</option>
          <option value="cpu">Most CPU</option>
          <option value="storage">Most storage</option>
          <option value="name">Name</option>
        </select>
      </label>

      <Slider label="Min RAM" value={f.minRam} max={24} step={1} unit=" GB" onChange={(v) => set('minRam', v)} />
      <Slider label="Min CPU" value={f.minCpu} max={600} step={50} unit="%" onChange={(v) => set('minCpu', v)} />
      <Slider label="Min storage" value={f.minStorage} max={200} step={5} unit=" GB" onChange={(v) => set('minStorage', v)} />

      <div className="group">
        <span className="group-title">Server location</span>
        <div className="pills">
          {regions.map((r) => (
            <button key={r} className={`pill ${f.regions.includes(r) ? 'on' : ''}`} onClick={() => set('regions', toggle(f.regions, r))}>
              {REGION_LABELS[r]}
            </button>
          ))}
        </div>
      </div>

      <div className="group">
        <span className="group-title">Uptime</span>
        <div className="pills">
          {(['any', '24/7', 'on-demand', 'limited'] as const).map((u) => (
            <button key={u} className={`pill ${f.uptime === u ? 'on' : ''}`} onClick={() => set('uptime', u)}>
              {u === 'any' ? 'Any' : UPTIME_LABELS[u]}
            </button>
          ))}
        </div>
      </div>

      <div className="group">
        <span className="group-title">Server software</span>
        <div className="pills">
          {(showAllSoftware ? availableSoftware : availableSoftware.slice(0, SOFTWARE_PREVIEW)).map((s) => (
            <button key={s} className={`pill ${f.software.includes(s) ? 'on' : ''}`} onClick={() => set('software', toggle(f.software, s))}>
              {s}
            </button>
          ))}
          {availableSoftware.length > SOFTWARE_PREVIEW && (
            <button className="pill more" onClick={() => setShowAllSoftware((v) => !v)}>
              {showAllSoftware ? 'Show less' : `+${availableSoftware.length - SOFTWARE_PREVIEW} more`}
            </button>
          )}
        </div>
      </div>

      <div className="group">
        <span className="group-title">Must have</span>
        {([
          ['mods', 'Mod support'],
          ['plugins', 'Plugin support'],
          ['bedrock', 'Bedrock / cross-play'],
          ['proxy', 'Proxy hosting'],
          ['noAds', 'No ads'],
          ['noQueue', 'No queue'],
          ['subdomain', 'Free subdomain'],
        ] as const).map(([k, label]) => (
          <label key={k} className="check">
            <input type="checkbox" checked={f[k]} onChange={(e) => set(k, e.target.checked)} />
            <span>{label}</span>
          </label>
        ))}
      </div>
    </aside>
  );
}

function Slider({ label, value, max, step, unit, onChange }: {
  label: string; value: number; max: number; step: number; unit: string; onChange: (v: number) => void;
}) {
  return (
    <label className="field">
      <span className="field-row">
        <span>{label}</span>
        <b>{value === 0 ? 'Any' : `${value}${unit}+`}</b>
      </span>
      <input type="range" min={0} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}
