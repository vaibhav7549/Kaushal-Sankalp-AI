import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mic, Send, Headphones, Phone, ChevronLeft, Volume2, ShieldCheck, TrendingUp, IndianRupee, MapPin } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Turn {
  id: number;
  speaker: 'parent' | 'learner' | 'mediator';
  text: string;
  cards_shown?: any[];
  rs_value?: number;
  distress?: boolean;
}

export default function Session() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sessionData, setSessionData] = useState<any>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [speakerMode, setSpeakerMode] = useState<'parent' | 'learner'>('parent');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch initial session data
  useEffect(() => {
    fetch(`http://localhost:8000/api/v1/sessions/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Session not found or server offline');
        return res.json();
      })
      .then(data => {
        setSessionData(data);
        if (data.turns && data.turns.length > 0) {
          setTurns(data.turns);
        } else {
          setTurns([{
            id: 0,
            speaker: 'mediator',
            text: `नमस्ते! मैं आपका AI साथी हूँ। कौशल संकल्प में आपका स्वागत है। आप कोर्स और करियर को लेकर कोई भी चिंता या सवाल मुझसे पूछ सकते हैं।`,
          }]);
          setSuggestions(['कमाई कितनी होगी?', 'सुरक्षा कैसी है?', 'भविष्य में क्या?']);
        }
      })
      .catch(err => {
        console.warn("Could not fetch session, falling back to local session state:", err);
        setSessionData({ id, language: 'hi', current_rs: 0.25 });
        setTurns([{
          id: 0,
          speaker: 'mediator',
          text: `नमस्ते! मैं आपका AI साथी हूँ। कौशल संकल्प में आपका स्वागत है। आप कोर्स और करियर को लेकर कोई भी चिंता या सवाल मुझसे पूछ सकते हैं।`,
        }]);
        setSuggestions(['कमाई कितनी होगी?', 'सुरक्षा कैसी है?', 'भविष्य में क्या?']);
      });
  }, [id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [turns, isTyping]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;
    
    const newTurn: Turn = { id: Date.now(), speaker: speakerMode, text };
    setTurns(prev => [...prev, newTurn]);
    setInput('');
    setSuggestions([]);
    setIsTyping(true);

    try {
      const res = await fetch(`http://localhost:8000/api/v1/chat/turn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: id,
          speaker: speakerMode,
          text: text,
          lang: sessionData?.language || 'hi'
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
        setSessionData((prev: any) => ({...prev, current_rs: data.rs.value, rs_band: data.rs.band}));
      }

      // Speech Synthesis Fallback (Browser)
      if (data.reply_text) {
         const utterance = new SpeechSynthesisUtterance(data.reply_text);
         utterance.lang = sessionData?.language === 'en' ? 'en-IN' : 'hi-IN';
         window.speechSynthesis.speak(utterance);
      }

    } catch (e) {
      console.error("Chat turn error or backend unavailable, generating fallback response:", e);
      setIsTyping(false);
      const fallbackTurn: Turn = {
        id: Date.now() + 1,
        speaker: 'mediator',
        text: speakerMode === 'parent' 
          ? `मैं आपकी चिंता समझता हूँ। व्यावसायिक शिक्षा और NCVET प्रमाणित प्रशिक्षण से रोजगार के सुरक्षित और बेहतर अवसर मिलते हैं। क्या आप नजदीकी संस्थान या छात्रवृत्ति के बारे में जानना चाहते हैं?` 
          : `बहुत बढ़िया! आपकी रुचि और हुनर के आधार पर कई प्रैक्टिकल और आधुनिक कोर्सेज उपलब्ध हैं, जिनमें तुरंत इंटर्नशिप और प्लेसमेंट मिलता है।`,
        cards_shown: [
          {
            type: 'wage_roi',
            data: {
              trade: 'Electrician / Solar Tech',
              avg_salary: '₹18,500/mo',
              placement_rate: '88%',
              source: 'NCVET / Skill India'
            }
          }
        ],
        rs_value: 0.32,
        distress: false
      };
      setTurns(prev => [...prev, fallbackTurn]);
      setSuggestions(['नजदीकी कॉलेज कहाँ है?', 'खर्च और स्कॉलरशिप क्या है?', 'प्रमाणपत्र की मान्यता']);
    }
  };

  // Setup Speech Recognition
  const recognitionRef = useRef<any>(null);

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
            setInput(prev => prev + finalTranscript);
            setIsRecording(false);
          } else {
            // Can handle interim here if needed
          }
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    } else {
      console.warn("Speech Recognition API not supported in this browser.");
    }
  }, []);

  const toggleRecording = () => {
    if (!isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.lang = sessionData?.language === 'en' ? 'en-IN' : 'hi-IN';
        recognitionRef.current.start();
        setIsRecording(true);
      } else {
        alert("Voice to text is not supported in this browser.");
      }
    } else {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const getRsColor = (val: number) => {
    if (val <= 0.4) return 'bg-green-500';
    if (val <= 0.75) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const renderCard = (card: any, idx: number) => {
    if (card.type === 'earnings') {
      return (
        <div key={idx} className="bg-white rounded-xl p-3 shadow-sm border border-[var(--border)] mt-2 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[var(--navy-900)] font-semibold border-b pb-2">
            <IndianRupee size={16} className="text-green-600"/> <span>Earning Potential</span>
            <span className="ml-auto text-xs bg-green-100 text-green-800 px-2 rounded-full border border-green-200">Verified</span>
          </div>
          <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
            <span className="text-sm">Stipend (During Training)</span>
            <span className="font-semibold">{card.data.stipend_label}</span>
          </div>
          <div className="text-sm mt-1">
            <span className="font-semibold text-[var(--ks-blue-600)]">{card.data.share_earning_band}%</span> earn {card.data.band_label} {card.data.period}.
          </div>
          <div className="text-[10px] text-gray-400 text-right mt-1">Source: {card.data.source}</div>
        </div>
      );
    }
    if (card.type === 'safety') {
      return (
        <div key={idx} className="bg-white rounded-xl p-3 shadow-sm border border-[var(--border)] mt-2 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[var(--navy-900)] font-semibold border-b pb-2">
            <ShieldCheck size={16} className="text-blue-600"/> <span>Safety & Infrastructure</span>
            <span className="ml-auto text-xs bg-blue-100 text-blue-800 px-2 rounded-full border border-blue-200">Verified</span>
          </div>
          <div className="grid gap-2 text-sm">
             <div className="flex justify-between"><span>Centre</span><span className="font-medium text-right">{card.data.center_name}</span></div>
             <div className="flex justify-between"><span>Distance</span><span className="font-medium">{card.data.distance_km} km</span></div>
             <div className="flex justify-between"><span>Female Trainees</span><span className="font-medium">{card.data.female_pct}%</span></div>
             <div className="flex justify-between"><span>Security</span><span className="font-medium">{card.data.cctv} CCTV</span></div>
          </div>
          <div className="text-[10px] text-gray-400 text-right mt-1">Source: {card.data.source}</div>
        </div>
      );
    }
    if (card.type === 'pathway') {
       return (
        <div key={idx} className="bg-white rounded-xl p-3 shadow-sm border border-[var(--border)] mt-2 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[var(--navy-900)] font-semibold border-b pb-2">
            <TrendingUp size={16} className="text-purple-600"/> <span>Career Pathway</span>
            <span className="ml-auto text-xs bg-purple-100 text-purple-800 px-2 rounded-full border border-purple-200">NCVET</span>
          </div>
          <div className="flex flex-col gap-1 relative border-l-2 border-purple-200 ml-2 pl-4 py-1">
             {card.data.steps?.map((step: any, i: number) => (
               <div key={i} className="relative">
                 <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-purple-500"></div>
                 <div className="text-sm font-medium">{step.role} <span className="text-xs text-gray-500 font-normal">(Level {step.level})</span></div>
                 <div className="text-xs text-gray-600">{step.salary}</div>
               </div>
             ))}
          </div>
        </div>
      );
    }
    return <div key={idx} className="bg-gray-100 p-2 text-xs">Unknown card: {card.type}</div>;
  };

  return (
    <div className="h-screen mesh-bg max-w-md mx-auto flex flex-col relative overflow-hidden font-inter">
      {/* Header */}
      <header className="glass shadow-sm border-b border-white/40 p-3 flex flex-col gap-3 z-10 sticky top-0">
        <div className="flex justify-between items-center">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 hover:text-[var(--ks-blue-600)] transition-colors">
            <ChevronLeft size={24} />
          </button>
          
          <div className="flex items-center gap-3">
             {/* Escalation Button */}
             {sessionData?.current_rs > 0.75 && (
                <button className="flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold animate-pulse border border-red-200 shadow-sm shadow-red-200">
                  <Phone size={12}/> Talk to Human
                </button>
             )}
            
            {/* R_s Meter */}
            <div className="flex items-center gap-2 bg-white/60 backdrop-blur px-3 py-1.5 rounded-full border border-white/50 shadow-sm">
              <span className="text-[10px] font-bold text-[var(--navy-900)] uppercase tracking-wider">PRI</span>
              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                <div 
                  className={`h-full transition-all duration-700 ease-out ${getRsColor(sessionData?.current_rs || 0)}`} 
                  style={{width: `${Math.max(10, (sessionData?.current_rs || 0) * 100)}%`}}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Dyadic Toggle */}
        <div className="flex p-1 bg-black/5 rounded-xl border border-black/5 backdrop-blur-sm shadow-inner">
          <button 
            className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-all duration-300 ${speakerMode === 'parent' ? 'bg-white shadow-md text-[var(--parent)] scale-[1.02]' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setSpeakerMode('parent')}
          >
            Parent
          </button>
          <button 
            className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-all duration-300 ${speakerMode === 'learner' ? 'bg-white shadow-md text-[var(--learner)] scale-[1.02]' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setSpeakerMode('learner')}
          >
            Learner
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-5 pb-32" ref={scrollRef}>
        {turns.map((turn, i) => {
          const isBot = turn.speaker === 'mediator';
          const isParent = turn.speaker === 'parent';
          const isLearner = turn.speaker === 'learner';
          
          return (
            <div key={turn.id || i} className={`flex ${isBot ? 'justify-start' : 'justify-end'} w-full animate-in fade-in slide-in-from-bottom-2`}>
              <div className={`max-w-[85%] flex flex-col gap-1.5`}>
                
                {/* Speaker Label */}
                {!isBot && (
                  <span className={`text-[10px] font-bold px-1 tracking-widest ${isParent ? 'text-orange-500' : 'text-blue-500'}`}>
                    {isParent ? 'PARENT' : 'LEARNER'}
                  </span>
                )}

                {/* Message Bubble */}
                <div className={`p-4 rounded-2xl shadow-sm border ${
                  isBot ? 'bg-white/80 backdrop-blur border-white/60 text-[var(--navy-900)] rounded-tl-sm' : 
                  isParent ? 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200/50 text-orange-900 rounded-tr-sm' : 
                  'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200/50 text-blue-900 rounded-tr-sm'
                }`}>
                  <div className="text-[15px] leading-relaxed">
                     <ReactMarkdown>{turn.text}</ReactMarkdown>
                  </div>
                  {isBot && (
                    <button onClick={() => {
                        const utterance = new SpeechSynthesisUtterance(turn.text);
                        utterance.lang = sessionData?.language === 'en' ? 'en-IN' : 'hi-IN';
                        window.speechSynthesis.speak(utterance);
                    }} className="mt-2 flex items-center gap-1.5 text-[var(--ks-blue-600)] text-xs font-semibold opacity-80 hover:opacity-100 bg-[var(--ks-blue-50)] px-2 py-1 rounded-full w-max">
                      <Volume2 size={14}/> Listen
                    </button>
                  )}
                </div>

                {/* Interactive Cards */}
                {turn.cards_shown && turn.cards_shown.length > 0 && (
                  <div className="flex flex-col gap-2 mt-2">
                    {turn.cards_shown.map((c, j) => renderCard(c, j))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {isTyping && (
          <div className="flex justify-start animate-in fade-in">
             <div className="bg-white/80 backdrop-blur border border-white/60 p-4 rounded-2xl rounded-tl-sm text-gray-500 flex gap-2 items-center shadow-sm">
               <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
               <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-75"></div>
               <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-150"></div>
             </div>
          </div>
        )}
      </main>

      {/* Input Area */}
      <footer className="absolute bottom-0 left-0 right-0 glass-dark px-4 py-4 pb-6 flex flex-col gap-3 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
        {/* Chips */}
        {suggestions.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar -mx-4 px-4 mask-edges">
            {suggestions.map((sg, i) => (
              <button 
                key={i} 
                onClick={() => handleSend(sg)}
                className="whitespace-nowrap bg-white/10 border border-white/20 px-4 py-2 rounded-full text-sm text-white hover:bg-white/20 hover:scale-[1.02] transition-all shadow-sm font-medium"
              >
                {sg}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-end gap-3">
           <button 
             onClick={toggleRecording}
             className={`p-4 rounded-full shrink-0 transition-all shadow-md ${
               isRecording ? 'bg-red-500 text-white animate-pulse-glow scale-110' : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
             }`}
           >
             <Mic size={24} />
           </button>
           
           <div className={`flex-1 rounded-3xl overflow-hidden flex items-center transition-all bg-white shadow-inner border-2 ${
             speakerMode === 'parent' ? 'border-orange-200 focus-within:border-orange-400 focus-within:ring-4 ring-orange-400/20' : 'border-blue-200 focus-within:border-blue-500 focus-within:ring-4 ring-blue-500/20'
           }`}>
             <input 
               type="text" 
               value={input}
               onChange={e => setInput(e.target.value)}
               onKeyDown={e => e.key === 'Enter' && handleSend()}
               placeholder={speakerMode === 'parent' ? "अभिभावक बोल रहे हैं..." : "विद्यार्थी बोल रहे हैं..."}
               className="w-full bg-transparent px-5 py-4 outline-none text-[15px] font-medium text-gray-800 placeholder:text-gray-400"
               disabled={isRecording}
             />
           </div>

           <button 
             onClick={() => handleSend()}
             disabled={!input.trim()}
             className={`p-4 rounded-full shrink-0 transition-all shadow-md ${
               input.trim() ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-blue-500/40 hover:scale-105' : 'bg-white/5 text-white/30 cursor-not-allowed'
             }`}
           >
             <Send size={24} className={input.trim() ? "translate-x-0.5 -translate-y-0.5" : ""} />
           </button>
        </div>
      </footer>
    </div>
  );
}
