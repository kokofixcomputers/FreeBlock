import { Clock, ExternalLink, MapPin } from 'lucide-react';
import { HostIcon } from './HostIcon';
import type { Host } from '../types';
import { fmtCount, fmtCpu, fmtRam, fmtStorage, UPTIME_LABELS } from '../lib/filter';
import { SpecBar } from './SpecBar';

interface Props {
  host: Host;
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
  onDetails: () => void;
}

// Bar scales: the top of each bar is a "big free tier" benchmark.
const MAX = { ram: 8, cpu: 600, storage: 100 };

export function HostCard({ host: h, selected, disabled, onToggle, onDetails }: Props) {
  const est = (k: 'ram' | 'cpu' | 'storage') => h.estimated?.includes(k);
  return (
    <article className={`card ${selected ? 'is-selected' : ''}`} style={{ ['--accent' as string]: h.color }}>
      <header className="card-head">
        <div className="logo"><HostIcon host={h} /></div>
        <div className="card-title">
          <h3>{h.name}</h3>
          <p>{h.tagline}</p>
        </div>
      </header>

      <div className="specs">
        <SpecBar label="RAM" value={fmtRam(h.ramGB)} ratio={(h.ramGB ?? 0) / MAX.ram} estimated={est('ram')} color="var(--accent)" />
        <SpecBar label="CPU" value={fmtCpu(h.cpuPercent)} ratio={(h.cpuPercent ?? 0) / MAX.cpu} estimated={est('cpu')} color="var(--accent)" />
        {h.cpuModel && <div className="cpu-model">{h.cpuModel}</div>}
        <SpecBar label="Storage" value={fmtStorage(h.storageGB)} ratio={h.storageGB == null ? 0 : h.storageGB / MAX.storage} estimated={est('storage')} color="var(--accent)" />
      </div>

      <div className="chips">
        <span className="chip"><Clock size={12} /> {UPTIME_LABELS[h.uptime]}</span>
        {h.mods && <span className="chip">Mods</span>}
        {h.plugins && <span className="chip">Plugins</span>}
        {h.bedrock && <span className="chip">Bedrock</span>}
        {h.ads !== undefined && <span className={`chip ${h.ads ? 'warn' : 'good'}`}>{h.ads ? 'Ads' : 'No ads'}</span>}
        {h.freeServers && <span className="chip good">{fmtCount(h.freeServers)} servers</span>}
        {h.renewal && <span className="chip warn">{h.renewal.perDay && h.renewal.hours ? `Renew ${h.renewal.perDay}×/day · +${h.renewal.hours}h` : 'Needs renewal'}</span>}
        {h.proxy && <span className="chip">Proxies</span>}
        {h.queue && <span className="chip warn">Queue</span>}
        {h.control === 'discord' && <span className="chip">Discord-managed</span>}
        {h.subdomain && <span className="chip good">{h.subdomain}</span>}
      </div>

      <div className="locations">
        {h.locations.map((l) => (
          <span key={`${l.country}-${l.city}`} className="loc" title={`${l.city ? l.city + ', ' : ''}${l.country}`}>
            <MapPin size={13} /> <b>{l.code}</b> <small>{l.city ?? l.country}</small>
          </span>
        ))}
      </div>

      <footer className="card-foot">
        <label className={`compare-toggle ${disabled && !selected ? 'off' : ''}`}>
          <input type="checkbox" checked={selected} disabled={disabled && !selected} onChange={onToggle} />
          <span>Compare</span>
        </label>
        <button className="btn ghost" onClick={onDetails}>Details</button>
        <a className="btn" href={h.url} target="_blank" rel="noreferrer">
          Visit <ExternalLink size={14} />
        </a>
      </footer>
    </article>
  );
}
