import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';

const TIERS = {
  diamond: {
    name: 'Diamond Partner',
    color: 'from-blue-400 via-cyan-300 to-indigo-400',
    border: 'border-cyan-200',
    text: 'text-cyan-900',
    badge: '💎',
    desc: 'Elite Sustainability Champion'
  },
  gold: {
    name: 'Gold Partner',
    color: 'from-amber-300 via-yellow-400 to-orange-500',
    border: 'border-yellow-200',
    text: 'text-amber-900',
    badge: '🏆',
    desc: 'Premier Impact Leader'
  },
  silver: {
    name: 'Silver Partner',
    color: 'from-slate-300 via-slate-400 to-slate-500',
    border: 'border-slate-200',
    text: 'text-slate-900',
    badge: '🥈',
    desc: 'Committed Community Ally'
  }
};

const Achievement = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { stats, restaurantName } = location.state || { stats: {}, restaurantName: 'Our Restaurant' };
  
  const tier = TIERS[type] || TIERS.silver;

  return (
    <div className="min-h-screen bg-slate-50 font-serif print:bg-white pb-20">
      <Header />
      
      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8 flex justify-between items-center print:hidden">
          <button 
            onClick={() => navigate('/restaurants')}
            className="flex items-center gap-2 text-sm font-sans font-black uppercase tracking-widest text-slate-500 hover:text-slate-800 transition"
          >
            ← Back to Dashboard
          </button>
          <button 
            onClick={() => window.print()}
            className="bg-ocean-950 text-white px-8 py-3 rounded-xl font-sans font-black text-sm uppercase tracking-widest shadow-xl hover:opacity-90 transition"
          >
            Print Achievement
          </button>
        </div>

        {/* Certificate Frame */}
        <div className={`relative overflow-hidden rounded-[2rem] border-8 ${tier.border} bg-white p-1 pb-1 shadow-2xl`}>
          <div className={`h-full w-full rounded-[1.5rem] border-4 ${tier.border} p-16 text-center relative`}>
            {/* Artistic Background Elements */}
            <div className={`absolute top-0 left-0 h-48 w-48 bg-gradient-to-br ${tier.color} opacity-10 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2`}></div>
            <div className={`absolute bottom-0 right-0 h-64 w-64 bg-gradient-to-tl ${tier.color} opacity-10 blur-3xl rounded-full translate-x-1/2 translate-y-1/2`}></div>

            {/* Content */}
            <div className="relative z-10">
               <div className={`mx-auto h-24 w-24 rounded-3xl bg-gradient-to-br ${tier.color} flex items-center justify-center text-5xl shadow-2xl mb-10`}>
                 {tier.badge}
               </div>

               <p className="font-sans text-xs font-black uppercase tracking-[.6em] text-slate-400 mb-4">Official Sustainability Recognition</p>
               
               <h1 className="text-2xl font-medium italic text-slate-500 mb-2">This prestigious award is presented to</h1>
               <h2 className={`text-6xl font-black tracking-tight ${tier.text} mb-8`}>{restaurantName}</h2>
               
               <div className="h-1 w-32 bg-slate-200 mx-auto mb-8"></div>

               <p className="text-2xl font-medium text-slate-600 mb-2">For achieving the status of</p>
               <h3 className={`text-5xl font-black uppercase tracking-tighter ${tier.text} mb-12`}>
                 {tier.name}
               </h3>

               <div className="grid grid-cols-3 gap-8 mb-16 bg-slate-50/50 p-8 rounded-3xl border border-slate-100">
                  <div>
                    <p className="font-sans text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">CO2 Saved</p>
                    <p className="text-3xl font-black text-slate-800">{stats.co2Saved?.toFixed(1)}kg</p>
                  </div>
                  <div>
                    <p className="font-sans text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Meals Shared</p>
                    <p className="text-3xl font-black text-slate-800">{stats.totalMeals}</p>
                  </div>
                  <div>
                    <p className="font-sans text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Community Pts</p>
                    <p className="text-3xl font-black text-slate-800">{stats.impactPoints}</p>
                  </div>
               </div>

               <p className="max-w-2xl mx-auto text-lg leading-relaxed text-slate-500 italic mb-16">
                 "Through unwavering commitment to food waste reduction and social responsibility, 
                 this establishment has set a benchmark for sustainability in our community."
               </p>

               <div className="flex justify-between items-end mt-12 px-10">
                 <div className="text-left">
                   <div className="h-0.5 w-48 bg-slate-300 mb-2"></div>
                   <p className="font-sans text-[10px] font-black uppercase tracking-[.2em] text-slate-400">Date of Achievement</p>
                   <p className="font-sans text-sm font-bold text-slate-800">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                 </div>
                 
                 <div className="h-24 w-24 border-4 border-slate-100 rounded-full flex items-center justify-center relative">
                    <div className={`absolute inset-2 border-2 border-dashed ${tier.border} rounded-full`}></div>
                    <span className="font-sans text-[10px] font-black text-slate-300 uppercase tracking-tighter rotate-12">Official Seal</span>
                 </div>

                 <div className="text-right">
                   <div className="h-0.5 w-48 bg-slate-300 mb-2"></div>
                   <p className="font-sans text-[10px] font-black uppercase tracking-[.2em] text-slate-400">FeedNet Logistics Director</p>
                   <p className="font-sans text-sm font-bold italic text-slate-800">Authorized Signature</p>
                 </div>
               </div>
            </div>
          </div>
        </div>

        <p className="mt-10 text-center font-sans text-[10px] font-black uppercase tracking-[.5em] text-slate-300">
          FeedNet Achievement ID: #FN-{Math.random().toString(36).substring(7).toUpperCase()}
        </p>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .print\\:hidden { display: none !important; }
          body { background: white !important; }
          .rounded-\\[2rem\\] { border-radius: 0 !important; border: none !important; box-shadow: none !important; }
          .rounded-\\[1\\.5rem\\] { border-radius: 0 !important; border: 4px solid #eee !important; }
        }
      `}} />
    </div>
  );
};

export default Achievement;
