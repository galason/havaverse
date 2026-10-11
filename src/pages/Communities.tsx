import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SparklesIcon, UsersIcon } from 'lucide-react';
import type { CommunityCategory, CommunitySummary } from '../types/community';
import { communityApi } from '../services/communityApi';
import { CommunityHero } from '../components/community/CommunityHero';
import { HappeningNow } from '../components/community/HappeningNow';
import { CategoryTabs, categories } from '../components/community/CategoryTabs';
import { CommunityCard } from '../components/community/CommunityCard';
import { SectionHeader } from '../components/community/SectionHeader';
import { TrendingConversations } from '../components/community/TrendingConversations';
import { WatchTogether } from '../components/community/WatchTogether';
import { EventsPanel } from '../components/community/EventsPanel';
import { StoryUniverse } from '../components/community/StoryUniverse';
import { CreatorsPanel } from '../components/community/CreatorsPanel';
import { MadeByFans } from '../components/community/MadeByFans';
import { PredictionsPolls } from '../components/community/PredictionsPolls';
import { AchievementsPanel } from '../components/community/AchievementsPanel';
import { PeoplePanel } from '../components/community/PeoplePanel';
import { HavaAiCommunityPanel } from '../components/community/HavaAiCommunityPanel';
import { EmptyBlock, ErrorBlock, SkeletonRows } from '../components/community/StateBlocks';
import { useCommunity } from '../contexts/CommunityContext';

export function Communities() {
  const [params, setParams] = useSearchParams();
  const { memberships } = useCommunity();

  const paramCategory = params.get('category') as CommunityCategory | null;
  const category: CommunityCategory = categories.includes(paramCategory as CommunityCategory) ?
  paramCategory as CommunityCategory :
  'For you';

  const [communities, setCommunities] = React.useState<CommunitySummary[]>([]);
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'error'>('loading');

  const load = React.useCallback(async () => {
    setStatus('loading');
    const result = await communityApi.listCommunities();
    if (result.ok) {
      setCommunities(result.data);
      setStatus('ready');
    } else {
      setStatus('error');
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const setCategory = (next: CommunityCategory) =>
  setParams(next === 'For you' ? {} : { category: next }, { replace: true });

  const matches = communities.filter((c) => c.categories.includes(category));
  const mine = communities.filter((c) => memberships.some((m) => m.slug === c.slug));
  const because = communities.filter((c) => c.slug !== 'the-last-train').slice(0, 4);

  return (
    <div className="space-y-10 p-4 pb-12 sm:p-5">
      <CommunityHero />

      <HappeningNow />

      <section aria-labelledby="explore-communities-heading" id="explore-communities">
        <h2 id="explore-communities-heading" className="mb-3 text-lg font-bold tracking-tight text-white">
          Explore HavaVerse Community
        </h2>
        <CategoryTabs active={category} onChange={setCategory} />

        <div className="mt-5">
          <SectionHeader
            title={category === 'For you' ? 'Communities for you' : `${category} communities`}
            subtitle={
            category === 'For you' ?
            'Based on what you watch, follow and discuss.' :
            `${matches.length} ${matches.length === 1 ? 'community' : 'communities'} anchored to ${category.toLowerCase()}.`
            } />
          

          {status === 'loading' && <SkeletonRows rows={2} />}
          {status === 'error' && <ErrorBlock message="Could not load communities." onRetry={load} />}

          {status === 'ready' && (
          matches.length > 0 ?
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {matches.map((community) =>
            <li key={community.slug}>
                    <CommunityCard community={community} />
                  </li>
            )}
              </ul> :

          <EmptyBlock
            icon={<UsersIcon className="h-6 w-6" />}
            title={`No ${category.toLowerCase()} communities yet`}
            body="Communities appear here once there is something to anchor them to. Be the first to start one around a title you follow."
            action={
            <button
              type="button"
              onClick={() => setCategory('For you')}
              className="rounded-full bg-brand-indigo px-4 py-2 text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:bg-brand-violet">
              
                    Back to your recommendations
                  </button>
            } />)

          }
        </div>
      </section>

      {mine.length > 0 &&
      <section aria-labelledby="my-communities">
          <SectionHeader
          id="my-communities"
          title="My communities"
          subtitle="Everything you have joined" />
        
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
            {mine.map((community) =>
          <li key={community.slug}>
                <CommunityCard community={community} compact />
              </li>
          )}
          </ul>
        </section>
      }

      <section aria-labelledby="popular-fan-clubs">
        <SectionHeader
          id="popular-fan-clubs"
          title="Popular fan clubs"
          subtitle="The biggest rooms on HavaVerse right now" />
        
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
          {communities.map((community) =>
          <li key={community.slug}>
              <CommunityCard community={community} compact />
            </li>
          )}
        </ul>
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_1fr_0.95fr]">
        <TrendingConversations />
        <WatchTogether />
        <EventsPanel />
      </div>

      <StoryUniverse />

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <MadeByFans />
        <PredictionsPolls />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <CreatorsPanel />
        <div className="space-y-4">
          <AchievementsPanel />
          <PeoplePanel />
        </div>
      </div>

      <section aria-labelledby="because-you-watched">
        <SectionHeader
          id="because-you-watched"
          title="Because you watched The Last Train"
          subtitle="Communities close to the Railway universe"
          icon={<SparklesIcon className="h-5 w-5 text-brand-indigo" aria-hidden="true" />}
          actionTo="/universes/railway"
          actionLabel="Open the universe" />
        
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {because.map((community) =>
          <li key={community.slug}>
              <CommunityCard community={community} compact />
            </li>
          )}
        </ul>
        <p className="mt-3 text-[11px] text-mist-400">
          Drawn from what you have watched in HavaVerse Play — the same content graph that decides
          what appears on your home screen.{' '}
          <Link to="/fan-creations" className="font-semibold text-mist-200 hover:text-white">
            See what fans have made
          </Link>
          .
        </p>
      </section>

      <HavaAiCommunityPanel />
    </div>);

}