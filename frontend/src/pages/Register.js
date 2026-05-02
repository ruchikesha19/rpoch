import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';

const Register = () => {
  return (
    <div className="bg-ocean-50 font-sans text-ocean-950 antialiased">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_10%_0%,rgba(145,216,255,.35),transparent_34%),linear-gradient(180deg,#f5fbff_0%,#ffffff_44%,#f7fcff_100%)]" />
      
      <Header />

      <main className="mx-auto grid min-h-[calc(100vh_-_96px)] w-[min(980px,calc(100%_-_32px))] grid-cols-[.9fr_1.1fr] items-start gap-6 py-8 max-lg:grid-cols-1">
        <section className="animate-rise rounded-lg border border-ocean-100 bg-white/90 p-6 shadow-soft">
          <p className="mb-3 text-xs font-black uppercase tracking-[.14em] text-mint-700">Join FeedNet</p>
          <h1 className="text-4xl font-black leading-tight text-ocean-950 max-sm:text-3xl">
            Choose how you want to contribute.
          </h1>
          <p className="mt-3 leading-7 text-slate-600">
            Whether you're a volunteer looking to help distribute food or a restaurant wanting to reduce waste, we have a place for you.
          </p>
          <div className="mt-6 rounded-lg bg-ocean-100 p-4 text-sm font-bold leading-6 text-slate-600">
            Already have an account? <Link className="font-black text-ocean-800" to="/login">Sign in here</Link>.
          </div>
        </section>

        <section className="animate-float-in grid grid-cols-2 gap-4 max-md:grid-cols-1">
          <article className="lift-card rounded-lg border border-ocean-100 bg-white/90 p-6 shadow-soft">
            <p className="mb-3 text-xs font-black uppercase tracking-[.14em] text-mint-700">Volunteer</p>
            <h2 className="text-2xl font-black text-ocean-950">Volunteer registration</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Join as a volunteer to pick up surplus food and help distribute it to those in need.
            </p>
            <Link className="submit-button mt-5 w-full inline-block text-center" to="/register-volunteer">
              Register as volunteer
            </Link>
            <Link className="mt-3 inline-flex font-black text-ocean-800" to="/login-volunteer">
              Already a volunteer? Login
            </Link>
          </article>
          <article className="lift-card rounded-lg border border-ocean-100 bg-white/90 p-6 shadow-soft">
            <p className="mb-3 text-xs font-black uppercase tracking-[.14em] text-ocean-600">Restaurant</p>
            <h2 className="text-2xl font-black text-ocean-950">Restaurant registration</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Register your restaurant to list surplus food and coordinate with volunteers for pickups.
            </p>
            <Link className="submit-button mt-5 w-full inline-block text-center" to="/register-restaurant">
              Register as restaurant
            </Link>
            <Link className="mt-3 inline-flex font-black text-ocean-800" to="/login-restaurant">
              Already a restaurant? Login
            </Link>
          </article>
        </section>
      </main>
    </div>
  );
};

export default Register;
