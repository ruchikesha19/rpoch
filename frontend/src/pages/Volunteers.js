import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Header from '../components/Header';
import Toast from '../components/Toast';
import { io } from 'socket.io-client';

const Volunteers = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [pickups, setPickups] = useState([]);
  const [mapUrl, setMapUrl] = useState("https://www.google.com/maps?q=Bengaluru%20Karnataka&output=embed");
  const [volunteerData, setVolunteerData] = useState({
    total_pickups: 0,
    total_points: 0,
    pickups: []
  });
  const [toast, setToast] = useState({ show: false, message: '' });
  const socketRef = useRef(null);
  const locationIntervalRef = useRef(null);

  const fetchPickups = async () => {
    try {
      const response = await api.get('/pickups');
      setPickups(response.data);
    } catch (error) {
      console.error('Error fetching pickups:', error);
    }
  };

  const fetchVolunteerData = async () => {
    if (!currentUser) return;
    try {
      const response = await api.get(`/volunteer/${currentUser.user_id}`);
      setVolunteerData(response.data);
    } catch (error) {
      console.error('Error fetching volunteer data:', error);
    }
  };

  useEffect(() => {
    fetchPickups();
    fetchVolunteerData();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMapUrl(`https://www.google.com/maps?q=${latitude},${longitude}&output=embed`);
        }
      );
    }

    if (currentUser) {
      socketRef.current = io('http://localhost:5000', {
        query: { role: currentUser.user_type }
      });

      socketRef.current.on('new_pickup', (pickup) => {
        setPickups((prev) => [pickup, ...prev]);
        setToast({ show: true, message: `New pickup: ${pickup.restaurant_name} has ${pickup.food_type}!` });
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
      });

      socketRef.current.on('pickup_accepted', (acceptedPickup) => {
        setPickups((prev) => prev.filter(p => p._id !== acceptedPickup._id));
      });

      socketRef.current.on('pickup_completed', (updatedPickup) => {
        setPickups((prev) => prev.filter(p => p._id !== updatedPickup._id));
      });

      socketRef.current.on('pickup_deleted', (deletedId) => {
        setPickups((prev) => prev.filter(p => p._id !== deletedId));
      });

      // Start location tracking broadcast if there are accepted pickups
      locationIntervalRef.current = setInterval(() => {
        if (volunteerData.pickups.some(p => p.status === 'accepted')) {
          navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            volunteerData.pickups.filter(p => p.status === 'accepted').forEach(pickup => {
              socketRef.current.emit('volunteer_location', {
                pickup_id: pickup._id,
                restaurant_id: pickup.restaurant_id,
                volunteer_name: currentUser.name,
                lat: latitude,
                lng: longitude
              });
            });
          });
        }
      }, 5000);
    }

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
      if (locationIntervalRef.current) clearInterval(locationIntervalRef.current);
    };
  }, [currentUser, volunteerData.pickups]);

  const handleAcceptPickup = async (pickupId) => {
    try {
      const response = await api.post(`/pickups/${pickupId}/accept`, {
        volunteer_id: currentUser.user_id
      });
      const { points_earned } = response.data;
      setToast({ show: true, message: `+${points_earned} points earned! Redirecting to delivery details...` });
      
      setTimeout(() => {
        setToast({ show: false, message: '' });
        navigate(`/delivery/${pickupId}`);
      }, 1500);
    } catch (error) {
      console.error('Error accepting pickup:', error);
      setToast({ show: true, message: 'Failed to accept pickup.' });
      setTimeout(() => setToast({ show: false, message: '' }), 2200);
    }
  };

  return (
    <div className="bg-ocean-50 font-sans text-ocean-950 antialiased">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_10%_0%,rgba(145,216,255,.35),transparent_34%),linear-gradient(180deg,#f5fbff_0%,#ffffff_44%,#f7fcff_100%)]" />
      
      <Header />

      <main className="mx-auto w-[min(1180px,calc(100%_-_32px))] py-8">
        <section className="grid grid-cols-[.75fr_1.25fr] gap-6 max-lg:grid-cols-1">
          <aside className="animate-rise rounded-lg border border-ocean-100 bg-white/90 p-6 shadow-soft">
            <p className="mb-3 text-xs font-black uppercase tracking-[.14em] text-mint-700">Volunteer portal</p>
            <h1 className="text-4xl font-black leading-tight text-ocean-950 max-sm:text-3xl">
              Welcome back, <span className="text-ocean-600">{currentUser?.name || 'Volunteer'}</span>!
            </h1>
            <p className="text-lg font-semibold text-ocean-600 mb-3">Pickups that are clear before you move.</p>
            <p className="mt-3 leading-7 text-slate-600">
              See urgency, route distance, nearby restaurants, and activity rewards from one dashboard.
            </p>
            
            <div className="mt-6 grid grid-cols-2 gap-3">
              <article className="rounded-lg bg-ocean-100 p-4">
                <span className="text-sm font-black text-slate-500">Total Pickups</span>
                <strong className="mt-2 block text-3xl font-black text-ocean-950">{volunteerData.total_pickups}</strong>
              </article>
              <article className="rounded-lg bg-mint-100 p-4">
                <span className="text-sm font-black text-slate-500">Total Points</span>
                <strong className="mt-2 block text-3xl font-black text-ocean-950">{volunteerData.total_points}</strong>
              </article>
            </div>
            
            <div className="mt-6 overflow-hidden rounded-lg border border-ocean-100 bg-white">
              <iframe 
                className="h-64 w-full" 
                title="Volunteer pickup map" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade" 
                src={mapUrl}
              />
            </div>
          </aside>

          <section className="animate-float-in rounded-lg border border-ocean-100 bg-white/90 p-6 shadow-soft">
            <div className="flex items-start justify-between gap-4 max-sm:flex-col">
              <div>
                <p className="mb-3 text-xs font-black uppercase tracking-[.14em] text-mint-700">Live dispatch board</p>
                <h2 className="text-4xl font-black leading-tight text-ocean-950 max-sm:text-3xl">Available food nearby</h2>
                <p className="mt-2 text-sm font-bold text-slate-500">
                  <span>{pickups.length}</span> restaurants available
                </p>
              </div>
              <button className="outline-button" type="button" onClick={fetchPickups}>Refresh listings</button>
            </div>

            <div className="mt-6 grid gap-3 max-h-[500px] overflow-y-auto pr-1">
              {pickups.length > 0 ? (
                pickups.map((pickup) => (
                  <article key={pickup._id} className="lift-card flex items-center justify-between gap-4 rounded-lg border border-ocean-100 bg-white p-5 max-sm:flex-col max-sm:items-start animate-fade-in">
                    <div>
                      {pickup.distance_km >= 20 && (
                        <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-coral">Long Distance</span>
                      )}
                      <h3 className="mt-3 text-lg font-black text-ocean-950">{pickup.quantity} {pickup.food_type}, {pickup.restaurant_name}</h3>
                      <p className="mt-1 text-slate-600">{pickup.location} - {pickup.distance_km} km route</p>
                    </div>
                    <button 
                      className="outline-button" 
                      type="button"
                      onClick={() => handleAcceptPickup(pickup._id)}
                    >
                      Accept ({pickup.distance_km}km)
                    </button>
                  </article>
                ))
              ) : (
                <p className="mt-5 text-center font-bold text-slate-500 py-10">No available pickups at the moment.</p>
              )}
            </div>
          </section>
        </section>

        <section className="mt-6 grid grid-cols-[1.05fr_.95fr] gap-6 max-lg:grid-cols-1">
          <article className="rounded-lg border border-ocean-100 bg-white/90 p-6 shadow-soft">
            <div className="flex items-center justify-between gap-3 max-sm:flex-col max-sm:items-start">
              <div>
                <p className="mb-3 text-xs font-black uppercase tracking-[.14em] text-mint-700">Volunteer activity</p>
                <h2 className="text-3xl font-black text-ocean-950">Active Deliveries</h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                  You have accepted <strong>{volunteerData.total_pickups}</strong> total deliveries and earned <strong>{volunteerData.total_points}</strong> points.
                </p>
              </div>
              <button 
                onClick={() => navigate('/past-orders')}
                className="outline-button whitespace-nowrap"
              >
                View History
              </button>
            </div>
            
            <div className="mt-5 grid gap-3">
              {volunteerData.pickups.filter(p => p.status === 'accepted').length > 0 ? (
                volunteerData.pickups.filter(p => p.status === 'accepted').map((pickup) => (
                  <div 
                    key={pickup._id} 
                    onClick={() => navigate(`/delivery/${pickup._id}`)}
                    className="rounded-lg p-4 border border-ocean-100 transition-all duration-200 cursor-pointer hover:bg-ocean-100 hover:shadow-md hover:border-ocean-300 bg-white"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-black text-ocean-950">{pickup.restaurant_name}</p>
                        <p className="text-sm text-slate-600">{pickup.quantity} {pickup.food_type} - {pickup.location}</p>
                      </div>
                      <span className="text-xs font-black text-ocean-400 uppercase tracking-widest group-hover:text-ocean-600 transition">View Details →</span>
                    </div>
                    <span className="mt-2 inline-block rounded-full bg-mint-100 px-2 py-1 text-xs font-black text-mint-700 uppercase tracking-wider">
                      {pickup.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm font-bold text-slate-500 italic">No active deliveries. Accept a pickup from the board above!</p>
              )}
            </div>
          </article>

          <article className="rounded-lg border border-ocean-100 bg-white/90 p-6 shadow-soft">
            <p className="mb-3 text-xs font-black uppercase tracking-[.14em] text-mint-700">Automatic Reward System</p>
            <h2 className="text-3xl font-black text-ocean-950">Earn Points by Distance</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Points are now automatically calculated and added to your profile when you accept a delivery.
            </p>
            
            <div className="mt-6 grid gap-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-ocean-100">
                <span className="font-black text-ocean-950">0 - 5 km</span>
                <span className="rounded-full bg-white px-4 py-1 font-black text-ocean-600 shadow-sm">+10 pts</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-ocean-100">
                <span className="font-black text-ocean-950">5 - 10 km</span>
                <span className="rounded-full bg-white px-4 py-1 font-black text-ocean-600 shadow-sm">+25 pts</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-ocean-100">
                <span className="font-black text-ocean-950">10 - 20 km</span>
                <span className="rounded-full bg-white px-4 py-1 font-black text-ocean-600 shadow-sm">+50 pts</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-ocean-100 border-2 border-mint-500/30">
                <span className="font-black text-ocean-950 text-lg">20+ km</span>
                <span className="rounded-full bg-mint-500 px-4 py-1 font-black text-white shadow-lg shadow-mint-500/20">+100 pts</span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-ocean-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[.14em] text-slate-500">Your Current Balance</p>
                  <p className="text-4xl font-black text-ocean-950">{volunteerData.total_points} <span className="text-xl text-ocean-600">points</span></p>
                </div>
                <button 
                  onClick={() => navigate('/rewards')}
                  className="bg-ocean-950 text-white px-8 py-3 rounded-xl font-black text-sm shadow-lg hover:bg-mint-600 transition-colors"
                >
                  Claim Rewards
                </button>
                <div className="h-16 w-16 rounded-full bg-mint-100 flex items-center justify-center">
                  <svg className="h-8 w-8 text-mint-700" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              </div>
            </div>
          </article>
        </section>
      </main>

      <Toast message={toast.message} show={toast.show} />
    </div>
  );
};

export default Volunteers;
