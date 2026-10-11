import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { CommunityProvider } from './contexts/CommunityContext';
import { CommerceProvider } from './contexts/CommerceContext';
import { MusicProvider } from './contexts/MusicContext';
import { PodcastProvider } from './contexts/PodcastContext';
import { DirectorProvider } from './contexts/DirectorContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { Settings } from './pages/Settings';
import { ShotDetail } from './pages/studio/ShotDetail';
import { ScenePage } from './pages/studio/ScenePage';
import { StoryBiblePage } from './pages/studio/StoryBible';
import { JobQueue } from './pages/studio/JobQueue';
import { Continuity } from './pages/studio/Continuity';
import { DirectorsPlan } from './pages/studio/DirectorsPlan';
import { SequencePage } from './pages/studio/SequencePage';
import { StudioProjects } from './pages/studio/Projects';
import { StudioPublish } from './pages/studio/Publish';
import { Library } from './pages/Library';
import { Notifications } from './pages/Notifications';
import { Live } from './pages/Live';
import { AppShell } from './components/layout/AppShell';
import { RequireAuth } from './components/auth/RequireAuth';
import { Home } from './pages/Home';
import { Browse } from './pages/Browse';
import { Shorts } from './pages/Shorts';
import { TitleDetail } from './pages/TitleDetail';
import { Studio } from './pages/Studio';
import { Player } from './pages/Player';
import { CreatorPage } from './pages/CreatorPage';
import { Search } from './pages/Search';
import { Wallet } from './pages/Wallet';
import { CreatorEconomy } from './pages/CreatorEconomy';
import { Dashboard } from './pages/Dashboard';
import { Sports } from './pages/Sports';
import { Communities } from './pages/Communities';
import { CommunityDetail } from './pages/CommunityDetail';
import { Market } from './pages/Market';
import { DiscussionThread } from './pages/community/DiscussionThread';
import { WatchParties } from './pages/community/WatchParties';
import { WatchPartyRoom } from './pages/community/WatchPartyRoom';
import { CreateWatchParty } from './pages/community/CreateWatchParty';
import { Events } from './pages/community/Events';
import { EventDetail } from './pages/community/EventDetail';
import { FanCreations } from './pages/community/FanCreations';
import { FanCreationDetail } from './pages/community/FanCreationDetail';
import { UniversePage } from './pages/community/UniversePage';
import { CharacterPage } from './pages/community/CharacterPage';
import { PersonProfile } from './pages/community/PersonProfile';
import { PollsAndPredictions } from './pages/community/PollsAndPredictions';
import { UniverseStore } from './pages/market/UniverseStore';
import { ProductDetail } from './pages/market/ProductDetail';
import { CreatorStorePage } from './pages/market/CreatorStorePage';
import { CollectionVault } from './pages/market/CollectionVault';
import { Bag } from './pages/market/Bag';
import { Orders } from './pages/market/Orders';
import { OrderDetail } from './pages/market/OrderDetail';
import { OrderInvoice } from './pages/market/OrderInvoice';
import { Music } from './pages/Music';
import { WorldPage } from './pages/music/WorldPage';
import { ArtistPage } from './pages/music/ArtistPage';
import { TrackPage } from './pages/music/TrackPage';
import { LivePage } from './pages/music/LivePage';
import { PassportPage } from './pages/music/PassportPage';
import { Podcast } from './pages/Podcast';
import { EpisodePage } from './pages/podcast/EpisodePage';
import { ShowPage } from './pages/podcast/ShowPage';
import { PodcastCreatorPage } from './pages/podcast/CreatorPage';
import { PodcastWorldPage } from './pages/podcast/WorldPage';
import { TopicPage } from './pages/podcast/TopicPage';
import { PodcastLivePage } from './pages/podcast/LivePage';
import { DropPage } from './pages/podcast/DropPage';
import { PodcastPassportPage } from './pages/podcast/PassportPage';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ChooseAccountType } from './pages/auth/ChooseAccountType';
import { CompleteProfile } from './pages/auth/CompleteProfile';
import { VerifyEmail } from './pages/auth/VerifyEmail';
import { VerifyPhone } from './pages/auth/VerifyPhone';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';
import { Activate } from './pages/auth/Activate';
import { ThemeProvider } from './contexts/ThemeContext';

export function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <CommunityProvider>
            <CommerceProvider>
              <MusicProvider>
                <PodcastProvider>
                  <DirectorProvider>
                    <SettingsProvider>
            <Routes>
              {/* Authentication — rendered outside the application shell */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/verify-phone" element={<VerifyPhone />} />
              <Route path="/choose-account-type" element={<ChooseAccountType />} />
              <Route path="/complete-profile" element={<CompleteProfile />} />
              <Route path="/activate" element={<Activate />} />

              <Route element={<AppShell />}>
                {/* Open to everyone */}
                <Route path="/" element={<Home />} />
                <Route path="/browse/:section" element={<Browse />} />
                <Route path="/shorts" element={<Shorts />} />
                <Route path="/shorts/:slug" element={<Shorts />} />
                <Route path="/title/:slug" element={<TitleDetail />} />
                <Route path="/search" element={<Search />} />
                <Route path="/sports" element={<Sports />} />
                <Route path="/live" element={<Live />} />
                <Route path="/browse/live" element={<Navigate to="/live" replace />} />
                <Route path="/creator/:handle" element={<CreatorPage />} />
                <Route path="/people/:userId" element={<PersonProfile />} />
                <Route path="/universes/:universeId" element={<UniversePage />} />
                <Route path="/universes/:universeId/:section" element={<UniversePage />} />
                <Route path="/characters/:characterId" element={<CharacterPage />} />
                <Route path="/fan-creations" element={<FanCreations />} />
                <Route path="/fan-creations/:creationId" element={<FanCreationDetail />} />

                {/* HavaVerse Music — open, because discovery precedes identity */}
                <Route path="/music" element={<Music />} />
                <Route path="/music/world/:worldId" element={<WorldPage />} />
                <Route path="/music/artist/:artistId" element={<ArtistPage />} />
                <Route path="/music/track/:trackId" element={<TrackPage />} />
                <Route path="/music/live" element={<LivePage />} />
                <Route path="/music/live/:liveId" element={<LivePage />} />
                <Route path="/music/passport" element={<PassportPage />} />

                {/* HavaVerse Podcast */}
                <Route path="/podcast" element={<Podcast />} />
                <Route path="/podcast/episode/:episodeId" element={<EpisodePage />} />
                <Route path="/podcast/show/:showId" element={<ShowPage />} />
                <Route path="/podcast/creator/:hostId" element={<PodcastCreatorPage />} />
                <Route path="/podcast/world/:worldId" element={<PodcastWorldPage />} />
                <Route path="/podcast/topic/:topicId" element={<TopicPage />} />
                <Route path="/podcast/live" element={<PodcastLivePage />} />
                <Route path="/podcast/live/:liveId" element={<PodcastLivePage />} />
                <Route path="/podcast/drops" element={<DropPage />} />
                <Route path="/podcast/drop/:dropId" element={<DropPage />} />
                <Route path="/podcast/passport" element={<PodcastPassportPage />} />

                {/* Requires a HavaVerse identity */}
                <Route element={<RequireAuth />}>
                  <Route path="/watch/:slug" element={<Player />} />
                  <Route path="/studio" element={<Studio />} />
                  <Route path="/studio/projects" element={<StudioProjects />} />
                  <Route path="/studio/publish" element={<StudioPublish />} />
                  <Route path="/studio/shot/:shotId" element={<ShotDetail />} />
                  <Route path="/studio/scene/:sceneId" element={<ScenePage />} />
                  <Route path="/studio/bible" element={<StoryBiblePage />} />
                  <Route path="/studio/jobs" element={<JobQueue />} />
                  <Route path="/studio/continuity" element={<Continuity />} />
                  <Route path="/studio/rules" element={<DirectorsPlan />} />
                  <Route path="/studio/sequence/:sequenceId" element={<SequencePage />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/library" element={<Library />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/wallet" element={<Wallet />} />
                  <Route path="/creator/economy" element={<CreatorEconomy />} />
                  <Route path="/communities" element={<Communities />} />
                  <Route path="/community" element={<Navigate to="/communities" replace />} />
                  <Route path="/community/:slug" element={<CommunityDetail />} />
                  <Route path="/discussions/:threadId" element={<DiscussionThread />} />
                  <Route path="/watch-parties" element={<WatchParties />} />
                  <Route path="/watch-parties/create" element={<CreateWatchParty />} />
                  <Route path="/watch-parties/:partyId" element={<WatchPartyRoom />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/events/:eventId" element={<EventDetail />} />
                  <Route path="/polls" element={<PollsAndPredictions />} />
                  <Route path="/predictions" element={<PollsAndPredictions />} />
                  <Route path="/market" element={<Market />} />
                  <Route path="/market/universe/:universeId" element={<UniverseStore />} />
                  <Route path="/market/product/:productId" element={<ProductDetail />} />
                  <Route path="/market/store/:storeId" element={<CreatorStorePage />} />
                  <Route path="/market/collection" element={<CollectionVault />} />
                  <Route path="/market/bag" element={<Bag />} />
                  <Route path="/market/orders" element={<Orders />} />
                  <Route path="/market/orders/:orderId" element={<OrderDetail />} />
                  <Route path="/market/orders/:orderId/invoice" element={<OrderInvoice />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/settings/:section" element={<Settings />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
                    </SettingsProvider>
                  </DirectorProvider>
                </PodcastProvider>
              </MusicProvider>
            </CommerceProvider>
          </CommunityProvider>
        </AppProvider>
      </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>);

}