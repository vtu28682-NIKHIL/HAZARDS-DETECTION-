import React from 'react';
import {
  ShieldAlert,
  Mic,
  SlidersHorizontal,
  FileText,
  Radio,
  Globe2
} from 'lucide-react';
import { SupportedLanguage } from '../types/disaster';
import { TRANSLATIONS } from '../services/i18n';

interface HeaderProps {
  currentTab: 'command' | 'citizen' | 'forecast' | 'resources' | 'vulnerability' | 'sdg';
  onSelectTab: (tab: 'command' | 'citizen' | 'forecast' | 'resources' | 'vulnerability' | 'sdg') => void;
  language: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  onOpenVoice: () => void;
  onOpenWeights: () => void;
  onOpenAudit: () => void;
  liveFeedCount: number;
  lastUpdated: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  language,
  onLanguageChange,
  onOpenVoice,
  onOpenWeights,
  onOpenAudit,
  liveFeedCount,
  lastUpdated
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const languages: { code: SupportedLanguage; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'ta', label: 'தமிழ்' },
    { code: 'te', label: 'తెలుగు' },
    { code: 'kn', label: 'ಕನ್ನಡ' },
    { code: 'ml', label: 'മലയാളം' },
    { code: 'bn', label: 'বাংলা' },
    { code: 'mr', label: 'मराठी' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur border-b border-slate-800">
      {/* Primary Top Bar Contract: 3 zones separated by gap-8 */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onSelectTab('command')}
            className="flex items-center gap-2.5 text-left group focus-visible:outline-none"
          >
            <div className="w-9 h-9 rounded-lg bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400 group-hover:border-rose-400 transition-colors">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white whitespace-nowrap block">
                DisasterLens AI
              </span>
              <span className="text-[11px] text-slate-400 block -mt-0.5 tracking-tight">
                SDG 13 Climate Action & Intelligence
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-300">
          <button
            onClick={() => onSelectTab('command')}
            className={`whitespace-nowrap transition-colors py-1 ${
              currentTab === 'command'
                ? 'text-rose-400 border-b-2 border-rose-500 font-semibold'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            {t.commandCenter}
          </button>
          <button
            onClick={() => onSelectTab('citizen')}
            className={`whitespace-nowrap transition-colors py-1 ${
              currentTab === 'citizen'
                ? 'text-rose-400 border-b-2 border-rose-500 font-semibold'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            {t.citizenPortal}
          </button>
          <button
            onClick={() => onSelectTab('forecast')}
            className={`whitespace-nowrap transition-colors py-1 ${
              currentTab === 'forecast'
                ? 'text-rose-400 border-b-2 border-rose-500 font-semibold'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            {t.climateForecast}
          </button>
          <button
            onClick={() => onSelectTab('resources')}
            className={`whitespace-nowrap transition-colors py-1 ${
              currentTab === 'resources'
                ? 'text-rose-400 border-b-2 border-rose-500 font-semibold'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            {t.resources}
          </button>
          <button
            onClick={() => onSelectTab('vulnerability')}
            className={`whitespace-nowrap transition-colors py-1 ${
              currentTab === 'vulnerability'
                ? 'text-rose-400 border-b-2 border-rose-500 font-semibold'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            {t.vulnerability}
          </button>
          <button
            onClick={() => onSelectTab('sdg')}
            className={`whitespace-nowrap transition-colors py-1 ${
              currentTab === 'sdg'
                ? 'text-rose-400 border-b-2 border-rose-500 font-semibold'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            {t.sdgImpact}
          </button>
        </nav>

        {/* Zone 3: Actions & Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Language Switcher */}
          <div className="relative flex items-center">
            <Globe2 className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
              aria-label="Select Language"
              className="bg-slate-900 border border-slate-750 text-slate-200 text-xs rounded-lg pl-7 pr-3 py-1.5 focus:border-rose-500 focus:outline-none appearance-none cursor-pointer"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code} className="bg-slate-900 text-slate-100">
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          {/* Scoring Weights Trigger */}
          <button
            onClick={onOpenWeights}
            title="Configure Priority Scoring Weights"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors whitespace-nowrap"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden xl:inline">Weights</span>
          </button>

          {/* Audit Trail Trigger */}
          <button
            onClick={onOpenAudit}
            title="Incident Command Audit Log"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors whitespace-nowrap"
          >
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden xl:inline">Audit</span>
          </button>

          {/* DisasterVoice Assistant CTA */}
          <button
            onClick={onOpenVoice}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-sm shadow-rose-950 transition-colors whitespace-nowrap"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>DisasterVoice</span>
          </button>
        </div>
      </div>

      {/* Sub-bar with Live Telemetry Metadata (Unboxed text with separators, no pills) */}
      <div className="bg-slate-900/60 border-t border-slate-800/80 px-4 sm:px-6 py-1.5 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            USGS & NASA Earth Feeds Synchronized
          </span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>{liveFeedCount} authoritative hazards active</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>Last sync: {lastUpdated}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="text-slate-300">Target SDG: 13.1 Resilience</span>
        </div>
        
        {/* Mobile quick tab select */}
        <div className="flex lg:hidden items-center gap-2 text-xs">
          <button
            onClick={() => onSelectTab('command')}
            className={`px-2 py-0.5 rounded text-[11px] ${currentTab === 'command' ? 'bg-rose-600/30 text-rose-300' : 'text-slate-400'}`}
          >
            Command
          </button>
          <button
            onClick={() => onSelectTab('citizen')}
            className={`px-2 py-0.5 rounded text-[11px] ${currentTab === 'citizen' ? 'bg-rose-600/30 text-rose-300' : 'text-slate-400'}`}
          >
            Citizen
          </button>
          <button
            onClick={() => onSelectTab('forecast')}
            className={`px-2 py-0.5 rounded text-[11px] ${currentTab === 'forecast' ? 'bg-rose-600/30 text-rose-300' : 'text-slate-400'}`}
          >
            Forecast
          </button>
        </div>
      </div>
    </header>
  );
};
