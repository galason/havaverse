import React from 'react';

export function Divider({ label = 'OR' }: {label?: string;}) {
  return (
    <div className="flex items-center gap-3" role="separator" aria-label={label}>
      <span className="h-px flex-1 bg-white/10" />
      <span className="text-[11px] font-semibold tracking-[0.14em] text-mist-400">{label}</span>
      <span className="h-px flex-1 bg-white/10" />
    </div>);

}