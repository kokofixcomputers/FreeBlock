import type { ReactNode } from 'react';
import { Check, ExternalLink, HelpCircle, MapPin, X } from 'lucide-react';
import { HostIcon } from './HostIcon';
import type { Host } from '../types';
import { fmtRenewal, countValue, fmtCount, fmtCpu, fmtRam, fmtStorage, REGION_LABELS, UPTIME_LABELS } from '../lib/filter';

interface Props {
  hosts: Host[];
  onRemove: (id: string) => void;
  onClose: () => void;
}

type Row = { label: string; render: (h: Host) => ReactNode; best?: (h: Host) => number | null };

const yes = (v: boolean | undefined) => (v === undefined ? <HelpCircle className="unk" size={16} aria-label="Unknown" /> : v ? <Check className="yes" size={18} /> : <X className="no" size={18} />);

const rows: Row[] = [
  { label: 'RAM', render: (h) => (h.estimated?.includes('ram') ? '~' : '') + fmtRam(h.ramGB), best: (h) => h.ramGB },
  { label: 'CPU', render: (h) => (h.estimated?.includes('cpu') ? '~' : '') + fmtCpu(h.cpuPercent), best: (h) => h.cpuPercent },
  { label: 'CPU model', render: (h) => h.cpuModel ?? <HelpCircle className="unk" size={16} /> },
  { label: 'Storage', render: (h) => (h.estimated?.includes('storage') ? '~' : '') + fmtStorage(h.storageGB), best: (h) => h.storageGB },
  { label: 'Max players', render: (h) => h.maxPlayers ?? 'Not published', best: (h) => h.maxPlayers },
  { label: 'Uptime', render: (h) => UPTIME_LABELS[h.uptime] },
  {
    label: 'Locations',
    render: (h) => (
      h.locations.length === 0 ? <HelpCircle className="unk" size={16} /> : <div className="stack">
        {h.locations.map((l) => (
          <span key={`${l.country}-${l.city}`}><MapPin size={12} /> {l.code} · {l.city ?? l.country} <small>· {REGION_LABELS[l.region]}</small></span>
        ))}
      </div>
    ),
  },
  { label: 'Software', render: (h) => h.software.length === 0 ? <HelpCircle className="unk" size={16} /> : <div className="chips">{h.software.map((s) => <span key={s} className="chip">{s}</span>)}</div> },
  { label: 'Mods', render: (h) => yes(h.mods) },
  { label: 'Plugins', render: (h) => yes(h.plugins) },
  { label: 'Bedrock', render: (h) => yes(h.bedrock) },
  { label: 'Ad-free', render: (h) => yes(h.ads === undefined ? undefined : !h.ads) },
  { label: 'Free servers', render: (h) => (h.freeServers === undefined ? <HelpCircle className="unk" size={16} /> : fmtCount(h.freeServers)), best: (h) => countValue(h.freeServers) },
  { label: 'Queue when busy', render: (h) => <span className={h.queue ? 'warn-text' : 'good-text'}>{h.queue ? 'Yes' : 'No'}</span> },
  { label: 'Free subdomain', render: (h) => h.subdomain ?? <X className="no" size={18} /> },
  { label: 'Free databases', render: (h) => h.databases ?? <HelpCircle className="unk" size={16} />, best: (h) => h.databases ?? null },
  { label: 'Rewards', render: (h) => h.rewards ?? <X className="no" size={18} /> },
  { label: 'Renewal', render: (h) => fmtRenewal(h.renewal) },
  { label: 'Connect address', render: (h) => (h.connect ? <code>{h.connect}</code> : h.subdomain ?? <X className="no" size={18} />) },
  { label: 'Free allocations', render: (h) => (h.allocations === undefined ? <HelpCircle className="unk" size={16} /> : fmtCount(h.allocations)), best: (h) => countValue(h.allocations) },
  { label: 'Managed via', render: (h) => (h.control === 'discord' ? 'Discord (no web panel)' : 'Web panel') },
  { label: 'Proxy hosting', render: (h) => yes(h.proxy) },
  { label: 'Backups', render: (h) => yes(h.backups) },
  { label: 'Schedules', render: (h) => yes(h.schedules) },
  { label: 'FTP / file access', render: (h) => yes(h.ftp) },
  { label: 'Custom domain', render: (h) => yes(h.customDomain) },
  { label: 'DDoS protection', render: (h) => yes(h.ddosProtection) },
  { label: 'Setup difficulty', render: (h) => h.difficulty === undefined ? <HelpCircle className="unk" size={16} /> : <span className="dots">{[1, 2, 3, 4, 5].map((n) => <i key={n} className={n <= (h.difficulty ?? 0) ? 'on' : ''} />)}</span> },
  { label: 'Pros', render: (h) => <ul>{h.pros.map((p) => <li key={p}>{p}</li>)}</ul> },
  { label: 'Cons', render: (h) => <ul>{h.cons.map((p) => <li key={p}>{p}</li>)}</ul> },
];

export function CompareView({ hosts, onRemove, onClose }: Props) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="compare" onClick={(e) => e.stopPropagation()} style={{ ['--cols' as string]: hosts.length }}>
        <div className="compare-top">
          <h2>Compare hosts</h2>
          <button className="btn ghost" onClick={onClose}>Close <X size={14} /></button>
        </div>
        <div className="compare-scroll">
          <table>
            <thead>
              <tr>
                <th />
                {hosts.map((h) => (
                  <th key={h.id} style={{ ['--accent' as string]: h.color }}>
                    <div className="col-head">
                      <span className="logo sm"><HostIcon host={h} size={16} /></span>
                      <b>{h.name}</b>
                      <button className="x" onClick={() => onRemove(h.id)} aria-label={`Remove ${h.name}`}><X size={14} /></button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const vals = r.best ? hosts.map((h) => r.best!(h)) : [];
                const nums = vals.filter((v): v is number => v != null);
                const max = nums.length > 1 ? Math.max(...nums) : null;
                const winners = max != null && nums.filter((n) => n === max).length < nums.length;
                return (
                  <tr key={r.label}>
                    <th scope="row">{r.label}</th>
                    {hosts.map((h, i) => (
                      <td key={h.id} className={winners && vals[i] === max ? 'best' : ''}>{r.render(h)}</td>
                    ))}
                  </tr>
                );
              })}
              <tr>
                <th scope="row" />
                {hosts.map((h) => (
                  <td key={h.id}><a className="btn" href={h.url} target="_blank" rel="noreferrer">Visit {h.name} <ExternalLink size={14} /></a></td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <p className="foot-note">~ = estimated. Highlighted = best value in that row.</p>
      </div>
    </div>
  );
}
