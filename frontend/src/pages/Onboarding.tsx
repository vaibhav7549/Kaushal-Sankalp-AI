import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Volume2, CheckCircle2, ShieldCheck, MicOff, Trash2, Globe, MapPin, User, Briefcase, IndianRupee, ChevronLeft } from 'lucide-react';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  // Step 1: Language
  const handleLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setStep(2);
  };

  // Step 2: Consent
  const handleConsent = () => {
    setStep(3);
  };

  // Step 3: Profile (Simplified for demo)
  const [profile, setProfile] = useState({
    district: '',
    income: '',
    learner_age: '',
    learner_gender: '',
    academic: '',
    interests: [] as string[],
    parent_occ: ''
  });

  const [isStarting, setIsStarting] = useState(false);

  const handleComplete = async () => {
    setIsStarting(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: i18n.language,
          state: 'Maharashtra',
          district: profile.district || 'Palghar',
          income_band: profile.income,
          learner_age: parseInt(profile.learner_age) || 17,
          learner_gender: profile.learner_gender,
          academic_bg: profile.academic,
          learner_interests: profile.interests,
          parent_occupation: profile.parent_occ
        })
      });
      if (!response.ok) {
        throw new Error(`Failed to create session: ${response.status}`);
      }
      const data = await response.json();
      navigate(`/session/${data.id || 'demo-session'}`);
    } catch (err) {
      console.warn("Backend unavailable, starting offline/demo session:", err);
      // Fallback seamlessly so user isn't stuck on the onboarding screen
      const fallbackId = `demo-${Date.now()}`;
      navigate(`/session/${fallbackId}`);
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="min-h-screen mesh-bg flex flex-col font-inter">
      {/* Premium Header Overlay */}
      <div className="absolute top-0 left-0 right-0 p-4 z-10 flex justify-between items-center">
        <button onClick={() => navigate('/')} className="text-gray-500 hover:text-[var(--ks-blue-600)] transition-colors p-2 glass rounded-full shadow-sm hover:scale-105 active:scale-95">
           <ChevronLeft size={24} />
        </button>
      </div>

      <div className="flex-1 w-full max-w-md mx-auto p-4 pt-16 flex flex-col relative z-0">
        
        {/* Progress Tracker */}
        <div className="flex justify-center gap-3 mb-10">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-2.5 rounded-full transition-all duration-500 ${i === step ? 'w-10 bg-gradient-to-r from-blue-500 to-indigo-600 shadow-sm shadow-blue-300' : (i < step ? 'w-4 bg-blue-300' : 'w-2 bg-gray-300')}`} />
          ))}
        </div>

        {/* Form Container */}
        <div className="glass p-6 sm:p-8 rounded-[2rem] shadow-xl border border-white/60 relative overflow-hidden flex-1 flex flex-col justify-center">
          
          {/* Subtle glowing orbs in the background */}
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-blue-400/20 blur-[50px] rounded-full pointer-events-none"></div>
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-purple-400/20 blur-[50px] rounded-full pointer-events-none"></div>

          <div className="relative z-10 flex flex-col h-full">
            
            {step === 1 && (
              <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 duration-500 h-full justify-center">
                <div className="text-center mb-4">
                  <h2 className="text-3xl font-extrabold text-[var(--navy-900)] font-poppins tracking-tight mb-2">
                    {t('onboarding.language_select')}
                  </h2>
                  <p className="text-gray-500 font-medium">हम किस भाषा में बात करें?</p>
                </div>
                
                <div className="grid gap-4">
                  <button onClick={() => handleLanguage('hi')} className="group bg-white/60 backdrop-blur-sm border-2 border-transparent hover:border-blue-400 hover:bg-blue-50/50 p-5 rounded-2xl shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md flex justify-between items-center">
                    <span className="text-2xl font-bold text-[var(--navy-900)]">हिंदी</span>
                    <Volume2 className="text-blue-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </button>
                  <button onClick={() => handleLanguage('en')} className="group bg-white/60 backdrop-blur-sm border-2 border-transparent hover:border-blue-400 hover:bg-blue-50/50 p-5 rounded-2xl shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md flex justify-between items-center">
                    <span className="text-2xl font-bold text-[var(--navy-900)]">English</span>
                    <Volume2 className="text-blue-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </button>
                  <button onClick={() => handleLanguage('mr')} className="group bg-white/60 backdrop-blur-sm border-2 border-transparent hover:border-blue-400 hover:bg-blue-50/50 p-5 rounded-2xl shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md flex justify-between items-center">
                    <span className="text-2xl font-bold text-[var(--navy-900)]">मराठी</span>
                    <Volume2 className="text-blue-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </button>
                </div>
                
                <div className="mt-8 text-center text-sm font-medium text-gray-500 flex items-center justify-center gap-2">
                  <Globe size={16} className="text-blue-500"/> 22 languages supported by Bhashini
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 duration-500 h-full">
                <div className="text-center mb-2">
                  <h2 className="text-3xl font-extrabold text-[var(--navy-900)] font-poppins tracking-tight mb-2">
                    {t('onboarding.consent_title')}
                  </h2>
                  <p className="text-gray-500 text-sm font-medium px-4">As per DPDP Act 2023, we need your consent to process family details.</p>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="bg-white/60 backdrop-blur border border-white p-5 rounded-2xl shadow-sm flex items-start gap-4">
                    <div className="bg-blue-100/50 p-3 rounded-full text-blue-600 shrink-0 border border-blue-200">
                      <MicOff size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-[var(--navy-900)] mb-1">Audio is not saved</h3>
                      <p className="text-sm text-gray-600 font-medium">Your voice is only used to understand you in real-time.</p>
                    </div>
                  </div>
                  
                  <div className="bg-white/60 backdrop-blur border border-white p-5 rounded-2xl shadow-sm flex items-start gap-4">
                    <div className="bg-emerald-100/50 p-3 rounded-full text-emerald-600 shrink-0 border border-emerald-200">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-[var(--navy-900)] mb-1">Safe and Secure</h3>
                      <p className="text-sm text-gray-600 font-medium">Names are not stored. Data is encrypted.</p>
                    </div>
                  </div>

                  <div className="bg-white/60 backdrop-blur border border-white p-5 rounded-2xl shadow-sm flex items-start gap-4">
                    <div className="bg-red-100/50 p-3 rounded-full text-red-600 shrink-0 border border-red-200">
                      <Trash2 size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-[var(--navy-900)] mb-1">Delete Anytime</h3>
                      <p className="text-sm text-gray-600 font-medium">You can erase all your session data at any moment.</p>
                    </div>
                  </div>
                </div>
                
                <p className="text-xs text-center text-gray-400 font-medium mt-2">
                  * Minors require guardian consent to proceed. By continuing, you confirm parental guidance.
                </p>

                <div className="mt-auto pt-6">
                  <button onClick={handleConsent} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 text-white p-4 rounded-2xl font-bold text-lg transition-all hover:scale-[1.02] flex justify-center items-center gap-2">
                    <CheckCircle2 size={24} /> {t('onboarding.consent_agree')}
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 duration-500 overflow-y-auto pb-4 custom-scrollbar h-full">
                <div className="text-center mb-2">
                  <h2 className="text-3xl font-extrabold text-[var(--navy-900)] font-poppins tracking-tight mb-2">
                    {t('onboarding.profile_title')}
                  </h2>
                  <p className="text-gray-500 text-sm font-medium">Help us personalize the session.</p>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="bg-white/70 backdrop-blur-md border border-white p-5 rounded-2xl shadow-sm">
                    <label className="flex items-center gap-2 text-sm font-bold text-[var(--navy-900)] mb-3"><MapPin size={16} className="text-blue-500"/> District</label>
                    <input type="text" placeholder="e.g. Palghar" className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-medium bg-white/50" value={profile.district} onChange={e => setProfile({...profile, district: e.target.value})} />
                  </div>

                  <div className="bg-white/70 backdrop-blur-md border border-white p-5 rounded-2xl shadow-sm">
                    <label className="flex items-center gap-2 text-sm font-bold text-[var(--navy-900)] mb-3"><IndianRupee size={16} className="text-green-600"/> Household Income</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['< 10k', '10k - 25k', '25k - 50k', '> 50k'].map(inc => (
                        <button key={inc} onClick={() => setProfile({...profile, income: inc})} className={`p-2.5 rounded-xl border-2 text-sm font-bold transition-all ${profile.income === inc ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm' : 'border-transparent bg-white/50 text-gray-500 hover:border-gray-200 hover:bg-white'}`}>
                          {inc}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white/70 backdrop-blur-md border border-white p-5 rounded-2xl shadow-sm">
                    <label className="flex items-center gap-2 text-sm font-bold text-[var(--navy-900)] mb-3"><User size={16} className="text-orange-500"/> Learner Profile</label>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <input type="number" placeholder="Age (e.g. 17)" className="p-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-medium bg-white/50 text-sm" value={profile.learner_age} onChange={e => setProfile({...profile, learner_age: e.target.value})} />
                      <select className="p-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-medium bg-white/50 text-sm" value={profile.learner_gender} onChange={e => setProfile({...profile, learner_gender: e.target.value})}>
                        <option value="">Gender</option>
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {['8th Pass', '10th Pass', '12th Pass', 'Dropout'].map(edu => (
                        <button key={edu} onClick={() => setProfile({...profile, academic: edu})} className={`p-2 rounded-xl border-2 text-xs font-bold transition-all ${profile.academic === edu ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm' : 'border-transparent bg-white/50 text-gray-500 hover:border-gray-200 hover:bg-white'}`}>
                          {edu}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-white/70 backdrop-blur-md border border-white p-5 rounded-2xl shadow-sm">
                    <label className="flex items-center gap-2 text-sm font-bold text-[var(--navy-900)] mb-3"><Briefcase size={16} className="text-purple-500"/> Login via Demo</label>
                    <div className="flex gap-3">
                      <button className="flex-1 bg-gradient-to-br from-green-50 to-green-100/50 text-green-800 border border-green-200 p-3 rounded-xl text-sm font-bold flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-shadow">
                        Mobile OTP
                        <span className="text-[10px] font-medium opacity-70 mt-0.5">(Demo: 123456)</span>
                      </button>
                      <button className="flex-1 bg-gradient-to-br from-orange-50 to-orange-100/50 text-orange-800 border border-orange-200 p-3 rounded-xl text-sm font-bold flex flex-col items-center justify-center relative shadow-sm hover:shadow-md transition-shadow">
                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[9px] px-2 py-0.5 rounded-full font-black shadow-sm">SIMULATED</div>
                        Aadhaar e-KYC
                        <span className="text-[10px] font-medium opacity-70 mt-0.5">(Fast path)</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <button 
                    onClick={handleComplete} 
                    disabled={isStarting}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-70 shadow-lg shadow-blue-500/30 text-white p-4 rounded-2xl font-bold text-lg transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                  >
                    {isStarting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Starting Session...</span>
                      </>
                    ) : (
                      "Start Session"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
