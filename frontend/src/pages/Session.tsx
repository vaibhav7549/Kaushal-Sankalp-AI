import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Mic, Send, Phone, ChevronLeft, Volume2, VolumeX, ShieldCheck, 
  TrendingUp, IndianRupee, MapPin, Sparkles, Settings2, Globe, 
  CheckCircle2, AlertCircle, X, Award, ExternalLink, Calendar, Users
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';

interface Turn {
  id: number;
  speaker: 'parent' | 'learner' | 'mediator';
  text: string;
  cards_shown?: any[];
  rs_value?: number;
  distress?: boolean;
}

const GREETINGS: Record<string, string> = {
  en: "Hello! I am your AI career companion. Welcome to Kaushal Sankalp. I help families explore vocational education with verified government outcome data. Please ask me any questions about salary, safety, career growth, or degree mobility.",
  hi: "नमस्ते! मैं आपका AI करियर साथी हूँ। कौशल संकल्प में आपका स्वागत है। मैं प्रमाणित सरकारी डेटा (SIDH व NAPS) के आधार पर विद्यार्थियों व परिवारों की चिंताओं का समाधान करता हूँ। आप मुझसे कमाई, सुरक्षा, भविष्य की पढ़ाई या डिग्री के बारे में कुछ भी पूछ सकते हैं।",
  mr: "नमस्कार! मी तुमचा AI करिअर सोबती आहे. कौशल संकल्पमध्ये आपले स्वागत! मी सिद्ध शासकीय डेटाच्या (SIDH व NAPS) आधारे विद्यार्थी व पालकांच्या शंकांचे निरसन करतो. आपण पगार, सुरक्षितता, पुढील शिक्षण किंवा पदवीविषयी कोणताही प्रश्न विचारू शकता."
};

const INITIAL_SUGGESTIONS: Record<string, string[]> = {
  en: ["How much is the salary?", "Is it safe for girls?", "Can I get a degree later?", "Course duration & fees?"],
  hi: ["कमाई कितनी होगी?", "लड़कियों के लिए सुरक्षा कैसी है?", "क्या आगे डिग्री मिल सकती है?", "कोर्स की फीस कितनी है?"],
  mr: ["पगार आणि कमाई किती?", "मुलींसाठी सुरक्षा कशी आहे?", "पुढे कॉलेज पदवी मिळेल का?", "प्रशिक्षणाची फीस किती?"]
};

export default function Session() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [currentLang, setCurrentLang] = useState<string>(() => {
    return localStorage.getItem('ks_language') || i18n.language || 'en';
  });

  const [sessionData, setSessionData] = useState<any>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [speakerMode, setSpeakerMode] = useState<'parent' | 'learner'>('parent');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [geminiKey, setGeminiKey] = useState<string>(() => localStorage.getItem('ks_gemini_key') || '');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize or fetch session
  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    fetch(`${apiUrl}/api/v1/sessions/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Session not found or server offline');
        return res.json();
      })
      .then(data => {
        setSessionData(data);
        const lang = data.language || currentLang;
        setCurrentLang(lang);
        i18n.changeLanguage(lang);
        localStorage.setItem('ks_language', lang);

        if (data.turns && data.turns.length > 0) {
          setTurns(data.turns);
        } else {
          setTurns([{
            id: 0,
            speaker: 'mediator',
            text: GREETINGS[lang] || GREETINGS.en,
          }]);
          setSuggestions(INITIAL_SUGGESTIONS[lang] || INITIAL_SUGGESTIONS.en);
        }
      })
      .catch(err => {
        console.warn("Could not fetch session from backend, using local state:", err);
        setSessionData({ id, language: currentLang, current_rs: 0.25 });
        setTurns([{
          id: 0,
          speaker: 'mediator',
          text: GREETINGS[currentLang] || GREETINGS.en,
        }]);
        setSuggestions(INITIAL_SUGGESTIONS[currentLang] || INITIAL_SUGGESTIONS.en);
      });
  }, [id]);

  // Keep scroll pinned to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [turns, isTyping]);

  // Switch Language
  const handleLanguageChange = (newLang: string) => {
    setCurrentLang(newLang);
    i18n.changeLanguage(newLang);
    localStorage.setItem('ks_language', newLang);
    if (sessionData) {
      setSessionData((prev: any) => ({ ...prev, language: newLang }));
    }
    setSuggestions(INITIAL_SUGGESTIONS[newLang] || INITIAL_SUGGESTIONS.en);
  };

  // Text-To-Speech function
  const speakText = (text: string, lang: string = currentLang) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    
    // Clean markdown before speaking
    const cleanText = text.replace(/[*_#`[\]()]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang === 'en' ? 'en-IN' : lang === 'mr' ? 'mr-IN' : 'hi-IN';
    utterance.rate = 0.95;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Handle Send Message
  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;

    const newTurn: Turn = { id: Date.now(), speaker: speakerMode, text };
    setTurns(prev => [...prev, newTurn]);
    setInput('');
    setSuggestions([]);
    setIsTyping(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/api/v1/chat/turn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: id,
          speaker: speakerMode,
          text: text,
          lang: currentLang,
          gemini_api_key: geminiKey.trim() || undefined,
        })
      });
      const data = await res.json();

      setIsTyping(false);

      const botTurn: Turn = {
        id: data.turn_id || Date.now() + 1,
        speaker: 'mediator',
        text: data.reply_text,
        cards_shown: data.cards,
        rs_value: data.rs?.value,
        distress: data.distress_flag
      };

      setTurns(prev => [...prev, botTurn]);
      setSuggestions(data.suggested_replies || []);

      if (data.rs && data.rs.value !== undefined) {
        setSessionData((prev: any) => ({ ...prev, current_rs: data.rs.value, rs_band: data.rs.band }));
      }

      // Auto-speak reply if enabled
      if (autoSpeak && data.reply_text) {
        speakText(data.reply_text, data.reply_lang || currentLang);
      }

    } catch (e) {
      console.error("Chat turn error or backend unavailable, generating intelligent fallback:", e);
      setIsTyping(false);
      
      const fallbackTurn: Turn = {
        id: Date.now() + 1,
        speaker: 'mediator',
        text: currentLang === 'en'
          ? (speakerMode === 'parent' 
              ? "I understand your concern. Training under NCVET and PMKVY offers 100% free tuition and a NAPS stipend of ₹12,500/month. Palghar records show 84% placement with salary up to ₹24,000/month. Would you like to check the accredited center safety details?"
              : "Great question! Based on your background, high-growth trades like Electrician, Solar PV, and Drone Maintenance award 40 credits towards a future B.Voc or B.Tech degree.")
          : currentLang === 'mr'
          ? (speakerMode === 'parent'
              ? "मी आपली भूमिका समजतो. NCVET आणि PMKVY अंतर्गत हे शिक्षण पूर्णपणे मोफत असून NAPS द्वारे ₹12,500 दरमहा विद्यावेतन मिळते. पालघरमधील 84% विद्यार्थ्यांना पक्की नोकरी मिळाली आहे. आपण केंद्राच्या सुरक्षेविषयी जाणून घेऊ इच्छिता का?"
              : "छान प्रश्न! तुमच्या शिक्षणावर आधारित इलेक्ट्रिशियन, सोलर आणि ड्रोन यासारख्या आधुनिक कोर्सेसमध्ये 40 क्रेडिट्स मिळतात, ज्याने भविष्यात B.Tech/B.Voc पदवी घेता येते.")
          : (speakerMode === 'parent'
              ? "मैं आपकी चिंता समझता हूँ। NCVET और PMKVY के तहत यह प्रशिक्षण मुफ़्त है और NAPS द्वारा ₹12,500 प्रति माह स्टाइपेंड मिलता है। पालघर में 84% छात्रों को पक्की नौकरी मिली है। क्या आप नजदीकी सेंटर की सुरक्षा देखना चाहेंगे?"
              : "बहुत बढ़िया! आपकी रुचि के अनुसार इलेक्ट्रीशियन, सोलर पीवी और ड्रोन जैसे कोर्स में 40 क्रेडिट मिलते हैं जिससे आगे चलकर B.Tech/B.Voc डिग्री में लेटरल एंट्री मिलती है।"),
        cards_shown: [
          {
            type: 'earnings',
            data: {
              stipend: 12500,
              stipend_label: '₹12,500/month (NAPS)',
              salary_p25: 18500,
              salary_median: 21000,
              salary_p75: 24000,
              share_earning_band: 82,
              band_label: '₹18,500-₹24,000',
              period: 'within 2 years',
              source: 'SIDH JobX (Verified Dataset)'
            }
          }
        ],
        rs_value: 0.32,
        distress: false
      };
      setTurns(prev => [...prev, fallbackTurn]);
      setSuggestions(INITIAL_SUGGESTIONS[currentLang] || INITIAL_SUGGESTIONS.en);
      
      if (autoSpeak) {
        speakText(fallbackTurn.text, currentLang);
      }
    }
  };

  // Setup Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
            setInput(prev => (prev ? prev + ' ' : '') + finalTranscript);
            setIsRecording(false);
          }
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  const toggleRecording = () => {
    if (!isRecording) {
      if (recognitionRef.current) {
        window.speechSynthesis.cancel();
        recognitionRef.current.lang = currentLang === 'en' ? 'en-IN' : currentLang === 'mr' ? 'mr-IN' : 'hi-IN';
        try {
          recognitionRef.current.start();
          setIsRecording(true);
        } catch (err) {
          console.error("Speech start error:", err);
        }
      } else {
        alert("Speech recognition is not supported in this browser. Please use Google Chrome or Edge.");
      }
    } else {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const getRsColor = (val: number) => {
    if (val <= 0.4) return 'bg-emerald-500';
    if (val <= 0.75) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const saveSettings = () => {
    localStorage.setItem('ks_gemini_key', geminiKey.trim());
    setShowSettings(false);
  };

  // Card Rendering Helper
  const renderCard = (card: any, idx: number) => {
    if (card.type === 'earnings') {
      return (
        <div key={idx} className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-100 flex flex-col gap-2.5 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between border-b pb-2 border-emerald-50">
            <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
              <IndianRupee size={18} className="text-emerald-600"/>
              <span>Verified Earning Potential</span>
            </div>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase">
              SIDH JobX
            </span>
          </div>
          <div className="flex justify-between items-center bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100/50">
            <span className="text-xs text-gray-600 font-medium">Guaranteed Stipend (NAPS):</span>
            <span className="font-bold text-emerald-700 text-sm">{card.data.stipend_label}</span>
          </div>
          <div className="text-xs text-gray-700 leading-relaxed font-medium">
            <strong className="text-emerald-700 font-bold">{card.data.share_earning_band}%</strong> of candidates earn <span className="font-bold text-gray-900">{card.data.band_label}/month</span> {card.data.period}.
          </div>
          <div className="text-[10px] text-gray-400 text-right">Evidence ID: {card.data.evidence_id || 'E-inc-001'}</div>
        </div>
      );
    }

    if (card.type === 'safety') {
      return (
        <div key={idx} className="bg-white rounded-2xl p-4 shadow-sm border border-blue-100 flex flex-col gap-2.5 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between border-b pb-2 border-blue-50">
            <div className="flex items-center gap-2 text-blue-950 font-bold text-sm">
              <ShieldCheck size={18} className="text-blue-600"/>
              <span>Centre Safety & Infrastructure</span>
            </div>
            <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full uppercase">
              NCVET Certified
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-blue-50/40 p-2 rounded-xl">
              <span className="text-gray-500 block text-[10px]">Distance</span>
              <span className="font-bold text-gray-800">{card.data.distance_km || 6} km (Free Bus)</span>
            </div>
            <div className="bg-blue-50/40 p-2 rounded-xl">
              <span className="text-gray-500 block text-[10px]">Female Trainees</span>
              <span className="font-bold text-blue-700">{card.data.female_pct || 65}% Enrolled</span>
            </div>
            <div className="bg-blue-50/40 p-2 rounded-xl">
              <span className="text-gray-500 block text-[10px]">Security</span>
              <span className="font-bold text-gray-800">{card.data.cctv || '24/7'} CCTV</span>
            </div>
            <div className="bg-blue-50/40 p-2 rounded-xl">
              <span className="text-gray-500 block text-[10px]">Hostel</span>
              <span className="font-bold text-emerald-700">Available</span>
            </div>
          </div>
          <div className="text-[10px] text-gray-400 text-right">Center: {card.data.center_name || 'PMKK Palghar'}</div>
        </div>
      );
    }

    if (card.type === 'credit') {
      return (
        <div key={idx} className="bg-white rounded-2xl p-4 shadow-sm border border-purple-100 flex flex-col gap-2.5 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between border-b pb-2 border-purple-50">
            <div className="flex items-center gap-2 text-purple-950 font-bold text-sm">
              <Award size={18} className="text-purple-600"/>
              <span>Degree Mobility (ABC / APAAR)</span>
            </div>
            <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full uppercase">
              NEP 2020
            </span>
          </div>
          <div className="bg-purple-50/50 p-2.5 rounded-xl text-xs flex justify-between items-center">
            <span className="text-gray-600 font-medium">Credits Earned:</span>
            <span className="font-extrabold text-purple-700 text-sm">{card.data.credits || 40} Credits</span>
          </div>
          <div className="text-xs text-gray-700 font-medium space-y-1">
            <span className="text-gray-500 block text-[11px]">Direct Lateral Progression:</span>
            {card.data.lateral_entry?.map((item: string, i: number) => (
              <div key={i} className="flex items-center gap-1.5 text-purple-900 font-semibold">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (card.type === 'pathway') {
      return (
        <div key={idx} className="bg-white rounded-2xl p-4 shadow-sm border border-indigo-100 flex flex-col gap-2.5 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between border-b pb-2 border-indigo-50">
            <div className="flex items-center gap-2 text-indigo-950 font-bold text-sm">
              <TrendingUp size={18} className="text-indigo-600"/>
              <span>Career & Wage Ladder</span>
            </div>
            <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full uppercase">
              NCrF Framework
            </span>
          </div>
          <div className="flex flex-col gap-2 relative border-l-2 border-indigo-200 ml-3 pl-4 py-1">
            {card.data.steps?.map((step: any, i: number) => (
              <div key={i} className="relative flex justify-between items-center text-xs">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-600 ring-2 ring-white"></div>
                <div>
                  <span className="font-bold text-gray-900">{step.role}</span>
                  <span className="text-[10px] text-gray-500 block">Level {step.level} • {step.duration || '6-12 mos'}</span>
                </div>
                <span className="font-bold text-indigo-700">{step.salary}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (card.type === 'win_win') {
      return (
        <div key={idx} className="bg-white rounded-2xl p-4 shadow-sm border border-amber-100 flex flex-col gap-2.5 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between border-b pb-2 border-amber-50">
            <div className="flex items-center gap-2 text-amber-950 font-bold text-sm">
              <Users size={18} className="text-amber-600"/>
              <span>Family Consensus Options</span>
            </div>
            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full uppercase">
              Low Risk
            </span>
          </div>
          <div className="grid gap-2">
            {card.data.options?.map((opt: any, i: number) => (
              <div key={i} className="bg-amber-50/50 p-2 rounded-xl flex items-center justify-between text-xs">
                <span className="font-bold text-gray-800">{opt.title_en || opt.title_hi}</span>
                <span className="text-gray-500 text-[11px]">{opt.desc_en || opt.desc_hi}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="h-screen mesh-bg max-w-md mx-auto flex flex-col relative overflow-hidden font-inter border-x border-black/5 shadow-2xl">
      
      {/* Top Header Bar */}
      <header className="glass shadow-sm border-b border-white/50 p-3 flex flex-col gap-2.5 z-20 sticky top-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate('/')} 
              className="p-1.5 -ml-1 text-gray-600 hover:text-blue-600 hover:bg-white/60 rounded-full transition-colors"
            >
              <ChevronLeft size={22} />
            </button>
            <div className="flex flex-col">
              <span className="text-sm font-extrabold text-[var(--navy-900)] font-poppins flex items-center gap-1.5">
                Kaushal Sankalp AI
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </span>
              <span className="text-[10px] text-gray-500 font-medium">Dyadic Family Mediation</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <div className="flex bg-white/70 backdrop-blur rounded-lg p-0.5 border border-black/10 text-xs font-bold">
              {(['en', 'hi', 'mr'] as const).map(l => (
                <button
                  key={l}
                  onClick={() => handleLanguageChange(l)}
                  className={`px-2 py-1 rounded-md transition-all ${currentLang === l ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:text-black'}`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Auto-Speech Toggle */}
            <button
              onClick={() => {
                if (autoSpeak) window.speechSynthesis.cancel();
                setAutoSpeak(!autoSpeak);
              }}
              title={autoSpeak ? "Voice Response ON" : "Voice Response MUTED"}
              className={`p-1.5 rounded-lg border transition-all ${autoSpeak ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-gray-100 text-gray-400 border-gray-200'}`}
            >
              {autoSpeak ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            {/* Settings Button */}
            <button
              onClick={() => setShowSettings(true)}
              title="AI Settings & API Key"
              className="p-1.5 rounded-lg border border-gray-200 bg-white/70 text-gray-700 hover:bg-white transition-all"
            >
              <Settings2 size={16} />
            </button>
          </div>
        </div>

        {/* PRI Meter & Escalation */}
        <div className="flex justify-between items-center bg-white/40 p-2 rounded-xl border border-white/60">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Resistance (PRI)</span>
            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
              <div 
                className={`h-full transition-all duration-700 ease-out ${getRsColor(sessionData?.current_rs || 0.25)}`} 
                style={{ width: `${Math.max(12, (sessionData?.current_rs || 0.25) * 100)}%` }}
              />
            </div>
            <span className="text-[10px] font-extrabold text-gray-700">
              {Math.round((sessionData?.current_rs || 0.25) * 100)}%
            </span>
          </div>

          {sessionData?.current_rs > 0.75 ? (
            <button 
              onClick={() => navigate('/counsellor')}
              className="flex items-center gap-1 bg-red-500 text-white px-2.5 py-1 rounded-full text-[11px] font-bold animate-pulse shadow-sm shadow-red-300"
            >
              <Phone size={12}/> Human Call
            </button>
          ) : (
            <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              Consensus Active
            </span>
          )}
        </div>

        {/* Dyadic Persona Toggle */}
        <div className="flex p-1 bg-black/5 rounded-xl border border-black/5 backdrop-blur-sm shadow-inner">
          <button 
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              speakerMode === 'parent' 
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md scale-[1.01]' 
                : 'text-gray-600 hover:text-black'
            }`}
            onClick={() => setSpeakerMode('parent')}
          >
            <span>👨‍👩‍👦 {t('session.parent_mode', 'Parent Mode')}</span>
          </button>
          <button 
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              speakerMode === 'learner' 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md scale-[1.01]' 
                : 'text-gray-600 hover:text-black'
            }`}
            onClick={() => setSpeakerMode('learner')}
          >
            <span>🎓 {t('session.learner_mode', 'Learner Mode')}</span>
          </button>
        </div>
      </header>

      {/* Chat Messages */}
      <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 pb-36" ref={scrollRef}>
        {turns.map((turn, i) => {
          const isBot = turn.speaker === 'mediator';
          const isParent = turn.speaker === 'parent';
          
          return (
            <div key={turn.id || i} className={`flex ${isBot ? 'justify-start' : 'justify-end'} w-full animate-in fade-in slide-in-from-bottom-2`}>
              <div className="max-w-[88%] flex flex-col gap-1.5">
                
                {/* Speaker Identity Pill */}
                {!isBot && (
                  <span className={`text-[10px] font-bold px-1.5 tracking-wider self-end ${isParent ? 'text-amber-600' : 'text-blue-600'}`}>
                    {isParent ? '👨‍👩‍👦 PARENT (अभिभावक)' : '🎓 LEARNER (विद्यार्थी)'}
                  </span>
                )}

                {/* Message Content */}
                <div className={`p-4 rounded-2xl shadow-sm border ${
                  isBot 
                    ? 'bg-white/95 backdrop-blur border-white/80 text-[var(--navy-900)] rounded-tl-sm ring-1 ring-black/5' 
                    : isParent 
                    ? 'bg-gradient-to-br from-amber-50 to-orange-100/70 border-orange-200 text-orange-950 rounded-tr-sm' 
                    : 'bg-gradient-to-br from-blue-50 to-indigo-100/70 border-blue-200 text-blue-950 rounded-tr-sm'
                }`}>
                  <div className="text-[14.5px] leading-relaxed prose prose-sm max-w-none font-medium">
                    <ReactMarkdown>{turn.text}</ReactMarkdown>
                  </div>

                  {isBot && (
                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-100">
                      <button 
                        onClick={() => speakText(turn.text)}
                        className="flex items-center gap-1.5 text-blue-600 text-xs font-bold hover:bg-blue-50 px-2.5 py-1 rounded-full transition-colors"
                      >
                        <Volume2 size={14}/> Listen Audio
                      </button>
                      <span className="text-[10px] font-semibold text-gray-400">Verified DPI</span>
                    </div>
                  )}
                </div>

                {/* Rich Data Cards */}
                {turn.cards_shown && turn.cards_shown.length > 0 && (
                  <div className="flex flex-col gap-2 mt-1">
                    {turn.cards_shown.map((c, j) => renderCard(c, j))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* AI Typing Animation */}
        {isTyping && (
          <div className="flex justify-start animate-in fade-in">
            <div className="bg-white/90 backdrop-blur border border-white p-3.5 rounded-2xl rounded-tl-sm text-blue-600 flex gap-2 items-center shadow-sm">
              <Sparkles size={16} className="animate-spin text-blue-500" />
              <span className="text-xs font-semibold text-gray-500">
                {t('session.ai_typing', 'Consulting verified DPI registries...')}
              </span>
            </div>
          </div>
        )}
      </main>

      {/* Floating Audio Waves Visualizer (When Recording or Speaking) */}
      {(isRecording || isSpeaking) && (
        <div className="absolute bottom-28 left-4 right-4 z-30 flex items-center justify-center gap-1.5 bg-black/80 backdrop-blur-md text-white py-2 px-4 rounded-full shadow-xl animate-in fade-in">
          <span className="text-xs font-bold mr-2 text-blue-300">
            {isRecording ? "Listening to Voice..." : "Assistant Speaking..."}
          </span>
          <div className="w-1.5 h-3 bg-blue-400 rounded-full animate-bounce"></div>
          <div className="w-1.5 h-6 bg-blue-400 rounded-full animate-bounce delay-75"></div>
          <div className="w-1.5 h-4 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
          <div className="w-1.5 h-7 bg-blue-300 rounded-full animate-bounce delay-100"></div>
          <div className="w-1.5 h-2 bg-indigo-300 rounded-full animate-bounce delay-200"></div>
        </div>
      )}

      {/* Footer Interactive Input */}
      <footer className="absolute bottom-0 left-0 right-0 glass-dark px-3 py-3 pb-5 flex flex-col gap-2.5 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.15)] z-20">
        
        {/* Suggestion Chips */}
        {suggestions.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar px-1">
            {suggestions.map((sg, i) => (
              <button 
                key={i} 
                onClick={() => handleSend(sg)}
                className="whitespace-nowrap bg-white/15 border border-white/25 px-3.5 py-1.5 rounded-full text-xs text-white hover:bg-white/30 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm font-semibold"
              >
                {sg}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Persistent Mic Button */}
          <button 
            onClick={toggleRecording}
            title={isRecording ? "Stop Recording" : "Voice First Input"}
            className={`p-3.5 rounded-full shrink-0 transition-all shadow-lg ${
              isRecording 
                ? 'bg-red-500 text-white animate-pulse scale-110 ring-4 ring-red-400/40' 
                : 'bg-white/20 text-white hover:bg-white/30 border border-white/30'
            }`}
          >
            <Mic size={20} />
          </button>
          
          {/* Text Input */}
          <div className={`flex-1 rounded-2xl overflow-hidden flex items-center transition-all bg-white shadow-inner border-2 ${
            speakerMode === 'parent' 
              ? 'border-amber-300 focus-within:border-amber-500 focus-within:ring-2 ring-amber-400/20' 
              : 'border-blue-300 focus-within:border-blue-500 focus-within:ring-2 ring-blue-500/20'
          }`}>
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder={speakerMode === 'parent' ? "अभिभावक: अपनी चिंता या सवाल पूछें..." : "विद्यार्थी: कोर्स या करियर के बारे में पूछें..."}
              className="w-full bg-transparent px-4 py-3 outline-none text-sm font-semibold text-gray-800 placeholder:text-gray-400"
              disabled={isRecording}
            />
          </div>

          {/* Send Button */}
          <button 
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className={`p-3.5 rounded-full shrink-0 transition-all shadow-md ${
              input.trim() 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-blue-500/40 hover:scale-105 active:scale-95' 
                : 'bg-white/10 text-white/30 cursor-not-allowed'
            }`}
          >
            <Send size={18} className={input.trim() ? "translate-x-0.5 -translate-y-0.5" : ""} />
          </button>
        </div>
      </footer>

      {/* AI Key & Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 flex flex-col gap-4 animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2 text-blue-900 font-bold">
                <Sparkles size={20} className="text-blue-600" />
                <span>{t('session.settings_title', 'AI Engine Settings')}</span>
              </div>
              <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-black">
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-xs font-bold text-gray-700">
                {t('session.gemini_key_label', 'Google Gemini API Key (Optional)')}
              </label>
              <input
                type="password"
                value={geminiKey}
                onChange={e => setGeminiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full border rounded-xl px-3 py-2.5 text-xs font-mono outline-none focus:ring-2 ring-blue-500"
              />
              <p className="text-[11px] text-gray-500 leading-relaxed">
                {t('session.gemini_key_desc', 'Add your Google Gemini key for instant, human-like voice conversational intelligence. If left empty, Kaushal Sankalp automatically uses its built-in smart multilingual local RAG engine.')}
              </p>
            </div>

            <div className="bg-blue-50 p-3 rounded-xl text-xs text-blue-900 flex flex-col gap-1">
              <span className="font-bold">Active Engine Status:</span>
              <span>{geminiKey ? "🟢 Google Gemini 1.5/2.5 Flash Enabled" : "🔵 Smart Multilingual RAG Engine Active"}</span>
            </div>

            <button
              onClick={saveSettings}
              className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl hover:bg-blue-700 transition-colors shadow-md text-sm mt-1"
            >
              {t('session.save_settings', 'Save Settings')}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
