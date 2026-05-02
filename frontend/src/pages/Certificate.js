import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Header from '../components/Header';

const Certificate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [pickup, setPickup] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCertificateData = async () => {
      try {
        const response = await api.get(`/volunteer/${currentUser.user_id}`);
        const found = response.data.pickups.find(p => p._id === id);
        if (found) {
          setPickup(found);
        }
      } catch (error) {
        console.error('Error fetching certificate:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchCertificateData();
    }
  }, [id, currentUser]);

  const calculatePoints = (km) => {
    if (km <= 5) return 10;
    if (km <= 10) return 25;
    if (km <= 20) return 50;
    return 100;
  };

  if (loading) return <div className="p-10 text-center font-bold">Generating your certificate...</div>;
  if (!pickup) return <div className="p-10 text-center font-bold">Mission details not found.</div>;

  const co2Saved = (parseInt(pickup.quantity) * 0.19).toFixed(2);
  const points = calculatePoints(pickup.distance_km);

  return (
    <div className="min-h-screen bg-[#f8fafc] font-serif text-[#1e293b] antialiased pb-20">
      <Header />

      <main className="mx-auto w-[min(900px,calc(100%_-_32px))] py-12">
        <button 
          onClick={() => navigate('/past-orders')}
          className="mb-8 flex items-center gap-2 text-sm font-sans font-black uppercase tracking-widest text-ocean-600 hover:text-ocean-800 transition no-print"
        >
          ← Back to History
        </button>

        <section className="animate-float-in relative overflow-hidden bg-white shadow-[0_0_80px_rgba(0,0,0,0.08)] rounded-lg p-1">
          {/* Border Decoration */}
          <div className="border-[16px] border-double border-ocean-950/10 p-12 text-center relative">
            
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-24 h-24 border-t-8 border-l-8 border-ocean-950/20"></div>
            <div className="absolute top-0 right-0 w-24 h-24 border-t-8 border-r-8 border-ocean-950/20"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 border-b-8 border-l-8 border-ocean-950/20"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 border-b-8 border-r-8 border-ocean-950/20"></div>

            {/* Header */}
            <div className="mb-10">
              <div className="mx-auto h-20 w-20 bg-ocean-950 rounded-full flex items-center justify-center mb-6 shadow-xl">
                <span className="text-3xl font-black text-mint-400 font-sans">FN</span>
              </div>
              <p className="text-sm font-sans font-black uppercase tracking-[0.4em] text-ocean-600 mb-2">Official Recognition</p>
              <h1 className="text-6xl font-black text-ocean-950 leading-tight">Certificate of Appreciation</h1>
            </div>

            <div className="max-w-2xl mx-auto space-y-8">
              <p className="text-xl font-medium italic text-slate-500">This certificate is proudly awarded to</p>
              
              <div className="py-4">
                <h2 className="text-5xl font-black text-ocean-950 border-b-2 border-ocean-950/10 inline-block px-12 pb-2">
                  {currentUser.name}
                </h2>
              </div>

              <p className="text-lg leading-relaxed text-slate-600 font-medium">
                In recognition of your outstanding contribution to the global fight against food waste. 
                Through your dedicated service on <strong>{new Date(pickup.created_at).toLocaleDateString()}</strong>, 
                you successfully redistributed <strong>{pickup.quantity} {pickup.food_type}</strong> from 
                <strong> {pickup.restaurant_name}</strong> to those in need.
              </p>

              {/* Impact Seals */}
              <div className="grid grid-cols-3 gap-8 py-10">
                <div className="space-y-2">
                  <div className="h-16 w-16 mx-auto rounded-full bg-mint-50 flex items-center justify-center text-mint-700 border-2 border-mint-200">
                    <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  </div>
                  <p className="font-sans font-black text-xs uppercase tracking-widest text-slate-400">Merit Points</p>
                  <p className="text-xl font-black text-ocean-950">+{points} Pts</p>
                </div>
                <div className="space-y-2">
                  <div className="h-16 w-16 mx-auto rounded-full bg-ocean-50 flex items-center justify-center text-ocean-700 border-2 border-ocean-200">
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <p className="font-sans font-black text-xs uppercase tracking-widest text-slate-400">CO2 Offset</p>
                  <p className="text-xl font-black text-ocean-950">{co2Saved} kg</p>
                </div>
                <div className="space-y-2">
                  <div className="h-16 w-16 mx-auto rounded-full bg-red-50 flex items-center justify-center text-red-700 border-2 border-red-200">
                    <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
                  </div>
                  <p className="font-sans font-black text-xs uppercase tracking-widest text-slate-400">Social Impact</p>
                  <p className="text-xl font-black text-ocean-950">High</p>
                </div>
              </div>

              {/* Signatures */}
              <div className="flex justify-between items-end pt-12 mt-12 border-t border-ocean-950/5">
                <div className="text-left">
                  <p className="font-black text-ocean-950 font-sans text-sm">FeedNet Logistics</p>
                  <p className="text-xs text-slate-400 font-bold font-sans uppercase tracking-widest">Authorized Platform</p>
                </div>
                <div className="h-24 w-24 relative">
                  <div className="absolute inset-0 bg-ocean-950 rounded-full opacity-5 transform rotate-12 scale-125"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="font-black text-[10px] text-ocean-950 uppercase tracking-tighter transform -rotate-12 leading-tight">OFFICIAL<br/>SEAL OF<br/>IMPACT</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-ocean-950 font-sans text-sm">ID: {pickup._id.slice(-10).toUpperCase()}</p>
                  <p className="text-xs text-slate-400 font-bold font-sans uppercase tracking-widest">Verification Code</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-10 flex justify-center gap-4 no-print">
          <button 
            onClick={() => window.print()}
            className="bg-ocean-950 text-white px-10 py-4 rounded-xl font-black text-sm shadow-xl hover:opacity-90 transition flex items-center gap-3 font-sans"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2-2H7a2 2 0 00-2 2v4h14z" /></svg>
            Print Certificate
          </button>
          <button 
            onClick={() => navigate('/past-orders')}
            className="bg-white text-ocean-950 border-2 border-ocean-950 px-10 py-4 rounded-xl font-black text-sm hover:bg-ocean-50 transition font-sans"
          >
            Return to History
          </button>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print, header, nav { display: none !important; }
          body { background: white !important; margin: 0 !important; padding: 0 !important; }
          main { width: 100% !important; max-width: 100% !important; padding: 0 !important; margin: 0 !important; }
          section { border: none !important; box-shadow: none !important; margin: 0 !important; }
        }
      `}} />
    </div>
  );
};

export default Certificate;
