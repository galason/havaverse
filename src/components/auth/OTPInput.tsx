import React from 'react';

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  invalid?: boolean;
  disabled?: boolean;
  length?: number;
}

export function OTPInput({
  value,
  onChange,
  onComplete,
  invalid = false,
  disabled = false,
  length = 6
}: OTPInputProps) {
  const refs = React.useRef<(HTMLInputElement | null)[]>([]);

  const setDigit = (index: number, digit: string) => {
    const next = value.padEnd(length, ' ').split('');
    next[index] = digit;
    const joined = next.join('').replace(/\s/g, '');
    onChange(joined);
    if (digit && index < length - 1) refs.current[index + 1]?.focus();
    if (joined.length === length) onComplete?.(joined);
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !value[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
    if (event.key === 'ArrowLeft' && index > 0) refs.current[index - 1]?.focus();
    if (event.key === 'ArrowRight' && index < length - 1) refs.current[index + 1]?.focus();
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    onChange(pasted);
    refs.current[Math.min(pasted.length, length - 1)]?.focus();
    if (pasted.length === length) onComplete?.(pasted);
  };

  return (
    <div
      role="group"
      aria-label="Six digit verification code"
      className="flex justify-center gap-2 sm:gap-2.5">
      
      {Array.from({ length }).map((_, index) =>
      <input
        key={index}
        ref={(el) => {
          refs.current[index] = el;
        }}
        value={value[index] ?? ''}
        onChange={(e) => setDigit(index, e.target.value.replace(/\D/g, '').slice(-1))}
        onKeyDown={(e) => handleKeyDown(index, e)}
        onPaste={handlePaste}
        disabled={disabled}
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={1}
        aria-label={`Digit ${index + 1}`}
        aria-invalid={invalid}
        className={[
        'h-12 w-11 rounded-xl border bg-ink-850 text-center font-display text-2xl tracking-wider text-white transition-colors duration-150 ease-entrance focus:outline-none disabled:opacity-50 sm:h-14 sm:w-12',
        invalid ? 'border-live/70 focus:border-live' : 'border-white/10 focus:border-brand-indigo'].
        join(' ')} />

      )}
    </div>);

}