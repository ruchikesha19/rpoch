import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import Header from '../components/Header';
import Toast from '../components/Toast';

const LoginRestaurant = () => {
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
        if (user.user_type === 'restaurant') {
          navigate('/restaurants');
        } else {
          navigate('/volunteers');
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
          <div className="mb-4 grid h-14 w-14 place-items-center rounded-lg bg-gradient-to-br from-coral to-honey text-xl font-black text-white shadow-lg shadow-coral/20">
            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <p className="mb-3 text-xs font-black uppercase tracking-[.14em] text-coral">Restaurant access</p>
          <h1 className="text-4xl font-black leading-tight text-ocean-950 max-sm:text-3xl">
            Welcome back, restaurant partner.
          </h1>
          <p className="mt-3 leading-7 text-slate-600">
            Sign in to list surplus food, track pickups, monitor performance metrics, and coordinate with volunteers.
          </p>
          <div className="mt-6 grid gap-3">
            <div className="rounded-lg bg-orange-50 p-4 text-sm font-bold leading-6 text-slate-600">
              <strong className="text-coral">Reduce waste</strong> by listing surplus meals and getting them picked up quickly.
            </div>
            <div className="rounded-lg bg-ocean-100 p-4 text-sm font-bold leading-6 text-slate-600">
              New here? <Link className="font-black text-ocean-800" to="/register-restaurant">Create a restaurant account</Link>.
            </div>
          </div>
        </section>

        <section className="animate-float-in rounded-lg border border-ocean-100 bg-white/90 p-6 shadow-soft">
          <h2 className="text-2xl font-black text-ocean-950">Restaurant Login</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Enter your credentials to access your restaurant dashboard.</p>
          
          <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
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
              {loading ? 'Logging in...' : 'Login as Restaurant'}
            </button>
          </form>
          
          <div className="mt-5 rounded-lg border border-ocean-100 p-4 text-center text-sm font-bold text-slate-500">
            Are you a volunteer? <Link className="font-black text-ocean-800" to="/login-volunteer">Login here instead</Link>
          </div>
        </section>
      </main>

      <Toast message={toast.message} show={toast.show} />
    </div>
  );
};

export default LoginRestaurant;
