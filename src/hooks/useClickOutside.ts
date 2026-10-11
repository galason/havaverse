import React from 'react';

export function useClickOutside<T extends HTMLElement>(
active: boolean,
onClose: () => void)
: React.RefObject<T> {
  const ref = React.useRef<T>(null);

  React.useEffect(() => {
    if (!active) return;

    const handlePointer = (event: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) onClose();
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [active, onClose]);

  return ref;
}