import React from 'react';
import { Link } from 'react-router-dom';
import { GlobeIcon, InstagramIcon, LinkedinIcon, TwitterIcon, YoutubeIcon } from 'lucide-react';
import { HavaVerseLogo } from '../brand/HavaVerseLogo';

const columns: {heading: string;links: {label: string;to: string;}[];}[] = [
{
  heading: 'Products',
  links: [
  { label: 'HavaVerse AI', to: '/studio' },
  { label: 'HavaVerse Studio', to: '/studio' },
  { label: 'HavaVerse Play', to: '/' },
  { label: 'HavaVerse Music', to: '/music' },
  { label: 'HavaVerse Podcast', to: '/podcast' },
  { label: 'HavaVerse Live', to: '/sports' },
  { label: 'HavaVerse Community', to: '/communities' },
  { label: 'HavaVerse Market', to: '/market' },
  { label: 'HavaPay', to: '/wallet' }]

},
{
  heading: 'Company',
  links: [
  { label: 'About us', to: '/browse/about' },
  { label: 'Careers', to: '/browse/careers' },
  { label: 'Press', to: '/browse/press' },
  { label: 'Blog', to: '/browse/blog' },
  { label: 'Investors', to: '/browse/investors' },
  { label: 'Partners', to: '/browse/partners' },
  { label: 'Contact', to: '/browse/contact' }]

},
{
  heading: 'Support',
  links: [
  { label: 'Help centre', to: '/browse/help' },
  { label: 'Community guidelines', to: '/browse/guidelines' },
  { label: 'Creator support', to: '/browse/creator-support' },
  { label: 'Report content', to: '/browse/report' },
  { label: 'Terms of service', to: '/browse/terms' },
  { label: 'Privacy policy', to: '/browse/privacy' },
  { label: 'Cookie settings', to: '/browse/cookies' }]

}];


const socials = [
{ label: 'YouTube', icon: YoutubeIcon },
{ label: 'X', icon: TwitterIcon },
{ label: 'Instagram', icon: InstagramIcon },
{ label: 'LinkedIn', icon: LinkedinIcon }];


const languages = [
'English',
'Nigerian Pidgin',
'Yoruba',
'Igbo',
'Hausa',
'Français',
'Kiswahili'];


export function Footer() {
  const [language, setLanguage] = React.useState('English');

  return (
    <footer className="border-t border-white/5 bg-ink-900">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[1.4fr_repeat(3,1fr)_1.1fr]">
        <div>
          <Link
            to="/"
            aria-label="HavaVerse home"
            className="inline-flex rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo">
            
            <HavaVerseLogo variant="full" size="lg" />
          </Link>
          <p className="mt-4 max-w-xs text-xs leading-relaxed text-mist-300">
            An AI-native entertainment ecosystem where people create, publish, discover, experience,
            socialise around and monetise entertainment.
          </p>
          <ul className="mt-5 flex gap-2">
            {socials.map((social) => {
              const Icon = social.icon;
              return (
                <li key={social.label}>
                  <a
                    href="#"
                    aria-label={social.label}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-mist-300 transition-colors duration-150 ease-entrance hover:border-white/25 hover:text-white">
                    
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </a>
                </li>);

            })}
          </ul>
        </div>

        {columns.map((column) =>
        <nav key={column.heading} aria-label={column.heading}>
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
              {column.heading}
            </h2>
            <ul className="mt-4 space-y-2.5">
              {column.links.map((link) =>
            <li key={link.label}>
                  <Link
                to={link.to}
                className="text-xs text-mist-300 transition-colors duration-150 ease-entrance hover:text-white">
                
                    {link.label}
                  </Link>
                </li>
            )}
            </ul>
          </nav>
        )}

        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
            Language
          </h2>
          <div className="relative mt-4">
            <GlobeIcon
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-400"
              aria-hidden="true" />
            
            <label htmlFor="footer-language" className="sr-only">
              Choose interface language
            </label>
            <select
              id="footer-language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="h-10 w-full appearance-none rounded-lg border border-white/10 bg-ink-850 pl-9 pr-8 text-xs text-white transition-colors duration-150 ease-entrance focus:border-brand-indigo/60 focus:outline-none">
              
              {languages.map((l) =>
              <option key={l} value={l}>
                  {l}
                </option>
              )}
            </select>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-mist-300">
            Built for creators. Designed for everyone.
          </p>
          <p className="mt-2 text-[11px] text-mist-400">Prices shown in Nigerian Naira (₦).</p>
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-5 gap-y-2 px-6 py-5 text-[11px] text-mist-400">
          <p>© 2026 HavaVerse. All rights reserved.</p>
          <Link
            to="/browse/terms"
            className="transition-colors duration-150 ease-entrance hover:text-white">
            
            Terms
          </Link>
          <Link
            to="/browse/privacy"
            className="transition-colors duration-150 ease-entrance hover:text-white">
            
            Privacy
          </Link>
          <Link
            to="/browse/guidelines"
            className="transition-colors duration-150 ease-entrance hover:text-white">
            
            Guidelines
          </Link>
          <p className="ml-auto">AI-generated content is labelled across the platform.</p>
        </div>
      </div>
    </footer>);

}