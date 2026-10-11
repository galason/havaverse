import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckIcon, ClapperboardIcon, LayersIcon, PlayIcon } from 'lucide-react';
import { HavaVerseLogo } from '../../components/brand/HavaVerseLogo';
import { useAuth, type AccountType } from '../../contexts/AuthContext';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { AuthButton } from '../../components/auth/AuthButton';

const options: {
  id: AccountType;
  name: string;
  blurb: string;
  icon: React.ComponentType<{className?: string;}>;
  recommended?: boolean;
}[] = [
{
  id: 'viewer',
  name: 'Viewer',
  blurb: 'Watch, discover, follow creators, join communities and enjoy entertainment.',
  icon: PlayIcon
},
{
  id: 'creator',
  name: 'Creator',
  blurb: 'Create, publish, build an audience and monetise your work.',
  icon: ClapperboardIcon
},
{
  id: 'both',
  name: 'Both',
  blurb: 'Watch and create. Access the complete HavaVerse experience.',
  icon: LayersIcon,
  recommended: true
}];


export function ChooseAccountType() {
  const { setAccountType, identity } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = React.useState<AccountType>(identity?.accountType ?? 'both');

  const persist = (type: AccountType) => {
    setAccountType(type);
    navigate('/complete-profile');
  };

  return (
    <AuthLayout compact>
      <div className="rounded-2xl border border-white/8 bg-ink-900/80 p-6 backdrop-blur sm:p-8">
        <HavaVerseLogo variant="icon" size="md" className="mx-auto" />
        <h1 className="mt-4 text-center text-2xl font-bold tracking-tight text-white">
          How will you use HavaVerse?
        </h1>
        <p className="mt-1 text-center text-sm text-mist-300">You can always change this later.</p>

        <fieldset className="mt-6 space-y-3">
          <legend className="sr-only">Choose an account type</legend>
          {options.map((option) => {
            const Icon = option.icon;
            const active = selected === option.id;
            return (
              <label
                key={option.id}
                className={[
                'flex cursor-pointer items-start gap-3.5 rounded-2xl border p-4 transition-colors duration-150 ease-entrance',
                active ?
                'border-brand-indigo bg-brand-indigo/10' :
                'border-white/10 bg-ink-850 hover:border-white/25'].
                join(' ')}>
                
                <input
                  type="radio"
                  name="account-type"
                  value={option.id}
                  checked={active}
                  onChange={() => setSelected(option.id)}
                  className="sr-only" />
                
                <span
                  className={[
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                  active ? 'bg-brand-indigo text-white' : 'bg-white/5 text-mist-300'].
                  join(' ')}>
                  
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{option.name}</span>
                    {option.recommended &&
                    <span className="rounded bg-brand-magenta/20 px-1.5 py-0.5 text-[10px] font-semibold text-brand-magenta">
                        Recommended
                      </span>
                    }
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-mist-300">
                    {option.blurb}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className={[
                  'mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
                  active ? 'border-brand-indigo bg-brand-indigo' : 'border-white/25'].
                  join(' ')}>
                  
                  {active && <CheckIcon className="h-3 w-3 text-white" />}
                </span>
              </label>);

          })}
        </fieldset>

        <p className="mt-4 text-[11px] leading-relaxed text-mist-400">
          This shapes what HavaVerse shows you first. It never locks you out — a viewer can start
          creating at any time, and creators keep the full viewing experience.
        </p>

        <AuthButton className="mt-5" onClick={() => persist(selected)}>
          Continue
        </AuthButton>

        <button
          type="button"
          onClick={() => persist('viewer')}
          className="mt-3 w-full text-center text-xs font-semibold text-mist-400 transition-colors duration-150 ease-entrance hover:text-white">
          
          Skip for now
        </button>
      </div>
    </AuthLayout>);

}