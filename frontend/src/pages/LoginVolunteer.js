import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import Header from '../components/Header';
import Toast from '../components/Toast';

const LoginVolunteer = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
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
    setLoading(true);

    try {
      // Direct call to authAPI.login which uses axios.post('/api/login')
      const user = await authAPI.login({
        email: formData.email,
        password: formData.password
      });

      // 1. Store in localStorage
      localStorage.setItem('user', JSON.stringify(user));

      // 2. Update AuthContext state
      login(user);

      setToast({ show: true, message: 'Login successful! Redirecting...' });
      
      // 3. Redirect based on user_type
      setTimeout(() => {
        if (user.user_type === 'volunteer') {
          navigate('/volunteers');
        } else {
          navigate('/restaurants');
        }
      }, 1000);

    } catch (error) {
      console.error(error.response?.data || error.message);
      setToast({ show: true, message: `Login failed: ${error.response?.data?.error || error.message}` });
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
          <div className="mb-4 grid h-14 w-14 place-items-center rounded-lg bg-gradient-to-br from-mint-500 to-ocean-600 text-xl font-black text-white shadow-lg shadow-mint-500/20">
            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <p className="mb-3 text-xs font-black uppercase tracking-[.14em] text-mint-700">Volunteer access</p>
          <h1 className="text-4xl font-black leading-tight text-ocean-950 max-sm:text-3xl">
            Welcome back, volunteer.
          </h1>
          <p className="mt-3 leading-7 text-slate-600">
            Sign in to access your pickup dashboard, track reward points, and discover nearby restaurants with available food.
          </p>
          <div className="mt-6 grid gap-3">
            <div className="rounded-lg bg-mint-100 p-4 text-sm font-bold leading-6 text-slate-600">
              <strong className="text-mint-700">Earn rewards</strong> for every delivery you complete. Track distance, meals, and bonus points.
            </div>
            <div className="rounded-lg bg-ocean-100 p-4 text-sm font-bold leading-6 text-slate-600">
              New here? <Link className="font-black text-ocean-800" to="/register-volunteer">Create a volunteer account</Link>.
            </div>
          </div>
        </section>

        <section className="animate-float-in rounded-lg border border-ocean-100 bg-white/90 p-6 shadow-soft">
          <h2 className="text-2xl font-black text-ocean-950">Volunteer Login</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Enter your credentials to access your volunteer dashboard.</p>
          
          <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
            <label className="grid gap-2 text-sm font-black text-ocean-950">
              Email
              <input 
                className="field" 
                name="email" 
                type="email" 
                placeholder="aarav@example.com" 
                value={formData.email}
                onChange={handleChange}
                required 
              />
            </label>
            <label className="grid gap-2 text-sm font-black text-ocean-950">
              Password
              <input 
                className="field" 
                name="password" 
                type="password" 
                placeholder="Enter password" 
                value={formData.password}
                onChange={handleChange}
                required 
              />
            </label>
            <button className="submit-button" type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login as Volunteer'}
            </button>
          </form>
          
          <div className="mt-5 rounded-lg border border-ocean-100 p-4 text-center text-sm font-bold text-slate-500">
            Are you a restaurant? <Link className="font-black text-ocean-800" to="/login-restaurant">Login here instead</Link>
          </div>
        </section>
      </main>

      <Toast message={toast.message} show={toast.show} />
    </div>
  );
};

export default LoginVolunteer;
