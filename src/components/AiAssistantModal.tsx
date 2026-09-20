import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Bot, User, Loader2, Sprout, ShieldAlert, BookOpen, RefreshCw } from 'lucide-react';
import { FormInput, HasilAnalisis } from '../types.ts';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: FormInput;
  hasilAnalisis: HasilAnalisis;
  hasGeminiKey: boolean;
  userLocation?: {
    latitude: number;
    longitude: number;
    displayName: string;
  } | null;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

const QUICK_PROMPTS = [
  { label: '🚨 Bahaya karhutla di lokasi saya', prompt: 'Berdasarkan cuaca dan lokasi saya saat ini, seberapa bahaya ancaman kebakaran hutan dan lahan di sekitar saya?' },
  { label: '💨 Prediksi sebaran asap ke lokasi saya', prompt: 'Dengan arah angin saat ini, apakah kabut asap berpotensi mengarah dan mencemari pemukiman di lokasi saya?' },
  { label: '🛡️ Langkah perlindungan warga sekitar', prompt: 'Langkah darurat apa yang harus disiapkan warga di wilayah saya untuk mengantisipasi asap dan percikan api?' },
  { label: '🌿 Cara olah kebun tanpa bakar di sini', prompt: 'Bagaimana cara aman dan murah membersihkan lahan pertanian di wilayah saya tanpa membakar?' },
];

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  formData,
  hasilAnalisis,
  hasGeminiKey,
  userLocation
}) => {
  const activeLocation = userLocation ? userLocation.displayName : formData.lokasi;

  const buildWelcomeMessage = (loc: string, cat: string, skor: number, coords?: { lat: number; lon: number } | null): string => {
    const coordStr = coords ? ` (Koordinat: ${coords.lat.toFixed(3)}°, ${coords.lon.toFixed(3)}°)` : '';
    return `Halo! Saya Asisten AI RadarKarhutla (didukung **Google Gemini 3.6 Flash**).\n\nSaya memprioritaskan keselamatan wilayah Anda di **${loc}**${coordStr}.\n\nStatus risiko di sekitar lokasi Anda saat ini: **${cat} (${skor}/100)**.\n\nSilakan tanyakan kondisi kabut asap, arah angin, atau langkah mitigasi bencana di wilayah Anda!`;
  };

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-msg',
      sender: 'ai',
      text: buildWelcomeMessage(
        userLocation ? userLocation.displayName : formData.lokasi,
        hasilAnalisis.kategori_risiko,
        hasilAnalisis.skor_risiko,
        userLocation ? { lat: userLocation.latitude, lon: userLocation.longitude } : null
      ),
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Sync welcome message if user hasn't started conversation yet and location updates
  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].id === 'welcome-msg') {
        return [
          {
            id: 'welcome-msg',
            sender: 'ai',
            text: buildWelcomeMessage(
              activeLocation,
              hasilAnalisis.kategori_risiko,
              hasilAnalisis.skor_risiko,
              userLocation ? { lat: userLocation.latitude, lon: userLocation.longitude } : null
            ),
            time: prev[0].time
          }
        ];
      }
      return prev;
    });
  }, [activeLocation, hasilAnalisis.kategori_risiko, hasilAnalisis.skor_risiko, userLocation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsLoading(true);

    try {
      // Build history
      const history = messages.slice(-4).map(m => ({
        role: m.sender === 'user' ? 'user' as const : 'model' as const,
        text: m.text
      }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          userLocation: userLocation ? {
            name: userLocation.displayName,
            lat: userLocation.latitude,
            lon: userLocation.longitude
          } : {
            name: activeLocation
          },
          context: {
            lokasi: activeLocation,
            jenis_lahan: formData.jenis_lahan,
            musim: formData.musim,
            skor_risiko: hasilAnalisis.skor_risiko,
            kategori_risiko: hasilAnalisis.kategori_risiko
          },
          history
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const aiReply = data.reply || 'Tidak ada balasan dari AI.';

      setMessages(prev => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: aiReply,
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err: unknown) {
      setMessages(prev => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: 'Maaf, terjadi kendala saat menghubungi server AI. Pastikan koneksi internet stabil dan coba sesaat lagi.',
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-[#0e172e] rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl w-full max-w-2xl flex flex-col h-[600px] max-h-[90vh] overflow-hidden transition-colors">
        
        {/* Modal Header */}
        <div className="p-4 sm:px-6 sm:py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-50/70 via-sky-50/40 to-white dark:from-[#152238] dark:via-[#0e172e] dark:to-[#0e172e]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Asisten AI RadarKarhutla
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
                  Gemini 3.6 Flash
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Konsultasi mitigasi api, cuaca spasial & teknik olah lahan
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-[#152238] hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-transparent dark:border-slate-700/50"
            title="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Location Context Bar with Priority Badge */}
        <div className="px-4 py-2 bg-blue-50/60 dark:bg-[#0d1629] border-b border-blue-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-2 truncate">
            <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white font-bold text-[9px] uppercase tracking-wider shrink-0">
              Prioritas Wilayah Anda
            </span>
            <span className="truncate text-slate-900 dark:text-white font-bold">{userLocation ? userLocation.displayName : formData.lokasi}</span>
            <span className="text-slate-300 dark:text-slate-600">&bull;</span>
            <span className="capitalize text-slate-600 dark:text-slate-400">{formData.jenis_lahan}</span>
          </div>

          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] shrink-0 ${
            hasilAnalisis.kategori_risiko === 'SANGAT TINGGI'
              ? 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/50'
              : hasilAnalisis.kategori_risiko === 'TINGGI'
              ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50'
              : 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50'
          }`}>
            {hasilAnalisis.kategori_risiko} ({hasilAnalisis.skor_risiko}/100)
          </span>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gradient-to-tr from-sky-500 to-blue-600 text-white'
                }`}
              >
                {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[82%] sm:max-w-[78%] rounded-2xl px-4 py-3 shadow-xs space-y-1 ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-xs'
                    : 'bg-slate-100/90 dark:bg-[#152238] text-slate-800 dark:text-slate-100 rounded-tl-xs border border-slate-200/70 dark:border-slate-700/60'
                }`}
              >
                <div className="whitespace-pre-line leading-relaxed text-xs sm:text-[13px]">
                  {m.text}
                </div>
                <span
                  className={`block text-[10px] text-right font-mono ${
                    m.sender === 'user' ? 'text-blue-200' : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {m.time}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-100 dark:bg-[#152238] rounded-2xl rounded-tl-xs px-4 py-2.5 border border-slate-200/70 dark:border-slate-700/60 flex items-center gap-2 text-slate-600 dark:text-slate-300 text-xs">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600 dark:text-blue-400" />
                <span>Gemini AI sedang berpikir...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0d1629] flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {QUICK_PROMPTS.map((qp, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(qp.prompt)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-xl bg-white dark:bg-[#152238] hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-300 text-[11px] font-medium border border-slate-200 dark:border-slate-700/60 shadow-2xs shrink-0 transition-colors cursor-pointer"
            >
              {qp.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 sm:p-4 bg-white dark:bg-[#0e172e] border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 transition-colors"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Tanyakan seputar mitigasi api, cuaca, atau olah lahan..."
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-[#0d1629] hover:bg-slate-100/70 dark:hover:bg-[#131e33] focus:bg-white dark:focus:bg-[#0d1629] border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all disabled:opacity-60"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed shadow-md shadow-blue-500/20 shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span className="hidden sm:inline">Kirim</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};

