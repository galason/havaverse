import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
  CircleDashedIcon,
  CircleIcon,
  Loader2Icon,
  MinusCircleIcon,
  ServerIcon,
  XCircleIcon } from
'lucide-react';
import { useDirector } from '../../contexts/DirectorContext';
import { publishingApi } from '../../services/publishingApi';
import { projectGenres } from '../../data/studioProjects';
import { ErrorBlock, LoadingBlock } from '../../components/community/StateBlocks';
import { relativeTime } from '../../utils/time';
import type {
  PreflightCheck,
  PublishJob,
  PublishStep,
  ReleaseAudience,
  ReleaseMetadata } from
'../../types/publishing';

const maturities = ['G', 'PG', 'PG-13', 'PG-16', '18'];
const languageOptions = ['English', 'Yoruba', 'Igbo', 'Hausa', 'Pidgin', 'French', 'Swahili'];

const field =
'w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm text-white placeholder:text-mist-400 focus:border-brand-indigo/60 focus:outline-none';

export function StudioPublish() {
  const director = useDirector();
  const { project, bible, status, reload, shots, rights, violations, stale, continuity } = director;
  const [metadata, setMetadata] = React.useState<ReleaseMetadata | null>(null);
  const [audience, setAudience] = React.useState<ReleaseAudience>({ visibility: 'public', regions: 'worldwide', releaseAt: 'now' });
  const [job, setJob] = React.useState<PublishJob | undefined>();
  const [submitting, setSubmitting] = React.useState(false);
  const [refusal, setRefusal] = React.useState<string | null>(null);
  // The job view stays after completion only for the release submitted here.
  const [submittedId, setSubmittedId] = React.useState<string | null>(null);

  // Metadata starts from the project; the creator edits it for the release.
  React.useEffect(() => {
    if (!project) return;
    const genre = bible.find((e) => e.label === 'Genre')?.value;
    setMetadata({
      title: project.title,
      logline: project.logline,
      genre: genre && projectGenres.includes(genre) ? genre : 'Thriller',
      maturity: 'PG-13',
      languages: ['English']
    });
    setJob(publishingApi.latestJob(project.id));
  }, [project?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // The publication job advances in the service; the page only listens.
  React.useEffect(() => {
    if (!project) return;
    return publishingApi.subscribe(() => setJob(publishingApi.latestJob(project.id)));
  }, [project]);

  const finished = job?.status === 'completed' ? job.id : null;
  React.useEffect(() => {
    if (finished) reload();
  }, [finished]); // eslint-disable-line react-hooks/exhaustive-deps

  const checks = React.useMemo(
    () => metadata ? publishingApi.preflight(metadata, audience) : [],
    // Director state changes re-run the gate-backed checks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [metadata, audience, shots, rights, violations, stale, continuity]
  );

  if (status === 'loading' || !metadata) {
    return (
      <div className="p-5">
        <LoadingBlock label="Loading project…" />
      </div>);

  }
  if (status === 'error' || !project) {
    return (
      <div className="p-5">
        <ErrorBlock message="The project could not be loaded." onRetry={reload} />
      </div>);

  }

  const blocking = checks.filter((c) => c.status === 'fail');
  const running = job?.status === 'running';
  const releases = publishingApi.listReleases(project.id);

  async function submit() {
    if (!metadata) return;
    setSubmitting(true);
    setRefusal(null);
    const result = await publishingApi.submitPublish(metadata, audience);
    setSubmitting(false);
    if (!result.ok) setRefusal(result.error);else
    {
      setSubmittedId(result.data.id);
      setJob(result.data);
    }
  }

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6">
      <Link
        to="/studio"
        className="inline-flex items-center gap-1 text-xs font-semibold text-mist-300 transition-colors duration-150 ease-entrance hover:text-white">
        
        <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden="true" />
        Back to Studio
      </Link>
      <header className="mt-3 border-b border-white/5 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-white">Publish {project.title}</h1>
        <p className="mt-0.5 text-xs text-mist-400">
          Your request is checked again on the server before anything goes live. Nothing is published until the job finishes.
        </p>
      </header>

      {job && (job.status === 'running' || job.status === 'completed' && job.id === submittedId) ?
      <JobView job={job} /> :

      <div className="grid gap-6 pt-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            {job?.status === 'failed' &&
          <div role="alert" className="rounded-2xl border border-live/30 bg-live/5 p-4 text-xs text-mist-200">
                <p className="font-semibold text-white">The last publication attempt stopped</p>
                <p className="mt-1">{job.error}</p>
              </div>
          }

            <section aria-labelledby="meta-h">
              <h2 id="meta-h" className="text-sm font-bold text-white">
                How it appears to viewers
              </h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="mb-1 block text-[11px] font-semibold text-mist-300">Title</span>
                  <input value={metadata.title} onChange={(e) => setMetadata({ ...metadata, title: e.target.value })} className={field} />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1 flex justify-between text-[11px] font-semibold text-mist-300">
                    Logline
                    <span className="font-normal tabular-nums text-mist-400">{metadata.logline.trim().length} / 40+</span>
                  </span>
                  <textarea
                  value={metadata.logline}
                  rows={3}
                  onChange={(e) => setMetadata({ ...metadata, logline: e.target.value })}
                  className={`${field} resize-none`} />
                
                </label>
                <label className="block">
                  <span className="mb-1 block text-[11px] font-semibold text-mist-300">Genre</span>
                  <select value={metadata.genre} onChange={(e) => setMetadata({ ...metadata, genre: e.target.value })} className={field}>
                    {projectGenres.map((g) =>
                  <option key={g}>{g}</option>
                  )}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-[11px] font-semibold text-mist-300">Maturity rating</span>
                  <select value={metadata.maturity} onChange={(e) => setMetadata({ ...metadata, maturity: e.target.value })} className={field}>
                    {maturities.map((m) =>
                  <option key={m}>{m}</option>
                  )}
                  </select>
                </label>
              </div>
              <fieldset className="mt-3">
                <legend className="mb-1.5 text-[11px] font-semibold text-mist-300">Audio languages</legend>
                <div className="flex flex-wrap gap-2">
                  {languageOptions.map((lang) => {
                  const on = metadata.languages.includes(lang);
                  return (
                    <button
                      key={lang}
                      type="button"
                      aria-pressed={on}
                      onClick={() =>
                      setMetadata({
                        ...metadata,
                        languages: on ? metadata.languages.filter((l) => l !== lang) : [...metadata.languages, lang]
                      })
                      }
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors duration-150 ease-entrance ${
                      on ? 'bg-brand-indigo text-white' : 'border border-white/15 text-mist-300 hover:text-white'}`
                      }>
                      
                        {lang}
                      </button>);

                })}
                </div>
              </fieldset>
            </section>

            <section aria-labelledby="aud-h" className="border-t border-white/5 pt-6">
              <h2 id="aud-h" className="text-sm font-bold text-white">
                Audience &amp; distribution
              </h2>
              <div className="mt-3 grid gap-4 sm:grid-cols-3">
                <Choice
                label="Visibility"
                value={audience.visibility}
                options={[
                ['public', 'Public', 'In Search, recommendations and your profile'],
                ['unlisted', 'Unlisted', 'Only people with the link']]
                }
                onChange={(v) => setAudience({ ...audience, visibility: v as ReleaseAudience['visibility'] })} />
              
                <Choice
                label="Where"
                value={audience.regions}
                options={[
                ['worldwide', 'Worldwide', 'Every region you hold rights in'],
                ['africa', 'Africa', 'African markets only'],
                ['nigeria', 'Nigeria', 'Nigeria only']]
                }
                onChange={(v) => setAudience({ ...audience, regions: v as ReleaseAudience['regions'] })} />
              
                <div>
                  <p className="mb-1.5 text-[11px] font-semibold text-mist-300">When</p>
                  <div className="space-y-1.5">
                    <Radio checked={audience.releaseAt === 'now'} onChange={() => setAudience({ ...audience, releaseAt: 'now' })} label="Release now" />
                    <Radio
                    checked={audience.releaseAt !== 'now'}
                    onChange={() => setAudience({ ...audience, releaseAt: Date.now() + 86_400_000 })}
                    label="Schedule a premiere" />
                  
                    {audience.releaseAt !== 'now' &&
                  <input
                    type="datetime-local"
                    aria-label="Premiere date and time"
                    value={toLocalInput(audience.releaseAt)}
                    onChange={(e) => setAudience({ ...audience, releaseAt: new Date(e.target.value).getTime() || Date.now() })}
                    className={`${field} text-xs`} />

                  }
                  </div>
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            <section aria-labelledby="pre-h" className="rounded-2xl border border-white/5 bg-ink-900 p-4">
              <h2 id="pre-h" className="text-sm font-bold text-white">
                Preflight
              </h2>
              <p className="mt-0.5 text-[11px] text-mist-400">
                {blocking.length === 0 ? 'Ready to submit.' : `${blocking.length} ${blocking.length === 1 ? 'check holds' : 'checks hold'} this release.`}
              </p>
              <ul className="mt-3 space-y-2.5">
                {checks.map((c) =>
              <PreflightRow key={c.key} check={c} />
              )}
              </ul>
              {refusal &&
            <p role="alert" className="mt-3 rounded-lg bg-live/10 p-2.5 text-[11px] leading-relaxed text-mist-100">
                  {refusal}
                </p>
            }
              <button
              type="button"
              onClick={submit}
              disabled={blocking.length > 0 || submitting || running}
              className="mt-4 w-full rounded-full bg-brand-cyan px-4 py-2.5 text-sm font-semibold text-ink-950 transition-colors duration-150 ease-entrance hover:bg-white disabled:cursor-not-allowed disabled:bg-ink-700 disabled:text-mist-400">
              
                {submitting ? 'Submitting…' : audience.releaseAt === 'now' ? 'Submit and publish' : 'Submit and schedule'}
              </button>
            </section>

            {releases.length > 0 &&
          <section aria-labelledby="rel-h" className="rounded-2xl border border-white/5 bg-ink-900 p-4">
                <h2 id="rel-h" className="text-sm font-bold text-white">
                  Releases
                </h2>
                <ul className="mt-2 divide-y divide-white/5">
                  {releases.map((r) =>
              <li key={r.id} className="flex items-center gap-2 py-2 text-xs">
                      <span className="font-semibold tabular-nums text-mist-300">v{r.version}</span>
                      <span className="min-w-0 flex-1 truncate text-mist-300">
                        {r.visibility === 'public' ? 'Public' : 'Unlisted'} · {relativeTime(r.publishedAt)}
                      </span>
                      <Link to={`/title/${r.slug}`} className="font-semibold text-white hover:underline">
                        Open
                      </Link>
                    </li>
              )}
                </ul>
              </section>
          }
          </aside>
        </div>
      }
    </div>);

}

function JobView({ job }: {job: PublishJob;}) {
  const done = job.status === 'completed';
  return (
    <section aria-labelledby="job-h" aria-live="polite" className="mx-auto max-w-xl pt-8">
      <h2 id="job-h" className="text-lg font-bold text-white">
        {done ?
        job.audience.releaseAt === 'now' ?
        `${job.metadata.title} is live` :
        `${job.metadata.title} is scheduled` :
        `Publishing ${job.metadata.title} · v${job.version}`}
      </h2>
      <ol className="mt-5 space-y-3">
        {job.steps.map((step, i) =>
        <motion.li
          key={step.key}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: i * 0.04, ease: [0.23, 1, 0.32, 1] }}
          className="flex gap-3">
          
            <StepIcon status={step.status} />
            <div className="min-w-0">
              <p className={`text-sm font-semibold ${step.status === 'pending' ? 'text-mist-400' : 'text-white'}`}>{step.label}</p>
              <p className="text-xs text-mist-400">{step.detail}</p>
            </div>
          </motion.li>
        )}
      </ol>
      {done &&
      <div className="mt-6 flex flex-wrap gap-2">
          <Link
          to={`/title/${job.slug}`}
          className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink-950 transition-colors duration-150 ease-entrance hover:bg-mist-100">
          
            Open the title page
            <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </Link>
          {job.audience.visibility === 'public' &&
        <Link
          to={`/search?q=${encodeURIComponent(job.metadata.title)}`}
          className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-mist-200 hover:text-white">
          
              Find it in Search
            </Link>
        }
          <Link to="/studio" className="rounded-full px-4 py-2 text-sm font-semibold text-mist-300 hover:text-white">
            Back to Studio
          </Link>
        </div>
      }
    </section>);

}

function StepIcon({ status }: {status: PublishStep['status'];}) {
  if (status === 'done') return <CheckCircle2Icon className="mt-0.5 h-4 w-4 shrink-0 text-status-success-fg" aria-label="Done" />;
  if (status === 'running') return <Loader2Icon className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-brand-indigo" aria-label="In progress" />;
  if (status === 'skipped') return <MinusCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-mist-400" aria-label="Skipped" />;
  return <CircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-mist-400/60" aria-label="Waiting" />;
}

function PreflightRow({ check }: {check: PreflightCheck;}) {
  const icon =
  check.status === 'pass' ?
  <CheckCircle2Icon className="h-4 w-4 text-status-success-fg" aria-hidden="true" /> :
  check.status === 'server' ?
  <ServerIcon className="h-4 w-4 text-mist-300" aria-hidden="true" /> :

  <XCircleIcon className="h-4 w-4 text-live" aria-hidden="true" />;

  return (
    <li className="flex gap-2.5">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-white">
          {check.label}
          <span className="sr-only"> — {check.status === 'pass' ? 'passed' : check.status === 'server' ? 'checked on submit' : 'blocking'}</span>
        </p>
        <p className="text-[11px] text-mist-400">{check.detail}</p>
        {check.status === 'fail' && check.issues.length > 0 &&
        <ul className="mt-1 space-y-0.5">
            {check.issues.slice(0, 3).map((issue) =>
          <li key={issue} className="text-[11px] text-mist-200">
                {issue}
              </li>
          )}
            {check.issues.length > 3 && <li className="text-[11px] text-mist-400">+{check.issues.length - 3} more</li>}
          </ul>
        }
        {check.status === 'fail' && check.fixTo &&
        <Link to={check.fixTo} className="mt-1 inline-block text-[11px] font-semibold text-brand-indigo hover:underline">
            Resolve
          </Link>
        }
      </div>
    </li>);

}

function Choice({
  label,
  value,
  options,
  onChange





}: {label: string;value: string;options: [string, string, string][];onChange: (v: string) => void;}) {
  return (
    <div role="radiogroup" aria-label={label}>
      <p className="mb-1.5 text-[11px] font-semibold text-mist-300">{label}</p>
      <div className="space-y-1.5">
        {options.map(([v, title, hint]) =>
        <Radio key={v} checked={value === v} onChange={() => onChange(v)} label={title} hint={hint} />
        )}
      </div>
    </div>);

}

function Radio({ checked, onChange, label, hint }: {checked: boolean;onChange: () => void;label: string;hint?: string;}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={onChange}
      className="flex w-full items-start gap-2 text-left">
      
      {checked ?
      <CheckCircle2Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-indigo" aria-hidden="true" /> :

      <CircleDashedIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-mist-400" aria-hidden="true" />
      }
      <span>
        <span className={`block text-xs font-semibold ${checked ? 'text-white' : 'text-mist-300'}`}>{label}</span>
        {hint && <span className="block text-[11px] text-mist-400">{hint}</span>}
      </span>
    </button>);

}

function toLocalInput(at: number): string {
  const d = new Date(at);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}