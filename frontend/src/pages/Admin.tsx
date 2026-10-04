import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, AlertTriangle, Clock, Activity, ChevronLeft, MapPin, Download, BarChart2 } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#f97316', '#3b82f6', '#a855f7', '#6b7280'];
const data = [
  { name: 'Female Safety', value: 40 },
  { name: 'Income Security', value: 30 },
  { name: 'Social Status', value: 20 },
  { name: 'Trade Obsol.', value: 10 },
];

export default function Admin() {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState<any>(null);
  const [geoData, setGeoData] = useState<any>(null);

  useEffect(() => {
    // Fetch mock data from our backend
    fetch('http://localhost:8000/api/v1/admin/kpis')
      .then(r => r.json())
      .then(setKpis);
      
    fetch('http://localhost:8000/api/v1/admin/geo/pri')
      .then(r => r.json())
      .then(setGeoData);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      <header className="bg-[var(--ks-blue-600)] text-white p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
           <button onClick={() => navigate('/')} className="hover:bg-white/20 p-2 rounded-full"><ChevronLeft/></button>
           <div>
             <h1 className="text-xl font-bold font-poppins tracking-wide">Kaushal Sankalp AI</h1>
             <p className="text-sm opacity-90">District Admin Console • Palghar</p>
           </div>
        </div>
        <button className="bg-white text-[var(--ks-blue-600)] px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-blue-50 transition-colors">
          <Download size={16}/> Export Report
        </button>
      </header>

      <main className="flex-1 p-6 flex gap-6 max-w-[1400px] mx-auto w-full">
        {/* Left Column: KPIs & Breakdown */}
        <div className="w-1/3 flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
            <KpiCard icon={<Users/>} title="Families Engaged" value={kpis?.families_engaged || '...'} trend="+12%" color="blue"/>
            <KpiCard icon={<Activity/>} title="Avg. Resistance (PRI)" value={kpis?.average_pri || '...'} trend="-0.05" color="orange"/>
            <KpiCard icon={<AlertTriangle/>} title="Escalation Rate" value={(kpis?.escalation_rate || '...') + '%'} trend="-2%" color="red"/>
            <KpiCard icon={<Clock/>} title="Counsellor Hrs Saved" value={kpis?.counsellor_time_saved_hours || '...'} trend="+140" color="green"/>
          </div>

          <div className="bg-white border border-[var(--border)] rounded-2xl p-6 shadow-sm flex-1 flex flex-col">
             <h3 className="font-semibold text-[var(--navy-900)] mb-2 flex items-center gap-2"><BarChart2 size={18}/> Primary Objections (Palghar)</h3>
             <div className="flex-1 min-h-[200px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={data}
                     cx="50%"
                     cy="50%"
                     innerRadius={60}
                     outerRadius={80}
                     paddingAngle={5}
                     dataKey="value"
                   >
                     {data.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                   </Pie>
                   <RechartsTooltip 
                     contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                   />
                 </PieChart>
               </ResponsiveContainer>
             </div>
             
             <div className="grid grid-cols-2 gap-3 mt-4">
               {data.map((entry, idx) => (
                 <div key={idx} className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                   <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }}></div>
                   {entry.name} ({entry.value}%)
                 </div>
               ))}
             </div>
             
             <p className="text-xs text-red-500 bg-red-50 p-2 rounded-lg mt-6 border border-red-100 font-medium">Action required: Prioritize safety communication in outreach programs for PMKK Palghar.</p>
          </div>
        </div>

        {/* Right Column: PRI Map (Mocked) */}
        <div className="flex-1 bg-white border border-[var(--border)] rounded-2xl shadow-sm flex flex-col overflow-hidden relative">
          <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-gray-50 z-10">
             <h3 className="font-semibold text-[var(--navy-900)] flex items-center gap-2"><MapPin size={18}/> Parental Resistance Heatmap</h3>
             <div className="flex gap-2">
               <select className="border border-gray-300 rounded-lg p-1.5 text-sm bg-white">
                 <option>All Demographics</option>
                 <option>Female Learners</option>
                 <option>Rural</option>
               </select>
             </div>
          </div>
          
          <div className="flex-1 bg-blue-50 relative flex items-center justify-center overflow-hidden">
             {/* Mock Map Background */}
             <div className="absolute inset-0 opacity-20" style={{
                 backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M10 10 h 80 v 80 h -80 Z\' fill=\'none\' stroke=\'%230B63B8\' stroke-width=\'1\'/%3E%3C/svg%3E")',
                 backgroundSize: '50px 50px'
             }}></div>
             
             {geoData?.districts?.map((d: any) => (
               <div key={d.id} className="relative z-10 flex flex-col items-center group cursor-pointer">
                 <div className="text-xs font-bold text-gray-800 bg-white/80 px-2 py-0.5 rounded shadow-sm mb-1">{d.name}</div>
                 <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ${d.pri > 0.6 ? 'bg-red-500/80 animate-pulse' : 'bg-orange-500/80'}`}>
                   {d.pri}
                 </div>
                 <div className="absolute top-full mt-2 bg-white border border-gray-200 shadow-xl rounded-lg p-3 w-48 hidden group-hover:block z-20">
                    <div className="text-sm font-semibold border-b pb-1 mb-2">{d.name} Details</div>
                    <div className="text-xs flex justify-between"><span>Sessions:</span> <span>{d.volume}</span></div>
                    <div className="text-xs flex justify-between"><span>Safety Driver:</span> <span>{d.driver_mix.FEMALE_SAFETY}%</span></div>
                 </div>
               </div>
             ))}
          </div>
          <div className="absolute bottom-4 right-4 bg-white/90 p-2 rounded-lg shadow border border-gray-200 text-xs flex items-center gap-2 z-10">
            <span className="font-semibold">Legend: PRI</span>
            <div className="flex gap-1 items-center">
              <div className="w-3 h-3 bg-green-500 rounded"></div> &lt; 0.4
              <div className="w-3 h-3 bg-orange-500 rounded ml-2"></div> 0.4 - 0.7
              <div className="w-3 h-3 bg-red-500 rounded ml-2"></div> &gt; 0.7
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function KpiCard({icon, title, value, trend, color}: {icon: any, title: string, value: string|number, trend: string, color: string}) {
  const colorMap: any = {
    blue: 'bg-blue-50 text-blue-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
    green: 'bg-green-50 text-green-600',
  };
  
  return (
    <div className="bg-white border border-[var(--border)] rounded-xl p-4 shadow-sm flex flex-col gap-2">
       <div className="flex justify-between items-start">
         <div className={`p-2 rounded-lg ${colorMap[color]}`}>{icon}</div>
         <span className={`text-xs font-semibold ${trend.startsWith('+') && color !== 'red' ? 'text-green-600' : 'text-red-600'}`}>{trend}</span>
       </div>
       <div>
         <div className="text-sm text-gray-500 font-medium">{title}</div>
         <div className="text-2xl font-bold text-[var(--navy-900)]">{value}</div>
       </div>
    </div>
  );
}

function DriverBar({label, value, color}: {label: string, value: number, color: string}) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="font-bold text-gray-900">{value}%</span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{width: `${value}%`}}></div>
      </div>
    </div>
  );
}
