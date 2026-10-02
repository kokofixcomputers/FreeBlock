import { useEffect, type ReactNode } from 'react';
import { Check, ExternalLink, HelpCircle, MapPin, X } from 'lucide-react';
import type { Host } from '../types';
import { fmtRenewal, fmtCount, fmtCpu, fmtRam, fmtStorage, REGION_LABELS, UPTIME_LABELS } from '../lib/filter';
import { HostIcon } from './HostIcon';

const flag = (v: boolean | undefined) =>
  v === undefined ? <HelpCircle className="unk" size={16} /> : v ? <Check className="yes" size={18} /> : <X className="no" size={18} />;

const unknown = <HelpCircle className="unk" size={16} />;

export function HostDetails({ host: h, onClose }: { host: Host; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const est = (k: 'ram' | 'cpu' | 'storage') => (h.estimated?.includes(k) ? '~' : '');

  const specs: [string, string][] = [
    ['RAM', est('ram') + fmtRam(h.ramGB)],
    ['CPU', est('cpu') + fmtCpu(h.cpuPercent)],
    ['Storage', est('storage') + fmtStorage(h.storageGB)],
    ['Players', h.maxPlayers != null ? String(h.maxPlayers) : '—'],
  ];

  const facts: [string, ReactNode][] = [
    ['CPU model', h.cpuModel ?? unknown],
    ['Uptime', UPTIME_LABELS[h.uptime]],
    ['Queue when busy', <span className={h.queue ? 'warn-text' : 'good-text'}>{h.queue ? 'Yes' : 'No'}</span>],
    ['Free servers', h.freeServers === undefined ? unknown : fmtCount(h.freeServers)],
    ['Free subdomain', h.subdomain ? <code>{h.subdomain}</code> : <X className="no" size={18} />],
    ['Free allocations', h.allocations === undefined ? unknown : fmtCount(h.allocations)],
    ['Free databases', h.databases ?? unknown],
    ['Renewal', fmtRenewal(h.renewal)],
    ['Managed via', h.control === 'discord' ? 'Discord (no web panel)' : 'Web panel'],
    ['Mods', flag(h.mods)],
    ['Plugins', flag(h.plugins)],
    ['Bedrock', flag(h.bedrock)],
    ['Ad-free', flag(h.ads === undefined ? undefined : !h.ads)],
    ['Proxy hosting', flag(h.proxy)],
    ['Backups', flag(h.backups)],
    ['Schedules', flag(h.schedules)],
    ['SFTP / file access', flag(h.ftp)],
    ['Custom domain', flag(h.customDomain)],
    ['DDoS protection', flag(h.ddosProtection)],
    [
      'Setup difficulty',
      h.difficulty === undefined ? unknown : (
        <span className="dots">{[1, 2, 3, 4, 5].map((n) => <i key={n} className={n <= h.difficulty! ? 'on' : ''} />)}</span>
      ),
    ],
  ];

  return (
    <div className="overlay" onClick={onClose}>
      <div className="details" role="dialog" aria-label={`${h.name} details`} style={{ ['--accent' as string]: h.color }} onClick={(e) => e.stopPropagation()}>
        <div className="details-head">
          <span className="logo"><HostIcon host={h} /></span>
          <div>
            <h2>{h.name}</h2>
            <p>{h.tagline}</p>
          </div>
          <button className="x" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>

        <div className="details-body">
          <div className="spec-tiles">
            {specs.map(([k, v]) => (
              <div key={k} className="tile"><span>{k}</span><b>{v}</b></div>
            ))}
          </div>

          {(h.specNotes || h.uptimeNote) && (
            <div className="note">
              {h.specNotes && <p>{h.specNotes}</p>}
              {h.uptimeNote && <p>{h.uptimeNote}</p>}
            </div>
          )}

          {h.rewards && (
            <section>
              <h4>Free rewards</h4>
              <p className="muted">{h.rewards}</p>
            </section>
          )}

          {h.connect && (
            <section>
              <h4>Example connect address</h4>
              <code className="connect">{h.connect}</code>
            </section>
          )}

          <section>
            <h4>Server locations</h4>
            {h.locations.length === 0 ? <p className="muted">Not listed.</p> : (
              <div className="locations">
                {h.locations.map((l) => (
                  <span key={`${l.country}-${l.city}`} className="loc">
                    <MapPin size={13} /> <b>{l.code}</b> <small>{l.city ?? l.country} · {REGION_LABELS[l.region]}</small>
                  </span>
                ))}
              </div>
            )}
          </section>

          <section>
            <h4>Server software</h4>
            {h.software.length === 0 ? <p className="muted">Not listed.</p> : (
              <div className="chips">{h.software.map((s) => <span key={s} className="chip">{s}</span>)}</div>
            )}
          </section>

          <section>
            <h4>Features</h4>
            <dl className="facts">
              {facts.map(([k, v]) => (
                <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
              ))}
            </dl>
          </section>

          <div className="procon">
            <section>
              <h4>Pros</h4>
              <ul>{h.pros.map((p) => <li key={p}>{p}</li>)}</ul>
            </section>
            <section>
              <h4>Cons</h4>
              {h.cons.length ? <ul>{h.cons.map((p) => <li key={p}>{p}</li>)}</ul> : <p className="muted">None listed.</p>}
            </section>
          </div>
        </div>

        <div className="details-foot">
          <small>Last checked {h.verified} · ~ = estimated</small>
          <a className="btn" href={h.url} target="_blank" rel="noreferrer">Visit {h.name} <ExternalLink size={14} /></a>
        </div>
      </div>
    </div>
  );
}
