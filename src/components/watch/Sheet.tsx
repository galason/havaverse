import React from 'react';
import { XIcon } from 'lucide-react';

interface SheetProps {
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
}

/** Accessible modal used by every contextual watch flow. */
export function Sheet({ title, description, onClose, children }: SheetProps) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    ref.current?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/80 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 cursor-default" />
      
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="relative max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-2xl border border-white/10 bg-ink-900 p-5 focus:outline-none sm:rounded-2xl">
        
        <div className="mb-4 flex items-start gap-3">
          <div className="min-w-0">
            <h2 className="text-base font-bold tracking-tight text-white">{title}</h2>
            {description && <p className="mt-1 text-xs text-mist-400">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="ml-auto grid h-8 w-8 shrink-0 place-items-center rounded-full text-mist-400 transition-colors duration-150 ease-entrance hover:bg-white/5 hover:text-white">
            
            <XIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>);

}