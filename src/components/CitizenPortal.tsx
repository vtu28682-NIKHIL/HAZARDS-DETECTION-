import React, { useState } from 'react';
import {
  ShieldAlert,
  Volume2,
  VolumeX,
  MapPin,
  PhoneCall,
  Search,
  Crosshair,
  Building2,
  HeartPulse,
  Droplets,
  Flame,
  Sun,
  Waves,
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { DisasterIncident, SupportedLanguage } from '../types/disaster';
import { TRANSLATIONS } from '../services/i18n';
import { VERIFIED_FACILITIES } from '../data/mockAndHistoricalData';

interface CitizenPortalProps {
  incidents: DisasterIncident[];
  language: SupportedLanguage;
  onExploreMap: () => void;
  onOpenVoice: () => void;
  onSelectIncident: (inc: DisasterIncident) => void;
}

export const CitizenPortal: React.FC<CitizenPortalProps> = ({
  incidents,
  language,
  onExploreMap,
  onOpenVoice,
  onSelectIncident
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [userCity, setUserCity] = useState('');
  const [activeHazardGuide, setActiveHazardGuide] = useState<'flood' | 'heatwave' | 'cyclone' | 'earthquake'>('flood');
  const [isReadingAudio, setIsReadingAudio] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);

  // Read latest alerts via browser SpeechSynthesis
  const handleReadAlerts = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported on this browser.');
      return;
    }

    if (isReadingAudio) {
      window.speechSynthesis.cancel();
      setIsReadingAudio(false);
      return;
    }

    const highAlerts = incidents.filter(i => i.priorityCategory === 'Critical' || i.priorityCategory === 'High');
    let textToSpeak = `DisasterLens safety briefing. `;
    if (highAlerts.length > 0) {
      textToSpeak += `There are ${highAlerts.length} high priority disaster alerts currently active. `;
      highAlerts.slice(0, 3).forEach((a, i) => {
        textToSpeak += `Alert ${i + 1}: ${a.title} in ${a.locationName}. Rated as ${a.priorityCategory} priority. `;
      });
      textToSpeak += `Please follow guidance from official disaster management authorities.`;
    } else {
      textToSpeak += `No critical or high-severity alerts are currently registered in the database. Please continue monitoring local official broadcasts.`;
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.95;
    utterance.onend = () => setIsReadingAudio(false);
    utterance.onerror = () => setIsReadingAudio(false);

    setIsReadingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser.');
      return;
    }

    setLocationStatus('Locating your position...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationStatus(`Location detected (${pos.coords.latitude.toFixed(2)}°N, ${pos.coords.longitude.toFixed(2)}°E). Showing regional risk status below.`);
      },
      (err) => {
        setLocationStatus('Could not access current location. Please select your region manually.');
      }
    );
  };

  // Practical safety steps for common disasters
  const safetyGuides = {
    flood: [
      { step: 'Evacuate Early', detail: 'Move immediately to higher ground or assigned disaster shelters if an evacuation advisory is issued.' },
      { step: 'Never Walk or Drive in Floodwaters', detail: 'Just 15 cm of moving water can knock down an adult, and 30 cm can float most passenger cars.' },
      { step: 'Drink Only Safe Water', detail: 'Boil drinking water or use chlorine purification tablets to prevent cholera and waterborne infections.' },
      { step: 'Switch Off Mains', detail: 'Disconnect domestic electrical main breakers before floodwater enters your dwelling to prevent electrocution.' }
    ],
    heatwave: [
      { step: 'Hydrate Continuously', detail: 'Drink water frequently even if not thirsty. Carry oral rehydration salts (ORS) or lemon water.' },
      { step: 'Avoid Peak Sun (11 AM – 4 PM)', detail: 'Stay in well-ventilated, shaded, or cooled rooms during the highest radiant temperature window.' },
      { step: 'Care for Vulnerable Individuals', detail: 'Check regularly on elderly family members, young children, pregnant women, and pets.' },
      { step: 'Recognize Heat Exhaustion', detail: 'Watch for dizziness, nausea, confusion, or absence of sweating. Move to cold shade immediately and seek medical care.' }
    ],
    cyclone: [
      { step: 'Secure Loose Structures', detail: 'Fasten metal roofing sheets, trim precarious tree branches near dwellings, and tape windows.' },
      { step: 'Emergency Kit Ready', detail: 'Keep battery radio, torches, 3 days of non-perishable food, vital medicines, and identity documents in a waterproof bag.' },
      { step: 'Do Not Fall for the Cyclone Eye', detail: 'If winds suddenly stop, stay inside. The eye is passing, and fierce winds will resume from the opposite direction.' }
    ],
    earthquake: [
      { step: 'Drop, Cover, and Hold On', detail: 'Drop to your hands and knees. Cover your head and neck under a sturdy table. Hold on until shaking stops.' },
      { step: 'Stay Away from Glass & Facades', detail: 'Exterior walls and windows are the most hazardous areas during seismic ground tremors.' },
      { step: 'Never Use Elevators', detail: 'Use stairwells after shaking stops. Expect aftershocks in the minutes and hours following the main shock.' }
    ]
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Prominent Citizen Status Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>Regional Risk & Warning Advisory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Active Citizen Safety Portal
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Monitor real-time official alerts, find nearest verified emergency relief shelters, and learn vital lifesaving precautions.
          </p>
          {locationStatus && (
            <p className="text-xs text-sky-400 font-medium pt-1">{locationStatus}</p>
          )}
        </div>

        {/* Big Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={onExploreMap}
            className="flex items-center gap-2 px-4 py-3 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all shadow-md"
          >
            <MapPin className="w-4 h-4 text-rose-400" />
            <span>Explore Disaster Map</span>
          </button>

          <button
            onClick={handleLocateMe}
            className="flex items-center gap-2 px-4 py-3 text-xs font-semibold text-slate-200 bg-slate-850 hover:bg-slate-800 border border-slate-750 rounded-xl transition-all shadow-md"
          >
            <Crosshair className="w-4 h-4 text-cyan-400" />
            <span>Check Risks Near Me</span>
          </button>

          <button
            onClick={handleReadAlerts}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold text-white rounded-xl transition-all shadow-md ${
              isReadingAudio ? 'bg-amber-600 hover:bg-amber-500' : 'bg-rose-600 hover:bg-rose-500'
            }`}
          >
            {isReadingAudio ? (
              <>
                <VolumeX className="w-4 h-4 animate-pulse" />
                <span>Stop Spoken Alerts</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" />
                <span>Hear Latest Alerts</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Honest Data State Transparency Notice */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p>
          <strong className="text-slate-300">Important Safety Notice: </strong>
          Absence of an incident marker does not guarantee an area is completely risk-free. Some remote stations report on latency intervals. Always follow direct broadcast instructions from the National Disaster Management Authority (NDMA), state disaster response forces, and local police.
        </p>
      </div>

      {/* 4 Prominent Citizen Service Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Nearest Emergency Shelters & Hospitals */}
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Emergency Facilities</h3>
              <p className="text-xs text-slate-400 mt-1">
                Verified Level-1 trauma hospitals, flood relief shelters, and clean water distribution points.
              </p>
            </div>
            <div className="space-y-2 pt-2">
              {VERIFIED_FACILITIES.slice(0, 3).map((fac) => (
                <div key={fac.id} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-xs">
                  <span className="font-semibold text-slate-200 block truncate">{fac.name}</span>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span className="capitalize">{fac.type.replace('_', ' ')}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-emerald-400">{fac.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={onExploreMap}
            className="mt-4 flex items-center justify-between text-xs font-semibold text-rose-400 hover:text-rose-300 pt-2"
          >
            <span>View All Facilities on Map</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Card 2: Active Warnings in Your Region */}
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Active Regional Warnings</h3>
              <p className="text-xs text-slate-400 mt-1">
                Currently tracking {incidents.length} authoritative disaster alerts.
              </p>
            </div>
            <div className="space-y-2 pt-2">
              {incidents.slice(0, 3).map((inc) => (
                <div
                  key={inc.id}
                  onClick={() => onSelectIncident(inc)}
                  className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-xs hover:border-slate-700 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200 block truncate">{inc.title}</span>
                    <span className="text-rose-400 font-mono text-[11px] font-bold shrink-0 ml-2">
                      {inc.priorityScore}/100
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {inc.locationName} · {inc.severityLevel}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={onExploreMap}
            className="mt-4 flex items-center justify-between text-xs font-semibold text-rose-400 hover:text-rose-300 pt-2"
          >
            <span>Open Interactive Map</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Card 3: Emergency Helplines & SOS */}
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Emergency Helplines</h3>
              <p className="text-xs text-slate-400 mt-1">
                Direct nationwide emergency call numbers (India Toll-Free).
              </p>
            </div>
            <div className="space-y-2.5 pt-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-200 block">National Emergency Number</span>
                  <span className="text-[11px] text-slate-400">Police, Fire, Ambulance</span>
                </div>
                <span className="font-mono font-bold text-base text-rose-400">112</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-200 block">Disaster Management (NDMA)</span>
                  <span className="text-[11px] text-slate-400">National Control Room</span>
                </div>
                <span className="font-mono font-bold text-base text-amber-400">1078</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-200 block">State Disaster Helpline</span>
                  <span className="text-[11px] text-slate-400">SDMA State Control</span>
                </div>
                <span className="font-mono font-bold text-base text-cyan-400">1070</span>
              </div>
            </div>
          </div>
          <button
            onClick={onOpenVoice}
            className="mt-4 flex items-center justify-between text-xs font-semibold text-cyan-400 hover:text-cyan-300 pt-2"
          >
            <span>Ask DisasterVoice Assistance</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Practical Precautionary Guides */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-rose-400" />
              <span>Lifesaving Precautionary Protocols</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Authoritative step-by-step guidance vetted by disaster response standards.
            </p>
          </div>

          {/* Guide switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setActiveHazardGuide('flood')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${activeHazardGuide === 'flood' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Floods
            </button>
            <button
              onClick={() => setActiveHazardGuide('heatwave')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${activeHazardGuide === 'heatwave' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Heatwaves
            </button>
            <button
              onClick={() => setActiveHazardGuide('cyclone')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${activeHazardGuide === 'cyclone' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Cyclones
            </button>
            <button
              onClick={() => setActiveHazardGuide('earthquake')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${activeHazardGuide === 'earthquake' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Earthquakes
            </button>
          </div>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {safetyGuides[activeHazardGuide].map((guide, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
              <span className="font-mono text-rose-400 font-bold text-xs">Step {idx + 1}</span>
              <h4 className="text-sm font-bold text-white">{guide.step}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{guide.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
