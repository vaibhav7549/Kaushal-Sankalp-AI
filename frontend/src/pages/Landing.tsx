import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, UserCircle, Shield, Briefcase, GraduationCap, MapPin, Sparkles, 
  ChevronRight, Volume2, Award, TrendingUp, CheckCircle2, ArrowRight,
  Database, Activity, Cpu, Layers, HelpCircle, PhoneCall, Zap, HeartHandshake, Eye
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Landing() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [selectedTrade, setSelectedTrade] = useState(0);

  const changeLang = (l: string) => {
    i18n.changeLanguage(l);
    localStorage.setItem('ks_language', l);
  };

  const trades = [
    {
      name: "Electrician (Domestic & Industrial)",
      nsqf: "Level 4",
      duration: "12 Months",
      credits: "40 Credits (ABC / APAAR)",
      stipend: "₹12,500/mo (NAPS)",
      salary: "₹18,500 - ₹26,000/mo",
      placement: "84% (Verified SIDH)",
      pathway: "Diploma in Electrical → Lateral Entry into B.Tech",
      safety: "65% Female Trainees • 24/7 CCTV • Free State Bus Transport",
      tag: "Most Popular Trade"
    },
    {
      name: "Solar PV Installer (Green Energy)",
      nsqf: "Level 4",
      duration: "6 Months",
      credits: "20 Credits (ABC / APAAR)",
      stipend: "₹11,000/mo (NAPS)",
      salary: "₹16,000 - ₹24,000/mo",
      placement: "88% (PM Surya Ghar)",
      pathway: "Solar Plant Supervisor → Renewable Energy B.Voc",
      safety: "Day-shift Lab Training • Industry Certification",
      tag: "High Growth Future Skill"
    },
    {
      name: "General Duty Healthcare Assistant",
      nsqf: "Level 3/4",
      duration: "12 Months",
      credits: "40 Credits (ABC / APAAR)",
      stipend: "₹13,000/mo (Hospital Internship)",
      salary: "₹17,000 - ₹25,000/mo",
      placement: "92% (Healthcare Sector Council)",
      pathway: "Nursing Supervisor → B.Sc / B.Voc Allied Health",
      safety: "94% Female Enrollment • Hospital Hostels Available",
      tag: "High Female Enrollment"
    },
    {
      name: "Electric Vehicle (EV) Service Specialist",
      nsqf: "Level 4+",
      duration: "9 Months",
      credits: "30 Credits (ABC / APAAR)",
      stipend: "₹14,000/mo (Auto OEMs)",
      salary: "₹20,000 - ₹30,000/mo",
      placement: "86% (EV Hubs)",
      pathway: "EV Diagnostics Specialist → Automotive Engineering",
      safety: "Modern High-Tech Labs • Clean Safe Workspaces",
      tag: "DGT Future-Skill Track"
    },
    {
      name: "Drone Assembly & Maintenance Technician",
      nsqf: "Level 5",
      duration: "6 Months",
      credits: "20 Credits (ABC / APAAR)",
      stipend: "₹15,000/mo (Agri & Mapping)",
      salary: "₹22,000 - ₹35,000/mo",
      placement: "81% (DGCA Aligned)",
      pathway: "Commercial Drone Pilot → Drone Systems Engineering",
      safety: "DGCA Aligned Centers • Simulator Training",
      tag: "Next-Gen Technology"
    }
  ];

  return (
    <div className="min-h-screen mesh-bg font-inter overflow-x-hidden text-gray-800">
      
      {/* Top Header / Navigation Bar */}
      <nav className="glass shadow-sm border-b border-white/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex justify-between items-center">
          
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-2.5 rounded-2xl text-white shadow-md shadow-blue-500/20">
              <Sparkles size={20} />
            </div>
            <div>
              <span className="text-xl font-extrabold font-poppins text-[var(--navy-900)] tracking-tight">
                Kaushal Sankalp AI
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-bold text-blue-700 bg-blue-100/70 border border-blue-200 px-2 py-0.5 rounded-full">
                PS SIH26241
              </span>
            </div>
          </div>

          <div className="hidden lg:flex gap-7 text-sm font-bold text-gray-700">
            <a href="#problem" className="hover:text-blue-600 transition-colors">Problem</a>
            <a href="#solution" className="hover:text-blue-600 transition-colors">Dyadic Architecture</a>
            <a href="#trades" className="hover:text-blue-600 transition-colors">Career Explorer</a>
            <a href="#feasibility" className="hover:text-blue-600 transition-colors">Feasibility & Impact</a>
            <a href="#research" className="hover:text-blue-600 transition-colors">Research</a>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="flex bg-white/80 backdrop-blur rounded-xl p-1 border border-black/10 text-xs font-bold shadow-sm">
              <button 
                onClick={() => changeLang('en')} 
                className={`px-2.5 py-1 rounded-lg transition-all ${i18n.language === 'en' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:text-black'}`}
              >
                EN
              </button>
              <button 
                onClick={() => changeLang('hi')} 
                className={`px-2.5 py-1 rounded-lg transition-all ${i18n.language === 'hi' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:text-black'}`}
              >
                हिन्दी
              </button>
              <button 
                onClick={() => changeLang('mr')} 
                className={`px-2.5 py-1 rounded-lg transition-all ${i18n.language === 'mr' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:text-black'}`}
              >
                मराठी
              </button>
            </div>

            <button 
              onClick={() => navigate('/onboard')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-extrabold px-4 py-2 rounded-xl shadow-md shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all"
            >
              Start Session
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-12 lg:py-16 flex flex-col lg:flex-row gap-12 items-center min-h-[calc(100vh-90px)]">
        
        {/* Left Column: Mission, SIH Problem Title & Live Metrics */}
        <div className="flex-1 flex flex-col items-start text-left animate-in fade-in slide-in-from-left-6 duration-700">
          
          <div className="bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-blue-200 text-blue-900 text-xs font-extrabold mb-5 flex items-center gap-2 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            Smart India Hackathon 2026 • Team TheBIG(O) [ID: 173175]
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-poppins gradient-text mb-4 tracking-tight leading-[1.15]">
            हुनर का फ़ैसला, <br/>
            पूरे परिवार के साथ।
          </h1>
          
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 max-w-xl leading-snug">
            AI-Enabled Career Counselling & Family Decision-Support Platform for Vocational Education
          </h2>
          
          <p className="text-base text-gray-600 mb-8 max-w-xl leading-relaxed">
            India's first <strong>Voice-First Dyadic Guidance Engine</strong> that counsels learners and parents simultaneously in 22 regional languages. We replace informal hearsay with verified district wage data (SIDH JobX), guaranteed NAPS stipends, and degree pathways through Academic Bank of Credits (ABC / APAAR).
          </p>

          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 w-full mb-8">
            <div className="glass p-3.5 rounded-2xl border border-white/70 shadow-sm flex flex-col">
              <span className="text-2xl lg:text-3xl font-black text-blue-600 font-poppins">65%+</span>
              <span className="text-[11px] font-bold text-gray-600 uppercase mt-0.5">Youth Degree Trap</span>
              <span className="text-[9px] text-gray-400 mt-0.5">PLFS Survey</span>
            </div>
            <div className="glass p-3.5 rounded-2xl border border-white/70 shadow-sm flex flex-col">
              <span className="text-2xl lg:text-3xl font-black text-orange-600 font-poppins">90%+</span>
              <span className="text-[11px] font-bold text-gray-600 uppercase mt-0.5">Parent Influence</span>
              <span className="text-[9px] text-gray-400 mt-0.5">Vocational Veto</span>
            </div>
            <div className="glass p-3.5 rounded-2xl border border-white/70 shadow-sm flex flex-col">
              <span className="text-2xl lg:text-3xl font-black text-emerald-600 font-poppins">84%</span>
              <span className="text-[11px] font-bold text-gray-600 uppercase mt-0.5">Verified Placement</span>
              <span className="text-[9px] text-gray-400 mt-0.5">SIDH JobX Palghar</span>
            </div>
            <div className="glass p-3.5 rounded-2xl border border-white/70 shadow-sm flex flex-col">
              <span className="text-2xl lg:text-3xl font-black text-purple-600 font-poppins">40</span>
              <span className="text-[11px] font-bold text-gray-600 uppercase mt-0.5">NSQF Credits</span>
              <span className="text-[9px] text-gray-400 mt-0.5">APAAR / B.Voc Mobility</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <button 
              onClick={() => navigate('/onboard')}
              className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white text-sm font-bold px-7 py-3.5 rounded-2xl shadow-xl shadow-blue-500/25 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <span>Launch Family Counselling Session</span>
              <ArrowRight size={18} />
            </button>
            <a 
              href="#solution"
              className="bg-white/80 hover:bg-white text-gray-800 text-sm font-bold px-6 py-3.5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-2 transition-all"
            >
              Explore Architecture
            </a>
          </div>
        </div>

        {/* Right Column: Interactive Persona Simulation Hub */}
        <div className="flex-1 w-full max-w-lg relative animate-in fade-in slide-in-from-right-6 duration-700">
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/15 blur-[90px] rounded-full pointer-events-none"></div>

          <div className="glass p-7 sm:p-9 rounded-[2.5rem] shadow-2xl border border-white/70 relative z-10 flex flex-col gap-5">
            <div className="text-center">
              <span className="bg-blue-100 text-blue-800 text-[11px] font-extrabold uppercase px-3 py-1 rounded-full border border-blue-200">
                Live Prototype Hub
              </span>
              <h3 className="text-2xl font-black text-[var(--navy-900)] font-poppins mt-2">Choose Simulation Persona</h3>
              <p className="text-xs text-gray-500 font-medium mt-1">Experience the end-to-end triadic mediation lifecycle.</p>
            </div>

            {/* Persona 1: Family Session */}
            <button 
              onClick={() => navigate('/onboard')}
              className="group bg-white/85 hover:bg-white border border-white/80 hover:border-blue-300 p-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] flex items-center gap-4 text-left shadow-sm"
            >
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-3.5 rounded-2xl shadow-md group-hover:shadow-blue-500/40 transition-shadow">
                <Users size={26} />
              </div>
              <div className="flex-1">
                <div className="text-base font-extrabold text-[var(--navy-900)] font-poppins flex items-center gap-2">
                  Family Voice Session
                  <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-bold">Dyadic PWA</span>
                </div>
                <div className="text-xs text-gray-500 font-medium mt-0.5">Learner Mode & Parent Mode joint counselling in regional languages</div>
              </div>
              <ChevronRight className="text-blue-500 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Persona 2: Tele-Counsellor */}
            <button 
              onClick={() => navigate('/counsellor')}
              className="group bg-white/85 hover:bg-white border border-white/80 hover:border-orange-300 p-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] flex items-center gap-4 text-left shadow-sm"
            >
              <div className="bg-gradient-to-br from-orange-500 to-amber-600 text-white p-3.5 rounded-2xl shadow-md group-hover:shadow-orange-500/40 transition-shadow">
                <UserCircle size={26} />
              </div>
              <div className="flex-1">
                <div className="text-base font-extrabold text-[var(--navy-900)] font-poppins flex items-center gap-2">
                  Tele-Counsellor Desk
                  <span className="text-[10px] bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full font-bold">R_s &gt; 0.75</span>
                </div>
                <div className="text-xs text-gray-500 font-medium mt-0.5">Instant WebRTC handoff & 60s structured family resistance briefs</div>
              </div>
              <ChevronRight className="text-orange-500 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Persona 3: District Admin */}
            <button 
              onClick={() => navigate('/admin')}
              className="group bg-white/85 hover:bg-white border border-white/80 hover:border-emerald-300 p-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] flex items-center gap-4 text-left shadow-sm"
            >
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-3.5 rounded-2xl shadow-md group-hover:shadow-emerald-500/40 transition-shadow">
                <Briefcase size={26} />
              </div>
              <div className="flex-1">
                <div className="text-base font-extrabold text-[var(--navy-900)] font-poppins flex items-center gap-2">
                  District Admin (MSDE/SSDM)
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">PRI GIS Heatmap</span>
                </div>
                <div className="text-xs text-gray-500 font-medium mt-0.5">Anonymized block-level telemetry & 2% IEC budget tuning</div>
              </div>
              <ChevronRight className="text-emerald-500 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="text-center pt-1">
              <span className="text-[11px] text-gray-400 font-medium">
                Prototype includes deterministic Palghar District verified dataset.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* The 3-Tier Problem Section (Directly from PPT Slide 2) */}
      <section id="problem" className="py-20 bg-white/70 backdrop-blur-md border-t border-gray-200/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-extrabold text-xs tracking-widest uppercase bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
              Problem Analysis
            </span>
            <h2 className="text-3xl lg:text-4xl font-black font-poppins text-[var(--navy-900)] mt-3 mb-4">
              Why Vocational Uptake Fails in the Field
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-base font-medium">
              India ranks low in vocational enrolment despite massive demand for skilled labour. Conventional career platforms ignore the real gatekeeper: <strong>The Indian Family</strong>.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-xl mb-6">
                01
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-3 font-poppins">The Degree Trap & Stigma</h3>
              <p className="text-sm text-gray-600 leading-relaxed font-medium mb-4">
                <strong>65%+ of youth</strong> prefer general academic degrees (B.A./B.Com) over technical skilling, resulting in <strong>13% overall / 20.4% female educated youth unemployment</strong>. Vocational courses are viewed as a second-tier status downgrade.
              </p>
              <div className="mt-auto pt-4 border-t border-gray-100 text-xs font-bold text-red-600">
                No Degree Mobility → Dead-End Fear
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl mb-6">
                02
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-3 font-poppins">90%+ Parental Influence</h3>
              <p className="text-sm text-gray-600 leading-relaxed font-medium mb-4">
                Families hold ultimate veto power over adolescent career decisions. Without verified local salary proof, families fear lifelong low wages. For daughters, lack of certified safety, transport, and female instructors triggers instant parental refusal.
              </p>
              <div className="mt-auto pt-4 border-t border-gray-100 text-xs font-bold text-amber-600">
                Informal Hearsay &gt; Official Claims
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl mb-6">
                03
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-3 font-poppins">Existing AI Tools Fail</h3>
              <p className="text-sm text-gray-600 leading-relaxed font-medium mb-4">
                Current guidance solutions are built for high-literacy individual course searches. They offer generic unverified claims, zero dyadic mediation for parents, no local dialect voice interaction, and no escalation to human counsellors when resistance spikes.
              </p>
              <div className="mt-auto pt-4 border-t border-gray-100 text-xs font-bold text-blue-600">
                Learner-Only • Zero Human Handoff
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5-Stage Technical Architecture (From PPT Slide 3) */}
      <section id="solution" className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-500 via-transparent to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <span className="text-blue-400 font-extrabold text-xs tracking-widest uppercase bg-blue-500/10 border border-blue-400/20 px-3 py-1 rounded-full">
              Full-Stack Architecture
            </span>
            <h2 className="text-3xl lg:text-4xl font-black font-poppins text-white mt-3 mb-4">
              The KaushalSankalp Triadic Mediation Engine
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto text-base font-medium">
              An evidence-first, 5-stage pipeline bridging vernacular speech, mediative reasoning, national DPI registries, and human escalation.
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-4">
            
            {/* Stage 1 */}
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col hover:bg-white/10 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <span className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 font-extrabold flex items-center justify-center text-sm">1</span>
                <Volume2 size={20} className="text-blue-400" />
              </div>
              <h4 className="font-bold text-white text-base mb-2 font-poppins">Voice-First UI</h4>
              <p className="text-xs text-gray-300 leading-relaxed font-medium">
                Mobile & PMKK Kiosk PWA. Persistent single-tap mic, Silero VAD noise filtering, synchronous audio + text display.
              </p>
            </div>

            {/* Stage 2 */}
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col hover:bg-white/10 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <span className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 font-extrabold flex items-center justify-center text-sm">2</span>
                <Cpu size={20} className="text-indigo-400" />
              </div>
              <h4 className="font-bold text-white text-base mb-2 font-poppins">Bhashini Speech</h4>
              <p className="text-xs text-gray-300 leading-relaxed font-medium">
                MeitY Bhashini & AI4Bharat stack: IndicConformer ASR, IndicTrans2 NMT, and localized regional TTS for 22 languages.
              </p>
            </div>

            {/* Stage 3 */}
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col hover:bg-white/10 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <span className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 font-extrabold flex items-center justify-center text-sm">3</span>
                <HeartHandshake size={20} className="text-purple-400" />
              </div>
              <h4 className="font-bold text-white text-base mb-2 font-poppins">Triadic Mediator</h4>
              <p className="text-xs text-gray-300 leading-relaxed font-medium">
                Mediative LLM Agent reconciling Learner Aspirations with Parental Risk Concerns using local verified evidence.
              </p>
            </div>

            {/* Stage 4 */}
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col hover:bg-white/10 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-extrabold flex items-center justify-center text-sm">4</span>
                <Database size={20} className="text-emerald-400" />
              </div>
              <h4 className="font-bold text-white text-base mb-2 font-poppins">DPI Middleware</h4>
              <p className="text-xs text-gray-300 leading-relaxed font-medium">
                Queries SIDH JobX for live placement, NAPS for guaranteed stipends, and NCrF/ABC for degree credit accumulation.
              </p>
            </div>

            {/* Stage 5 */}
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col hover:bg-white/10 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 font-extrabold flex items-center justify-center text-sm">5</span>
                <PhoneCall size={20} className="text-amber-400" />
              </div>
              <h4 className="font-bold text-white text-base mb-2 font-poppins">Human Escalation</h4>
              <p className="text-xs text-gray-300 leading-relaxed font-medium">
                When R_s &gt; 0.75, generates a structured 60s context brief for live SSDM tele-counsellor or PMKK coordinator handoff.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Interactive Career & Trade Explorer */}
      <section id="trades" className="py-20 bg-slate-50 border-t border-gray-200/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-emerald-600 font-extrabold text-xs tracking-widest uppercase bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              Live Verified Opportunities
            </span>
            <h2 className="text-3xl lg:text-4xl font-black font-poppins text-[var(--navy-900)] mt-3 mb-4">
              Vocational Career & Progression Explorer
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-base font-medium">
              Explore high-demand trades backed by verified starting wages, guaranteed NAPS stipends, and official degree pathways.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Trade Selector List */}
            <div className="w-full lg:w-1/3 flex flex-col gap-3">
              {trades.map((t, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedTrade(idx)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    selectedTrade === idx 
                      ? 'bg-white border-blue-500 shadow-md ring-2 ring-blue-500/20 scale-[1.01]' 
                      : 'bg-white/70 border-gray-200 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{t.nsqf}</span>
                    <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-semibold">{t.duration}</span>
                  </div>
                  <h4 className="font-extrabold text-gray-900 text-sm font-poppins">{t.name}</h4>
                  <span className="text-xs font-semibold text-emerald-600 mt-1 block">{t.stipend}</span>
                </button>
              ))}
            </div>

            {/* Selected Trade Detailed Card */}
            <div className="flex-1 bg-white p-8 rounded-3xl border border-gray-200 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-5 mb-6">
                  <div>
                    <span className="text-xs font-extrabold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
                      {trades[selectedTrade].tag}
                    </span>
                    <h3 className="text-2xl font-black text-gray-900 font-poppins mt-2">
                      {trades[selectedTrade].name}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-400 block font-medium">Placement Rate</span>
                    <span className="text-2xl font-black text-emerald-600 font-poppins">{trades[selectedTrade].placement}</span>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-gray-100">
                    <span className="text-xs text-gray-500 block mb-1">Guaranteed Stipend (NAPS)</span>
                    <span className="text-lg font-bold text-gray-900">{trades[selectedTrade].stipend}</span>
                    <span className="text-[11px] text-gray-400 block mt-0.5">Paid directly by Govt & Employer</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-gray-100">
                    <span className="text-xs text-gray-500 block mb-1">Expected 2-Year Salary</span>
                    <span className="text-lg font-bold text-emerald-700">{trades[selectedTrade].salary}</span>
                    <span className="text-[11px] text-gray-400 block mt-0.5">Verified SIDH District Records</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-gray-100">
                    <span className="text-xs text-gray-500 block mb-1">Academic Credits (APAAR / ABC)</span>
                    <span className="text-base font-bold text-purple-700">{trades[selectedTrade].credits}</span>
                    <span className="text-[11px] text-gray-400 block mt-0.5">Transferrable under NEP 2020</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-gray-100">
                    <span className="text-xs text-gray-500 block mb-1">Centre Safety Infrastructure</span>
                    <span className="text-xs font-bold text-blue-800">{trades[selectedTrade].safety}</span>
                    <span className="text-[11px] text-gray-400 block mt-0.5">NCVET Accredited Center Rating</span>
                  </div>
                </div>

                <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-100 mb-6">
                  <span className="text-xs font-bold text-blue-900 uppercase tracking-wider block mb-1">
                    Degree Progression & Lateral Mobility
                  </span>
                  <p className="text-sm text-blue-950 font-semibold">
                    {trades[selectedTrade].pathway}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-500 font-medium">Source: Skill India Digital Hub & NCVET</span>
                <button 
                  onClick={() => navigate('/onboard')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-colors"
                >
                  Discuss this Trade with AI Assistant
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feasibility & Social Impact (From PPT Slides 4 & 5) */}
      <section id="feasibility" className="py-20 bg-white border-t border-gray-200/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-purple-600 font-extrabold text-xs tracking-widest uppercase bg-purple-50 border border-purple-200 px-3 py-1 rounded-full">
              Feasibility & Ecosystem Scale
            </span>
            <h2 className="text-3xl lg:text-4xl font-black font-poppins text-[var(--navy-900)] mt-3 mb-4">
              Built for National Scale & Rural Viability
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-base font-medium">
              Designed to integrate seamlessly into existing digital public infrastructure without imposing recurring user costs.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-16">
            <div className="p-6 rounded-3xl bg-slate-50 border border-gray-100 flex flex-col">
              <span className="text-xs font-bold text-blue-600 uppercase mb-2">Technical Feasibility</span>
              <h4 className="text-lg font-bold text-gray-900 mb-2 font-poppins">Evidence-First AI</h4>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                RAG + Verified Outcome Data grounds AI responses in empirical figures, mitigating LLM hallucinations. Lightweight PWA functions on low-bandwidth rural 2G/3G connections.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-gray-100 flex flex-col">
              <span className="text-xs font-bold text-emerald-600 uppercase mb-2">Financial Feasibility</span>
              <h4 className="text-lg font-bold text-gray-900 mb-2 font-poppins">Zero User Cost</h4>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                Completely free for students and parents on smartphones and CSC/PMKK kiosks. Reuses existing national investments in Bhashini, Skill India Digital Hub, and DigiLocker.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-gray-100 flex flex-col">
              <span className="text-xs font-bold text-orange-600 uppercase mb-2">Operational Feasibility</span>
              <h4 className="text-lg font-bold text-gray-900 mb-2 font-poppins">5x Counsellor Boost</h4>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                AI resolves routine queries and structures complex objections into a 60-second Case Pack, allowing frontline tele-counsellors to handle 5x more cases with deep empathy.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-gray-100 flex flex-col">
              <span className="text-xs font-bold text-purple-600 uppercase mb-2">Social Feasibility</span>
              <h4 className="text-lg font-bold text-gray-900 mb-2 font-poppins">Family Consensus</h4>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                Addresses deep societal status stigma and female safety concerns natively in local dialects, bridging generational hesitation and preventing mid-course dropouts.
              </p>
            </div>
          </div>

          {/* National Ecosystem Readiness Stats Banner */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-8 sm:p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <span className="text-xs font-extrabold text-blue-300 uppercase tracking-wider block mb-1">Ecosystem Readiness</span>
              <h3 className="text-2xl sm:text-3xl font-black font-poppins">Direct DPI Plug-in Architecture</h3>
              <p className="text-sm text-gray-300 max-w-xl mt-2 font-medium">
                Ready to deploy across the national skilling network without needing new hardware or parallel registries.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-6 text-center border-t md:border-t-0 md:border-l border-white/20 pt-6 md:pt-0 md:pl-8">
              <div>
                <span className="text-2xl sm:text-3xl font-black text-blue-400 block font-poppins">1.64 Cr+</span>
                <span className="text-[11px] text-gray-300 font-semibold">Trained under PMKVY</span>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black text-emerald-400 block font-poppins">1.5 Cr+</span>
                <span className="text-[11px] text-gray-300 font-semibold">Registered on SIDH</span>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black text-purple-400 block font-poppins">56 Lakh+</span>
                <span className="text-[11px] text-gray-300 font-semibold">Apprentices Engaged</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Research & Official Citations Section */}
      <section id="research" className="bg-slate-900 text-white py-20 relative overflow-hidden border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <span className="text-blue-400 font-extrabold text-xs tracking-widest uppercase bg-blue-500/10 border border-blue-400/20 px-3 py-1 rounded-full">
              Academic Foundation
            </span>
            <h2 className="text-3xl lg:text-4xl font-black font-poppins mt-3 mb-4">Research & Policy References</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-base font-medium">
              Every formula, metric, and persona in Kaushal Sankalp AI is grounded in peer-reviewed research and official government reports.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-5 max-w-5xl mx-auto text-xs font-medium">
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
              <span className="text-blue-400 font-bold block mb-1 text-sm">[1] NITI Aayog (2026)</span>
              <p className="text-gray-300 leading-relaxed">
                Reimagining Skilling for Viksit Bharat@2047 — Pathway Clinics, MyGuide, Skill Scout and National Career Outcome Repository.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
              <span className="text-blue-400 font-bold block mb-1 text-sm">[2] MoSPI — PLFS 2023–24</span>
              <p className="text-gray-300 leading-relaxed">
                Periodic Labour Force Survey: vocational and technical training participation among Indian youth and educated unemployment rates.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
              <span className="text-blue-400 font-bold block mb-1 text-sm">[3 & 4] MSDE / PIB (2026)</span>
              <p className="text-gray-300 leading-relaxed">
                Skills, Scale and Transformation — PMKVY, Skill India Digital Hub (SIDH) & National Apprenticeship Promotion Scheme (NAPS).
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
              <span className="text-blue-400 font-bold block mb-1 text-sm">[5 & 6] NCVET & MeitY BHASHINI</span>
              <p className="text-gray-300 leading-relaxed">
                National Credit Framework (NCrF) qualification levels and MeitY Digital India Corporation Multilingual Language AI.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl md:col-span-2">
              <span className="text-blue-400 font-bold block mb-1 text-sm">Empirical VET Perception Studies</span>
              <ul className="text-gray-300 space-y-2 list-disc list-inside mt-2">
                <li><strong>Schneider (2023/2024):</strong> The Attractiveness of Polytechnics in Delhi and Mumbai — Student & Parent Perceptions.</li>
                <li><strong>Ajithkumar, U. & Pilz, M. (2019):</strong> Attractiveness of Industrial Training Institutes (ITI) in India: A study on ITI students and their parents. <em>Education + Training</em>, 61(2), 153–168.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-gray-400 py-10 border-t border-gray-800 text-xs">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white text-sm">Kaushal Sankalp AI</span>
            <span>• SIH 2026 Problem Statement SIH26241</span>
          </div>
          <div className="text-center sm:text-right">
            <span>Built by <strong>Team TheBIG(O)</strong> [Team ID: 173175]</span>
            <span className="block text-[11px] text-gray-500 mt-0.5">Ministry of Skill Development & Entrepreneurship (MSDE) Challenge</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
