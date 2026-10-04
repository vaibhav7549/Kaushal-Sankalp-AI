import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserCircle, Shield, Briefcase, GraduationCap, MapPin, Sparkles, ChevronRight } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen mesh-bg font-inter overflow-x-hidden">
      
      {/* Navigation Bar */}
      <nav className="glass shadow-sm border-b border-white/40 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
           <div className="flex items-center gap-2">
             <div className="bg-gradient-to-r from-[var(--ks-blue-600)] to-indigo-600 p-2 rounded-xl text-white">
               <Sparkles size={20} />
             </div>
             <span className="text-xl font-bold font-poppins text-[var(--navy-900)]">Kaushal Sankalp AI</span>
           </div>
           <div className="hidden md:flex gap-6 text-sm font-semibold text-[var(--navy-700)]">
             <a href="#about" className="hover:text-blue-600 transition-colors">Problem Statement</a>
             <a href="#research" className="hover:text-blue-600 transition-colors">Research & Impact</a>
             <a href="#demo" className="hover:text-blue-600 transition-colors">Live Demo</a>
           </div>
           <div className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1.5 rounded-full border border-blue-200">
             SIH 2026: PS SIH26241
           </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12 items-center min-h-[calc(100vh-80px)]">
        
        {/* Left Column: Hero Copy & PS Info */}
        <div className="flex-1 flex flex-col items-start text-left animate-in fade-in slide-in-from-left-8 duration-700">
          <div className="bg-white/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white text-blue-800 text-sm font-bold mb-6 flex items-center gap-2 shadow-sm">
             Team The BIG(O) • ID 173175
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold font-poppins gradient-text mb-6 tracking-tight drop-shadow-sm leading-tight">
            Bridging the Gap <br/> in Vocational Choice.
          </h1>
          <p className="text-xl text-[var(--navy-700)] mb-2 font-medium max-w-lg">
            AI-Enabled Career Counselling and Family Decision-Support Platform for Vocational Education.
          </p>
          <p className="text-lg text-gray-500 mb-8 max-w-lg">
            हुनर का फ़ैसला, पूरे परिवार के साथ। Empathetic AI mediation that brings parents and learners to a consensus using verified DPI data.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8 w-full max-w-lg">
            <div className="glass p-4 rounded-2xl border border-white/60 shadow-sm flex flex-col">
              <span className="text-3xl font-black text-blue-600">5,980+</span>
              <span className="text-xs font-bold text-gray-500 uppercase mt-1">Families Registered</span>
              <span className="text-[10px] text-gray-400 mt-1">*Demo Dataset (Palghar)</span>
            </div>
            <div className="glass p-4 rounded-2xl border border-white/60 shadow-sm flex flex-col">
              <span className="text-3xl font-black text-emerald-600">31%</span>
              <span className="text-xs font-bold text-gray-500 uppercase mt-1">Dropout Reduction</span>
              <span className="text-[10px] text-gray-400 mt-1">*Projected via Consensus</span>
            </div>
          </div>
        </div>

        {/* Right Column: Interaction Hub */}
        <div className="flex-1 w-full max-w-lg relative animate-in fade-in slide-in-from-right-8 duration-700 delay-150" id="demo">
          
          {/* Decorative glowing blobs */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none"></div>

          <div className="glass p-8 rounded-[2.5rem] shadow-2xl border border-white/60 relative z-10 flex flex-col gap-6">
            <div className="text-center mb-2">
              <h3 className="text-2xl font-bold text-[var(--navy-900)] font-poppins">Enter the Simulation</h3>
              <p className="text-sm text-gray-500 font-medium mt-1">Choose a persona to explore the prototype.</p>
            </div>

            <button 
              onClick={() => navigate('/onboard')}
              className="group bg-white/70 backdrop-blur border border-white hover:border-blue-300 p-5 rounded-2xl transition-all duration-300 hover:scale-[1.03] hover:shadow-lg active:scale-[0.98] flex items-center gap-5"
            >
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-4 rounded-full shadow-lg group-hover:shadow-blue-500/50 transition-shadow">
                <Users size={28} />
              </div>
              <div className="text-left flex-1">
                <div className="text-lg font-bold text-[var(--navy-900)] font-poppins">Family Session</div>
                <div className="text-sm text-gray-500 font-medium">Bilingual mediation (Learner & Parent)</div>
              </div>
              <ChevronRight className="text-blue-500 group-hover:translate-x-1 transition-transform" />
            </button>

            <button 
              onClick={() => navigate('/counsellor')}
              className="group bg-white/70 backdrop-blur border border-white hover:border-orange-300 p-5 rounded-2xl transition-all duration-300 hover:scale-[1.03] hover:shadow-lg active:scale-[0.98] flex items-center gap-5"
            >
              <div className="bg-gradient-to-br from-orange-400 to-orange-600 text-white p-4 rounded-full shadow-lg group-hover:shadow-orange-500/50 transition-shadow">
                <UserCircle size={28} />
              </div>
              <div className="text-left flex-1">
                <div className="text-lg font-bold text-[var(--navy-900)] font-poppins">Tele-Counsellor</div>
                <div className="text-sm text-gray-500 font-medium">Handle escalated sessions in real-time</div>
              </div>
              <ChevronRight className="text-orange-500 group-hover:translate-x-1 transition-transform" />
            </button>

            <button 
              onClick={() => navigate('/admin')}
              className="group bg-white/70 backdrop-blur border border-white hover:border-emerald-300 p-5 rounded-2xl transition-all duration-300 hover:scale-[1.03] hover:shadow-lg active:scale-[0.98] flex items-center gap-5"
            >
              <div className="bg-gradient-to-br from-emerald-400 to-teal-600 text-white p-4 rounded-full shadow-lg group-hover:shadow-emerald-500/50 transition-shadow">
                <Briefcase size={28} />
              </div>
              <div className="text-left flex-1">
                <div className="text-lg font-bold text-[var(--navy-900)] font-poppins">District Admin</div>
                <div className="text-sm text-gray-500 font-medium">View macro analytics & PRI heatmap</div>
              </div>
              <ChevronRight className="text-emerald-500 group-hover:translate-x-1 transition-transform" />
            </button>
            
          </div>
        </div>
      </div>

      {/* Feature & Research Section */}
      <section id="research" className="bg-white/50 backdrop-blur-lg border-t border-white shadow-[0_-4px_30px_rgba(0,0,0,0.02)] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-extrabold font-poppins text-[var(--navy-900)] mb-4">Powered by Verified DPI Data</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg font-medium">
              We replace speculation with facts. Every interactive card shown in the session is backed by aggregated data from the Skill India Digital Hub (SIDH) and NAPS.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
              <div className="bg-blue-50 text-blue-600 p-4 rounded-2xl mb-6">
                <Shield size={32} />
              </div>
              <h4 className="text-xl font-bold text-[var(--navy-900)] mb-3">Safety & Logistics</h4>
              <p className="text-sm text-gray-500 leading-relaxed font-medium">
                Uses real centre ratings, CCTV availability, and female instructor ratios to alleviate parental safety concerns instantly.
              </p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
              <div className="bg-green-50 text-green-600 p-4 rounded-2xl mb-6">
                <GraduationCap size={32} />
              </div>
              <h4 className="text-xl font-bold text-[var(--navy-900)] mb-3">Progression Pathways</h4>
              <p className="text-sm text-gray-500 leading-relaxed font-medium">
                Maps DGT Future Skills and lateral B.Voc entry to tackle 'trade obsolescence' and 'social status' objections.
              </p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
              <div className="bg-orange-50 text-orange-600 p-4 rounded-2xl mb-6">
                <MapPin size={32} />
              </div>
              <h4 className="text-xl font-bold text-[var(--navy-900)] mb-3">Hyper-Local Outcomes</h4>
              <p className="text-sm text-gray-500 leading-relaxed font-medium">
                Presents district-level stipend bands, vacancy rates, and employer density to provide concrete income security.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Research & References Section */}
      <section className="bg-[var(--navy-900)] text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-extrabold font-poppins mb-4">Research & References</h2>
            <p className="text-blue-200 max-w-2xl mx-auto text-lg font-medium">
              Kaushal Sankalp AI is grounded in extensive research on vocational education and parental perceptions.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:bg-white/20 transition-colors">
              <span className="text-blue-300 font-bold text-sm mb-2 block">[1] NITI Aayog (2026)</span>
              <p className="text-sm text-gray-200">Reimagining Skilling for Viksit Bharat@2047 — Pathway Clinics, MyGuide, Skill Scout and National Career Outcome Repository.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:bg-white/20 transition-colors">
              <span className="text-blue-300 font-bold text-sm mb-2 block">[2] MoSPI — PLFS 2023–24</span>
              <p className="text-sm text-gray-200">Vocational and technical training participation among youth.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:bg-white/20 transition-colors">
              <span className="text-blue-300 font-bold text-sm mb-2 block">[3 & 4] MSDE / PIB (2026)</span>
              <p className="text-sm text-gray-200">Skills, Scale and Transformation — PMKVY, Skill India Digital Hub (SIDH) & Apprenticeship Ecosystem.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:bg-white/20 transition-colors">
              <span className="text-blue-300 font-bold text-sm mb-2 block">[5 & 6] NCVET & BHASHINI</span>
              <p className="text-sm text-gray-200">National framework for vocational qualification levels, credits (NCrF) and Multilingual AI services for Indian languages.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:bg-white/20 transition-colors md:col-span-2">
              <span className="text-blue-300 font-bold text-sm mb-2 block">Academic Research on Indian VET Perceptions</span>
              <ul className="text-sm text-gray-200 list-disc list-inside space-y-2">
                <li><strong className="text-white">Schneider (2023/2024):</strong> The Attractiveness of Polytechnics in Delhi and Mumbai — Student & Parent Perceptions.</li>
                <li><strong className="text-white">Ajithkumar, U. & Pilz, M. (2019):</strong> Attractiveness of Industrial Training Institutes (ITI) in India: A study on ITI students and their parents. Education + Training, 61(2), 153–168.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
