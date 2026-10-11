import React from 'react';
import { BrainIcon, FlameIcon, MessageSquareIcon, MicIcon, TrophyIcon, TvIcon } from 'lucide-react';
import { achievementRules } from '../../data/communityContent';
import { useCommunity } from '../../contexts/CommunityContext';

const icons: Record<string, React.ComponentType<{className?: string;}>> = {
  trophy: TrophyIcon,
  tv: TvIcon,
  message: MessageSquareIcon,
  brain: BrainIcon,
  flame: FlameIcon,
  mic: MicIcon
};

export function AchievementsPanel() {
  const { counters, earnedAchievements } = useCommunity();

  return (
    <section
      aria-labelledby="community-achievements"
      className="rounded-2xl border border-white/5 bg-ink-900 p-4">
      
      <h2 id="community-achievements" className="text-base font-bold tracking-tight text-white">
        Your standing in the community
      </h2>
      <p className="mt-0.5 text-xs text-mist-400">
        {earnedAchievements.length} of {achievementRules.length} earned — evaluated against what you
        actually do here, not a global follower count.
      </p>

      <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {achievementRules.map((rule) => {
          const Icon = icons[rule.icon] ?? TrophyIcon;
          const progress = counters[rule.metric];
          const earned = earnedAchievements.includes(rule.id);
          return (
            <li
              key={rule.id}
              className={[
              'rounded-xl border p-3',
              earned ? 'border-brand-amber/30 bg-brand-amber/5' : 'border-white/5 bg-ink-850'].
              join(' ')}>
              
              <Icon
                className={['h-4 w-4', earned ? 'text-brand-amber' : 'text-mist-400'].join(' ')}
                aria-hidden="true" />
              
              <p
                className={[
                'mt-1.5 text-xs font-semibold',
                earned ? 'text-white' : 'text-mist-300'].
                join(' ')}>
                
                {rule.name}
              </p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-mist-400">{rule.detail}</p>
              {!earned &&
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-mist-400">
                  {progress} / {rule.threshold}
                </p>
              }
            </li>);

        })}
      </ul>
    </section>);

}