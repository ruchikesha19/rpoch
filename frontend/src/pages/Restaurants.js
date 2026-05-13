import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Header from '../components/Header';
import Toast from '../components/Toast';
import { io } from 'socket.io-client';

const Restaurants = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [pickups, setPickups] = useState([]);
  const [activeMenu, setActiveMenu] = useState(null);
  const [stats, setStats] = useState({
    total_listings: 0,
    active_listings: 0,
    total_meals: 0,
    performanceAverage: 85,
    performanceTrend: '+4%'
  });
  const [formData, setFormData] = useState({
    food: '',
    servings: '',
    pickup: '',
    location: currentUser?.location || '',
    lat: currentUser?.lat || 12.9716,
    lng: currentUser?.lng || 77.5946,
    distanceKm: '5',
    durationHours: '1'
  });
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });
  const socketRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  // Sync location if currentUser changes (e.g. after login/register)
  useEffect(() => {
    if (currentUser?.location) {
      setFormData(prev => ({ 
        ...prev, 
        location: currentUser.location,
        lat: currentUser.lat || 12.9716,
        lng: currentUser.lng || 77.5946
      }));
    }
  }, [currentUser]);

  const fetchRestaurantData = async () => {
    if (!currentUser) return;
    try {
      const response = await api.get(`/restaurants/${currentUser.user_id}/pickups`);
      setPickups(response.data.pickups);
      setStats({
        ...stats,
        total_listings: response.data.total_listings,
        active_listings: response.data.active_listings,
        total_meals: response.data.total_meals
      });
    } catch (error) {
      console.error('Error fetching restaurant data:', error);
    }
  };

  useEffect(() => {
    fetchRestaurantData();

    if (currentUser) {
      socketRef.current = io('http://localhost:5000', {
        query: { role: currentUser.user_type }
      });

      socketRef.current.on('pickup_accepted', (acceptedPickup) => {
        setPickups((prev) => 
          prev.map(p => p._id === acceptedPickup._id ? { ...p, status: 'accepted' } : p)
        );
        if (acceptedPickup.restaurant_id === currentUser.user_id) {
          setToast({ show: true, message: `Your listing "${acceptedPickup.food_type}" was just accepted!` });
          setTimeout(() => setToast({ show: false, message: '' }), 3000);
          fetchRestaurantData();
        }
      });

      socketRef.current.on('pickup_completed', (updatedPickup) => {
        setPickups((prev) =>
          prev.map(p => p._id === updatedPickup._id ? updatedPickup : p)
        );
        fetchRestaurantData();
      });

      socketRef.current.on('pickup_deleted', (deletedId) => {
        setPickups((prev) => prev.filter(p => p._id !== deletedId));
        fetchRestaurantData();
      });
    }

    const handleClickOutside = () => setActiveMenu(null);
    const handleScroll = () => setActiveMenu(null);

    document.addEventListener('click', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true); // Use capture to detect inner scroll

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
      document.removeEventListener('click', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [currentUser]);

  const handleToggleMenu = (e, id) => {
    e.stopPropagation();
    setActiveMenu(prev => (prev === id ? null : id));
  };

  const handleComplete = async (id) => {
    setActiveMenu(null); // Close dropdown immediately
    try {
      const response = await api.put(`/pickups/${id}/complete`);
      const updated = response.data;
      setPickups(prev =>
        prev.map(p => p._id === id ? updated : p)
      );
      setToast({ show: true, message: 'Pickup marked as completed!' });
      setTimeout(() => setToast({ show: false, message: '' }), 2000);
      fetchRestaurantData();
    } catch (err) {
      console.error('Error completing pickup:', err);
      setToast({ show: true, message: 'Failed to complete pickup.' });
      setTimeout(() => setToast({ show: false, message: '' }), 2000);
    }
  };

  const handleDelete = async (id) => {
    setActiveMenu(null); // Close dropdown immediately
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await api.delete(`/pickups/${id}`);
      setPickups(prev => prev.filter(p => p._id !== id));
      setToast({ show: true, message: 'Listing deleted.' });
      setTimeout(() => setToast({ show: false, message: '' }), 2000);
      fetchRestaurantData();
    } catch (err) {
      console.error('Error deleting pickup:', err);
      setToast({ show: true, message: 'Failed to delete listing.' });
      setTimeout(() => setToast({ show: false, message: '' }), 2000);
    }
  };

  // Calculate Impact Stats
  const completed = pickups.filter(p => p.status === 'completed');
  const totalMeals = completed.reduce((sum, p) => sum + (parseInt(p.quantity) || 0), 0);
  const co2Saved = (totalMeals * 0.19);
  const waterSaved = (totalMeals * 2.5);
  const impactPoints = completed.length * 50;
  const treesEquivalent = (co2Saved / 20).toFixed(1); // 1 tree offsets ~20kg CO2/year
  const communityRank = completed.length > 5 ? '#12' : '#84'; // Mock rank logic

  // Calculate Tier dynamically
  const getTierInfo = () => {
    if (completed.length >= 15) return { id: 'diamond', name: 'Diamond Partner', color: 'text-blue-400' };
    if (completed.length >= 5) return { id: 'gold', name: 'Gold Partner', color: 'text-amber-400' };
    return { id: 'silver', name: 'Silver Partner', color: 'text-slate-400' };
  };
  const currentTier = getTierInfo();

  // Impact Bar Values (Normalized for 100% chart height)
  const chartData = [
    { label: 'CO2 SAVED', value: Math.min(co2Saved, 100), display: `${co2Saved.toFixed(1)}kg`, icon: '🍃' },
    { label: 'MEALS SHARED', value: Math.min(totalMeals, 100), display: totalMeals, icon: '🍱' },
    { label: 'WATER SAVED', value: Math.min(waterSaved / 10, 100), display: `${Math.floor(waterSaved)}L`, icon: '💧' },
    { label: 'IMPACT PTS', value: Math.min(impactPoints / 5, 100), display: impactPoints, icon: '⭐' }
  ];

  const handleView = (pickup) => {
    setActiveMenu(null);
    navigate(`/invoice/${pickup._id}`);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmitListing = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/pickups', {
        restaurant_id: currentUser.user_id,
        restaurant_name: currentUser.name,
        food_type: formData.food,
        quantity: `${formData.servings} servings`,
        distance_km: parseFloat(formData.distanceKm),
        location: formData.location,
        lat: formData.lat,
        lng: formData.lng
      });

      setToast({ show: true, message: 'Listing created successfully!' });
      setFormData({
        food: '',
        servings: '',
        pickup: '',
        location: currentUser?.location || '',
        lat: currentUser?.lat || 12.9716,
        lng: currentUser?.lng || 77.5946,
        distanceKm: '5',
        durationHours: '1'
      });
      fetchRestaurantData();
      
      setTimeout(() => setToast({ show: false, message: '' }), 2200);
    } catch (error) {
      console.error('Error creating listing:', error);
      setToast({ show: true, message: 'Failed to create listing.' });
      setTimeout(() => setToast({ show: false, message: '' }), 2200);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-ocean-100 text-ocean-800';
      case 'accepted': return 'bg-mint-100 text-mint-700';
      case 'completed': return 'bg-green-100 text-green-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  // Leaflet Map Initialization
  useEffect(() => {
    if (showMap && !mapRef.current) {
      setTimeout(() => {
        const L = window.L;
        if (!L) return;

        const map = L.map('map-picker').setView([formData.lat, formData.lng], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        const marker = L.marker([formData.lat, formData.lng], {
          draggable: true
        }).addTo(map);

        const updateLocation = async (lat, lng) => {
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await res.json();
            const address = data.display_name.split(',').slice(0, 3).join(',');
            setFormData(prev => ({ ...prev, lat, lng, location: address || `Pin at ${lat.toFixed(4)}, ${lng.toFixed(4)}` }));
          } catch (err) {
            setFormData(prev => ({ ...prev, lat, lng, location: `Pin at ${lat.toFixed(4)}, ${lng.toFixed(4)}` }));
          }
        };

        marker.on('dragend', (e) => {
          const { lat, lng } = e.target.getLatLng();
          updateLocation(lat, lng);
        });

        map.on('click', (e) => {
          const { lat, lng } = e.latlng;
          marker.setLatLng([lat, lng]);
          updateLocation(lat, lng);
        });

        mapRef.current = map;
        markerRef.current = marker;
      }, 100);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [showMap]);

  return (
    <div className="bg-ocean-50 font-sans text-ocean-950 antialiased">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_10%_0%,rgba(145,216,255,.35),transparent_34%),linear-gradient(180deg,#f5fbff_0%,#ffffff_44%,#f7fcff_100%)]" />
      
      <Header />

      <main className="mx-auto w-[min(1180px,calc(100%_-_32px))] py-8">
        <section className="grid grid-cols-[.78fr_1.22fr] gap-6 max-lg:grid-cols-1">
          <aside className="animate-rise rounded-lg border border-ocean-100 bg-white/90 p-6 shadow-soft">
            <p className="mb-3 text-xs font-black uppercase tracking-[.14em] text-mint-700">Restaurant portal</p>
            <h1 className="text-4xl font-black leading-tight text-ocean-950 max-sm:text-3xl">
              Welcome back, <span className="text-ocean-600">{currentUser?.name || 'Restaurant'}</span>!
            </h1>
            <p className="text-lg font-semibold text-ocean-600 mb-3">List surplus food and track every match.</p>
            <p className="mt-3 leading-7 text-slate-600">
              Manage surplus food, route distance, match status, and performance trends from one focused dashboard.
            </p>
            
            <div className="mt-6 grid grid-cols-2 gap-3">
              <article className="rounded-lg bg-ocean-100 p-4">
                <span className="text-sm font-black text-slate-500">Active listings</span>
                <strong className="mt-2 block text-3xl font-black text-ocean-950">{stats.active_listings}</strong>
              </article>
              <article className="rounded-lg bg-mint-100 p-4">
                <span className="text-sm font-black text-slate-500">Meals donated</span>
                <strong className="mt-2 block text-3xl font-black text-ocean-950">{stats.total_meals}</strong>
              </article>
              <article className="rounded-lg bg-white p-4 border border-ocean-50">
                <span className="text-sm font-black text-slate-500">Avg score</span>
                <strong className="mt-2 block text-3xl font-black text-ocean-950">{stats.performanceAverage}</strong>
              </article>
              <article className="rounded-lg bg-white p-4 border border-ocean-50">
                <span className="text-sm font-black text-slate-500">Trend</span>
                <strong className="mt-2 block text-3xl font-black text-ocean-950">{stats.performanceTrend}</strong>
              </article>
            </div>
          </aside>

          <section className="animate-float-in rounded-lg border border-ocean-100 bg-white/90 p-6 shadow-soft overflow-visible">
            <div className="flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-start">
              <div>
                <p className="mb-3 text-xs font-black uppercase tracking-[.14em] text-mint-700">Food management</p>
                <h2 className="text-3xl font-black text-ocean-950">Quick add leftover food</h2>
                <span className="rounded-full bg-mint-100 px-3 py-1 text-xs font-black text-mint-700">Live matching</span>
              </div>
              <button 
                onClick={() => navigate('/restaurant-history')}
                className="outline-button whitespace-nowrap"
              >
                View Archive
              </button>
            </div>

            <div className="mt-8 rounded-[32px] bg-white border-2 border-ocean-200 p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-1 bg-mint-500 rounded-full"></div>
                  <div>
                    <h3 className="text-2xl font-black text-ocean-950">New Surplus Listing</h3>
                    <p className="text-xs font-bold text-slate-500">Fill in the details to notify nearby volunteers.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-mint-50 rounded-full border border-mint-100">
                  <span className="h-2 w-2 bg-mint-500 rounded-full animate-ping"></span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-mint-700">Live Dispatch</span>
                </div>
              </div>
              
              <form className="grid grid-cols-2 gap-8 max-sm:grid-cols-1" onSubmit={handleSubmitListing}>
                <div className="space-y-6">
                  <label className="group block">
                    <span className="block text-[11px] font-black uppercase tracking-[0.2em] text-ocean-900 group-focus-within:text-mint-600 transition-colors mb-3">1. Food item & Details</span>
                    <input 
                      className="w-full bg-ocean-50/30 border-2 border-ocean-100 rounded-2xl p-5 text-base font-bold text-ocean-950 placeholder:text-slate-400 focus:bg-white focus:border-mint-500 focus:ring-4 focus:ring-mint-500/10 transition-all outline-none" 
                      name="food" 
                      type="text" 
                      placeholder="e.g., Vegetable Biryani (Extra Large Tray)" 
                      value={formData.food} 
                      onChange={handleChange} 
                      required 
                    />
                  </label>

                  <div className="grid grid-cols-2 gap-6">
                    <label className="group block">
                      <span className="block text-[11px] font-black uppercase tracking-[0.2em] text-ocean-900 group-focus-within:text-mint-600 transition-colors mb-3">2. Servings</span>
                      <input 
                        className="w-full bg-ocean-50/30 border-2 border-ocean-100 rounded-2xl p-5 text-base font-bold text-ocean-950 placeholder:text-slate-400 focus:bg-white focus:border-mint-500 focus:ring-4 focus:ring-mint-500/10 transition-all outline-none" 
                        name="servings" 
                        type="number" 
                        placeholder="40" 
                        min="1" 
                        value={formData.servings} 
                        onChange={handleChange} 
                        required 
                      />
                    </label>
                    <label className="group block">
                      <span className="block text-[11px] font-black uppercase tracking-[0.2em] text-ocean-900 group-focus-within:text-mint-600 transition-colors mb-3">3. Available For</span>
                      <div className="relative">
                        <input 
                          className="w-full bg-ocean-50/30 border-2 border-ocean-100 rounded-2xl p-5 text-base font-bold text-ocean-950 placeholder:text-slate-400 focus:bg-white focus:border-mint-500 focus:ring-4 focus:ring-mint-500/10 transition-all outline-none pr-16" 
                          name="durationHours" 
                          type="number" 
                          placeholder="1" 
                          min="0.1" 
                          step="0.1" 
                          value={formData.durationHours} 
                          onChange={handleChange} 
                          required 
                        />
                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-black text-ocean-400">HRS</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="space-y-6">
                  <label className="group block">
                    <span className="block text-[11px] font-black uppercase tracking-[0.2em] text-ocean-900 group-focus-within:text-mint-600 transition-colors mb-3">4. Pickup Location</span>
                    <div className="relative">
                      <input 
                        className="w-full bg-ocean-50/30 border-2 border-ocean-100 rounded-2xl p-5 text-base font-bold text-ocean-950 placeholder:text-slate-400 focus:bg-white focus:border-mint-500 focus:ring-4 focus:ring-mint-500/10 transition-all outline-none pr-16" 
                        name="location" 
                        type="text" 
                        placeholder="Enter or select from map" 
                        value={formData.location} 
                        onChange={handleChange} 
                        required 
                      />
                      <button 
                        type="button"
                        onClick={() => setShowMap(true)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 h-12 w-12 bg-white border-2 border-ocean-100 rounded-xl flex items-center justify-center text-ocean-900 hover:border-mint-500 hover:text-mint-600 hover:shadow-lg transition-all group/pin"
                        title="Pick on Map"
                      >
                        <svg className="w-6 h-6 transition-transform group-hover/pin:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                      </button>
                    </div>
                  </label>

                  <label className="group block">
                    <span className="block text-[11px] font-black uppercase tracking-[0.2em] text-ocean-900 group-focus-within:text-mint-600 transition-colors mb-3">5. Pickup window starts at</span>
                    <input 
                      className="w-full bg-ocean-50/30 border-2 border-ocean-100 rounded-2xl p-5 text-base font-bold text-ocean-950 focus:bg-white focus:border-mint-500 focus:ring-4 focus:ring-mint-500/10 transition-all outline-none" 
                      name="pickup" 
                      type="time" 
                      value={formData.pickup} 
                      onChange={handleChange} 
                      required 
                    />
                  </label>

                  <button className="w-full h-[68px] bg-ocean-950 text-white rounded-2xl font-black text-sm uppercase tracking-[0.3em] shadow-2xl shadow-ocean-950/30 hover:bg-black hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-4 disabled:opacity-50" type="submit" disabled={loading}>
                    {loading ? (
                      <span className="animate-pulse">Dispatching...</span>
                    ) : (
                      <>
                        <span>Publish & Notify</span>
                        <div className="h-6 w-6 bg-white/20 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                        </div>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            <div className="mt-5 grid gap-3">
              {pickups.filter(l => l.status !== 'completed').length > 0 ? (
                pickups.filter(l => l.status !== 'completed').map((pickup) => (
                  <article key={pickup._id} className={`lift-card flex items-center justify-between gap-4 rounded-lg border border-ocean-100 bg-white p-5 max-sm:flex-col max-sm:items-start animate-fade-in relative overflow-visible ${activeMenu === pickup._id ? 'z-[110]' : 'z-10'}`}>
                    <div>
                      <span className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider ${getStatusColor(pickup.status)}`}>
                        {pickup.status}
                      </span>
                      <h3 className="mt-3 text-lg font-black text-ocean-950">{pickup.quantity} {pickup.food_type}</h3>
                      <p className="mt-1 text-slate-600">Created {new Date(pickup.created_at).toLocaleTimeString()} - {pickup.location}</p>
                    </div>
                    
                    <div className="relative">
                      <button
                        onClick={(e) => handleToggleMenu(e, pickup._id)}
                        className="outline-button flex items-center gap-2"
                      >
                        Manage <span className="text-[10px]">▼</span>
                      </button>

                      {activeMenu === pickup._id && (
                        <div 
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-0 top-full z-[100] mt-2 w-48 origin-top-right rounded-xl border border-ocean-100 bg-white p-2 shadow-2xl animate-dropdown translate-x-1"
                        >
                          <p className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Status: {pickup.status}</p>
                          
                          <button
                            onClick={() => handleView(pickup)}
                            className="flex w-full items-center rounded-md px-3 py-2 text-sm font-bold text-ocean-900 hover:bg-ocean-50"
                          >
                            View details
                          </button>

                          {pickup.status === 'accepted' && (
                            <button
                              onClick={() => navigate(`/tracker/${pickup._id}`)}
                              className="flex w-full items-center rounded-md px-3 py-2 text-sm font-bold text-ocean-600 hover:bg-ocean-50"
                            >
                              Track Volunteer
                            </button>
                          )}

                          {pickup.status === 'accepted' && (
                            <button
                              onClick={() => handleComplete(pickup._id)}
                              className="flex w-full items-center rounded-md px-3 py-2 text-sm font-bold text-mint-700 hover:bg-mint-50"
                            >
                              Mark completed
                            </button>
                          )}

                          {pickup.status === 'available' && (
                            <button
                              onClick={() => handleDelete(pickup._id)}
                              className="flex w-full items-center rounded-md px-3 py-2 text-sm font-bold text-coral hover:bg-orange-50"
                            >
                              Delete listing
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </article>
                ))
              ) : (
                <p className="text-center py-10 font-bold text-slate-500 italic">No listings yet. Add some leftovers above!</p>
              )}
            </div>
          </section>
        </section>

        <section className="mt-6 grid grid-cols-[1.1fr_.9fr] gap-6 max-lg:grid-cols-1">
          <article className="animate-rise rounded-lg border border-ocean-100 bg-white/90 p-10 text-center shadow-soft">
            <p className="mb-3 text-xs font-black uppercase tracking-[.14em] text-mint-700">Sustainability Metrics</p>
            <h2 className="text-4xl font-black leading-tight text-ocean-950 max-sm:text-3xl">Real-time Impact Overview</h2>
            <p className="mt-3 leading-7 text-slate-600">
              Your contribution to the global food redistribution network is measured across these key environmental and social pillars.
            </p>

            <div className="bar-chart mt-10">
              {chartData.map((data, index) => (
                <span key={index} style={{ '--value': `${data.value}%` }}>
                  <b>{data.display}</b>
                  <em>{data.label}</em>
                </span>
              ))}
            </div>
          </article>

           <article className="animate-float-in rounded-3xl border border-ocean-100 bg-white p-8 shadow-soft">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-mint-700">Live Statistics</p>
                <h3 className="text-2xl font-black text-ocean-950">Sustainability Portfolio</h3>
              </div>
              <div className="h-12 w-12 bg-mint-100 rounded-2xl flex items-center justify-center text-xl shadow-inner">🏆</div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-ocean-50/50 p-6 rounded-3xl border border-ocean-100 text-center group hover:bg-ocean-900 hover:text-white transition-all duration-300">
                <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">Trees Saved</p>
                <p className="text-3xl font-black">{treesEquivalent}</p>
                <p className="text-[10px] font-bold mt-1 opacity-40">Annual Offset Equiv.</p>
              </div>
              <div className="bg-mint-50/50 p-6 rounded-3xl border border-mint-100 text-center group hover:bg-mint-600 hover:text-white transition-all duration-300">
                <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">Global Rank</p>
                <p className="text-3xl font-black">{communityRank}</p>
                <p className="text-[10px] font-bold mt-1 opacity-40">Top 5% in Local Area</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-ocean-950 to-slate-900 p-8 rounded-[40px] text-white relative overflow-hidden group shadow-2xl">
              <div className="absolute -right-4 -top-4 h-24 w-24 bg-white/10 rounded-full blur-2xl group-hover:bg-mint-500/20 transition-colors"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-mint-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Active Status</span>
                  <span className={`${currentTier.color} font-black`}>{currentTier.name}</span>
                </div>
                <h4 className="text-xl font-black mb-2">Sustainability Badge Unlocked</h4>
                <p className="text-xs text-ocean-200 font-medium leading-relaxed">
                  You've maintained a 98% match rate this month. Your restaurant is now featured in the "Top Donors" section of the Community Hub.
                </p>
                <button 
                  onClick={() => {
                    navigate(`/achievement/${currentTier.id}`, { 
                      state: { 
                        stats: { co2Saved, totalMeals, impactPoints },
                        restaurantName: currentUser.name 
                      } 
                    });
                  }}
                  className="mt-6 w-full py-3 bg-white text-ocean-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-mint-400 transition-colors"
                >
                  Share Achievement
                </button>
              </div>
            </div>

            <div className="mt-8 border-t border-slate-100 pt-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Recent Milestone</p>
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-ocean-50 rounded-full flex items-center justify-center text-lg">🌱</div>
                <div>
                  <p className="text-sm font-black text-ocean-950">Milestone Reached!</p>
                  <p className="text-xs text-slate-500 font-medium">You've saved your first 15kg of CO2.</p>
                </div>
              </div>
            </div>
          </article>
        </section>
      </main>

      <Toast message={toast.message} show={toast.show} />

      {/* Map Picker Modal */}
      {showMap && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ocean-950/40 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl overflow-hidden rounded-[32px] bg-white shadow-2xl animate-rise">
            <div className="flex items-center justify-between border-b border-ocean-50 p-6">
              <h3 className="text-xl font-black text-ocean-950">Update Pickup Point</h3>
              <button onClick={() => setShowMap(false)} className="h-8 w-8 rounded-full bg-ocean-50 text-ocean-400 hover:bg-ocean-100 transition">✕</button>
            </div>
            <div className="relative h-[400px] bg-ocean-100">
               <div id="map-picker" className="h-full w-full z-10" />
               <div className="absolute top-4 right-4 z-[20] bg-white/90 p-2 rounded-lg shadow-md border border-ocean-100">
                  <p className="text-[10px] font-black uppercase text-ocean-950">Drag pin to update spot</p>
               </div>
            </div>
            <div className="p-6">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Search or Enter Location</p>
              <div className="relative mb-8">
                <input 
                  className="w-full bg-ocean-50 border-2 border-ocean-100 rounded-xl p-4 text-sm font-bold text-ocean-950 focus:border-mint-500 focus:outline-none pr-12"
                  type="text"
                  placeholder="e.g. REVA University, Bengaluru"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
                <button 
                  className="absolute right-3 top-3 h-10 w-10 bg-white border border-ocean-100 rounded-lg flex items-center justify-center text-mint-600 hover:shadow-md transition-all"
                  onClick={() => {
                    setToast({ show: true, message: 'Searching location...' });
                    setTimeout(() => setToast({ show: false, message: '' }), 1500);
                  }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                </button>
              </div>

              <div className="flex justify-center mb-8">
                <button 
                  onClick={() => {
                    if (navigator.geolocation) {
                      setToast({ show: true, message: '🛰️ Pinging satellite...' });
                      navigator.geolocation.getCurrentPosition((position) => {
                        setFormData({
                          ...formData,
                          lat: position.coords.latitude,
                          lng: position.coords.longitude,
                          location: 'My Current Location'
                        });
                        setToast({ show: true, message: '📍 Location pinned!' });
                        setTimeout(() => setToast({ show: false, message: '' }), 2000);
                      });
                    }
                  }}
                  className="flex items-center gap-2 rounded-xl bg-mint-50 px-8 py-3 text-xs font-black uppercase tracking-widest text-mint-700 hover:bg-mint-100 transition shadow-sm border border-mint-200"
                >
                  <span className="text-lg">📍</span> Pin My Current Location
                </button>
              </div>

              <button 
                onClick={() => setShowMap(false)}
                className="w-full bg-ocean-950 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.3em] shadow-xl hover:bg-black transition-all hover:-translate-y-1 active:translate-y-0"
              >
                Confirm Pickup Point
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Restaurants;
