import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CameraIcon } from 'lucide-react';
import { IMAGES } from '../../data/catalog';
import { HavaVerseLogo } from '../../components/brand/HavaVerseLogo';
import { useAuth } from '../../contexts/AuthContext';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { TextField } from '../../components/auth/TextField';
import { AuthButton } from '../../components/auth/AuthButton';

const countries = ['Nigeria', 'Ghana', 'Kenya', 'South Africa', 'United Kingdom', 'United States'];
const languages = ['English', 'Nigerian Pidgin', 'Yoruba', 'Igbo', 'Hausa', 'Français', 'Kiswahili'];
const interestOptions = [
'Movies',
'Series',
'Sports',
'Music',
'Anime',
'Podcasts',
'Comedy',
'Documentary',
'Afrobeats',
'Football'];


export function CompleteProfile() {
  const { identity, updateProfile, completeProfile } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = React.useState(identity?.profile.displayName ?? '');
  const [bio, setBio] = React.useState(identity?.profile.bio ?? '');
  const [country, setCountry] = React.useState(identity?.profile.country ?? '');
  const [language, setLanguage] = React.useState(identity?.profile.language ?? 'English');
  const [dob, setDob] = React.useState(identity?.profile.dateOfBirth ?? '');
  const [interests, setInterests] = React.useState<string[]>(identity?.profile.interests ?? []);
  const [saving, setSaving] = React.useState(false);

  const toggleInterest = (interest: string) =>
  setInterests((prev) =>
  prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
  );

  const nextStep = () => identity?.accountType === 'viewer' ? '/verify-email' : '/verify-email';

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    updateProfile({
      displayName: displayName.trim(),
      bio: bio.trim(),
      country,
      language,
      dateOfBirth: dob,
      interests,
      avatar: identity?.profile.avatar || IMAGES.creator
    });
    completeProfile();
    setSaving(false);
    navigate(nextStep());
  };

  return (
    <AuthLayout compact>
      <div className="rounded-2xl border border-white/8 bg-ink-900/80 p-6 backdrop-blur sm:p-8">
        <HavaVerseLogo variant="icon" size="md" />
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-white">Complete your profile</h1>
        <p className="mt-1 text-sm text-mist-300">
          Help us personalise your experience. Everything except your display name is optional.
        </p>

        <form onSubmit={save} className="mt-6 space-y-4">
          <div className="flex items-center gap-4">
            <span className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/20 bg-ink-850">
              {identity?.profile.avatar ?
              <img src={identity.profile.avatar} alt="" className="h-full w-full object-cover" /> :

              <CameraIcon className="h-6 w-6 text-mist-400" aria-hidden="true" />
              }
            </span>
            <div>
              <button
                type="button"
                onClick={() => updateProfile({ avatar: IMAGES.creator })}
                className="rounded-lg border border-white/15 px-3.5 py-2 text-xs font-semibold text-white transition-colors duration-150 ease-entrance hover:border-white/30">
                
                Add photo
              </button>
              <p className="mt-1.5 text-[11px] text-mist-400">JPG or PNG, up to 5 MB.</p>
            </div>
          </div>

          <TextField
            id="profile-name"
            label="Display name"
            placeholder="John Doe"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)} />
          

          <div>
            <label htmlFor="profile-bio" className="mb-1.5 block text-xs font-medium text-mist-200">
              Bio <span className="text-mist-400">(optional)</span>
            </label>
            <textarea
              id="profile-bio"
              rows={3}
              maxLength={180}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us a little about yourself…"
              className="w-full resize-none rounded-xl border border-white/10 bg-ink-850 p-3.5 text-sm text-white placeholder:text-mist-400 transition-colors duration-150 ease-entrance focus:border-brand-indigo focus:outline-none" />
            
            <p className="mt-1 text-right text-[11px] text-mist-400">{bio.length}/180</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="profile-country"
                className="mb-1.5 block text-xs font-medium text-mist-200">
                
                Country
              </label>
              <select
                id="profile-country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="h-11 w-full rounded-xl border border-white/10 bg-ink-850 px-3 text-sm text-white transition-colors duration-150 ease-entrance focus:border-brand-indigo focus:outline-none">
                
                <option value="">Select country</option>
                {countries.map((c) =>
                <option key={c} value={c}>
                    {c}
                  </option>
                )}
              </select>
            </div>
            <div>
              <label
                htmlFor="profile-language"
                className="mb-1.5 block text-xs font-medium text-mist-200">
                
                Preferred language
              </label>
              <select
                id="profile-language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="h-11 w-full rounded-xl border border-white/10 bg-ink-850 px-3 text-sm text-white transition-colors duration-150 ease-entrance focus:border-brand-indigo focus:outline-none">
                
                {languages.map((l) =>
                <option key={l} value={l}>
                    {l}
                  </option>
                )}
              </select>
            </div>
          </div>

          <TextField
            id="profile-dob"
            label="Date of birth (optional)"
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            hint="Used for age-appropriate content and Kids profiles." />
          

          <fieldset>
            <legend className="mb-2 text-xs font-medium text-mist-200">
              Content interests <span className="text-mist-400">(optional)</span>
            </legend>
            <div className="flex flex-wrap gap-1.5">
              {interestOptions.map((interest) => {
                const on = interests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleInterest(interest)}
                    className={[
                    'rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors duration-150 ease-entrance',
                    on ?
                    'border-transparent bg-brand-indigo text-white' :
                    'border-white/10 text-mist-300 hover:border-white/25 hover:text-white'].
                    join(' ')}>
                    
                    {interest}
                  </button>);

              })}
            </div>
          </fieldset>

          <AuthButton type="submit" loading={saving} loadingLabel="Saving…">
            Continue
          </AuthButton>
        </form>

        <button
          type="button"
          onClick={() => {
            completeProfile();
            navigate('/verify-email');
          }}
          className="mt-3 w-full text-center text-xs font-semibold text-mist-400 transition-colors duration-150 ease-entrance hover:text-white">
          
          Skip for now
        </button>
      </div>
    </AuthLayout>);

}