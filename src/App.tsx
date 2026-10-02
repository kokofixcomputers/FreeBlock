import { useEffect, useMemo, useState } from 'react';
import { hosts, LAST_UPDATED } from './data/hosts';
import { ALL_SOFTWARE, applyFilters, defaultFilters, type Filters } from './lib/filter';
import type { Region } from './types';
import { GitBranch, GitPullRequest, Pickaxe, X } from 'lucide-react';
import { EDIT_DATA_URL, NEW_ISSUE_URL, REPO } from './lib/links';
import { HostIcon } from './components/HostIcon';
import { FiltersPanel } from './components/FiltersPanel';
import { HostCard } from './components/HostCard';
import { HostDetails } from './components/HostDetails';
import { CompareView } from './components/CompareView';

const MAX_COMPARE = 4;
const BASE = import.meta.env.BASE_URL;

/** Deep links: /<base>/<host-id> opens that host's details (GitHub Pages serves 404.html = this app). */
function idFromPath(): string | null {
  const slug = decodeURIComponent(window.location.pathname.slice(BASE.length)).replace(/\/$/, '');
  return hosts.some((h) => h.id === slug) ? slug : null;
}
const STORAGE_KEY = 'freeblock:compare';

function loadSelected(): string[] {
  try {
    const ids: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return ids.filter((id) => hosts.some((h) => h.id === id)).slice(0, MAX_COMPARE);
  } catch {
    return [];
  }
}

export default function App() {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [selected, setSelected] = useState<string[]>(loadSelected);
  const [comparing, setComparing] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(idFromPath);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(selected)); } catch { /* ignore */ }
  }, [selected]);

  useEffect(() => {
    if (selected.length < 2) setComparing(false);
  }, [selected]);

  useEffect(() => {
    const onPop = () => setDetailId(idFromPath());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const openDetails = (id: string) => {
    setDetailId(id);
    window.history.pushState(null, '', BASE + id);
  };
  const closeDetails = () => {
    setDetailId(null);
    if (idFromPath()) window.history.pushState(null, '', BASE);
  };

  const regions = useMemo(
    () => [...new Set(hosts.flatMap((h) => h.locations.map((l) => l.region)))] as Region[],
    [],
  );
  const availableSoftware = useMemo(
    () => ALL_SOFTWARE.filter((s) => hosts.some((h) => h.software.includes(s))),
    [],
  );
  const visible = useMemo(() => applyFilters(hosts, filters), [filters]);
  const chosen = hosts.filter((h) => selected.includes(h.id));

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length < MAX_COMPARE ? [...s, id] : s));

  return (
    <>
      <div className="bg" aria-hidden />
      <header className="hero">
        <div className="hero-top">
          <span className="eyebrow"><Pickaxe size={14} /> FreeBlock</span>
          <a className="btn ghost" href={REPO} target="_blank" rel="noreferrer">
            <GitBranch size={15} /> Contribute
          </a>
        </div>
        <h1>Free Minecraft hosting, <em>compared.</em></h1>
        <p>
          {hosts.length} free hosts. Real RAM, CPU and storage numbers, server locations, and a side-by-side
          compare mode — so you can pick a host in a minute, not a weekend.
        </p>
      </header>

      <main className="layout">
        <button className="btn ghost mobile-filter" onClick={() => setShowFilters((v) => !v)}>
          {showFilters ? 'Hide filters' : `Filters (${visible.length})`}
        </button>
        <div className={`filters-wrap ${showFilters ? 'open' : ''}`}>
          <FiltersPanel filters={filters} onChange={setFilters} regions={regions} availableSoftware={availableSoftware} count={visible.length} />
        </div>

        <section className="grid">
          {visible.map((h) => (
            <HostCard
              key={h.id}
              host={h}
              selected={selected.includes(h.id)}
              disabled={selected.length >= MAX_COMPARE}
              onToggle={() => toggle(h.id)}
              onDetails={() => openDetails(h.id)}
            />
          ))}
          {visible.length === 0 && (
            <div className="empty">
              <p>No hosts match those filters.</p>
              <button className="btn" onClick={() => setFilters(defaultFilters)}>Reset filters</button>
            </div>
          )}
        </section>
      </main>

      <section className="contribute">
        <div>
          <h2>Know a host we’re missing?</h2>
          <p>
            FreeBlock is open source. Add a new host, fix outdated specs or improve anything else — all host data lives in a
            single file, so most changes are one small pull request.
          </p>
        </div>
        <div className="contribute-actions">
          <a className="btn primary" href={EDIT_DATA_URL} target="_blank" rel="noreferrer">
            <GitPullRequest size={15} /> Add or edit a host
          </a>
          <a className="btn ghost" href={NEW_ISSUE_URL} target="_blank" rel="noreferrer">Report an issue</a>
          <a className="btn ghost" href={REPO} target="_blank" rel="noreferrer"><GitBranch size={15} /> View on GitHub</a>
        </div>
      </section>

      <footer className="site-foot">
        Free-tier limits change often. Numbers marked “~” are estimates. Last checked {LAST_UPDATED} — always confirm on the host’s site.
      </footer>

      {selected.length > 0 && (
        <div className="tray">
          <div className="tray-items">
            {chosen.map((h) => (
              <span key={h.id} className="tray-chip" style={{ ['--accent' as string]: h.color }}>
                <HostIcon host={h} size={14} /> {h.name}
                <button onClick={() => toggle(h.id)} aria-label={`Remove ${h.name}`}><X size={14} /></button>
              </span>
            ))}
          </div>
          <button className="link" onClick={() => setSelected([])}>Clear</button>
          <button className="btn primary" disabled={selected.length < 2} onClick={() => setComparing(true)}>
            {selected.length < 2 ? 'Pick one more' : `Compare ${selected.length}`}
          </button>
        </div>
      )}

      {detailId && <HostDetails host={hosts.find((h) => h.id === detailId)!} onClose={closeDetails} />}
      {comparing && chosen.length >= 2 && (
        <CompareView hosts={chosen} onRemove={toggle} onClose={() => setComparing(false)} />
      )}
    </>
  );
}
