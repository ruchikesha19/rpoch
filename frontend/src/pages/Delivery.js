import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Header from '../components/Header';
import Toast from '../components/Toast';
import { io } from 'socket.io-client';

const Delivery = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [pickup, setPickup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });
  const fileInputRef = useRef(null);
  const socketRef = useRef(null);
  const locationIntervalRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoUpload = async () => {
    if (!photo) {
      setToast({ show: true, message: 'Please select a photo first!' });
      return;
    }

    setIsUploading(true);
    try {
      await api.put(`/pickups/${id}/complete`, {
        delivery_photo: photo
      });
      
      setToast({ show: true, message: '🎉 Mission Fully Completed! Points awarded.' });
      setTimeout(() => {
        setToast({ show: false, message: '' });
        navigate('/volunteers');
      }, 2000);
    } catch (error) {
      setToast({ show: true, message: 'Failed to upload proof.' });
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    const fetchPickupDetails = async () => {
      try {
        const response = await api.get(`/volunteer/${currentUser.user_id}`);
        const activePickup = response.data.pickups.find(p => p._id.toString() === id.toString());
        if (activePickup) {
          setPickup(activePickup);
        }
      } catch (error) {
        console.error('Error fetching delivery details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchPickupDetails();

      socketRef.current = io('http://localhost:5000', {
        query: { role: currentUser.user_type }
      });

      // Listen for completion signal from the restaurant
      socketRef.current.on('pickup_completed', (updatedPickup) => {
        if (updatedPickup._id.toString() === id.toString()) {
          setPickup(updatedPickup);
          setIsVerified(true);
          setToast({ show: true, message: '✅ Collection Verified! Now upload proof of delivery.' });
          setTimeout(() => setToast({ show: false, message: '' }), 3000);
        }
      });

      locationIntervalRef.current = setInterval(() => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            socketRef.current.emit('volunteer_location', {
              pickup_id: id,
              volunteer_name: currentUser.name,
              lat: latitude,
              lng: longitude
            });
          });
        }
      }, 5000);
    }

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
      if (locationIntervalRef.current) clearInterval(locationIntervalRef.current);
    };
  }, [id, currentUser, navigate]);

  if (loading) return <div className="p-10 text-center font-bold">Loading route details...</div>;
  if (!pickup) return <div className="p-10 text-center font-bold">Pickup not found or already completed.</div>;

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${pickup.lat},${pickup.lng}&travelmode=driving`;

  return (
    <div className="min-h-screen bg-ocean-50 font-sans text-ocean-950 antialiased">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_10%_0%,rgba(145,216,255,.35),transparent_34%),linear-gradient(180deg,#f5fbff_0%,#ffffff_44%,#f7fcff_100%)]" />
      
      <Header />

      <main className="mx-auto w-[min(800px,calc(100%_-_32px))] py-8">
        <button 
          onClick={() => navigate('/volunteers')}
          className="mb-6 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-ocean-600 hover:text-ocean-800 transition"
        >
          ← Back to Feed
        </button>

        <section className="animate-float-in overflow-hidden rounded-2xl border border-ocean-100 bg-white shadow-soft">
          <div className="p-6 border-b border-ocean-50 bg-mint-50 flex justify-between items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-mint-700">En Route</p>
              <h1 className="text-2xl font-black text-ocean-950">To {pickup.restaurant_name}</h1>
            </div>
            <div className="rounded-full bg-white px-4 py-1 shadow-sm flex items-center gap-2">
              <span className="h-2 w-2 bg-mint-500 rounded-full animate-pulse"></span>
              <span className="text-xs font-black text-mint-700 uppercase tracking-widest">Broadcasting Location</span>
            </div>
          </div>

          <div className="p-8">
            <div className="grid gap-8">
              <div className="flex items-start gap-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ocean-100 text-ocean-600">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">Pickup Location</p>
                  <p className="mt-1 text-xl font-bold text-ocean-950">{pickup.location}</p>
                  <a 
                    href={directionsUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 rounded-lg bg-ocean-950 px-4 py-2 text-sm font-black text-white hover:opacity-90 transition shadow-lg"
                  >
                    Open in Google Maps →
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-mint-100 text-mint-700">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">Restaurant Contact</p>
                  <p className="mt-1 text-xl font-bold text-ocean-950">+91 98765 43210</p>
                  <p className="mt-1 text-sm text-slate-500 font-bold">Call to confirm your arrival</p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-ocean-950 p-8 text-center text-white shadow-2xl relative overflow-hidden">
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10 blur-2xl"></div>
                <div className="absolute -left-4 -bottom-4 h-24 w-24 rounded-full bg-mint-500/20 blur-2xl"></div>
                
                {!isVerified ? (
                  <>
                    <p className="relative z-10 text-xs font-black uppercase tracking-[.2em] text-mint-400">Collection OTP</p>
                    <div className="relative z-10 mt-4 flex justify-center gap-4">
                      {pickup.otp ? pickup.otp.split('').map((char, i) => (
                        <span key={i} className="flex h-16 w-12 items-center justify-center rounded-xl bg-white/10 text-4xl font-black shadow-inner">
                          {char}
                        </span>
                      )) : '----'}
                    </div>
                    <p className="relative z-10 mt-6 text-sm font-bold text-ocean-200">
                      Share this 4-digit code with the restaurant staff to collect the <span className="text-white">{pickup.food_type}</span>.
                    </p>
                  </>
                ) : (
                  <div className="relative z-10 animate-rise">
                    <div className="mx-auto h-20 w-20 bg-mint-500 rounded-full flex items-center justify-center text-white text-3xl mb-4 shadow-lg shadow-mint-500/20">
                      📸
                    </div>
                    <h3 className="text-2xl font-black mb-2">Handover Verified!</h3>
                    <p className="text-sm text-ocean-200 font-bold mb-6">Take a photo of where you've delivered the food to complete the mission.</p>
                    
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      accept="image/*" 
                      className="hidden" 
                    />

                    <div 
                      onClick={() => fileInputRef.current.click()}
                      className="bg-white/10 border-2 border-dashed border-white/20 rounded-2xl overflow-hidden mb-6 cursor-pointer hover:bg-white/20 transition group min-h-[160px] flex items-center justify-center"
                    >
                       {photo ? (
                         <img src={photo} alt="Preview" className="h-full w-full object-cover" />
                       ) : (
                         <div className="text-center p-8">
                           <p className="text-xs font-black uppercase tracking-widest group-hover:scale-110 transition">Upload Proof Photo</p>
                           <p className="text-[10px] opacity-40 mt-1">Accepts JPG, PNG, WEBP</p>
                         </div>
                       )}
                    </div>

                    <button 
                      onClick={handlePhotoUpload}
                      disabled={isUploading || !photo}
                      className="w-full bg-mint-500 text-white py-4 rounded-xl font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:bg-mint-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUploading ? 'Saving Mission...' : 'Complete Mission'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-ocean-50 p-6 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-xs font-bold text-slate-600 leading-tight">
              Safety First: Keep your location on so the restaurant can track your approach.
            </p>
          </div>
        </section>
      </main>

      <Toast message={toast.message} show={toast.show} />
    </div>
  );
};

export default Delivery;
