import electionsRaw from '@/data/elections-pipeline.json';

export type Election = {
  id: string;
  flag: string;
  country: string;
  type: string;
  date: string;
  status: 'primary' | 'high' | 'watch' | 'cat';
  lead: string;
  notes: string;
  action: string;
};

export const elections = electionsRaw as Election[];

export const STATUS_META: Record<
  Election['status'],
  { label: string; cls: string }
> = {
  primary: { label: '🎯 Primary',   cls: 'primary' },
  high:    { label: '⚡ High',       cls: 'high'    },
  watch:   { label: '👁 Watch',     cls: 'watch'   },
  cat:     { label: '📋 Catalogue', cls: 'cat'     },
};
