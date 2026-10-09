import React, { useState, useEffect } from 'react';
import {
  X,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Send,
  HelpCircle,
  Globe2,
  CheckCircle2,
  Radio
} from 'lucide-react';
import { DisasterIncident, SupportedLanguage } from '../types/disaster';
import { TRANSLATIONS } from '../services/i18n';

interface DisasterVoiceModalProps {
  onClose: () => void;
  language: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  incidents: DisasterIncident[];
}

export const DisasterVoiceModal: React.FC<DisasterVoiceModalProps> = ({
  onClose,
  language,
  onLanguageChange,
  incidents
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [responseAnswer, setResponseAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [speechRate, setSpeechRate] = useState(0.95);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const samplePrompts = [
    'Is there a flood warning active near me?',
    'Read the highest priority incidents.',
    'What should I do during an extreme heatwave?',
    'Which emergency relief shelters are operational nearby?',
    'Why is the Saidapet flood scored as Critical?'
  ];

  // Speech Recognition setup
  useEffect(() => {
    let recognition: any = null;

    if (('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      const langMap: Record<SupportedLanguage, string> = {
        en: 'en-IN',
        hi: 'hi-IN',
        ta: 'ta-IN',
        te: 'te-IN',
        kn: 'kn-IN',
        ml: 'ml-IN',
        bn: 'bn-IN',
        mr: 'mr-IN'
      };
      recognition.lang = langMap[language] || 'en-IN';

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        setIsListening(false);
        handleSendQuestion(text);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    }

    if (isListening && recognition) {
      try {
        recognition.start();
      } catch (e) {
        console.warn('Recognition already started');
      }
    }

    return () => {
      if (recognition) {
        try { recognition.abort(); } catch (e) {}
      }
    };
  }, [isListening, language]);

  // Execute Question via server endpoint
  const handleSendQuestion = async (queryText?: string) => {
    const q = queryText || transcript;
    if (!q.trim()) return;

    setIsLoading(true);
    setResponseAnswer(null);

    try {
      const res = await fetch('/api/gemini/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          language,
          activeIncidents: incidents
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setResponseAnswer(data.answer);

      // Auto speak answer if speech synthesis is available
      speakText(data.answer);
    } catch (err: any) {
      const fallback = `DisasterLens tracking ${incidents.length} authoritative disaster incidents. Critical alerts should check nearest shelters and follow civil defense broadcasts.`;
      setResponseAnswer(fallback);
      speakText(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speechRate;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl p-6 text-slate-100 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                DisasterVoice AI Assistant
              </h2>
              <span className="text-[11px] text-slate-400">
                Multilingual Voice Intelligence (8 Indian Languages)
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Big Mic Button & Speech Radar */}
        <div className="flex flex-col items-center justify-center py-4 space-y-4">
          <div className="relative">
            <button
              onClick={() => {
                if (isListening) {
                  setIsListening(false);
                } else {
                  setTranscript('');
                  setIsListening(true);
                }
              }}
              className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-2xl transition-all ${
                isListening
                  ? 'bg-rose-600 ring-8 ring-rose-500/30 scale-105 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-750 border border-slate-700'
              }`}
            >
              {isListening ? (
                <Mic className="w-8 h-8 animate-bounce text-white" />
              ) : (
                <Mic className="w-8 h-8 text-rose-400" />
              )}
            </button>
          </div>

          <span className="text-xs font-medium text-slate-300">
            {isListening ? 'Listening to speech... Speak clearly' : 'Tap microphone to speak your question'}
          </span>
        </div>

        {/* Text Input & Submit Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendQuestion();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Or type disaster query here..."
            className="flex-1 bg-slate-950 border border-slate-750 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
          <button
            type="submit"
            disabled={isLoading || !transcript.trim()}
            className="p-2.5 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl transition-colors shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Suggested Queries */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Suggested Prompts:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {samplePrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => {
                  setTranscript(p);
                  handleSendQuestion(p);
                }}
                className="text-[11px] text-slate-300 bg-slate-950 hover:bg-slate-800 border border-slate-800 px-2.5 py-1 rounded-lg text-left transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Answer Box */}
        {(isLoading || responseAnswer) && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-rose-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Response Brief</span>
              </span>

              {responseAnswer && (
                <div className="flex items-center gap-2">
                  {isSpeaking ? (
                    <button
                      onClick={stopSpeaking}
                      className="flex items-center gap-1 text-[11px] text-amber-400 hover:underline"
                    >
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>Stop Voice</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => speakText(responseAnswer)}
                      className="flex items-center gap-1 text-[11px] text-emerald-400 hover:underline"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Repeat Audio</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {isLoading ? (
              <p className="text-slate-400 animate-pulse">
                Analyzing disaster feeds and generating grounded response...
              </p>
            ) : (
              <p className="text-slate-200 leading-relaxed whitespace-pre-line">
                {responseAnswer}
              </p>
            )}
          </div>
        )}

        {/* Footer with Speech Speed Slider */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>Speech Speed:</span>
            <input
              type="range"
              min="0.75"
              max="1.25"
              step="0.05"
              value={speechRate}
              onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
              className="w-20 accent-rose-500 cursor-pointer"
            />
            <span className="font-mono text-slate-300">{speechRate.toFixed(2)}x</span>
          </div>

          <button
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-xs hover:bg-slate-750"
          >
            Close Assistant
          </button>
        </div>
      </div>
    </div>
  );
};
