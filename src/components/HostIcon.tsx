import { useState } from 'react';
import {
  Cloud, Flame, Infinity as InfinityIcon, Leaf, MessageCircle, Mountain, Pickaxe, Play, Plug, Rocket, Satellite, Server, Sprout, Zap, type LucideIcon } from 'lucide-react';
import type { Host, HostIconName } from '../types';

const FALLBACK: Record<HostIconName, LucideIcon> = {
  sprout: Sprout, play: Play, rocket: Rocket, plug: Plug, pickaxe: Pickaxe, message: MessageCircle, infinity: InfinityIcon,
  mountain: Mountain, leaf: Leaf, satellite: Satellite, zap: Zap, flame: Flame, cloud: Cloud, server: Server,
};

/** Host favicon from favicone.com, falling back to the host's lucide icon if it fails to load. */
export function HostIcon({ host, size = 24 }: { host: Pick<Host, 'url' | 'icon' | 'name'>; size?: number }) {
  const [failed, setFailed] = useState(false);
  const domain = new URL(host.url).hostname.replace(/^www\./, '');

  if (failed) {
    const Icon = FALLBACK[host.icon];
    return <Icon size={size} strokeWidth={1.8} />;
  }
  return (
    <img
      src={`https://favicone.com/${domain}?s=64`}
      alt={`${host.name} logo`}
      width={size}
      height={size}
      loading="lazy"
      style={{ borderRadius: 4, objectFit: 'contain' }}
      onError={() => setFailed(true)}
    />
  );
}
