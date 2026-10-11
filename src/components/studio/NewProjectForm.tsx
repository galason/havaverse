import React from 'react';
import { PlusIcon, XIcon } from 'lucide-react';
import { projectFormats, projectGenres } from '../../data/studioProjects';
import type { NewProjectForm as FormValue } from '../../types/studioProject';

interface NewProjectFormProps {
  busy: boolean;
  onSubmit: (form: FormValue) => void;
  onCancel: () => void;
}

const field =
'w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm text-white placeholder:text-mist-400 focus:border-brand-indigo/60 focus:outline-none';

/** Idea in, Story Bible out: the first step of every production. */
export function NewProjectForm({ busy, onSubmit, onCancel }: NewProjectFormProps) {
  const [form, setForm] = React.useState<FormValue>({
    title: '',
    format: projectFormats[0],
    genre: projectGenres[0],
    logline: '',
    setting: '',
    characters: [{ name: '', note: '' }]
  });
  const id = React.useId();
  const set = <K extends keyof FormValue,>(key: K, value: FormValue[K]) => setForm((f) => ({ ...f, [key]: value }));
  const valid = form.title.trim().length >= 2 && form.logline.trim().length >= 20;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (valid && !busy) onSubmit(form);
      }}
      className="rounded-2xl border border-white/5 bg-ink-850 p-4 sm:p-5"
      aria-labelledby={`${id}-h`}>
      
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id={`${id}-h`} className="text-base font-bold text-white">
            Start from an idea
          </h2>
          <p className="mt-0.5 text-xs text-mist-400">
            This becomes the project’s Story Bible. Everything downstream is built from it.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Close"
          className="grid h-8 w-8 place-items-center rounded-full text-mist-400 hover:text-white">
          
          <XIcon className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold text-mist-300">Working title</span>
          <input
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="e.g. Southbound"
            className={field}
            autoFocus />
          
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold text-mist-300">Format</span>
          <select value={form.format} onChange={(e) => set('format', e.target.value)} className={field}>
            {projectFormats.map((f) =>
            <option key={f}>{f}</option>
            )}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold text-mist-300">Genre</span>
          <select value={form.genre} onChange={(e) => set('genre', e.target.value)} className={field}>
            {projectGenres.map((g) =>
            <option key={g}>{g}</option>
            )}
          </select>
        </label>
      </div>

      <label className="mt-3 block">
        <span className="mb-1 flex justify-between text-[11px] font-semibold text-mist-300">
          Logline
          <span className="font-normal tabular-nums text-mist-400">{form.logline.trim().length} / 20+</span>
        </span>
        <textarea
          value={form.logline}
          onChange={(e) => set('logline', e.target.value)}
          rows={2}
          placeholder="Who wants what, and what stands in the way — in one or two sentences."
          className={`${field} resize-none`} />
        
      </label>

      <label className="mt-3 block">
        <span className="mb-1 block text-[11px] font-semibold text-mist-300">Setting (optional)</span>
        <input
          value={form.setting}
          onChange={(e) => set('setting', e.target.value)}
          placeholder="Where and when — e.g. Kano, 1987, harmattan season"
          className={field} />
        
      </label>

      <fieldset className="mt-3">
        <legend className="mb-1 text-[11px] font-semibold text-mist-300">Characters you already know (optional)</legend>
        <ul className="space-y-2">
          {form.characters.map((c, i) =>
          <li key={i} className="flex gap-2">
              <input
              value={c.name}
              onChange={(e) =>
              set('characters', form.characters.map((x, j) => j === i ? { ...x, name: e.target.value } : x))
              }
              placeholder="Name"
              aria-label={`Character ${i + 1} name`}
              className={`${field} w-40 shrink-0`} />
            
              <input
              value={c.note}
              onChange={(e) =>
              set('characters', form.characters.map((x, j) => j === i ? { ...x, note: e.target.value } : x))
              }
              placeholder="Who they are, in a line"
              aria-label={`Character ${i + 1} description`}
              className={field} />
            
              {form.characters.length > 1 &&
            <button
              type="button"
              onClick={() => set('characters', form.characters.filter((_, j) => j !== i))}
              aria-label={`Remove character ${i + 1}`}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-mist-400 hover:text-white">
              
                  <XIcon className="h-4 w-4" aria-hidden="true" />
                </button>
            }
            </li>
          )}
        </ul>
        {form.characters.length < 6 &&
        <button
          type="button"
          onClick={() => set('characters', [...form.characters, { name: '', note: '' }])}
          className="mt-2 flex items-center gap-1 text-xs font-semibold text-mist-300 hover:text-white">
          
            <PlusIcon className="h-3.5 w-3.5" aria-hidden="true" />
            Add a character
          </button>
        }
      </fieldset>

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-white/5 pt-4">
        <button
          type="submit"
          disabled={!valid || busy}
          className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-ink-950 transition-colors duration-150 ease-entrance hover:bg-mist-100 disabled:opacity-50">
          
          {busy ? 'Creating…' : 'Create and open'}
        </button>
        <p className="text-[11px] text-mist-400">
          Opens in story development. Scenes and shots arrive as the agents break it down.
        </p>
      </div>
    </form>);

}