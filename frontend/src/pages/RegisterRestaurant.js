import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import Header from '../components/Header';
import Toast from '../components/Toast';

const RegisterRestaurant = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    location: '',
    lat: 12.9716,
    lng: 77.5946,
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setToast({ show: true, message: 'Passwords do not match' });
      return;
    }

    setLoading(true);

    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        location: formData.location,
        lat: formData.lat,
        lng: formData.lng,
        password: formData.password,
        user_type: 'restaurant'
      };

      const user = await authAPI.register(userData);
      
      // 1. Store in localStorage (as requested)
      localStorage.setItem('user', JSON.stringify(user));

      // 2. Update AuthContext
      login(user);

      setToast({ show: true, message: 'Registration successful! Redirecting...' });
      
      // 3. Redirect based on user_type
      setTimeout(() => {
        if (user.user_type === 'restaurant') {
          navigate('/restaurants');
        } else {
          navigate('/volunteers');
        }
      }, 1000);

    } catch (error) {
      setToast({ show: true, message: `Registration failed: ${error.response?.data?.error || error.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-ocean-50 font-sans text-ocean-950 antialiased">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_10%_0%,rgba(145,216,255,.35),transparent_34%),linear-gradient(180deg,#f5fbff_0%,#ffffff_44%,#f7fcff_100%)]" />
      
      <Header />

      <main className="mx-auto grid min-h-[calc(100vh_-_96px)] w-[min(980px,calc(100%_-_32px))] grid-cols-[.9fr_1.1fr] items-start gap-6 py-8 max-lg:grid-cols-1">
        <section className="animate-rise rounded-lg border border-ocean-100 bg-white/90 p-6 shadow-soft">
          <div className="mb-4 grid h-14 w-14 place-items-center rounded-lg bg-gradient-to-br from-coral to-honey text-xl font-black text-white shadow-lg shadow-coral/20">
            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <p className="mb-3 text-xs font-black uppercase tracking-[.14em] text-coral">Restaurant signup</p>
          <h1 className="text-4xl font-black leading-tight text-ocean-950 max-sm:text-3xl">
            Partner with us.
          </h1>
          <p className="mt-3 leading-7 text-slate-600">
            Register your restaurant to list surplus food, reduce waste, and help feed the community through our volunteer network.
          </p>
          <div className="mt-6 grid gap-3">
            <div className="rounded-lg bg-orange-50 p-4 text-sm font-bold leading-6 text-slate-600">
              <strong className="text-coral">Reduce waste</strong> by connecting surplus food with volunteers who can distribute it.
            </div>
            <div className="rounded-lg bg-ocean-100 p-4 text-sm font-bold leading-6 text-slate-600">
              Already have an account? <Link className="font-black text-ocean-800" to="/login-restaurant">Login here</Link>.
            </div>
          </div>
        </section>

        <section className="animate-float-in rounded-lg border border-ocean-100 bg-white/90 p-6 shadow-soft">
          <h2 className="text-2xl font-black text-ocean-950">Create Restaurant Account</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Fill in your restaurant details to start listing surplus food.</p>
          
          <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
            <label className="grid gap-2 text-sm font-black text-ocean-950">
              Restaurant Name
              <input 
                className="field" 
                name="name" 
                type="text" 
                placeholder="Enter restaurant name" 
                value={formData.name}
                onChange={handleChange}
                required 
              />
            </label>
            <label className="grid gap-2 text-sm font-black text-ocean-950">
              Email
              <input 
                className="field" 
                name="email" 
                type="email" 
                placeholder="restaurant@example.com" 
                value={formData.email}
                onChange={handleChange}
                required 
              />
            </label>
            <label className="grid gap-2 text-sm font-black text-ocean-950">
              Restaurant Location
              <div className="flex gap-2">
                <input 
                  className="field flex-1" 
                  name="location" 
                  type="text" 
                  placeholder="Enter full address" 
                  value={formData.location}
                  onChange={handleChange}
                  required 
                />
                <button 
                  type="button"
                  onClick={() => setShowMap(true)}
                  className="bg-ocean-100 p-3 rounded-xl hover:bg-ocean-200 transition"
                  title="Pick on Map"
                >
                  📍
                </button>
              </div>
            </label>
            <label className="grid gap-2 text-sm font-black text-ocean-950">
              Password
              <input 
                className="field" 
                name="password" 
                type="password" 
                placeholder="Create a password (min 6 characters)" 
                value={formData.password}
                onChange={handleChange}
                minLength="6"
                required 
              />
            </label>
            <label className="grid gap-2 text-sm font-black text-ocean-950">
              Confirm Password
              <input 
                className="field" 
                name="confirmPassword" 
                type="password" 
                placeholder="Confirm your password" 
                value={formData.confirmPassword}
                onChange={handleChange}
                required 
              />
            </label>
            <button className="submit-button" type="submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Restaurant Account'}
            </button>
          </form>
          
          <div className="mt-5 rounded-lg border border-ocean-100 p-4 text-center text-sm font-bold text-slate-500">
            Are you a volunteer? <Link className="font-black text-ocean-800" to="/register-volunteer">Register here instead</Link>
          </div>
        </section>
      </main>

      <Toast message={toast.message} show={toast.show} />

      {/* Map Picker Modal */}
      {showMap && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ocean-950/40 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl overflow-hidden rounded-[32px] bg-white shadow-2xl animate-rise">
            <div className="flex items-center justify-between border-b border-ocean-50 p-6">
              <h3 className="text-xl font-black text-ocean-950">Select Location</h3>
              <button onClick={() => setShowMap(false)} className="h-8 w-8 rounded-full bg-ocean-50 text-ocean-400 hover:bg-ocean-100 transition">✕</button>
            </div>
            <div className="relative h-[400px] bg-ocean-100">
               {/* Mock Map View */}
               <iframe 
                src={`https://www.google.com/maps?q=${formData.lat},${formData.lng}&z=15&output=embed`}
                className="h-full w-full grayscale-[20%]"
                title="Map Picker"
               />
               <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="h-10 w-10 text-coral animate-bounce">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                  </div>
               </div>
            </div>
            <div className="p-6">
              <p className="text-xs font-bold text-slate-500 mb-4">Click below to simulate pinning your restaurant's exact coordinates.</p>
              <div className="grid grid-cols-2 gap-3">
                 <button 
                  onClick={() => {
                    setFormData({...formData, lat: 12.9716, lng: 77.5946, location: 'MG Road, Bangalore'});
                    setShowMap(false);
                  }}
                  className="rounded-xl border border-ocean-100 p-4 text-left hover:bg-ocean-50 transition group"
                 >
                   <p className="text-[10px] font-black uppercase text-slate-400 group-hover:text-ocean-600">Location A</p>
                   <p className="text-sm font-bold">MG Road, Central</p>
                 </button>
                 <button 
                  onClick={() => {
                    setFormData({...formData, lat: 12.9352, lng: 77.6245, location: 'Koramangala 5th Block'});
                    setShowMap(false);
                  }}
                  className="rounded-xl border border-ocean-100 p-4 text-left hover:bg-ocean-50 transition group"
                 >
                   <p className="text-[10px] font-black uppercase text-slate-400 group-hover:text-ocean-600">Location B</p>
                   <p className="text-sm font-bold">Koramangala Area</p>
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterRestaurant;
