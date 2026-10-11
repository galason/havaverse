import React from 'react';

interface SocialAuthButtonsProps {
  verb?: string;
  disabled?: boolean;
  onSelect: (provider: string) => void;
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.45a5.5 5.5 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.57-5.17 3.57-8.65Z" />
      
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.08 7.94-2.92l-3.88-3c-1.08.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.94H1.28v3.1A12 12 0 0 0 12 24Z" />
      
      <path
        fill="#FBBC05"
        d="M5.29 14.29a7.2 7.2 0 0 1 0-4.58V6.61H1.28a12 12 0 0 0 0 10.78l4.01-3.1Z" />
      
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.34.61 4.58 1.8l3.44-3.44C17.95 1.2 15.24 0 12 0A12 12 0 0 0 1.28 6.61l4.01 3.1C6.23 6.86 8.88 4.75 12 4.75Z" />
      
    </svg>);

}

function AppleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white" aria-hidden="true">
      <path d="M16.4 12.7c0-2.5 2-3.7 2.1-3.8-1.2-1.7-3-1.9-3.6-2-1.5-.2-3 .9-3.8.9-.8 0-2-.9-3.3-.8-1.7 0-3.3 1-4.2 2.5-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.5 1.3-.05 1.8-.8 3.4-.8 1.6 0 2 .8 3.4.8 1.4 0 2.3-1.2 3.1-2.5.98-1.4 1.4-2.8 1.4-2.9-.03-.02-2.7-1-2.7-4.1Zm-2.5-7.6c.7-.9 1.2-2.1 1.1-3.3-1 .04-2.3.7-3.1 1.6-.6.8-1.2 2-1 3.2 1.2.1 2.3-.6 3-1.5Z" />
    </svg>);

}

function MicrosoftMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path fill="#F25022" d="M1 1h10.2v10.2H1z" />
      <path fill="#7FBA00" d="M12.8 1H23v10.2H12.8z" />
      <path fill="#00A4EF" d="M1 12.8h10.2V23H1z" />
      <path fill="#FFB900" d="M12.8 12.8H23V23H12.8z" />
    </svg>);

}

const providers = [
{ name: 'Google', mark: GoogleMark },
{ name: 'Apple', mark: AppleMark },
{ name: 'Microsoft', mark: MicrosoftMark }];


export function SocialAuthButtons({
  verb = 'Continue',
  disabled,
  onSelect
}: SocialAuthButtonsProps) {
  return (
    <ul className="space-y-2.5">
      {providers.map((provider) => {
        const Mark = provider.mark;
        return (
          <li key={provider.name}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onSelect(provider.name)}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-white/12 bg-ink-850 px-4 py-3 text-sm font-medium text-white transition-colors duration-150 ease-entrance hover:border-white/30 disabled:opacity-50">
              
              <Mark />
              {verb} with {provider.name}
            </button>
          </li>);

      })}
    </ul>);

}