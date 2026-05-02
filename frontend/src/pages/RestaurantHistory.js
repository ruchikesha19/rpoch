import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Header from '../components/Header';

const RestaurantHistory = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get(`/restaurants/${currentUser.user_id}/pickups`);
        // Filter for completed orders
        const completed = response.data.pickups.filter(p => p.status === 'completed');
        setHistory(completed);
      } catch (error) {
        console.error('Error fetching restaurant history:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchHistory();
    }
  }, [currentUser]);

  if (loading) return <div className="p-10 text-center font-bold">Loading your history...</div>;

  return (
    <div className="min-h-screen bg-ocean-50 font-sans text-ocean-950 antialiased pb-20">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_10%_0%,rgba(145,216,255,.35),transparent_34%),linear-gradient(180deg,#f5fbff_0%,#ffffff_44%,#f7fcff_100%)]" />
      
      <Header />

      <main className="mx-auto w-[min(1000px,calc(100%_-_32px))] py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <button 
              onClick={() => navigate('/restaurants')}
              className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-ocean-600 hover:text-ocean-800 transition"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-4xl font-black text-ocean-950">Donation Archive</h1>
            <p className="mt-2 text-slate-600 font-medium">Review your past food donations and environmental impact.</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Total Donations</p>
            <p className="text-4xl font-black text-mint-600">{history.length}</p>
          </div>
        </div>

        {history.length > 0 ? (
          <div className="grid gap-4">
            {history.map((order) => (
              <article key={order._id} className="animate-rise bg-white rounded-2xl border border-ocean-100 p-6 shadow-soft flex items-center justify-between gap-6 hover:shadow-md transition">
                  <div className="flex items-center gap-6">
                    {order.delivery_photo ? (
                      <div className="relative group cursor-pointer" onClick={() => window.open(order.delivery_photo, '_blank')}>
                        <img 
                          src={order.delivery_photo} 
                          alt="Delivery Proof" 
                          className="h-16 w-16 rounded-xl object-cover border-2 border-mint-100 group-hover:scale-105 transition shadow-sm"
                        />
                        <div className="absolute inset-0 bg-black/20 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white text-[10px] font-black uppercase">
                          View
                        </div>
                      </div>
                    ) : (
                      <div className="h-14 w-14 rounded-full bg-mint-50 flex items-center justify-center text-mint-600 border border-mint-100 shrink-0">
                        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-black text-ocean-950">{order.food_type}</h3>
                      <p className="text-slate-600 font-medium">{order.quantity} servings redistributed</p>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                        Completed on {new Date(order.updatedAt || order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Carbon Offset</p>
                    <p className="text-lg font-black text-ocean-900">{(parseInt(order.quantity) * 0.19).toFixed(1)} kg</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Impact Score</p>
                    <p className="text-lg font-black text-mint-600">High</p>
                  </div>
                  <button 
                    onClick={() => navigate(`/invoice/${order._id}`)}
                    className="rounded-xl border border-ocean-200 px-6 py-3 text-sm font-black text-ocean-950 hover:bg-ocean-50 transition shadow-sm"
                  >
                    View Invoice
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[40px] border-2 border-dashed border-ocean-200 p-24 text-center">
            <div className="mx-auto h-24 w-24 bg-ocean-50 rounded-full flex items-center justify-center text-ocean-200 mb-8">
              <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <h3 className="text-2xl font-black text-ocean-950">No completed donations found</h3>
            <p className="mt-2 text-slate-500 font-medium max-w-sm mx-auto">
              Your past food redistributions will be archived here. Complete your first pickup to start your archive!
            </p>
            <button 
              onClick={() => navigate('/restaurants')}
              className="mt-10 bg-ocean-950 text-white px-10 py-4 rounded-xl font-black text-sm shadow-xl hover:opacity-90 transition"
            >
              List Surplus Food
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default RestaurantHistory;
