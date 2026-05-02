import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';

const Login = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    localStorage.setItem('role', role);
    if (role === 'volunteer') {
      navigate('/login-volunteer');
    } else {
      navigate('/login-restaurant');
    }
  };

  return (
    <div className="bg-ocean-50 font-sans text-ocean-950 antialiased">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_10%_0%,rgba(145,216,255,.35),transparent_34%),linear-gradient(180deg,#f5fbff_0%,#ffffff_44%,#f7fcff_100%)]" />
      
      <Header />

      <main className="mx-auto grid min-h-[calc(100vh_-_96px)] w-[min(980px,calc(100%_-_32px))] grid-cols-[.9fr_1.1fr] items-start gap-6 py-8 max-lg:grid-cols-1">
        <section className="animate-rise rounded-lg border border-ocean-100 bg-white/90 p-6 shadow-soft">
          <p className="mb-3 text-xs font-black uppercase tracking-[.14em] text-mint-700">Welcome back</p>
          <h1 className="text-4xl font-black leading-tight text-ocean-950 max-sm:text-3xl">
            Choose the login page for your role.
          </h1>
          <p className="mt-3 leading-7 text-slate-600">
            Volunteers and restaurants sign in through separate pages while role-based access keeps each dashboard protected.
          </p>
          <div className="mt-6 rounded-lg bg-ocean-100 p-4 text-sm font-bold leading-6 text-slate-600">
            New here? <Link className="font-black text-ocean-800" to="/register">Create an account</Link>.
          </div>
        </section>

        <section className="animate-float-in grid grid-cols-2 gap-4 max-md:grid-cols-1">
          <article className="lift-card rounded-lg border border-ocean-100 bg-white/90 p-6 shadow-soft">
            <p className="mb-3 text-xs font-black uppercase tracking-[.14em] text-mint-700">Volunteer</p>
            <h2 className="text-2xl font-black text-ocean-950">Volunteer login</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Access pickup listings, Bengaluru restaurant range filters, and your volunteer dashboard.
            </p>
            <button 
              className="submit-button mt-5 w-full text-center" 
              onClick={() => handleRoleSelect('volunteer')}
            >
              Login as volunteer
            </button>
            <Link className="mt-3 inline-flex font-black text-ocean-800" to="/register-volunteer">
              Create volunteer account
            </Link>
          </article>
          <article className="lift-card rounded-lg border border-ocean-100 bg-white/90 p-6 shadow-soft">
            <p className="mb-3 text-xs font-black uppercase tracking-[.14em] text-ocean-600">Restaurant</p>
            <h2 className="text-2xl font-black text-ocean-950">Restaurant login</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Access surplus listings, volunteer coordination, and restaurant performance metrics.
            </p>
            <button 
              className="submit-button mt-5 w-full text-center" 
              onClick={() => handleRoleSelect('restaurant')}
            >
              Login as restaurant
            </button>
            <Link className="mt-3 inline-flex font-black text-ocean-800" to="/register-restaurant">
              Create restaurant account
            </Link>
          </article>
        </section>
      </main>
    </div>
  );
};

export default Login;
