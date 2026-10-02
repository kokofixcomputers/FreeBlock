export type Region =
  | 'north-america'
  | 'south-america'
  | 'europe'
  | 'asia'
  | 'oceania'
  | 'africa';

export type Uptime = '24/7' | 'on-demand' | 'limited';

export type Software =
  | 'Vanilla'
  | 'Paper'
  | 'Spigot'
  | 'Purpur'
  | 'Pufferfish'
  | 'Folia'
  | 'Forge'
  | 'NeoForge'
  | 'Fabric'
  | 'Quilt'
  | 'Legacy Fabric'
  | 'Sponge'
  | 'Velocity'
  | 'BungeeCord'
  | 'Waterfall'
  | 'Velocity-CTD'
  | 'Canvas'
  | 'Arclight'
  | 'Mohist'
  | 'Youer'
  | 'Magma'
  | 'DivineMC'
  | 'Leaf'
  | 'Leaves'
  | 'ASPaper'
  | 'Pluto'
  | 'LooHP Limbo'
  | 'NanoLimbo'
  | 'Bedrock';

export type HostIconName = 'mountain' | 'leaf' | 'satellite' | 'zap' | 'flame' | 'cloud' | 'server'
  | 'sprout' | 'play' | 'rocket' | 'plug' | 'pickaxe' | 'message' | 'infinity';

export type SpecKey = 'ram' | 'cpu' | 'storage';

export interface Location {
  country: string;
  /** ISO country code, e.g. 'US'. */
  code: string;
  region: Region;
  city?: string;
}

export interface Host {
  id: string;
  name: string;
  url: string;
  tagline: string;
  /** Brand colour used for the card accent. */
  color: string;
  icon: HostIconName;

  /** RAM in GB. `null` = not published. */
  ramGB: number | null;
  /** CPU model, e.g. 'AMD Ryzen 9 7950X'. */
  cpuModel?: string;
  /** CPU as a percentage of ONE core (100 = 1 full core, 400 = 4 cores). `null` = not published. */
  cpuPercent: number | null;
  /** Storage in GB. `null` = not published / effectively unlimited. */
  storageGB: number | null;
  /** Specs that are best guesses rather than officially published numbers. */
  estimated?: SpecKey[];
  specNotes?: string;

  maxPlayers: number | null;
  uptime: Uptime;
  uptimeNote?: string;
  locations: Location[];
  software: Software[];

  /** Feature flags: leave out (undefined) when unknown — the UI shows "unknown". */
  mods?: boolean;
  plugins?: boolean;
  bedrock?: boolean;
  ads?: boolean;
  backups?: boolean;
  /** Lets you run proxies (e.g. Velocity/BungeeCord) for free. */
  proxy?: boolean;
  /** Scheduled tasks (e.g. timed restarts/commands). */
  schedules?: boolean;
  ftp?: boolean;
  customDomain?: boolean;
  ddosProtection?: boolean;

  /** True if you may wait in a queue when the host is busy. */
  queue?: boolean;
  /** Free subdomain pattern, e.g. '*.play.hosting'. Omit if none. */
  subdomain?: string;
  /** How many free servers one account can run. */
  freeServers?: number | 'unlimited';
  /** Free-to-earn perks, e.g. daily coins that can be redeemed. */
  rewards?: string;
  /** Free databases included. */
  databases?: number;
  /** Free port allocations included. */
  allocations?: number | 'unlimited';
  /** Servers need renewing: how many times per day, and hours added each time. */
  renewal?: { perDay?: number; hours?: number };
  /** Example connect address when there is no subdomain, e.g. 'play2.example.com:25565'. */
  connect?: string;
  /** How you manage the server. Default 'panel'. */
  control?: 'panel' | 'discord';

  /** 1 = easiest, 5 = hardest. */
  difficulty?: 1 | 2 | 3 | 4 | 5;
  pros: string[];
  cons: string[];
  /** YYYY-MM the numbers were last checked. */
  verified: string;
}
