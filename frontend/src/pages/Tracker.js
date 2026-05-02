import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Toast from '../components/Toast';
import api from '../services/api';
import { io } from 'socket.io-client';

const Tracker = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [location, setLocation] = useState({ lat: 12.9716, lng: 77.5946 }); 
  const [eta, setEta] = useState('Calculating...');
  const [volunteerName, setVolunteerName] = useState('Volunteer');
  const [isLive, setIsLive] = useState(false);
  const [distanceText, setDistanceText] = useState("Waiting for volunteer signal...");
  const [otpValue, setOtpValue] = useState('');
  const [toast, setToast] = useState({ show: false, message: '' });
  const [pickupData, setPickupData] = useState(null);
  const socketRef = useRef(null);

  const RESTAURANT_LOC = { lat: 12.9716, lng: 77.5946 };

  const fetchPickupDetails = async () => {
    try {
      const response = await api.get(`/restaurants/${currentUser.user_id}/pickups`);
      const current = response.data.pickups.find(p => p._id === id);
      setPickupData(current);
    } catch (error) {
      console.error('Error fetching pickup:', error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchPickupDetails();

      socketRef.current = io('http://localhost:5000', {
        query: { role: currentUser.user_type }
      });

      socketRef.current.on(`location_update_${id}`, (data) => {
        setIsLive(true);
        setLocation({ lat: data.lat, lng: data.lng });
        setVolunteerName(data.volunteer_name || 'Volunteer');
        
        const R = 6371; 
        const dLat = (RESTAURANT_LOC.lat - data.lat) * Math.PI / 180;
        const dLon = (RESTAURANT_LOC.lng - data.lng) * Math.PI / 180;
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(data.lat * Math.PI / 180) * Math.cos(RESTAURANT_LOC.lat * Math.PI / 180) * 
          Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distanceKm = R * c;

        const hours = distanceKm / 20;
        const mins = Math.max(1, Math.round(hours * 60));
        
        setEta(`${mins} mins`);
        setDistanceText(`The volunteer is approximately ${distanceKm.toFixed(1)}km away.`);
      });
    }

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [id, currentUser]);

  const handleVerifyOtp = async () => {
    if (!pickupData) return;
    
    if (otpValue === pickupData.otp) {
      try {
        await api.put(`/pickups/${id}/complete`);
        setToast({ show: true, message: '🎉 OTP Verified! Pickup marked as COMPLETED.' });
        setTimeout(() => {
          setToast({ show: false, message: '' });
          navigate('/restaurants');
        }, 2500);
      } catch (error) {
        setToast({ show: true, message: 'Verification failed. Please try again.' });
        setTimeout(() => setToast({ show: false, message: '' }), 2500);
      }
    } else {
      setToast({ show: true, message: '❌ Invalid OTP. Please check with the volunteer.' });
      setTimeout(() => setToast({ show: false, message: '' }), 2500);
    }
  };

  const mapUrl = `https://www.google.com/maps?q=${location.lat},${location.lng}&output=embed`;

  return (
    <div className="min-h-screen bg-ocean-50 font-sans text-ocean-950 antialiased">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_10%_0%,rgba(145,216,255,.35),transparent_34%),linear-gradient(180deg,#f5fbff_0%,#ffffff_44%,#f7fcff_100%)]" />
      
      <Header />

      <main className="mx-auto w-[min(1000px,calc(100%_-_32px))] py-8">
        <button 
          onClick={() => navigate('/restaurants')}
          className="mb-6 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-ocean-600 hover:text-ocean-800 transition"
        >
          ← Back to Dashboard
        </button>

        <section className="grid grid-cols-[1.2fr_0.8fr] gap-6 max-lg:grid-cols-1">
          <div className="animate-float-in overflow-hidden rounded-2xl border border-ocean-100 bg-white shadow-soft">
            <div className="p-6 border-b border-ocean-50 flex justify-between items-center">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-mint-700">Live Tracking</p>
                <h1 className="text-2xl font-black text-ocean-950">Volunteer Movement</h1>
              </div>
              <div className={`flex items-center gap-2 rounded-full px-4 py-1 ${isLive ? 'bg-mint-100' : 'bg-slate-100'}`}>
                <span className={`h-2 w-2 rounded-full ${isLive ? 'bg-mint-500 animate-pulse' : 'bg-slate-400'}`}></span>
                <span className={`text-xs font-black uppercase ${isLive ? 'text-mint-700' : 'text-slate-500'}`}>
                  {isLive ? 'Live' : 'Waiting...'}
                </span>
              </div>
            </div>
            
            <div className="h-[500px] w-full bg-ocean-100 relative">
              <iframe 
                className="h-full w-full" 
                title="Volunteer Tracking Map" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade" 
                src={mapUrl}
              />
              {!isLive && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center p-8 text-center">
                  <div>
                    <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-ocean-200 border-t-ocean-600"></div>
                    <h3 className="text-lg font-black text-ocean-950">Establishing Connection...</h3>
                    <p className="mt-2 text-sm text-slate-600 max-w-xs">
                      The volunteer is currently viewing their delivery dashboard. Once they start moving, you will see them here.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-6">
            <article className="animate-rise rounded-2xl border border-ocean-100 bg-white p-6 shadow-soft">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Estimated Arrival</p>
              <div className="flex items-end gap-2">
                <span className="text-6xl font-black text-ocean-950 tracking-tighter">
                  {isLive ? eta.split(' ')[0] : '--'}
                </span>
                <span className="text-2xl font-black text-ocean-600 mb-2">mins</span>
              </div>
              <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-ocean-100">
                <div 
                  className="h-full bg-mint-500 transition-all duration-1000" 
                  style={{ width: isLive ? '85%' : '0%' }}
                ></div>
              </div>
              <p className="mt-3 text-sm font-bold text-slate-500">{distanceText}</p>
            </article>

            <article className="animate-rise delay-100 rounded-2xl border-2 border-ocean-950 bg-white p-6 shadow-xl">
              <p className="text-xs font-black uppercase tracking-widest text-ocean-600 mb-4 text-center">Verify Collection</p>
              <p className="text-sm font-bold text-slate-500 text-center mb-4">Enter the OTP shown on the volunteer's app:</p>
              
              <div className="flex flex-col gap-4">
                <input 
                  type="text" 
                  maxLength="4"
                  placeholder="0 0 0 0"
                  value={otpValue}
                  onChange={(e) => setOtpValue(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full rounded-xl border-2 border-ocean-100 bg-ocean-50 py-4 text-center text-3xl font-black tracking-[0.5em] text-ocean-950 focus:border-ocean-950 focus:outline-none transition-all"
                />
                <button 
                  onClick={handleVerifyOtp}
                  className="w-full rounded-xl bg-ocean-950 py-4 text-sm font-black text-white shadow-lg transition hover:bg-ocean-800 disabled:opacity-50"
                  disabled={otpValue.length !== 4}
                >
                  Verify & Complete Pickup
                </button>
              </div>
            </article>

            <article className="animate-rise delay-200 rounded-2xl border border-ocean-100 bg-white p-6 shadow-soft">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Assigned Volunteer</p>
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-ocean-100 flex items-center justify-center text-ocean-600 font-black text-xl">
                  {volunteerName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-black text-ocean-950 text-lg">{volunteerName}</h3>
                  <p className="text-sm font-bold text-mint-600">Verified FeedNet Hero</p>
                </div>
              </div>
              <button className="mt-6 w-full rounded-xl border border-ocean-200 py-3 text-sm font-black text-ocean-950 transition hover:bg-ocean-50">
                Contact Volunteer
              </button>
            </article>
          </aside>
        </section>
      </main>

      <Toast show={toast.show} message={toast.message} />
    </div>
  );
};

export default Tracker;
