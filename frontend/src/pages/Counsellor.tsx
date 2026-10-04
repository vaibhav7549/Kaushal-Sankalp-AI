import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, CheckCircle, Clock, AlertTriangle, ShieldCheck, ChevronLeft, MapPin } from 'lucide-react';

export default function Counsellor() {
  const navigate = useNavigate();
  const [escalations, setEscalations] = useState<any[]>([
    {
      id: 1,
      session_id: 1,
      status: 'pending',
      district: 'Palghar',
      learner_age: 17,
      learner_gender: 'Female',
      course: 'Electrician (Domestic)',
      wait_time: '2m',
      rs_value: 0.82,
      brief: "Family Context: Learner (17F) interested in Electrician course.\nFather (Farmer, 44) expressed strong resistance regarding female safety.\nAI resolved initial income concerns (Rs 12.5k stipend shown).\nDistress / High friction detected on distance/safety. R_s is 0.82.\n\nRecommendation:\n1. Emphasize PMKK Palghar safety (CCTV, female instructors).\n2. Offer a centre visit (lab tour).\n3. Validate their protective concern."
    },
    {
      id: 2,
      session_id: 2,
      status: 'pending',
      district: 'Nashik',
      learner_age: 18,
      learner_gender: 'Male',
      course: 'Solar PV Installer',
      wait_time: '15m',
      rs_value: 0.88,
      brief: "Family Context: Learner (18M) interested in Solar course.\nMother concerned about long-term stability and 'obsolescence' of trade jobs.\nRecommendation:\n1. Explain DGT Future Skills pathway.\n2. Note B.Voc lateral entry."
    }
  ]);
  const [activeCase, setActiveCase] = useState<any>(null);

  return (
    <div className="h-screen bg-[var(--bg)] flex overflow-hidden">
      
      {/* Sidebar: Queue */}
      <div className="w-1/3 min-w-[300px] border-r border-[var(--border)] bg-white flex flex-col">
        <div className="p-4 bg-[var(--navy-900)] text-white flex items-center gap-3">
           <button onClick={() => navigate('/')} className="hover:bg-white/20 p-1 rounded"><ChevronLeft/></button>
           <h1 className="font-semibold text-lg font-poppins">Tele-Counsellor</h1>
        </div>
        <div className="p-3 border-b border-[var(--border)] bg-gray-50 flex justify-between items-center text-sm font-medium text-gray-600">
           <span>Live Queue ({escalations.length})</span>
           <span className="flex items-center gap-1 text-green-600"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> Online</span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
           {escalations.map(esc => (
             <button 
               key={esc.id} 
               onClick={() => setActiveCase(esc)}
               className={`text-left p-4 rounded-xl border transition-all ${activeCase?.id === esc.id ? 'border-[var(--ks-blue-600)] bg-[var(--ks-blue-50)] shadow-sm' : 'border-[var(--border)] bg-white hover:border-gray-300'}`}
             >
               <div className="flex justify-between items-start mb-2">
                 <div className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                   <AlertTriangle size={12}/> High Friction (R_s {(esc.rs_value * 100).toFixed(0)}%)
                 </div>
                 <div className="text-xs text-gray-500 flex items-center gap-1"><Clock size={12}/> {esc.wait_time}</div>
               </div>
               <div className="font-semibold text-[var(--navy-900)]">{esc.course}</div>
               <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                 <UserIcon gender={esc.learner_gender}/> {esc.learner_age}{esc.learner_gender[0]} • <MapPin size={12}/> {esc.district}
               </div>
             </button>
           ))}
        </div>
      </div>

      {/* Main Content: Case Context */}
      <div className="flex-1 bg-gray-50 flex flex-col">
        {activeCase ? (
          <>
            <div className="p-6 bg-white border-b border-[var(--border)] shadow-sm">
              <div className="flex justify-between items-start">
                 <div>
                   <h2 className="text-2xl font-semibold text-[var(--navy-900)] mb-1">Case #{activeCase.session_id}</h2>
                   <p className="text-gray-500">{activeCase.district} • {activeCase.course}</p>
                 </div>
                 <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-full font-semibold flex items-center gap-2 shadow-sm transition-colors">
                   <Phone size={18}/> Accept & Call
                 </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
               
               {/* AI Brief */}
               <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
                 <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                   <ShieldCheck size={20}/> AI Handoff Brief
                 </h3>
                 <div className="text-blue-800 whitespace-pre-line text-sm leading-relaxed">
                   {activeCase.brief}
                 </div>
               </div>

               {/* Mock Transcript / Stats */}
               <div className="bg-white border border-[var(--border)] rounded-2xl p-6 shadow-sm">
                 <h3 className="font-semibold text-[var(--navy-900)] mb-4">Session Stats</h3>
                 <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="text-xs text-gray-500 font-semibold mb-1 uppercase">Max Resistance (R_s)</div>
                      <div className="text-2xl font-bold text-red-600">{(activeCase.rs_value * 100).toFixed(0)}%</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="text-xs text-gray-500 font-semibold mb-1 uppercase">Cards Shown</div>
                      <div className="text-lg font-semibold text-[var(--navy-900)]">Earnings, Safety</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="text-xs text-gray-500 font-semibold mb-1 uppercase">Primary Objection</div>
                      <div className="text-lg font-semibold text-orange-600">Female Safety</div>
                    </div>
                 </div>
               </div>
               
               <div className="text-center text-sm text-gray-400 mt-4">
                 * Telephony integration (Ozonetel/Exotel) is simulated for the demo.
               </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 flex-col gap-4">
            <Phone size={48} className="opacity-20"/>
            <p>Select a case from the queue to view details.</p>
          </div>
        )}
      </div>

    </div>
  );
}

function UserIcon({gender}: {gender: string}) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  );
}
