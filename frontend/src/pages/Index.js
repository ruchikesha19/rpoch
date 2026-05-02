import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import feednetHero from '../assets/feednet-hero.png';
import zeroHungerHero from '../assets/zero-hunger-hero.png';
const Index = () => {
  return (
    <div className="bg-ocean-50 font-sans text-ocean-950 antialiased">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_10%_0%,rgba(145,216,255,.35),transparent_34%),linear-gradient(180deg,#f5fbff_0%,#ffffff_44%,#f7fcff_100%)]" />
      
      <Header />

      <main>
        <section className="mx-auto grid min-h-[calc(100vh_-_84px)] w-[min(1180px,calc(100%_-_32px))] grid-cols-[.9fr_1.1fr] items-center gap-10 py-10 max-lg:grid-cols-1">
          <div className="animate-rise">
            <p className="mb-3 text-xs font-black uppercase tracking-[.14em] text-mint-700">AI-powered hunger relief network</p>
            <h1 className="max-w-3xl text-6xl font-black leading-[.9] tracking-normal text-ocean-950 max-sm:text-5xl lg:text-8xl">
              FeedNet
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Connect surplus meals from restaurants to volunteers in real time, using smart priority scoring, range-aware
              discovery, and automatic pickup coordination.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-ocean-600 to-mint-500 px-6 font-black text-white shadow-soft transition hover:-translate-y-1"
              >
                Get Started
                <svg className="h-4 w-4 transition group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <a href="#features" className="inline-flex min-h-12 items-center justify-center rounded-lg border border-ocean-100 bg-white px-6 font-black text-ocean-800 transition hover:-translate-y-1 hover:shadow-lg">
                Explore features
              </a>
            </div>
          </div>

          <div className="relative animate-float-in">
            <div className="absolute -left-5 top-8 z-10 rounded-lg border border-white/80 bg-white/90 p-4 shadow-soft backdrop-blur max-sm:hidden">
              <p className="text-xs font-black uppercase tracking-[.12em] text-mint-700">Next best match</p>
              <p className="mt-1 text-2xl font-black text-ocean-950">96 score</p>
            </div>
            <img 
              className="aspect-[1.28/1] w-full rounded-lg object-cover shadow-soft" 
              src={feednetHero}
              alt="Volunteer and restaurant staff coordinating surplus meal redistribution"
            />
          </div>
        </section>

        <section className="mx-auto grid w-[min(1180px,calc(100%_-_32px))] grid-cols-3 overflow-hidden rounded-lg border border-ocean-100 bg-ocean-100 shadow-soft max-md:grid-cols-1">
          <div className="bg-white/90 p-7">
            <strong className="block text-3xl font-black text-ocean-950">12 min</strong>
            <span className="font-bold text-slate-500">average match time</span>
          </div>
          <div className="bg-white/90 p-7">
            <strong className="block text-3xl font-black text-ocean-950">4.8k</strong>
            <span className="font-bold text-slate-500">meals routed weekly</span>
          </div>
          <div className="bg-white/90 p-7">
            <strong className="block text-3xl font-black text-ocean-950">98%</strong>
            <span className="font-bold text-slate-500">pickup visibility</span>
          </div>
        </section>

        <section id="features" className="mx-auto w-[min(1180px,calc(100%_-_32px))] py-24">
          <div className="mb-9 max-w-3xl">
            <p className="mb-3 text-xs font-black uppercase tracking-[.14em] text-mint-700">Feature engine</p>
            <h2 className="text-4xl font-black leading-tight text-ocean-950 max-sm:text-3xl">
              Food moves faster when urgency, distance, and real need are ranked together.
            </h2>
          </div>
          <div className="grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1">
            <article className="lift-card rounded-lg border border-ocean-100 bg-white/90 p-6 shadow-lg shadow-ocean-600/5">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-ocean-100 font-black text-ocean-700">01</span>
              <h3 className="mt-6 text-lg font-black text-ocean-950">AI Priority Scoring</h3>
              <p className="mt-2 leading-7 text-slate-600">
                Food quantity, expiry window, restaurant location, distance, and route capacity become a clear pickup score.
              </p>
            </article>
            <article className="lift-card rounded-lg border border-ocean-100 bg-white/90 p-6 shadow-lg shadow-ocean-600/5">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-mint-100 font-black text-mint-700">02</span>
              <h3 className="mt-6 text-lg font-black text-ocean-950">Automatic Matching</h3>
              <p className="mt-2 leading-7 text-slate-600">
                Available food is paired with nearby volunteers instantly, reducing calls, confusion, and delayed pickups.
              </p>
            </article>
            <article className="lift-card rounded-lg border border-ocean-100 bg-white/90 p-6 shadow-lg shadow-ocean-600/5">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-orange-50 font-black text-coral">03</span>
              <h3 className="mt-6 text-lg font-black text-ocean-950">Live Pickup Flow</h3>
              <p className="mt-2 leading-7 text-slate-600">
                Volunteers see nearby listings, urgency tags, pickup status, navigation, and alerts from restaurants.
              </p>
            </article>
            <article className="lift-card rounded-lg border border-ocean-100 bg-white/90 p-6 shadow-lg shadow-ocean-600/5">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-yellow-50 font-black text-amber-600">04</span>
              <h3 className="mt-6 text-lg font-black text-ocean-950">Trusted Community</h3>
              <p className="mt-2 leading-7 text-slate-600">
                Restaurants and volunteers can verify details, review pickups, and coordinate future needs.
              </p>
            </article>
          </div>
        </section>

        <section className="mx-auto grid w-[min(1180px,calc(100%_-_32px))] grid-cols-[.9fr_1.1fr] items-center gap-8 pb-24 max-lg:grid-cols-1">
          <div>
            <p className="mb-3 text-xs font-black uppercase tracking-[.14em] text-mint-700">Allocation snapshot</p>
            <h2 className="text-4xl font-black leading-tight text-ocean-950 max-sm:text-3xl">
              Every available meal gets a best destination before dispatch.
            </h2>
            <p className="mt-4 leading-8 text-slate-600">
              FeedNet compares surplus inventory with volunteer availability, selected distance range, and route urgency, then recommends the highest-impact pickup path.
            </p>
          </div>
          <div className="rounded-lg border border-ocean-100 bg-white/90 p-5 shadow-soft">
            <img 
              src={zeroHungerHero} 
              alt="Food redistribution dashboard showing meal allocation"
              className="w-full rounded-lg"
            />
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
